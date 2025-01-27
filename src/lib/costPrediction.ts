interface CostReport {
  cityId: string;
  universityId: string;
  durationMonths: number;
  accommodationLevel: number;
  diningLevel: number;
  nightlifeLevel: number;
  activitiesLevel: number;
  shoppingLevel: number;
  localTrips: number;
  internationalTrips: number;
  totalCost: number;
}

// Sample historical data (in a real app, this would come from a database)
const historicalReports: CostReport[] = [
  {
    cityId: 'paris',
    universityId: 'sorbonne',
    durationMonths: 6,
    accommodationLevel: 4,
    diningLevel: 3,
    nightlifeLevel: 4,
    activitiesLevel: 4,
    shoppingLevel: 3,
    localTrips: 2,
    internationalTrips: 1,
    totalCost: 15000
  },
  // Add more sample data for different cities and preferences
];

const CITY_COST_MULTIPLIERS: Record<string, number> = {
  'paris': 1.2,
  'london': 1.3,
  'barcelona': 0.9,
  'berlin': 0.95,
  'amsterdam': 1.1
};

export interface CostPredictionParams {
  cityId: string;
  universityId: string;
  durationMonths: number;
  accommodationLevel: number;
  diningLevel: number;
  nightlifeLevel: number;
  activitiesLevel: number;
  shoppingLevel: number;
  localTrips: number;
  internationalTrips: number;
}

function calculateSimilarityScore(report: CostReport, params: CostPredictionParams): number {
  const levelDiff = Math.abs(report.accommodationLevel - params.accommodationLevel) +
    Math.abs(report.diningLevel - params.diningLevel) +
    Math.abs(report.nightlifeLevel - params.nightlifeLevel) +
    Math.abs(report.activitiesLevel - params.activitiesLevel) +
    Math.abs(report.shoppingLevel - params.shoppingLevel);
  
  const tripDiff = Math.abs(report.localTrips - params.localTrips) +
    Math.abs(report.internationalTrips - params.internationalTrips);
  
  const durationDiff = Math.abs(report.durationMonths - params.durationMonths);
  
  return 1 / (1 + levelDiff * 0.2 + tripDiff * 0.3 + durationDiff * 0.5);
}

export function getPredictedCost(params: CostPredictionParams): number {
  // Filter reports for the same city
  const cityReports = historicalReports.filter(report => report.cityId === params.cityId);
  
  if (cityReports.length === 0) {
    // Fallback to base calculation if no data
    return calculateBaseCost(params);
  }

  // Calculate weighted average based on similarity
  const totalWeight = cityReports.reduce((sum, report) => 
    sum + calculateSimilarityScore(report, params), 0);
  
  const weightedCost = cityReports.reduce((sum, report) => {
    const similarity = calculateSimilarityScore(report, params);
    const normalizedCost = report.totalCost * (params.durationMonths / report.durationMonths);
    return sum + (normalizedCost * similarity);
  }, 0);

  return Math.round(weightedCost / totalWeight);
}

function calculateBaseCost(params: CostPredictionParams): number {
  const baseMonthlyRate = 2000; // Base cost per month
  const cityMultiplier = CITY_COST_MULTIPLIERS[params.cityId] || 1;
  
  const accommodationCost = baseMonthlyRate * params.accommodationLevel * 0.4;
  const diningCost = baseMonthlyRate * params.diningLevel * 0.2;
  const nightlifeCost = baseMonthlyRate * params.nightlifeLevel * 0.1;
  const activitiesCost = baseMonthlyRate * params.activitiesLevel * 0.15;
  const shoppingCost = baseMonthlyRate * params.shoppingLevel * 0.15;
  
  const monthlyTotal = (accommodationCost + diningCost + nightlifeCost + 
    activitiesCost + shoppingCost) * cityMultiplier;
  
  const tripsCost = (params.localTrips * 200 + params.internationalTrips * 500) * cityMultiplier;
  
  return Math.round((monthlyTotal * params.durationMonths) + tripsCost);
}