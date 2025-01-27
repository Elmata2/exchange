import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CostPredictionParams {
  cityId: string;
  durationMonths: number;
  accommodationLevel: number;
  diningLevel: number;
  nightlifeLevel: number;
  activitiesLevel: number;
  shoppingLevel: number;
  localTrips: number;
  internationalTrips: number;
}

export async function getPredictedCost(params: CostPredictionParams): Promise<number> {
  const { data, error } = await supabase
    .rpc('calculate_predicted_cost', {
      p_city_id: params.cityId,
      p_duration_months: params.durationMonths,
      p_accommodation_level: params.accommodationLevel,
      p_dining_level: params.diningLevel,
      p_nightlife_level: params.nightlifeLevel,
      p_activities_level: params.activitiesLevel,
      p_shopping_level: params.shoppingLevel,
      p_local_trips: params.localTrips,
      p_international_trips: params.internationalTrips
    });

  if (error) throw error;
  return data || 0;
}