-- Smart Energy Optimization Dashboard - Supabase Database Schema
-- Run this script in Supabase SQL Editor to create all required tables

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== CAMPUSES TABLE ====================
-- Stores campus profile information
CREATE TABLE IF NOT EXISTS campuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  num_buildings INTEGER,
  campus_size TEXT CHECK (campus_size IN ('Small', 'Medium', 'Large')),
  avg_occupancy INTEGER,
  has_hostels BOOLEAN DEFAULT false,
  peak_hours_start TEXT,
  peak_hours_end TEXT,
  special_event_frequency TEXT CHECK (special_event_frequency IN ('Rare', 'Monthly', 'Weekly')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_campuses_created_at ON campuses(created_at DESC);

-- ==================== BUILDINGS TABLE ====================
-- Stores building information for each campus
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
  building_name TEXT,
  building_type TEXT,
  floor_area INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for campus lookups
CREATE INDEX IF NOT EXISTS idx_buildings_campus_id ON buildings(campus_id);

-- ==================== ENERGY DATA TABLE ====================
-- Stores historical and real-time energy consumption data
CREATE TABLE IF NOT EXISTS energy_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  timestamp TIMESTAMP NOT NULL,
  occupancy INTEGER,
  temperature NUMERIC,
  humidity NUMERIC,
  energy_consumption NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance indexes for time-series queries
CREATE INDEX IF NOT EXISTS idx_energy_data_campus_timestamp ON energy_data(campus_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_energy_data_timestamp ON energy_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_energy_data_building ON energy_data(building_id, timestamp DESC);

-- ==================== PREDICTIONS TABLE ====================
-- Stores AI-generated energy consumption predictions
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
  prediction_time TIMESTAMP NOT NULL,
  predicted_energy NUMERIC NOT NULL,
  efficiency_score INTEGER,
  recommendation TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for prediction queries
CREATE INDEX IF NOT EXISTS idx_predictions_campus_time ON predictions(campus_id, prediction_time ASC);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);

-- ==================== USER INPUTS TABLE ====================
-- Stores manual user inputs from the prediction simulator
CREATE TABLE IF NOT EXISTS user_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
  input_date DATE,
  input_time TIME,
  occupancy INTEGER,
  temperature NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for user input queries
CREATE INDEX IF NOT EXISTS idx_user_inputs_campus ON user_inputs(campus_id, created_at DESC);

-- ==================== SAMPLE DATA (OPTIONAL) ====================
-- Uncomment to insert a demo campus for testing

-- INSERT INTO campuses (name, location, num_buildings, campus_size, avg_occupancy, has_hostels, peak_hours_start, peak_hours_end, special_event_frequency)
-- VALUES ('Demo University Campus', 'Mumbai, Maharashtra', 12, 'Medium', 75, true, '09:00', '17:00', 'Monthly');

-- ==================== VERIFICATION QUERIES ====================
-- Run these to verify tables were created successfully

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('campuses', 'buildings', 'energy_data', 'predictions', 'user_inputs');

-- Count records in each table
SELECT 
  'campuses' as table_name, COUNT(*) as record_count FROM campuses
UNION ALL
SELECT 
  'buildings' as table_name, COUNT(*) as record_count FROM buildings
UNION ALL
SELECT 
  'energy_data' as table_name, COUNT(*) as record_count FROM energy_data
UNION ALL
SELECT 
  'predictions' as table_name, COUNT(*) as record_count FROM predictions
UNION ALL
SELECT 
  'user_inputs' as table_name, COUNT(*) as record_count FROM user_inputs;

-- ==================== RLS POLICIES (OPTIONAL) ====================
-- Row Level Security - Enable if you need user authentication

-- Enable RLS on all tables (optional - currently disabled for simplicity)
-- ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE energy_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_inputs ENABLE ROW LEVEL SECURITY;

-- Example policy for public access (for prototyping)
-- CREATE POLICY "Allow public read access" ON campuses FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert" ON campuses FOR INSERT WITH CHECK (true);

-- ==================== NOTES ====================
-- 1. All tables use CASCADE deletion to maintain referential integrity
-- 2. Indexes are optimized for time-series queries and dashboard analytics
-- 3. UUID primary keys allow distributed systems and prevent ID collisions
-- 4. RLS policies are disabled by default for easier prototyping
-- 5. The schema supports future ML model integration via predictions table

-- ==================== DONE ====================
-- Schema creation complete!
-- You can now use the dashboard to create campus profiles and generate data.
