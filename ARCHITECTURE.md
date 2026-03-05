# System Architecture Diagram

## Complete Supabase Backend Integration

```
┌───────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              React Frontend Application                      │    │
│  │                                                               │    │
│  │  Pages:                                                       │    │
│  │  ┌────────────┐  ┌──────────┐  ┌─────────┐  ┌────────────┐ │    │
│  │  │ Dashboard  │  │ Forecast │  │ Insights│  │Sustainability│ │    │
│  │  └────────────┘  └──────────┘  └─────────┘  └────────────┘ │    │
│  │                                                               │    │
│  │  ┌────────────────────────────────────────────────────────┐ │    │
│  │  │         CampusContext (Global State)                   │ │    │
│  │  │  • Campus Profile                                      │ │    │
│  │  │  • Simulation Data (from Supabase)                    │ │    │
│  │  │  • Loading States                                      │ │    │
│  │  └────────────────────────────────────────────────────────┘ │    │
│  │                           ↕                                  │    │
│  │  ┌────────────────────────────────────────────────────────┐ │    │
│  │  │      Supabase Client (/utils/supabase.ts)             │ │    │
│  │  │  • getCampuses()                                       │ │    │
│  │  │  • getEnergyData()                                     │ │    │
│  │  │  • getPredictions()                                    │ │    │
│  │  │  • createOrUpdateCampus()                              │ │    │
│  │  └────────────────────────────────────────────────────────┘ │    │
│  └───────────────────────────┬───────────────────────────────────┘    │
└────────────────────────────────┼───────────────────────────────────────┘
                                 │
                                 │ HTTPS REST API
                                 │
┌────────────────────────────────┼───────────────────────────────────────┐
│                                ↓                                       │
│                    SUPABASE CLOUD                                      │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │           Supabase Edge Functions                            │    │
│  │                                                               │    │
│  │  ┌────────────────────────────────────────────────────────┐ │    │
│  │  │      Hono Web Server (index.tsx)                        │ │    │
│  │  │                                                          │ │    │
│  │  │  API Endpoints:                                         │ │    │
│  │  │  • GET  /campuses                                       │ │    │
│  │  │  • POST /campus                                         │ │    │
│  │  │  • GET  /energy-data/:campusId                         │ │    │
│  │  │  • POST /energy-data                                    │ │    │
│  │  │  • GET  /predictions/:campusId                         │ │    │
│  │  │  • POST /predictions                                    │ │    │
│  │  │  • GET  /buildings/:campusId                           │ │    │
│  │  │  • GET  /analytics/:campusId/metrics                   │ │    │
│  │  │                                                          │ │    │
│  │  └────────────────────────────────────────────────────────┘ │    │
│  └───────────────────────────┬──────────────────────────────────┘    │
│                               │                                       │
│                               │ SQL Queries                           │
│                               ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │              PostgreSQL Database                             │    │
│  │                                                               │    │
│  │  Tables:                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │    │
│  │  │   campuses   │  │   buildings  │  │ energy_data  │       │    │
│  │  │              │  │              │  │              │       │    │
│  │  │ • id         │  │ • id         │  │ • id         │       │    │
│  │  │ • name       │  │ • campus_id  │  │ • campus_id  │       │    │
│  │  │ • location   │  │ • name       │  │ • timestamp  │       │    │
│  │  │ • size       │  │ • type       │  │ • energy     │       │    │
│  │  │ • occupancy  │  │ • area       │  │ • occupancy  │       │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │    │
│  │                                                               │    │
│  │  ┌──────────────┐  ┌──────────────┐                         │    │
│  │  │ predictions  │  │ user_inputs  │                         │    │
│  │  │              │  │              │                         │    │
│  │  │ • id         │  │ • id         │                         │    │
│  │  │ • campus_id  │  │ • campus_id  │                         │    │
│  │  │ • time       │  │ • date       │                         │    │
│  │  │ • energy     │  │ • occupancy  │                         │    │
│  │  │ • score      │  │ • temp       │                         │    │
│  │  └──────────────┘  └──────────────┘                         │    │
│  └──────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────────────┐
│                    OPTIONAL: ML INTEGRATION                            │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │               Python ML Service (Future)                     │    │
│  │                                                               │    │
│  │  ┌────────────────────────────────────────────────────────┐ │    │
│  │  │  1. Fetch historical data from API                     │ │    │
│  │  │  2. Run ML model (TensorFlow/PyTorch)                 │ │    │
│  │  │  3. Generate predictions                               │ │    │
│  │  │  4. POST predictions to API                            │ │    │
│  │  └────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────┬───────────────────────────────────────┘    │
│                         │                                             │
│                         │ POST /predictions                           │
│                         ↓                                             │
│              (Connects to Supabase API)                               │
└────────────────────────────────────────────────────────────────────────┘


DATA FLOW EXAMPLE - Creating a Campus Profile:
───────────────────────────────────────────────

1. User fills campus profile form
         ↓
2. React calls updateCampusProfile()
         ↓
3. CampusContext → createOrUpdateCampus()
         ↓
4. POST https://{project}.supabase.co/functions/v1/make-server-33a46fa6/campus
         ↓
5. Hono server → INSERT INTO campuses
         ↓
6. Returns campus with UUID
         ↓
7. Generate 30 days × 24 hours = 720 energy records
         ↓
8. POST /energy-data (bulk insert)
         ↓
9. Generate 48 predictions
         ↓
10. POST /predictions
         ↓
11. Calculate metrics
         ↓
12. Update React state
         ↓
13. Dashboard re-renders with Supabase data
         ↓
14. ✅ User sees personalized energy analytics


KEY FEATURES:
─────────────

✅ Persistent Data - All data stored in PostgreSQL
✅ Real-time Analytics - Metrics calculated from actual database records
✅ Multi-Campus - Support for multiple campus profiles
✅ ML Ready - Predictions table ready for AI integration
✅ Scalable - Indexed queries, optimized performance
✅ Type-Safe - Full TypeScript types for all API calls
✅ Error Handling - Graceful fallbacks if Supabase unavailable
✅ Demo Mode - Seed data generator for testing
