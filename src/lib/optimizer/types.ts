/**
 * NusaTrip DSS (Decision Support System) - Type Definitions
 *
 * Covers 5 LP optimization areas:
 * 1. Vendor Supply Chain (cost minimization)
 * 2. Cross-Event Consolidation (volume discount pursuit)
 * 3. Peak Season Portfolio Selection (profit maximization)
 * 4. Freelancer Assignment (assignment problem)
 * 5. Itinerary & Catering Generation (knapsack/diet problem)
 */

// ─── Shared Types ──────────────────────────────────────────────

export type ServiceLevel = "budget" | "standard" | "premium";
export type VendorCategory =
  | "transport"
  | "accommodation"
  | "restaurant"
  | "attraction"
  | "catering";
export type FreelancerSpecialty =
  | "tour_guide"
  | "photographer"
  | "videographer";
export type Seniority = "junior" | "senior";

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  tier: "primary" | "backup";
  locationArea: string;
  baseRating: number;
  isActive: boolean;
  contactInfo: {
    phone: string;
    email?: string;
    pic: string;
  };
}

export interface VendorService {
  id: string;
  vendorId: string;
  vendorName: string;
  serviceName: string;
  serviceLevel: ServiceLevel;
  unitPrice: number;
  maxCapacity: number;
  isAvailable: boolean;
  category: VendorCategory;
}

export interface Freelancer {
  id: string;
  name: string;
  specialty: FreelancerSpecialty;
  seniority: Seniority;
  languages: string[];
  dailyRate: number;
  isAvailable: boolean;
  certifications: string[];
  hasDrone?: boolean;
}

// ─── Area 1: Vendor Supply Chain Optimization ──────────────────

export interface SupplyChainInput {
  orderId: string;
  participantCount: number;
  budget: number;
  serviceLevel: ServiceLevel;
  requirements: {
    transport: {
      type: string;
      needed: boolean;
    };
    accommodation: {
      nights: number;
      starLevel: number;
    };
    meals: {
      mealsPerDay: number;
      type: "prasmanan" | "set_menu" | "box";
    };
    attractions: string[];
  };
  availableVendors: VendorService[];
}

export interface VendorAllocation {
  vendorServiceId: string;
  vendorName: string;
  serviceName: string;
  category: VendorCategory;
  allocatedQuantity: number;
  unitCost: number;
  subtotal: number;
  isBackup: boolean;
}

export interface SupplyChainResult {
  feasible: boolean;
  totalCost: number;
  margin: number;
  marginPercentage: number;
  allocations: VendorAllocation[];
  backupAllocations: VendorAllocation[];
  transportBreakdown: {
    vehicleType: string;
    count: number;
    totalSeats: number;
    emptySeats: number;
    cost: number;
  }[];
  ticketBreakdown: {
    bundleOption: string;
    ticketCount: number;
    unitPrice: number;
    totalPrice: number;
    savings: number;
  }[];
  solverTimeMs: number;
}

// ─── Area 2: Cross-Event Consolidation ─────────────────────────

export interface ConsolidationEvent {
  orderId: string;
  participantCount: number;
  date: string;
  locationArea: string;
  mealSlot: "breakfast" | "lunch" | "dinner";
  currentVendorId?: string;
  currentUnitPrice: number;
}

export interface VendorDiscount {
  vendorId: string;
  vendorName: string;
  category: VendorCategory;
  locationArea: string;
  thresholds: {
    minQuantity: number;
    discountPercentage: number;
    pricePerUnit: number;
  }[];
  maxCapacity: number;
}

export interface ConsolidationInput {
  events: ConsolidationEvent[];
  vendorDiscounts: VendorDiscount[];
  date: string;
}

export interface ConsolidationResult {
  feasible: boolean;
  consolidatedVendorId: string;
  consolidatedVendorName: string;
  totalParticipants: number;
  discountTier: {
    minQuantity: number;
    discountPercentage: number;
    pricePerUnit: number;
  };
  originalTotalCost: number;
  consolidatedTotalCost: number;
  totalSavings: number;
  savingsPercentage: number;
  eventAllocations: {
    orderId: string;
    participantCount: number;
    originalCost: number;
    newCost: number;
    savings: number;
  }[];
  solverTimeMs: number;
}

// ─── Area 3: Peak Season Portfolio Selection ───────────────────

export interface EventCandidate {
  orderId: string;
  customerName: string;
  tripType: string;
  participantCount: number;
  agreedPrice: number;
  estimatedCost: number;
  estimatedProfit: number;
  requiredDpToVendors: number;
  requiredAdminTeams: number;
  startDate: string;
  endDate: string;
  priority: "high" | "medium" | "low";
}

export interface PortfolioInput {
  candidates: EventCandidate[];
  constraints: {
    availableCapital: number;
    availableAdminTeams: number;
    maxConcurrentEvents: number;
  };
}

export interface PortfolioResult {
  feasible: boolean;
  selectedEvents: {
    orderId: string;
    customerName: string;
    estimatedProfit: number;
    requiredCapital: number;
    recommendation: "accept" | "reject" | "reschedule";
    reason: string;
  }[];
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  capitalUtilization: number;
  teamUtilization: number;
  rejectedEvents: {
    orderId: string;
    customerName: string;
    reason: string;
  }[];
  solverTimeMs: number;
}

// ─── Area 4: Freelancer Assignment ─────────────────────────────

export interface FreelancerRequirement {
  specialty: FreelancerSpecialty;
  quantity: number;
  requiredLanguages?: string[];
  requiredSeniority?: Seniority;
  requiresDrone?: boolean;
}

export interface AssignmentInput {
  orderId: string;
  eventDates: string[];
  requirements: FreelancerRequirement[];
  availableFreelancers: Freelancer[];
  budgetForFreelancers: number;
}

export interface AssignmentResult {
  feasible: boolean;
  assignments: {
    freelancerId: string;
    freelancerName: string;
    specialty: FreelancerSpecialty;
    seniority: Seniority;
    languages: string[];
    dailyRate: number;
    totalFee: number;
    matchScore: number;
  }[];
  totalCost: number;
  budgetRemaining: number;
  unfilledRequirements: FreelancerRequirement[];
  solverTimeMs: number;
}

// ─── Area 5: Itinerary & Catering Generator ────────────────────

export interface Attraction {
  id: string;
  name: string;
  ticketPrice: number;
  rating: number;
  durationHours: number;
  category: string;
  locationArea: string;
  distanceFromCenter: number;
}

export interface ItineraryInput {
  days: number;
  budgetPerPerson: number;
  participantCount: number;
  locationArea: string;
  availableAttractions: Attraction[];
  maxHoursPerDay: number;
  preferences?: string[];
}

export interface ItineraryResult {
  feasible: boolean;
  dailySchedule: {
    day: number;
    attractions: {
      attractionId: string;
      name: string;
      ticketPrice: number;
      rating: number;
      durationHours: number;
      startTime: string;
      endTime: string;
    }[];
    totalTicketCost: number;
    totalHours: number;
    averageRating: number;
  }[];
  totalCostPerPerson: number;
  totalCost: number;
  budgetRemaining: number;
  overallRating: number;
  solverTimeMs: number;
}

export interface CateringMenuItem {
  id: string;
  name: string;
  category: "protein" | "vegetable" | "carb" | "fruit" | "drink" | "snack";
  vendorId: string;
  vendorName: string;
  pricePerPortion: number;
  rating: number;
}

export interface CateringInput {
  budgetPerPortion: number;
  participantCount: number;
  minimumCategories: ("protein" | "vegetable" | "carb" | "fruit" | "drink")[];
  availableMenuItems: CateringMenuItem[];
}

export interface CateringResult {
  feasible: boolean;
  selectedMenu: {
    itemId: string;
    name: string;
    category: string;
    vendorName: string;
    pricePerPortion: number;
    rating: number;
  }[];
  costPerPortion: number;
  totalCost: number;
  budgetRemaining: number;
  averageRating: number;
  categoriesCovered: string[];
  solverTimeMs: number;
}

// ─── Unified Optimization Log ──────────────────────────────────

export type OptimizationType =
  | "supply_chain"
  | "consolidation"
  | "portfolio"
  | "freelancer_assignment"
  | "itinerary"
  | "catering";

export interface OptimizationLog {
  id: string;
  orderId?: string;
  type: OptimizationType;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
  feasible: boolean;
  totalOptimizedCost: number;
  marginAchieved: number;
  solverTimeMs: number;
  createdAt: string;
  createdBy: string;
}
