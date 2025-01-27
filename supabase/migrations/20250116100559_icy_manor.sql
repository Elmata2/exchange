/*
  # Initial Schema Setup for Study Abroad Budget Calculator

  1. New Tables
    - `expense_reports`
      - Historical expense data from students
      - Includes all preference scales and trip counts
      - Links to city and duration
    - `cities`
      - Reference table for supported cities
      - Includes country and currency information
    - `universities`
      - Reference table for universities
      - Links to cities

  2. Security
    - Enable RLS on all tables
    - Public read access for reference data
    - Authenticated write access for expense reports
*/

-- Cities reference table
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  currency text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are viewable by everyone"
  ON cities
  FOR SELECT
  TO public
  USING (true);

-- Universities reference table
CREATE TABLE IF NOT EXISTS universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city_id uuid REFERENCES cities(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Universities are viewable by everyone"
  ON universities
  FOR SELECT
  TO public
  USING (true);

-- Expense reports table
CREATE TABLE IF NOT EXISTS expense_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  city_id uuid REFERENCES cities(id),
  university_id uuid REFERENCES universities(id),
  duration_months integer NOT NULL,
  accommodation_level integer NOT NULL CHECK (accommodation_level BETWEEN 1 AND 5),
  dining_level integer NOT NULL CHECK (dining_level BETWEEN 1 AND 5),
  nightlife_level integer NOT NULL CHECK (nightlife_level BETWEEN 1 AND 5),
  activities_level integer NOT NULL CHECK (activities_level BETWEEN 1 AND 5),
  shopping_level integer NOT NULL CHECK (shopping_level BETWEEN 1 AND 5),
  local_trips integer NOT NULL DEFAULT 0,
  international_trips integer NOT NULL DEFAULT 0,
  total_cost decimal NOT NULL,
  report_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expense_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own expense reports"
  ON expense_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read all expense reports"
  ON expense_reports
  FOR SELECT
  TO authenticated
  USING (true);

-- Create functions for cost prediction
CREATE OR REPLACE FUNCTION calculate_predicted_cost(
  p_city_id uuid,
  p_duration_months integer,
  p_accommodation_level integer,
  p_dining_level integer,
  p_nightlife_level integer,
  p_activities_level integer,
  p_shopping_level integer,
  p_local_trips integer,
  p_international_trips integer
)
RETURNS decimal
LANGUAGE plpgsql
AS $$
DECLARE
  v_predicted_cost decimal;
BEGIN
  -- Calculate average costs based on similar preferences
  SELECT 
    AVG(total_cost) INTO v_predicted_cost
  FROM expense_reports
  WHERE 
    city_id = p_city_id
    AND ABS(duration_months - p_duration_months) <= 1
    AND ABS(accommodation_level - p_accommodation_level) <= 1
    AND ABS(dining_level - p_dining_level) <= 1
    AND ABS(nightlife_level - p_nightlife_level) <= 1
    AND ABS(activities_level - p_activities_level) <= 1
    AND ABS(shopping_level - p_shopping_level) <= 1
    AND ABS(local_trips - p_local_trips) <= 1
    AND ABS(international_trips - p_international_trips) <= 1
    AND report_date >= CURRENT_DATE - INTERVAL '1 year';

  -- If no similar data found, use broader criteria
  IF v_predicted_cost IS NULL THEN
    SELECT 
      AVG(total_cost * (p_duration_months::decimal / duration_months::decimal))
    INTO v_predicted_cost
    FROM expense_reports
    WHERE 
      city_id = p_city_id
      AND report_date >= CURRENT_DATE - INTERVAL '1 year';
  END IF;

  RETURN COALESCE(v_predicted_cost, 0);
END;
$$;