# Quick Start Guide - Supabase Backend Integration

Get your Smart Energy Optimization Dashboard up and running with Supabase in 5 minutes.

## Prerequisites

✅ Supabase project created  
✅ Database tables created (see steps below)  
✅ Environment variables configured  

## Step 1: Create Database Tables

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/{your-project-id}

2. Navigate to **SQL Editor** in the left sidebar

3. Copy the contents of `/src/imports/supabase-schema.sql` and paste into the editor

4. Click **Run** to create all tables

5. Verify tables were created:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
     AND table_name IN ('campuses', 'buildings', 'energy_data', 'predictions', 'user_inputs');
   ```

## Step 2: Generate Demo Data (Optional)

### Method 1: Via Dashboard Settings Page

1. Open your dashboard application
2. Navigate to **Settings** page
3. Scroll to **Database Management** section
4. Click **Generate Demo Data** button
5. Wait for confirmation
6. Refresh the page

### Method 2: Via Browser Console

1. Open your dashboard application
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Run:
   ```javascript
   window.seedDemoData()
   ```
5. Wait for success message
6. Refresh the page

## Step 3: Configure Your Campus

### Option A: Use Demo Campus (if you generated demo data)

The demo data creates a pre-configured campus. Just refresh and you're done!

### Option B: Create Your Own Campus

1. Navigate to **Campus Profile** page
2. Fill in your campus details:
   - Campus Size (Small/Medium/Large)
   - Number of Buildings
   - Average Occupancy %
   - Location
   - Hostels (Yes/No)
   - Peak Hours
   - Event Frequency

3. Click **Save Campus Configuration**

4. Wait for data generation to complete

5. Navigate to **Dashboard** to see your data

## Step 4: Explore the Dashboard

Once your campus is configured, all pages will display live data from Supabase:

### 📊 Dashboard
- Real-time energy metrics
- 30-day historical consumption charts
- Cost analysis
- Occupancy trends

### 🔮 Forecast
- 7-day energy predictions
- Peak demand forecasts
- Weather-adjusted predictions
- Scenario planning

### 💡 Insights
- AI-powered optimization recommendations
- Anomaly detection
- Efficiency scoring
- Savings calculations

### 🌱 Sustainability
- Carbon footprint tracking
- Renewable energy metrics
- Emissions trends
- Green energy goals

### 📈 Reports
- Comprehensive analytics
- Custom date ranges
- Export functionality
- Historical comparisons

## Verification

### Check Data Loading

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. You should see logs like:
   ```
   Loading campus data from Supabase...
   Campus loaded: {campus details}
   Energy data records: 720
   ```

### Check Database

1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. Check record counts:
   - `campuses` - Should have 1+ records
   - `energy_data` - Should have 720+ records (30 days × 24 hours)
   - `predictions` - Should have 24-48 records

### Check API

Test the health endpoint:
```bash
curl https://{your-project-id}.supabase.co/functions/v1/make-server-33a46fa6/health
```

Expected response:
```json
{"status":"ok"}
```

## Troubleshooting

### ❌ "Campus Not Configured" Message

**Solution**: Navigate to Campus Profile page and create a campus

### ❌ Loading Spinner Never Stops

**Solution**: 
1. Check browser console for errors
2. Verify Supabase project is active
3. Check that tables exist in database
4. Verify Edge Functions are deployed

### ❌ Demo Data Generator Fails

**Possible causes**:
1. Tables don't exist - Run schema SQL first
2. Row Level Security blocking inserts - Disable RLS for prototyping
3. Network issues - Check internet connection

**Fix**:
```sql
-- Disable RLS on all tables
ALTER TABLE campuses DISABLE ROW LEVEL SECURITY;
ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;
ALTER TABLE energy_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_inputs DISABLE ROW LEVEL SECURITY;
```

### ❌ Charts Show No Data

**Solution**:
1. Verify energy_data table has records
2. Check that campus_id matches
3. Inspect browser Network tab for failed API calls
4. Check date ranges

## API Testing

Test API endpoints manually:

### Get All Campuses
```bash
curl -H "Authorization: Bearer {YOUR_ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-33a46fa6/campuses
```

### Get Energy Data
```bash
curl -H "Authorization: Bearer {YOUR_ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-33a46fa6/energy-data/{CAMPUS_ID}?limit=10
```

### Get Predictions
```bash
curl -H "Authorization: Bearer {YOUR_ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-33a46fa6/predictions/{CAMPUS_ID}
```

## Next Steps

### ✨ Recommended Actions

1. **Customize Your Campus** - Update campus profile with real data
2. **Explore Analytics** - Navigate through all dashboard pages
3. **Test Predictions** - Use the Custom Energy Prediction simulator
4. **Review Insights** - Check optimization recommendations
5. **Export Reports** - Generate and download reports

### 🚀 Advanced Features

1. **Connect ML Models** - Integrate Python prediction service
2. **Real Meter Data** - Connect to actual smart meters
3. **User Authentication** - Add Supabase Auth
4. **Real-time Updates** - Implement Supabase Realtime
5. **Building Analytics** - Track per-building consumption

## Support Resources

- **Documentation**: See `SUPABASE_INTEGRATION.md`
- **Schema**: See `supabase-schema.sql`
- **API Docs**: Check server endpoints in `/supabase/functions/server/index.tsx`
- **Supabase Docs**: https://supabase.com/docs

## Summary

You now have a fully functional Smart Energy Optimization Dashboard with:

✅ Supabase PostgreSQL backend  
✅ RESTful API with Hono server  
✅ 30 days of historical energy data  
✅ Real-time analytics and predictions  
✅ Dynamic chart visualizations  
✅ AI-powered recommendations  

**Happy optimizing! ⚡🌱**
