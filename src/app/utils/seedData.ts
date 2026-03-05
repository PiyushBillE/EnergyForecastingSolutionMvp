import {
  createOrUpdateCampus,
  createEnergyData,
  createPredictions,
  type CampusProfile,
  type EnergyData,
  type Prediction,
} from './supabase';

/**
 * Seeds the database with sample campus data for testing
 * This creates a demo campus with 30 days of historical energy data
 */
export async function seedDemoData() {
  try {
    console.log('Starting database seed...');

    // Create a demo campus
    const demoCampus: CampusProfile = {
      name: 'Demo University Campus',
      location: 'Mumbai, Maharashtra',
      num_buildings: 12,
      campus_size: 'Medium',
      avg_occupancy: 75,
      has_hostels: true,
      peak_hours_start: '09:00',
      peak_hours_end: '17:00',
      special_event_frequency: 'Monthly',
    };

    console.log('Creating campus profile...');
    const campus = await createOrUpdateCampus(demoCampus);
    console.log(`Campus created with ID: ${campus.id}`);

    // Generate 30 days of historical energy data
    console.log('Generating historical energy data...');
    const energyData: EnergyData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate 24 hourly readings for each day
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = new Date(date);
        timestamp.setHours(hour, 0, 0, 0);
        
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isPeakHour = hour >= 9 && hour <= 17;
        const isNightTime = hour < 6 || hour > 22;
        
        // Base energy consumption varies by time and day
        let baseEnergy = 30; // kWh per hour baseline
        
        if (isPeakHour && !isWeekend) {
          baseEnergy = 80; // High consumption during peak hours on weekdays
        } else if (isNightTime) {
          baseEnergy = 15; // Low consumption at night
        } else if (isWeekend) {
          baseEnergy = 25; // Moderate consumption on weekends
        }
        
        // Add random variation
        const variation = 0.85 + Math.random() * 0.3;
        const energy = baseEnergy * variation;
        
        // Occupancy varies with energy usage
        let occupancy = 0;
        if (isPeakHour && !isWeekend) {
          occupancy = Math.round(500 + Math.random() * 300);
        } else if (isWeekend) {
          occupancy = Math.round(100 + Math.random() * 150);
        } else if (!isNightTime) {
          occupancy = Math.round(200 + Math.random() * 200);
        } else {
          occupancy = Math.round(50 + Math.random() * 100);
        }
        
        energyData.push({
          campus_id: campus.id!,
          timestamp: timestamp.toISOString(),
          occupancy,
          temperature: 20 + Math.random() * 15,
          humidity: 40 + Math.random() * 40,
          energy_consumption: energy,
        });
      }
    }

    console.log(`Storing ${energyData.length} energy data records...`);
    await createEnergyData(energyData);
    console.log('Energy data stored successfully');

    // Generate predictions for next 48 hours
    console.log('Generating predictions...');
    const predictions: Prediction[] = [];
    const now = new Date();
    
    for (let i = 0; i < 48; i++) {
      const predictionTime = new Date(now);
      predictionTime.setHours(now.getHours() + i);
      
      const hour = predictionTime.getHours();
      const dayOfWeek = predictionTime.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isPeakHour = hour >= 9 && hour <= 17;
      const isNightTime = hour < 6 || hour > 22;
      
      let predictedEnergy = 30;
      if (isPeakHour && !isWeekend) {
        predictedEnergy = 80;
      } else if (isNightTime) {
        predictedEnergy = 15;
      } else if (isWeekend) {
        predictedEnergy = 25;
      }
      
      const variation = 0.9 + Math.random() * 0.2;
      
      predictions.push({
        campus_id: campus.id!,
        prediction_time: predictionTime.toISOString(),
        predicted_energy: predictedEnergy * variation,
        efficiency_score: Math.round(65 + Math.random() * 30),
        recommendation: i % 12 === 0 ? 'Consider load shifting to optimize energy costs' : undefined,
      });
    }

    console.log(`Storing ${predictions.length} predictions...`);
    await createPredictions(predictions);
    console.log('Predictions stored successfully');

    console.log('✅ Database seeding completed successfully!');
    console.log(`Campus ID: ${campus.id}`);
    
    return {
      success: true,
      campusId: campus.id,
      energyRecords: energyData.length,
      predictions: predictions.length,
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

/**
 * Helper function to seed data via browser console
 * Usage: In browser console, run: window.seedDemoData()
 */
if (typeof window !== 'undefined') {
  (window as any).seedDemoData = seedDemoData;
}
