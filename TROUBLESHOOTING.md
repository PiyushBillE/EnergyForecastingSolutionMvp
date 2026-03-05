# Troubleshooting Guide - Supabase Integration

## Common Issues and Solutions

---

## 🔴 Issue: "Campus Not Configured" Message

### Symptoms
- Dashboard shows empty state
- Message: "Please configure your campus profile"

### Cause
No campus profile has been created yet.

### Solution
1. Navigate to **Campus Profile** page (`/campus-profile`)
2. Fill in all campus details
3. Click **Save Campus Configuration**
4. Wait for confirmation
5. Navigate back to Dashboard

---

## 🔴 Issue: Loading Spinner Never Stops

### Symptoms
- "Loading campus data..." message persists
- Dashboard never loads

### Possible Causes & Solutions

#### 1. Supabase Project Inactive
**Check**: Go to https://supabase.com/dashboard
**Solution**: Ensure project status is "Active"

#### 2. Tables Don't Exist
**Check**: Browser console shows "relation does not exist"
**Solution**: 
```sql
-- Run in Supabase SQL Editor
\dt public.*
```
If tables missing, run `/src/imports/supabase-schema.sql`

#### 3. Network Issues
**Check**: Browser Network tab shows failed requests
**Solution**: 
- Check internet connection
- Verify no firewall blocking Supabase
- Try different network

#### 4. Edge Functions Not Deployed
**Check**: 
```bash
curl https://{PROJECT_ID}.supabase.co/functions/v1/make-server-33a46fa6/health
```
**Solution**: Edge Functions should auto-deploy. Check Supabase Functions page.

#### 5. CORS Errors
**Check**: Console shows CORS policy error
**Solution**: Already configured in server. Clear browser cache and retry.

---

## 🔴 Issue: Demo Data Generator Fails

### Error: "relation does not exist"

**Cause**: Database tables not created

**Solution**:
1. Go to Supabase Dashboard → SQL Editor
2. Paste contents of `/src/imports/supabase-schema.sql`
3. Click **Run**
4. Verify tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Error: "permission denied"

**Cause**: Row Level Security (RLS) blocking inserts

**Solution**:
```sql
-- Disable RLS for prototyping
ALTER TABLE campuses DISABLE ROW LEVEL SECURITY;
ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;
ALTER TABLE energy_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_inputs DISABLE ROW LEVEL SECURITY;
```

### Error: "violates foreign key constraint"

**Cause**: Referential integrity issue

**Solution**:
1. Delete existing test data:
```sql
DELETE FROM user_inputs;
DELETE FROM predictions;
DELETE FROM energy_data;
DELETE FROM buildings;
DELETE FROM campuses;
```
2. Run demo data generator again

---

## 🔴 Issue: Charts Show No Data

### Symptom
Dashboard loads but charts are empty

### Diagnosis Steps

1. **Check Energy Data Exists**
```sql
SELECT COUNT(*) FROM energy_data WHERE campus_id = 'YOUR_CAMPUS_ID';
```
Should return > 0

2. **Check Date Range**
```sql
SELECT MIN(timestamp), MAX(timestamp) 
FROM energy_data 
WHERE campus_id = 'YOUR_CAMPUS_ID';
```
Should cover last 30 days

3. **Check Browser Console**
Look for API errors or data parsing issues

### Solutions

**If No Data**:
- Recreate campus profile (triggers data generation)
- OR run demo data generator

**If Data Exists But Not Showing**:
- Check campus_id matches between localStorage and database
- Clear browser cache and localStorage
- Refresh page

---

## 🔴 Issue: API Returns 404 Not Found

### Error: "GET /campuses returns 404"

**Cause**: Edge Function not deployed or incorrect URL

**Check**:
```bash
# Test health endpoint
curl https://{PROJECT_ID}.supabase.co/functions/v1/make-server-33a46fa6/health

# Should return: {"status":"ok"}
```

**Solution**:
1. Verify project ID in `/utils/supabase/info.tsx`
2. Check Edge Function is deployed in Supabase Dashboard
3. Verify URL format is correct

---

## 🔴 Issue: Predictions Not Showing

### Symptom
Forecast page shows no predictions

### Check Database
```sql
SELECT COUNT(*) FROM predictions WHERE campus_id = 'YOUR_CAMPUS_ID';
```

### Solution
If count is 0:
1. Campus was created before predictions feature
2. Recreate campus profile OR
3. Manually generate predictions:
```javascript
// In browser console
import { createPredictions } from './utils/supabase';

const predictions = [];
for (let i = 0; i < 24; i++) {
  predictions.push({
    campus_id: 'YOUR_CAMPUS_ID',
    prediction_time: new Date(Date.now() + i * 3600000).toISOString(),
    predicted_energy: 50 + Math.random() * 100,
    efficiency_score: 70 + Math.random() * 20
  });
}

await createPredictions(predictions);
```

---

## 🔴 Issue: "Cannot read property of undefined"

### Symptom
JavaScript errors about undefined properties

### Common Causes

1. **simulationData is null**
- Wait for data to load
- Check loading state is handled

2. **Campus profile missing fields**
```javascript
// Check in console
const { campusProfile } = useCampus();
console.log(campusProfile);
```

3. **API response format changed**
- Verify API returns expected structure
- Check TypeScript interfaces match database

---

## 🔴 Issue: Slow Performance

### Symptom
Dashboard takes long to load

### Optimizations

1. **Check Data Volume**
```sql
SELECT 
  'energy_data' as table, COUNT(*) as count, 
  pg_size_pretty(pg_total_relation_size('energy_data')) as size
FROM energy_data
UNION ALL
SELECT 
  'predictions' as table, COUNT(*) as count,
  pg_size_pretty(pg_total_relation_size('predictions')) as size
FROM predictions;
```

2. **Add Indexes** (should already exist)
```sql
-- Verify indexes exist
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public';
```

3. **Limit Query Results**
- Use `limit` parameter in API calls
- Only fetch needed date ranges

4. **Clear Old Data**
```sql
-- Delete data older than 90 days
DELETE FROM energy_data 
WHERE timestamp < NOW() - INTERVAL '90 days';

DELETE FROM predictions 
WHERE created_at < NOW() - INTERVAL '7 days';
```

---

## 🔴 Issue: Metrics Don't Match Expected Values

### Symptom
Dashboard shows unexpected energy values

### Verification

1. **Check Raw Data**
```sql
SELECT 
  DATE(timestamp) as date,
  SUM(energy_consumption) as total_energy,
  AVG(occupancy) as avg_occupancy
FROM energy_data
WHERE campus_id = 'YOUR_CAMPUS_ID'
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

2. **Verify Calculation Logic**
- Check `getCampusMetrics()` endpoint
- Verify data aggregation in CampusContext

3. **Compare with Database**
- Run same calculations in SQL
- Compare with frontend metrics

---

## 🔧 Developer Tools

### Useful SQL Queries

**Check All Campus Data**
```sql
SELECT 
  c.name,
  c.location,
  (SELECT COUNT(*) FROM energy_data WHERE campus_id = c.id) as energy_records,
  (SELECT COUNT(*) FROM predictions WHERE campus_id = c.id) as prediction_records,
  (SELECT COUNT(*) FROM buildings WHERE campus_id = c.id) as building_count
FROM campuses c;
```

**Recent Energy Data**
```sql
SELECT 
  timestamp,
  energy_consumption,
  occupancy,
  temperature
FROM energy_data
WHERE campus_id = 'YOUR_CAMPUS_ID'
ORDER BY timestamp DESC
LIMIT 10;
```

**Check Predictions**
```sql
SELECT 
  prediction_time,
  predicted_energy,
  efficiency_score
FROM predictions
WHERE campus_id = 'YOUR_CAMPUS_ID'
  AND prediction_time > NOW()
ORDER BY prediction_time ASC
LIMIT 10;
```

### Browser Console Debugging

**Check Campus Context State**
```javascript
// In any page component
const { campusProfile, simulationData, isLoading } = useCampus();
console.log('Profile:', campusProfile);
console.log('Data:', simulationData);
console.log('Loading:', isLoading);
```

**Test API Directly**
```javascript
import { getCampuses, getEnergyData } from './utils/supabase';

// Test API calls
const campuses = await getCampuses();
console.log('Campuses:', campuses);

const energyData = await getEnergyData('CAMPUS_ID', { limit: 10 });
console.log('Energy Data:', energyData);
```

**Regenerate Data**
```javascript
// Force data regeneration
localStorage.removeItem('currentCampusId');
window.location.reload();
```

---

## 🧪 Testing Checklist

Use this checklist to verify everything works:

### Database Setup
- [ ] Tables exist in Supabase
- [ ] Indexes are created
- [ ] Foreign keys are set up
- [ ] RLS is disabled (for prototyping)

### API Endpoints
- [ ] Health check returns OK
- [ ] GET /campuses returns array
- [ ] POST /campus creates record
- [ ] GET /energy-data returns data
- [ ] GET /predictions returns forecasts

### Frontend Integration
- [ ] App loads without errors
- [ ] CampusContext loads data
- [ ] Dashboard shows metrics
- [ ] Charts render correctly
- [ ] Forecast page shows predictions
- [ ] Campus profile saves

### Data Flow
- [ ] Campus creation triggers data generation
- [ ] Energy data is stored in database
- [ ] Predictions are generated and stored
- [ ] Metrics are calculated correctly
- [ ] Data persists after refresh

---

## 📞 Getting Help

### Check Logs

**Browser Console**
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

**Supabase Logs**
- Go to Supabase Dashboard
- Navigate to Edge Functions → Logs
- Check for server-side errors

### Useful Commands

**Reset Everything**
```sql
-- Nuclear option: Delete all data
TRUNCATE campuses CASCADE;
```

**Start Fresh**
```javascript
// Clear local storage
localStorage.clear();
// Reload app
window.location.reload();
// Run demo data generator
window.seedDemoData();
```

---

## 💡 Pro Tips

1. **Always check browser console first** - Most issues show error messages there

2. **Use demo data for testing** - Faster than creating manual campus profiles

3. **Check Supabase dashboard** - View actual database records

4. **Test API endpoints separately** - Isolate frontend vs backend issues

5. **Enable verbose logging** - Add more console.log statements during debugging

6. **Compare with working state** - Create fresh demo campus to compare

---

## ✅ Still Need Help?

If you've tried everything above and still have issues:

1. **Document the error**
   - Screenshot of error message
   - Browser console output
   - Steps to reproduce

2. **Check system status**
   - Supabase status page
   - Network connectivity
   - Browser compatibility

3. **Simplify the problem**
   - Does demo data work?
   - Does API health check work?
   - Does fresh campus profile work?

4. **Review documentation**
   - SUPABASE_INTEGRATION.md
   - QUICKSTART.md
   - ARCHITECTURE.md

Most issues are resolved by:
- ✅ Ensuring tables exist
- ✅ Disabling RLS
- ✅ Using correct project ID
- ✅ Checking network connectivity
- ✅ Clearing browser cache

Good luck! 🚀
