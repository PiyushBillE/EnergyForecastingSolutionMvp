import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

// Create Supabase client helper
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
};

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-33a46fa6/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== CAMPUS PROFILE ENDPOINTS ====================

// Get campus profile by ID
app.get("/make-server-33a46fa6/campus/:id", async (c) => {
  try {
    const campusId = c.req.param("id");
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from("campuses")
      .select("*")
      .eq("id", campusId)
      .single();
    
    if (error) {
      console.log(`Error fetching campus ${campusId}: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data);
  } catch (err) {
    console.log(`Server error in GET /campus/:id: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// Get all campuses
app.get("/make-server-33a46fa6/campuses", async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from("campuses")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.log(`Error fetching campuses: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data || []);
  } catch (err) {
    console.log(`Server error in GET /campuses: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// Create or update campus profile
app.post("/make-server-33a46fa6/campus", async (c) => {
  try {
    const body = await c.req.json();
    const supabase = getSupabaseClient();
    
    // If ID is provided, update; otherwise create
    if (body.id) {
      const { data, error } = await supabase
        .from("campuses")
        .update({
          name: body.name,
          location: body.location,
          num_buildings: body.num_buildings,
          campus_size: body.campus_size,
          avg_occupancy: body.avg_occupancy,
          has_hostels: body.has_hostels,
          peak_hours_start: body.peak_hours_start,
          peak_hours_end: body.peak_hours_end,
          special_event_frequency: body.special_event_frequency,
        })
        .eq("id", body.id)
        .select()
        .single();
      
      if (error) {
        console.log(`Error updating campus ${body.id}: ${error.message}`);
        return c.json({ error: error.message }, 500);
      }
      
      return c.json(data);
    } else {
      const { data, error } = await supabase
        .from("campuses")
        .insert({
          name: body.name,
          location: body.location,
          num_buildings: body.num_buildings,
          campus_size: body.campus_size,
          avg_occupancy: body.avg_occupancy,
          has_hostels: body.has_hostels,
          peak_hours_start: body.peak_hours_start,
          peak_hours_end: body.peak_hours_end,
          special_event_frequency: body.special_event_frequency,
        })
        .select()
        .single();
      
      if (error) {
        console.log(`Error creating campus: ${error.message}`);
        return c.json({ error: error.message }, 500);
      }
      
      return c.json(data);
    }
  } catch (err) {
    console.log(`Server error in POST /campus: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// Delete campus profile
app.delete("/make-server-33a46fa6/campus/:id", async (c) => {
  try {
    const campusId = c.req.param("id");
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from("campuses")
      .delete()
      .eq("id", campusId);
    
    if (error) {
      console.log(`Error deleting campus ${campusId}: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json({ success: true });
  } catch (err) {
    console.log(`Server error in DELETE /campus/:id: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// ==================== ENERGY DATA ENDPOINTS ====================

// Get energy data for a campus (with optional date range)
app.get("/make-server-33a46fa6/energy-data/:campusId", async (c) => {
  try {
    const campusId = c.req.param("campusId");
    const startDate = c.req.query("start_date");
    const endDate = c.req.query("end_date");
    const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 100;
    
    const supabase = getSupabaseClient();
    
    let query = supabase
      .from("energy_data")
      .select("*")
      .eq("campus_id", campusId)
      .order("timestamp", { ascending: false })
      .limit(limit);
    
    if (startDate) {
      query = query.gte("timestamp", startDate);
    }
    
    if (endDate) {
      query = query.lte("timestamp", endDate);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.log(`Error fetching energy data for campus ${campusId}: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data || []);
  } catch (err) {
    console.log(`Server error in GET /energy-data/:campusId: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// Bulk insert energy data
app.post("/make-server-33a46fa6/energy-data", async (c) => {
  try {
    const body = await c.req.json();
    const supabase = getSupabaseClient();
    
    // Expecting an array of energy data records
    const records = Array.isArray(body) ? body : [body];
    
    const { data, error } = await supabase
      .from("energy_data")
      .insert(records)
      .select();
    
    if (error) {
      console.log(`Error inserting energy data: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data);
  } catch (err) {
    console.log(`Server error in POST /energy-data: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// ==================== PREDICTIONS ENDPOINTS ====================

// Get predictions for a campus
app.get("/make-server-33a46fa6/predictions/:campusId", async (c) => {
  try {
    const campusId = c.req.param("campusId");
    const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 50;
    
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("campus_id", campusId)
      .order("prediction_time", { ascending: true })
      .limit(limit);
    
    if (error) {
      console.log(`Error fetching predictions for campus ${campusId}: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data || []);
  } catch (err) {
    console.log(`Server error in GET /predictions/:campusId: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// Create predictions (for ML service integration)
app.post("/make-server-33a46fa6/predictions", async (c) => {
  try {
    const body = await c.req.json();
    const supabase = getSupabaseClient();
    
    const records = Array.isArray(body) ? body : [body];
    
    const { data, error } = await supabase
      .from("predictions")
      .insert(records)
      .select();
    
    if (error) {
      console.log(`Error inserting predictions: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data);
  } catch (err) {
    console.log(`Server error in POST /predictions: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// ==================== USER INPUTS ENDPOINTS ====================

// Get user inputs for a campus
app.get("/make-server-33a46fa6/user-inputs/:campusId", async (c) => {
  try {
    const campusId = c.req.param("campusId");
    const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 50;
    
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from("user_inputs")
      .select("*")
      .eq("campus_id", campusId)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      console.log(`Error fetching user inputs for campus ${campusId}: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data || []);
  } catch (err) {
    console.log(`Server error in GET /user-inputs/:campusId: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// Create user input
app.post("/make-server-33a46fa6/user-inputs", async (c) => {
  try {
    const body = await c.req.json();
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from("user_inputs")
      .insert({
        campus_id: body.campus_id,
        input_date: body.input_date,
        input_time: body.input_time,
        occupancy: body.occupancy,
        temperature: body.temperature,
      })
      .select()
      .single();
    
    if (error) {
      console.log(`Error creating user input: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data);
  } catch (err) {
    console.log(`Server error in POST /user-inputs: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// ==================== BUILDINGS ENDPOINTS ====================

// Get buildings for a campus
app.get("/make-server-33a46fa6/buildings/:campusId", async (c) => {
  try {
    const campusId = c.req.param("campusId");
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from("buildings")
      .select("*")
      .eq("campus_id", campusId)
      .order("building_name", { ascending: true });
    
    if (error) {
      console.log(`Error fetching buildings for campus ${campusId}: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data || []);
  } catch (err) {
    console.log(`Server error in GET /buildings/:campusId: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// Create building
app.post("/make-server-33a46fa6/buildings", async (c) => {
  try {
    const body = await c.req.json();
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from("buildings")
      .insert({
        campus_id: body.campus_id,
        building_name: body.building_name,
        building_type: body.building_type,
        floor_area: body.floor_area,
      })
      .select()
      .single();
    
    if (error) {
      console.log(`Error creating building: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data);
  } catch (err) {
    console.log(`Server error in POST /buildings: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// ==================== ANALYTICS ENDPOINTS ====================

// Get aggregated metrics for a campus
app.get("/make-server-33a46fa6/analytics/:campusId/metrics", async (c) => {
  try {
    const campusId = c.req.param("campusId");
    const supabase = getSupabaseClient();
    
    // Get last 30 days of energy data for metrics calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data, error } = await supabase
      .from("energy_data")
      .select("energy_consumption, timestamp, occupancy")
      .eq("campus_id", campusId)
      .gte("timestamp", thirtyDaysAgo.toISOString())
      .order("timestamp", { ascending: true });
    
    if (error) {
      console.log(`Error fetching analytics for campus ${campusId}: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }
    
    if (!data || data.length === 0) {
      return c.json({
        totalEnergy: 0,
        avgDailyEnergy: 0,
        peakDemand: 0,
        avgOccupancy: 0,
        carbonEmissions: 0,
      });
    }
    
    // Calculate metrics
    const totalEnergy = data.reduce((sum, d) => sum + (d.energy_consumption || 0), 0);
    const avgDailyEnergy = totalEnergy / 30;
    const peakDemand = Math.max(...data.map(d => d.energy_consumption || 0));
    const avgOccupancy = data.reduce((sum, d) => sum + (d.occupancy || 0), 0) / data.length;
    const carbonEmissions = totalEnergy * 0.82; // kg CO2 per kWh
    
    return c.json({
      totalEnergy: Math.round(totalEnergy),
      avgDailyEnergy: Math.round(avgDailyEnergy),
      peakDemand: Math.round(peakDemand),
      avgOccupancy: Math.round(avgOccupancy),
      carbonEmissions: Math.round(carbonEmissions),
      dataPoints: data.length,
    });
  } catch (err) {
    console.log(`Server error in GET /analytics/:campusId/metrics: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

Deno.serve(app.fetch);
