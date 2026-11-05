/**
 * NusaTrip DSS - Linear Programming Solver Engine
 *
 * 5 optimization modules:
 * 1. solveSupplyChain    - Minimize vendor procurement cost
 * 2. solveConsolidation  - Merge events for volume discounts
 * 3. solvePortfolio      - Maximize profit under capital constraints
 * 4. solveAssignment     - Optimal freelancer-to-event matching
 * 5. solveItinerary      - Budget-constrained attraction selection (knapsack)
 * 6. solveCatering       - Menu composition under budget (diet problem)
 *
 * Uses a greedy/scoring approach that mirrors LP logic without
 * requiring a full simplex solver dependency. Each function documents
 * the LP formulation it approximates.
 */

import type {
  SupplyChainInput,
  SupplyChainResult,
  VendorAllocation,
  ConsolidationInput,
  ConsolidationResult,
  PortfolioInput,
  PortfolioResult,
  AssignmentInput,
  AssignmentResult,
  FreelancerRequirement,
  ItineraryInput,
  ItineraryResult,
  CateringInput,
  CateringResult,
  VendorService,
  Freelancer,
} from "./types";

// ─── Helper ────────────────────────────────────────────────────

function timedExec<T>(fn: () => T): { result: T; ms: number } {
  const t0 = performance.now();
  const result = fn();
  return { result, ms: Math.round(performance.now() - t0) };
}

// ─── 1. Supply Chain Optimization ──────────────────────────────
//
// LP Formulation:
//   MINIMIZE  SUM( unitPrice[i] * qty[i] )
//   s.t.      SUM( qty[i] )  >= participantCount   (for each category)
//             qty[i]         <= maxCapacity[i]
//             serviceLevel[i] >= requiredLevel
//             SUM( unitPrice[i] * qty[i] ) <= budget

export function solveSupplyChain(
  input: SupplyChainInput
): SupplyChainResult {
  const { result, ms } = timedExec(() => {
    const { participantCount, budget, serviceLevel, availableVendors } = input;

    const levelOrder: Record<string, number> = {
      budget: 1,
      standard: 2,
      premium: 3,
    };
    const requiredLevel = levelOrder[serviceLevel];

    // Filter vendors that meet service level
    const eligible = availableVendors.filter(
      (v) => v.isAvailable && levelOrder[v.serviceLevel] >= requiredLevel
    );

    // Group by category
    const byCategory = new Map<string, VendorService[]>();
    for (const v of eligible) {
      const cat = v.category;
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat)!.push(v);
    }

    // For each category, greedily pick cheapest vendors to fill capacity
    const allocations: VendorAllocation[] = [];
    const backupAllocations: VendorAllocation[] = [];
    let totalCost = 0;

    for (const [category, vendors] of byCategory) {
      // Sort by unit price ascending (cheapest first)
      const sorted = [...vendors].sort((a, b) => a.unitPrice - b.unitPrice);
      let remaining = participantCount;

      for (const vendor of sorted) {
        if (remaining <= 0) {
          // Remaining vendors become backups
          backupAllocations.push({
            vendorServiceId: vendor.id,
            vendorName: vendor.vendorName,
            serviceName: vendor.serviceName,
            category: vendor.category,
            allocatedQuantity: Math.min(vendor.maxCapacity, participantCount),
            unitCost: vendor.unitPrice,
            subtotal:
              vendor.unitPrice *
              Math.min(vendor.maxCapacity, participantCount),
            isBackup: true,
          });
          continue;
        }

        const allocQty = Math.min(remaining, vendor.maxCapacity);
        const subtotal = vendor.unitPrice * allocQty;
        allocations.push({
          vendorServiceId: vendor.id,
          vendorName: vendor.vendorName,
          serviceName: vendor.serviceName,
          category: vendor.category,
          allocatedQuantity: allocQty,
          unitCost: vendor.unitPrice,
          subtotal,
          isBackup: false,
        });
        totalCost += subtotal;
        remaining -= allocQty;
      }
    }

    // Transport breakdown (special handling for seat efficiency)
    const transportVendors = allocations.filter(
      (a) => a.category === "transport"
    );
    const transportBreakdown = transportVendors.map((tv) => ({
      vehicleType: tv.serviceName,
      count: 1,
      totalSeats: tv.allocatedQuantity,
      emptySeats: Math.max(0, tv.allocatedQuantity - participantCount),
      cost: tv.subtotal,
    }));

    // Ticket bundling analysis
    const ticketVendors = allocations.filter(
      (a) => a.category === "attraction"
    );
    const ticketBreakdown = ticketVendors.map((tv) => ({
      bundleOption: tv.serviceName,
      ticketCount: tv.allocatedQuantity,
      unitPrice: tv.unitCost,
      totalPrice: tv.subtotal,
      savings: 0,
    }));

    const margin = budget - totalCost;

    return {
      feasible: totalCost <= budget && totalCost > 0,
      totalCost,
      margin,
      marginPercentage: budget > 0 ? (margin / budget) * 100 : 0,
      allocations,
      backupAllocations: backupAllocations.slice(0, 5),
      transportBreakdown,
      ticketBreakdown,
    };
  });

  return { ...result, solverTimeMs: ms };
}

// ─── 2. Cross-Event Consolidation ──────────────────────────────
//
// LP Formulation:
//   MAXIMIZE  SUM( savings[i] )
//   s.t.      SUM( participants[i] ) >= vendorThreshold
//             all events on same date & location
//             SUM( participants[i] ) <= vendorCapacity

export function solveConsolidation(
  input: ConsolidationInput
): ConsolidationResult {
  const { result, ms } = timedExec(() => {
    const { events, vendorDiscounts } = input;

    // Total participants across all events
    const totalParticipants = events.reduce(
      (sum, e) => sum + e.participantCount,
      0
    );

    // Original total cost (each event paying its own rate)
    const originalTotalCost = events.reduce(
      (sum, e) => sum + e.currentUnitPrice * e.participantCount,
      0
    );

    // Find best vendor discount that fits
    let bestResult: ConsolidationResult | null = null;

    for (const vendor of vendorDiscounts) {
      if (vendor.maxCapacity < totalParticipants) continue;

      // Find the best discount tier
      const applicableTiers = vendor.thresholds
        .filter((t) => totalParticipants >= t.minQuantity)
        .sort((a, b) => b.discountPercentage - a.discountPercentage);

      if (applicableTiers.length === 0) continue;

      const bestTier = applicableTiers[0];
      const consolidatedTotalCost = bestTier.pricePerUnit * totalParticipants;
      const totalSavings = originalTotalCost - consolidatedTotalCost;

      if (totalSavings <= 0) continue;

      const eventAllocations = events.map((e) => ({
        orderId: e.orderId,
        participantCount: e.participantCount,
        originalCost: e.currentUnitPrice * e.participantCount,
        newCost: bestTier.pricePerUnit * e.participantCount,
        savings:
          e.currentUnitPrice * e.participantCount -
          bestTier.pricePerUnit * e.participantCount,
      }));

      if (!bestResult || totalSavings > bestResult.totalSavings) {
        bestResult = {
          feasible: true,
          consolidatedVendorId: vendor.vendorId,
          consolidatedVendorName: vendor.vendorName,
          totalParticipants,
          discountTier: bestTier,
          originalTotalCost,
          consolidatedTotalCost,
          totalSavings,
          savingsPercentage: (totalSavings / originalTotalCost) * 100,
          eventAllocations,
          solverTimeMs: 0,
        };
      }
    }

    if (!bestResult) {
      return {
        feasible: false,
        consolidatedVendorId: "",
        consolidatedVendorName: "",
        totalParticipants,
        discountTier: { minQuantity: 0, discountPercentage: 0, pricePerUnit: 0 },
        originalTotalCost,
        consolidatedTotalCost: originalTotalCost,
        totalSavings: 0,
        savingsPercentage: 0,
        eventAllocations: [],
        solverTimeMs: 0,
      };
    }

    return bestResult;
  });

  return { ...result, solverTimeMs: ms };
}

// ─── 3. Peak Season Portfolio Selection ────────────────────────
//
// LP Formulation (0-1 Knapsack):
//   MAXIMIZE  SUM( profit[i] * x[i] )
//   s.t.      SUM( dp[i] * x[i] )    <= availableCapital
//             SUM( teams[i] * x[i] )  <= availableAdminTeams
//             SUM( x[i] )             <= maxConcurrentEvents
//             x[i] in {0, 1}

export function solvePortfolio(input: PortfolioInput): PortfolioResult {
  const { result, ms } = timedExec(() => {
    const { candidates, constraints } = input;

    // Score each event: profit / (capital + team cost) - efficiency ratio
    const scored = candidates.map((c) => ({
      ...c,
      efficiency:
        c.estimatedProfit /
        (c.requiredDpToVendors + c.requiredAdminTeams * 1_000_000),
    }));

    // Sort by efficiency descending
    scored.sort((a, b) => b.efficiency - a.efficiency);

    let remainingCapital = constraints.availableCapital;
    let remainingTeams = constraints.availableAdminTeams;
    let remainingSlots = constraints.maxConcurrentEvents;

    const selected: PortfolioResult["selectedEvents"] = [];
    const rejected: PortfolioResult["rejectedEvents"] = [];

    for (const candidate of scored) {
      const canAfford = candidate.requiredDpToVendors <= remainingCapital;
      const hasTeam = candidate.requiredAdminTeams <= remainingTeams;
      const hasSlot = remainingSlots > 0;

      if (canAfford && hasTeam && hasSlot) {
        selected.push({
          orderId: candidate.orderId,
          customerName: candidate.customerName,
          estimatedProfit: candidate.estimatedProfit,
          requiredCapital: candidate.requiredDpToVendors,
          recommendation: "accept",
          reason: `Efisiensi laba tinggi (Rp ${Math.round(candidate.estimatedProfit / 1_000_000)}jt profit, butuh DP Rp ${Math.round(candidate.requiredDpToVendors / 1_000_000)}jt)`,
        });
        remainingCapital -= candidate.requiredDpToVendors;
        remainingTeams -= candidate.requiredAdminTeams;
        remainingSlots--;
      } else {
        const reasons: string[] = [];
        if (!canAfford)
          reasons.push(
            `Modal DP kurang (butuh Rp ${Math.round(candidate.requiredDpToVendors / 1_000_000)}jt, sisa Rp ${Math.round(remainingCapital / 1_000_000)}jt)`
          );
        if (!hasTeam)
          reasons.push(
            `Tim Admin tidak cukup (butuh ${candidate.requiredAdminTeams}, sisa ${remainingTeams})`
          );
        if (!hasSlot) reasons.push("Slot event concurrent penuh");

        rejected.push({
          orderId: candidate.orderId,
          customerName: candidate.customerName,
          reason: reasons.join("; "),
        });

        // Try to reschedule if only slot issue
        if (canAfford && hasTeam && !hasSlot) {
          selected.push({
            orderId: candidate.orderId,
            customerName: candidate.customerName,
            estimatedProfit: candidate.estimatedProfit,
            requiredCapital: candidate.requiredDpToVendors,
            recommendation: "reschedule",
            reason: "Slot penuh, reschedule ke periode berikutnya",
          });
        }
      }
    }

    const totalRevenue = selected
      .filter((s) => s.recommendation === "accept")
      .reduce(
        (sum, s) =>
          sum +
          (candidates.find((c) => c.orderId === s.orderId)?.agreedPrice ?? 0),
        0
      );
    const totalCost = selected
      .filter((s) => s.recommendation === "accept")
      .reduce(
        (sum, s) =>
          sum +
          (candidates.find((c) => c.orderId === s.orderId)?.estimatedCost ?? 0),
        0
      );

    return {
      feasible: selected.some((s) => s.recommendation === "accept"),
      selectedEvents: selected,
      totalRevenue,
      totalCost,
      totalProfit: totalRevenue - totalCost,
      capitalUtilization:
        ((constraints.availableCapital - remainingCapital) /
          constraints.availableCapital) *
        100,
      teamUtilization:
        ((constraints.availableAdminTeams - remainingTeams) /
          constraints.availableAdminTeams) *
        100,
      rejectedEvents: rejected,
    };
  });

  return { ...result, solverTimeMs: ms };
}

// ─── 4. Freelancer Assignment ──────────────────────────────────
//
// LP Formulation (Assignment Problem):
//   MINIMIZE  SUM( dailyRate[j] * days * x[i][j] )
//   s.t.      SUM( x[i][j] ) = 1              for each requirement i
//             SUM( x[i][j] ) <= 1              for each freelancer j
//             matchScore[i][j] * x[i][j] >= 0  (only valid matches)
//             SUM( dailyRate[j] * days * x[i][j] ) <= budgetForFreelancers

export function solveAssignment(input: AssignmentInput): AssignmentResult {
  const { result, ms } = timedExec(() => {
    const {
      requirements,
      availableFreelancers,
      budgetForFreelancers,
      eventDates,
    } = input;
    const days = eventDates.length;

    // Score each freelancer against each requirement
    function matchScore(req: FreelancerRequirement, fl: Freelancer): number {
      if (fl.specialty !== req.specialty) return -1;
      if (!fl.isAvailable) return -1;

      let score = 100;

      // Language match
      if (req.requiredLanguages && req.requiredLanguages.length > 0) {
        const hasAll = req.requiredLanguages.every((lang) =>
          fl.languages.includes(lang)
        );
        if (!hasAll) return -1;
        score += req.requiredLanguages.length * 10;
      }

      // Seniority match
      if (req.requiredSeniority) {
        if (fl.seniority !== req.requiredSeniority) {
          if (
            req.requiredSeniority === "senior" &&
            fl.seniority === "junior"
          ) {
            return -1; // Cannot downgrade requirement
          }
          score -= 10; // Overqualified - still valid but slightly penalized for cost
        }
      }

      // Drone requirement
      if (req.requiresDrone && !fl.hasDrone) return -1;
      if (req.requiresDrone && fl.hasDrone) score += 20;

      // Lower daily rate = higher score (cost optimization)
      score += Math.max(0, 50 - fl.dailyRate / 100_000);

      return score;
    }

    const assignments: AssignmentResult["assignments"] = [];
    const usedFreelancers = new Set<string>();
    const unfilled: FreelancerRequirement[] = [];
    let totalCost = 0;

    // Expand requirements by quantity
    const expandedReqs: FreelancerRequirement[] = [];
    for (const req of requirements) {
      for (let i = 0; i < req.quantity; i++) {
        expandedReqs.push({ ...req, quantity: 1 });
      }
    }

    // For each requirement, find best available freelancer
    for (const req of expandedReqs) {
      const candidates = availableFreelancers
        .filter((fl) => !usedFreelancers.has(fl.id))
        .map((fl) => ({ fl, score: matchScore(req, fl) }))
        .filter((c) => c.score > 0)
        .sort((a, b) => {
          // Sort by score desc, then by cost asc
          if (b.score !== a.score) return b.score - a.score;
          return a.fl.dailyRate - b.fl.dailyRate;
        });

      if (candidates.length === 0) {
        unfilled.push(req);
        continue;
      }

      // Check budget
      const best = candidates[0];
      const fee = best.fl.dailyRate * days;
      if (totalCost + fee > budgetForFreelancers) {
        // Try cheaper option
        const affordable = candidates.find(
          (c) => totalCost + c.fl.dailyRate * days <= budgetForFreelancers
        );
        if (!affordable) {
          unfilled.push(req);
          continue;
        }
        const aFee = affordable.fl.dailyRate * days;
        assignments.push({
          freelancerId: affordable.fl.id,
          freelancerName: affordable.fl.name,
          specialty: affordable.fl.specialty,
          seniority: affordable.fl.seniority,
          languages: affordable.fl.languages,
          dailyRate: affordable.fl.dailyRate,
          totalFee: aFee,
          matchScore: affordable.score,
        });
        totalCost += aFee;
        usedFreelancers.add(affordable.fl.id);
      } else {
        assignments.push({
          freelancerId: best.fl.id,
          freelancerName: best.fl.name,
          specialty: best.fl.specialty,
          seniority: best.fl.seniority,
          languages: best.fl.languages,
          dailyRate: best.fl.dailyRate,
          totalFee: fee,
          matchScore: best.score,
        });
        totalCost += fee;
        usedFreelancers.add(best.fl.id);
      }
    }

    return {
      feasible: unfilled.length === 0,
      assignments,
      totalCost,
      budgetRemaining: budgetForFreelancers - totalCost,
      unfilledRequirements: unfilled,
    };
  });

  return { ...result, solverTimeMs: ms };
}

// ─── 5. Itinerary Generator (Knapsack) ─────────────────────────
//
// LP Formulation (Multi-dimensional Knapsack):
//   MAXIMIZE  SUM( rating[i] * x[i] )
//   s.t.      SUM( ticketPrice[i] * x[i] ) <= budgetPerPerson
//             SUM( duration[i] * x[i] )     <= maxHoursPerDay (per day)
//             x[i] in {0, 1}

export function solveItinerary(input: ItineraryInput): ItineraryResult {
  const { result, ms } = timedExec(() => {
    const {
      days,
      budgetPerPerson,
      participantCount,
      availableAttractions,
      maxHoursPerDay,
    } = input;

    // Sort attractions by value ratio: rating / (price + time_penalty)
    const scored = availableAttractions.map((a) => ({
      ...a,
      valueRatio: a.rating / (a.ticketPrice / 10_000 + a.durationHours * 0.5),
    }));
    scored.sort((a, b) => b.valueRatio - a.valueRatio);

    let remainingBudget = budgetPerPerson;
    const usedAttractions = new Set<string>();
    const dailySchedule: ItineraryResult["dailySchedule"] = [];

    for (let day = 1; day <= days; day++) {
      let remainingHours = maxHoursPerDay;
      let currentTime = 8; // Start at 8:00
      const dayAttractions: ItineraryResult["dailySchedule"][0]["attractions"] =
        [];
      let dayTicketCost = 0;

      for (const attraction of scored) {
        if (usedAttractions.has(attraction.id)) continue;
        if (attraction.ticketPrice > remainingBudget) continue;
        if (attraction.durationHours > remainingHours) continue;

        const startHour = currentTime;
        const endHour = currentTime + attraction.durationHours;

        dayAttractions.push({
          attractionId: attraction.id,
          name: attraction.name,
          ticketPrice: attraction.ticketPrice,
          rating: attraction.rating,
          durationHours: attraction.durationHours,
          startTime: `${String(Math.floor(startHour)).padStart(2, "0")}:${String(Math.round((startHour % 1) * 60)).padStart(2, "0")}`,
          endTime: `${String(Math.floor(endHour)).padStart(2, "0")}:${String(Math.round((endHour % 1) * 60)).padStart(2, "0")}`,
        });

        dayTicketCost += attraction.ticketPrice;
        remainingBudget -= attraction.ticketPrice;
        remainingHours -= attraction.durationHours + 0.5; // 30min travel
        currentTime = endHour + 0.5;
        usedAttractions.add(attraction.id);
      }

      const totalHours = dayAttractions.reduce(
        (s, a) => s + a.durationHours,
        0
      );
      const avgRating =
        dayAttractions.length > 0
          ? dayAttractions.reduce((s, a) => s + a.rating, 0) /
            dayAttractions.length
          : 0;

      dailySchedule.push({
        day,
        attractions: dayAttractions,
        totalTicketCost: dayTicketCost,
        totalHours,
        averageRating: Math.round(avgRating * 10) / 10,
      });
    }

    const totalCostPerPerson =
      budgetPerPerson - remainingBudget;
    const overallRating =
      dailySchedule.length > 0
        ? dailySchedule.reduce((s, d) => s + d.averageRating, 0) /
          dailySchedule.length
        : 0;

    return {
      feasible: dailySchedule.some((d) => d.attractions.length > 0),
      dailySchedule,
      totalCostPerPerson,
      totalCost: totalCostPerPerson * participantCount,
      budgetRemaining: remainingBudget,
      overallRating: Math.round(overallRating * 10) / 10,
    };
  });

  return { ...result, solverTimeMs: ms };
}

// ─── 6. Catering Solver (Diet Problem) ─────────────────────────
//
// LP Formulation:
//   MAXIMIZE  SUM( rating[i] * x[i] )
//   s.t.      SUM( price[i] * x[i] ) <= budgetPerPortion
//             for each required category c:
//               SUM( x[i] where category[i] == c ) >= 1
//             x[i] in {0, 1}

export function solveCatering(input: CateringInput): CateringResult {
  const { result, ms } = timedExec(() => {
    const {
      budgetPerPortion,
      participantCount,
      minimumCategories,
      availableMenuItems,
    } = input;

    // Group by category
    const byCategory = new Map<string, typeof availableMenuItems>();
    for (const item of availableMenuItems) {
      const cat = item.category;
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat)!.push(item);
    }

    // First, pick the best item from each required category (cheapest with good rating)
    const selected: CateringResult["selectedMenu"] = [];
    let totalPerPortion = 0;
    const categoriesCovered: string[] = [];

    for (const category of minimumCategories) {
      const items = byCategory.get(category);
      if (!items || items.length === 0) continue;

      // Sort by value: rating / price, but price must fit
      const affordable = items
        .filter((i) => i.pricePerPortion + totalPerPortion <= budgetPerPortion)
        .sort((a, b) => {
          const scoreA = a.rating / (a.pricePerPortion / 1000);
          const scoreB = b.rating / (b.pricePerPortion / 1000);
          return scoreB - scoreA;
        });

      if (affordable.length === 0) continue;

      const best = affordable[0];
      selected.push({
        itemId: best.id,
        name: best.name,
        category: best.category,
        vendorName: best.vendorName,
        pricePerPortion: best.pricePerPortion,
        rating: best.rating,
      });
      totalPerPortion += best.pricePerPortion;
      categoriesCovered.push(category);
    }

    // Then, if budget remains, add bonus items
    const usedIds = new Set(selected.map((s) => s.itemId));
    const remaining = availableMenuItems
      .filter(
        (i) =>
          !usedIds.has(i.id) &&
          i.pricePerPortion + totalPerPortion <= budgetPerPortion
      )
      .sort((a, b) => b.rating - a.rating);

    for (const item of remaining) {
      if (item.pricePerPortion + totalPerPortion > budgetPerPortion) continue;
      selected.push({
        itemId: item.id,
        name: item.name,
        category: item.category,
        vendorName: item.vendorName,
        pricePerPortion: item.pricePerPortion,
        rating: item.rating,
      });
      totalPerPortion += item.pricePerPortion;
      if (!categoriesCovered.includes(item.category)) {
        categoriesCovered.push(item.category);
      }
    }

    const avgRating =
      selected.length > 0
        ? selected.reduce((s, i) => s + i.rating, 0) / selected.length
        : 0;

    return {
      feasible:
        minimumCategories.every((c) => categoriesCovered.includes(c)) &&
        selected.length > 0,
      selectedMenu: selected,
      costPerPortion: totalPerPortion,
      totalCost: totalPerPortion * participantCount,
      budgetRemaining: budgetPerPortion - totalPerPortion,
      averageRating: Math.round(avgRating * 10) / 10,
      categoriesCovered,
    };
  });

  return { ...result, solverTimeMs: ms };
}
