# Supabase Backend Integration

## Overview

The Smart Energy Optimization Dashboard now uses **Supabase PostgreSQL** as its backend database, replacing all placeholder and hardcoded data. All dashboard analytics, charts, forecasts, and recommendations are now dynamically fetched from the database.

## Database Schema

The following tables have been created in Supabase:

### 1. **campuses**
Stores campus configuration and profile information.

```sql
CREATE TABLE campuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  num_buildings INTEGER,
  campus_size TEXT CHECK (campus_size IN ('Small', 'Medium', 'Large')),
  avg_occupancy INTEGER,
  has_hostels BOOLEAN DEFAULT false,
  peak_hours_start TIME,
  peak_hours_end TIME,
  special_event_frequency TEXT CHECK (special_event_frequency IN ('Rare', 'Monthly', 'Weekly')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. **buildings**
Stores building information for each campus.

```sql
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
  building_name TEXT,
  building_type TEXT,
  floor_area INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. **energy_data**
Stores historical and real-time energy consumption data.

```sql
CREATE TABLE energy_data (
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

-- Performance indexes
CREATE INDEX idx_energy_data_campus_timestamp ON energy_data(campus_id, timestamp DESC);
CREATE INDEX idx_energy_data_timestamp ON energy_data(timestamp DESC);
```

### 4. **predictions**
Stores AI-generated energy consumption predictions.

```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
  prediction_time TIMESTAMP NOT NULL,
  predicted_energy NUMERIC NOT NULL,
  efficiency_score INTEGER,
  recommendation TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_predictions_campus_time ON predictions(campus_id, prediction_time ASC);
```

### 5. **user_inputs**
Stores manual user inputs from the Custom Energy Prediction feature.

```sql
CREATE TABLE user_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
  input_date DATE,
  input_time TIME,
  occupancy INTEGER,
  temperature NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Architecture

### Frontend → Server → Database

```
React Frontend (Supabase Client)
         ↓
Hono Web Server (Edge Functions)
         ↓
Supabase PostgreSQL
```

## API Endpoints

All endpoints are available at:
```
https://{projectId}.supabase.co/functions/v1/make-server-33a46fa6
```

### Campus Profile Endpoints

- **GET** `/campuses` - Get all campuses
- **GET** `/campus/:id` - Get campus by ID
- **POST** `/campus` - Create or update campus profile
- **DELETE** `/campus/:id` - Delete campus

### Energy Data Endpoints

- **GET** `/energy-data/:campusId?start_date=&end_date=&limit=` - Get energy data with filters
- **POST** `/energy-data` - Bulk insert energy data records

### Predictions Endpoints

- **GET** `/predictions/:campusId?limit=` - Get predictions for campus
- **POST** `/predictions` - Create predictions (for ML integration)

### Buildings Endpoints

- **GET** `/buildings/:campusId` - Get all buildings for campus
- **POST** `/buildings` - Create building

### Analytics Endpoints

- **GET** `/analytics/:campusId/metrics` - Get aggregated campus metrics

### User Inputs Endpoints

- **GET** `/user-inputs/:campusId?limit=` - Get user inputs
- **POST** `/user-inputs` - Create user input

## Frontend Integration

### Supabase Client

The frontend uses the Supabase JavaScript client:

```typescript
import { supabase } from './utils/supabase';
```

### API Functions

All API interactions are in `/src/app/utils/supabase.ts`:

```typescript
import {
  getCampuses,
  getCampus,
  createOrUpdateCampus,
  getEnergyData,
  getPredictions,
  getCampusMetrics,
} from './utils/supabase';
```

### Campus Context Integration

The `CampusContext` now:
- ✅ Loads campus profiles from Supabase on app initialization
- ✅ Generates and saves energy data to Supabase
- ✅ Stores predictions in the database
- ✅ Fetches real-time analytics from backend
- ✅ Persists campus configuration across sessions

## How It Works

### 1. **Campus Configuration**
When a user configures their campus profile:
1. Profile is saved to `campuses` table
2. 30 days of historical energy data is generated and stored
3. 24-48 hours of predictions are generated
4. Campus ID is saved to localStorage for persistence

### 2. **Dashboard Data Loading**
- On app load, the system checks localStorage for saved campus ID
- Fetches campus profile from Supabase
- Loads energy data and predictions
- If no data exists, generates and saves simulation data
- All dashboard charts use data from Supabase

### 3. **Data Flow**

```
User configures campus
       ↓
Data saved to Supabase
       ↓
Dashboard fetches from DB
       ↓
Charts/Analytics display
```

## Demo Data Generator

For testing purposes, a demo data seeder is available:

### Via Settings Page
1. Navigate to **Settings** page
2. Scroll to **Database Management** section
3. Click **Generate Demo Data** button
4. Refresh the page to load the demo campus

### Via Browser Console
```javascript
// Open browser console and run:
window.seedDemoData()
```

This creates:
- ✅ 1 demo campus profile
- ✅ 720 energy data records (30 days × 24 hours)
- ✅ 48 prediction records

## Machine Learning Integration

The system is designed to support future ML integration:

### Python ML Service Example

```python
import requests
import json

# Generate predictions using your ML model
predictions = [
    {
        "campus_id": "your-campus-id",
        "prediction_time": "2026-03-06T10:00:00Z",
        "predicted_energy": 450.5,
        "efficiency_score": 85,
        "recommendation": "Consider load shifting"
    }
]

# Post to API
response = requests.post(
    'https://your-project.supabase.co/functions/v1/make-server-33a46fa6/predictions',
    headers={'Authorization': 'Bearer YOUR_ANON_KEY'},
    json=predictions
)
```

## Database Access

### Via Supabase Dashboard
View your database at:
```
https://supabase.com/dashboard/project/{projectId}/database/tables
```

### Direct SQL Queries
You can run SQL queries directly in the Supabase SQL Editor:

```sql
-- Get total energy consumption for a campus
SELECT 
  DATE(timestamp) as date,
  SUM(energy_consumption) as total_energy,
  AVG(occupancy) as avg_occupancy
FROM energy_data
WHERE campus_id = 'your-campus-id'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

## Configuration

### Environment Variables (Already Configured)
```
SUPABASE_URL - Your Supabase project URL
SUPABASE_ANON_KEY - Public anonymous key
SUPABASE_SERVICE_ROLE_KEY - Service role key (server-side only)
```

### Frontend Configuration
Located in `/utils/supabase/info.tsx` (auto-generated, do not edit)

## Error Handling

The system includes comprehensive error handling:

- ✅ Network errors are logged to console
- ✅ Fallback to local generation if Supabase is unavailable
- ✅ User-friendly error messages
- ✅ Loading states during data fetches

## Performance Optimizations

- ✅ Database indexes on timestamp and campus_id
- ✅ Limit queries to prevent large data transfers
- ✅ Caching via React state management
- ✅ Efficient bulk insert operations

## Next Steps

### Recommended Enhancements
1. **Add Authentication** - Implement user signup/login
2. **Real Meter Integration** - Connect to actual smart meters
3. **ML Model Integration** - Deploy Python prediction service
4. **Real-time Updates** - Use Supabase Realtime subscriptions
5. **Data Export** - Add CSV/Excel export functionality
6. **Building-level Analytics** - Expand to per-building tracking

## Troubleshooting

### Data Not Loading
- Check browser console for errors
- Verify Supabase project is active
- Ensure tables exist in database
- Check network tab for failed requests

### Demo Data Not Creating
- Verify table permissions in Supabase
- Check RLS (Row Level Security) policies
- Ensure foreign key constraints are satisfied

### Charts Showing No Data
- Confirm campus profile is configured
- Verify energy_data table has records
- Check date range filters

## Support

For issues or questions:
1. Check browser console for detailed error logs
2. Review Supabase Edge Function logs
3. Verify database schema matches documentation
4. Test API endpoints directly using Postman/curl

---

**Status**: ✅ Fully Integrated and Operational

All dashboard pages now fetch data from Supabase PostgreSQL instead of using hardcoded placeholders.
