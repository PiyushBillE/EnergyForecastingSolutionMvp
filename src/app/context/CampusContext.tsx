import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
  getCampuses,
  createOrUpdateCampus,
  getEnergyData,
  createEnergyData,
  getPredictions,
  createPredictions,
  getCampusMetrics,
  type CampusProfile as SupabaseCampusProfile,
  type EnergyData,
  type Prediction,
} from '../utils/supabase';

export interface CampusProfile {
  id?: string;
  campusSize: 'Small' | 'Medium' | 'Large';
  numBuildings: number;
  avgOccupancy: number;
  location: string;
  hasHostels: boolean;
  peakHoursStart: string;
  peakHoursEnd: string;
  specialEventFrequency: 'Rare' | 'Monthly' | 'Weekly';
}

export interface SimulationData {
  historicalData: Array<{
    date: string;
    energy: number;
    cost: number;
    occupancy: number;
  }>;
  hourlyData: Array<{
    hour: string;
    energy: number;
    predicted: number;
  }>;
  currentMetrics: {
    currentUsage: number;
    peakDemand: number;
    avgCost: number;
    totalCost: number;
    carbonEmissions: number;
  };
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    impact: string;
    savings: number;
    priority: 'High' | 'Medium' | 'Low';
    category: string;
  }>;
}

interface CampusContextType {
  campusProfile: CampusProfile | null;
  simulationData: SimulationData | null;
  isSimulationMode: boolean;
  isConfigured: boolean;
  isLoading: boolean;
  updateCampusProfile: (profile: CampusProfile) => Promise<void>;
  resetCampus: () => Promise<void>;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export function CampusProvider({ children }: { children: ReactNode }) {
  const [campusProfile, setCampusProfile] = useState<CampusProfile | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [isSimulationMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load campus profile and data on mount
  useEffect(() => {
    loadCampusData();
  }, []);

  const loadCampusData = async () => {
    try {
      setIsLoading(true);
      
      // Check localStorage for campus ID (for persistence across sessions)
      const savedCampusId = localStorage.getItem('currentCampusId');
      
      if (savedCampusId) {
        // Load campus from Supabase
        const campuses = await getCampuses();
        const campus = campuses.find(c => c.id === savedCampusId);
        
        if (campus) {
          const profile = mapSupabaseToCampusProfile(campus);
          setCampusProfile(profile);
          await loadSimulationData(campus.id!, profile);
        } else {
          // Campus not found, clear localStorage
          localStorage.removeItem('currentCampusId');
        }
      }
    } catch (error) {
      console.error('Error loading campus data from Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSimulationData = async (campusId: string, profile: CampusProfile) => {
    try {
      // Load energy data from Supabase
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const energyData = await getEnergyData(campusId, {
        startDate: thirtyDaysAgo.toISOString(),
        limit: 1000,
      });

      // Load predictions from Supabase
      const predictions = await getPredictions(campusId, 100);

      // If we have data, use it; otherwise generate and save
      if (energyData.length > 0) {
        await processExistingData(campusId, profile, energyData, predictions);
      } else {
        await generateAndSaveSimulationData(campusId, profile);
      }
    } catch (error) {
      console.error('Error loading simulation data from Supabase:', error);
      // Fallback to local generation
      generateLocalSimulationData(profile);
    }
  };

  const processExistingData = async (
    campusId: string,
    profile: CampusProfile,
    energyData: EnergyData[],
    predictions: Prediction[]
  ) => {
    // Transform energy data to historical data format
    const historicalData = energyData
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(data => ({
        date: new Date(data.timestamp).toISOString().split('T')[0],
        energy: Math.round(data.energy_consumption),
        cost: Math.round(data.energy_consumption * 8.5),
        occupancy: data.occupancy,
      }));

    // Get today's hourly data or generate it
    const today = new Date().toISOString().split('T')[0];
    const todayData = energyData.filter(d => d.timestamp.startsWith(today));
    
    let hourlyData;
    if (todayData.length >= 24) {
      hourlyData = todayData.slice(0, 24).map((data, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        energy: Math.round(data.energy_consumption),
        predicted: Math.round(data.energy_consumption * 1.05),
      }));
    } else {
      hourlyData = generateHourlyData(profile);
    }

    // Use predictions or generate from hourly data
    if (predictions.length === 0) {
      // Generate predictions based on hourly data
      await generateAndStorePredictions(campusId, hourlyData);
    }

    // Calculate metrics from Supabase
    const metrics = await getCampusMetrics(campusId);

    const simulationData: SimulationData = {
      historicalData,
      hourlyData,
      currentMetrics: {
        currentUsage: metrics.avgDailyEnergy,
        peakDemand: metrics.peakDemand,
        avgCost: Math.round(metrics.avgDailyEnergy * 8.5),
        totalCost: Math.round(metrics.totalEnergy * 8.5),
        carbonEmissions: metrics.carbonEmissions,
      },
      recommendations: generateRecommendations(profile, metrics.avgDailyEnergy),
    };

    setSimulationData(simulationData);
  };

  const generateAndSaveSimulationData = async (campusId: string, profile: CampusProfile) => {
    try {
      const sizeMultiplier = profile.campusSize === 'Large' ? 1.5 : profile.campusSize === 'Small' ? 0.6 : 1.0;
      const baseEnergy = 500 * sizeMultiplier * (profile.numBuildings / 10);
      const occupancyFactor = profile.avgOccupancy / 100;

      // Generate 30 days of historical data
      const historicalData = [];
      const energyDataToStore: EnergyData[] = [];
      const today = new Date();

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Add special event spikes
        let eventSpike = 0;
        if (profile.specialEventFrequency === 'Weekly' && i % 7 === 0) {
          eventSpike = baseEnergy * 0.3;
        } else if (profile.specialEventFrequency === 'Monthly' && i === 15) {
          eventSpike = baseEnergy * 0.3;
        } else if (profile.specialEventFrequency === 'Rare' && i === 20) {
          eventSpike = baseEnergy * 0.2;
        }

        const weekendFactor = isWeekend ? 0.6 : 1.0;
        const randomVariation = 0.9 + Math.random() * 0.2;
        const energy = (baseEnergy * occupancyFactor * weekendFactor + eventSpike) * randomVariation;
        const occupancy = isWeekend ? Math.round(profile.avgOccupancy * 0.4) : Math.round(profile.avgOccupancy * (0.9 + Math.random() * 0.2));

        historicalData.push({
          date: date.toISOString().split('T')[0],
          energy: Math.round(energy),
          cost: Math.round(energy * 8.5),
          occupancy,
        });

        // Prepare data for Supabase
        energyDataToStore.push({
          campus_id: campusId,
          timestamp: date.toISOString(),
          occupancy,
          temperature: 20 + Math.random() * 15,
          humidity: 40 + Math.random() * 40,
          energy_consumption: energy,
        });
      }

      // Store energy data in Supabase
      await createEnergyData(energyDataToStore);

      // Generate hourly data for today
      const hourlyData = generateHourlyData(profile);

      // Generate and store predictions
      await generateAndStorePredictions(campusId, hourlyData);

      // Calculate current metrics
      const totalEnergy = historicalData.reduce((sum, d) => sum + d.energy, 0);
      const avgDailyEnergy = totalEnergy / 30;
      const peakDemand = Math.max(...hourlyData.map(h => h.energy));
      const totalCost = historicalData.reduce((sum, d) => sum + d.cost, 0);
      const avgCost = totalCost / 30;
      const carbonEmissions = Math.round(totalEnergy * 0.82);

      const simulationData: SimulationData = {
        historicalData,
        hourlyData,
        currentMetrics: {
          currentUsage: Math.round(avgDailyEnergy),
          peakDemand: Math.round(peakDemand),
          avgCost: Math.round(avgCost),
          totalCost: Math.round(totalCost),
          carbonEmissions,
        },
        recommendations: generateRecommendations(profile, avgDailyEnergy),
      };

      setSimulationData(simulationData);
    } catch (error) {
      console.error('Error generating and saving simulation data:', error);
      // Fallback to local generation
      generateLocalSimulationData(profile);
    }
  };

  const generateHourlyData = (profile: CampusProfile) => {
    const sizeMultiplier = profile.campusSize === 'Large' ? 1.5 : profile.campusSize === 'Small' ? 0.6 : 1.0;
    const baseEnergy = 500 * sizeMultiplier * (profile.numBuildings / 10);
    const occupancyFactor = profile.avgOccupancy / 100;
    const peakStart = parseInt(profile.peakHoursStart.split(':')[0]);
    const peakEnd = parseInt(profile.peakHoursEnd.split(':')[0]);

    const hourlyData = [];
    for (let hour = 0; hour < 24; hour++) {
      const isPeakHour = hour >= peakStart && hour <= peakEnd;
      const isNightTime = hour < 6 || hour > 22;

      let hourlyBase = baseEnergy / 24;
      if (isPeakHour) {
        hourlyBase *= 1.8 * occupancyFactor;
      } else if (isNightTime) {
        hourlyBase *= profile.hasHostels ? 0.4 : 0.2;
      } else {
        hourlyBase *= 0.6;
      }

      const randomVariation = 0.95 + Math.random() * 0.1;
      const energy = hourlyBase * randomVariation;
      const predicted = energy * (1.05 + Math.random() * 0.1);

      hourlyData.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        energy: Math.round(energy),
        predicted: Math.round(predicted),
      });
    }

    return hourlyData;
  };

  const generateAndStorePredictions = async (campusId: string, hourlyData: any[]) => {
    try {
      const predictionsToStore: Prediction[] = [];
      const now = new Date();

      // Generate predictions for next 24 hours
      for (let i = 0; i < 24; i++) {
        const predictionTime = new Date(now);
        predictionTime.setHours(now.getHours() + i);

        const hourIndex = predictionTime.getHours();
        const baseEnergy = hourlyData[hourIndex]?.predicted || 50;

        predictionsToStore.push({
          campus_id: campusId,
          prediction_time: predictionTime.toISOString(),
          predicted_energy: baseEnergy,
          efficiency_score: Math.round(70 + Math.random() * 25),
          recommendation: i % 8 === 0 ? 'Consider load shifting during peak hours' : undefined,
        });
      }

      await createPredictions(predictionsToStore);
    } catch (error) {
      console.error('Error storing predictions:', error);
    }
  };

  const generateLocalSimulationData = (profile: CampusProfile) => {
    // Fallback: Generate data locally without saving to Supabase
    const sizeMultiplier = profile.campusSize === 'Large' ? 1.5 : profile.campusSize === 'Small' ? 0.6 : 1.0;
    const baseEnergy = 500 * sizeMultiplier * (profile.numBuildings / 10);
    const occupancyFactor = profile.avgOccupancy / 100;

    const historicalData = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      let eventSpike = 0;
      if (profile.specialEventFrequency === 'Weekly' && i % 7 === 0) {
        eventSpike = baseEnergy * 0.3;
      } else if (profile.specialEventFrequency === 'Monthly' && i === 15) {
        eventSpike = baseEnergy * 0.3;
      } else if (profile.specialEventFrequency === 'Rare' && i === 20) {
        eventSpike = baseEnergy * 0.2;
      }

      const weekendFactor = isWeekend ? 0.6 : 1.0;
      const randomVariation = 0.9 + Math.random() * 0.2;
      const energy = (baseEnergy * occupancyFactor * weekendFactor + eventSpike) * randomVariation;

      historicalData.push({
        date: date.toISOString().split('T')[0],
        energy: Math.round(energy),
        cost: Math.round(energy * 8.5),
        occupancy: isWeekend ? Math.round(profile.avgOccupancy * 0.4) : Math.round(profile.avgOccupancy * (0.9 + Math.random() * 0.2)),
      });
    }

    const hourlyData = generateHourlyData(profile);

    const totalEnergy = historicalData.reduce((sum, d) => sum + d.energy, 0);
    const avgDailyEnergy = totalEnergy / 30;
    const peakDemand = Math.max(...hourlyData.map(h => h.energy));
    const totalCost = historicalData.reduce((sum, d) => sum + d.cost, 0);
    const avgCost = totalCost / 30;
    const carbonEmissions = Math.round(totalEnergy * 0.82);

    const simulationData: SimulationData = {
      historicalData,
      hourlyData,
      currentMetrics: {
        currentUsage: Math.round(avgDailyEnergy),
        peakDemand: Math.round(peakDemand),
        avgCost: Math.round(avgCost),
        totalCost: Math.round(totalCost),
        carbonEmissions,
      },
      recommendations: generateRecommendations(profile, avgDailyEnergy),
    };

    setSimulationData(simulationData);
  };

  const generateRecommendations = (profile: CampusProfile, avgDailyEnergy: number): SimulationData['recommendations'] => {
    const recommendations = [];

    // Large campus recommendations
    if (profile.campusSize === 'Large' && profile.avgOccupancy > 70) {
      recommendations.push({
        id: 'hvac-zoning',
        title: 'Implement HVAC Zoning System',
        description: 'Deploy zone-based climate control to optimize energy usage across different campus areas based on occupancy patterns.',
        impact: '15-20% energy reduction',
        savings: Math.round(avgDailyEnergy * 0.17 * 30 * 8.5),
        priority: 'High' as const,
        category: 'HVAC',
      });
    }

    // Hostel recommendations
    if (profile.hasHostels) {
      recommendations.push({
        id: 'nighttime-load',
        title: 'Nighttime Load Balancing',
        description: 'Optimize hostel energy consumption during off-peak hours with smart scheduling for water heaters and lighting.',
        impact: '10-12% reduction',
        savings: Math.round(avgDailyEnergy * 0.11 * 30 * 8.5),
        priority: 'Medium' as const,
        category: 'Load Management',
      });
    }

    // Small campus recommendations
    if (profile.campusSize === 'Small') {
      recommendations.push({
        id: 'lighting-automation',
        title: 'Smart Lighting Automation',
        description: 'Install occupancy sensors and daylight harvesting systems to reduce unnecessary lighting usage.',
        impact: '25-30% lighting energy reduction',
        savings: Math.round(avgDailyEnergy * 0.08 * 30 * 8.5),
        priority: 'High' as const,
        category: 'Lighting',
      });
    }

    // High occupancy recommendations
    if (profile.avgOccupancy > 80) {
      recommendations.push({
        id: 'peak-shaving',
        title: 'Peak Demand Shaving',
        description: 'Implement battery storage and load shifting strategies to reduce peak demand charges during high occupancy periods.',
        impact: '12-15% cost reduction',
        savings: Math.round(avgDailyEnergy * 0.13 * 30 * 8.5),
        priority: 'High' as const,
        category: 'Demand Response',
      });
    }

    // Renewable energy recommendation (universal)
    recommendations.push({
      id: 'solar-integration',
      title: 'Solar PV System Integration',
      description: `Install rooftop solar panels across ${profile.numBuildings} buildings to offset daytime energy consumption.`,
      impact: '30-40% renewable energy',
      savings: Math.round(avgDailyEnergy * 0.35 * 30 * 8.5),
      priority: 'Medium' as const,
      category: 'Renewable Energy',
    });

    // Smart meter recommendation
    recommendations.push({
      id: 'smart-metering',
      title: 'Advanced Metering Infrastructure',
      description: 'Deploy smart meters for real-time monitoring and granular energy analytics across all buildings.',
      impact: '8-10% optimization',
      savings: Math.round(avgDailyEnergy * 0.09 * 30 * 8.5),
      priority: 'Low' as const,
      category: 'Monitoring',
    });

    return recommendations;
  };

  const mapSupabaseToCampusProfile = (campus: SupabaseCampusProfile): CampusProfile => ({
    id: campus.id,
    campusSize: campus.campus_size,
    numBuildings: campus.num_buildings,
    avgOccupancy: campus.avg_occupancy,
    location: campus.location,
    hasHostels: campus.has_hostels,
    peakHoursStart: campus.peak_hours_start,
    peakHoursEnd: campus.peak_hours_end,
    specialEventFrequency: campus.special_event_frequency,
  });

  const mapCampusProfileToSupabase = (profile: CampusProfile): SupabaseCampusProfile => ({
    id: profile.id,
    name: `${profile.location} Campus`,
    location: profile.location,
    num_buildings: profile.numBuildings,
    campus_size: profile.campusSize,
    avg_occupancy: profile.avgOccupancy,
    has_hostels: profile.hasHostels,
    peak_hours_start: profile.peakHoursStart,
    peak_hours_end: profile.peakHoursEnd,
    special_event_frequency: profile.specialEventFrequency,
  });

  const updateCampusProfile = async (profile: CampusProfile) => {
    try {
      setIsLoading(true);
      
      // Save to Supabase
      const supabaseProfile = mapCampusProfileToSupabase(profile);
      const saved = await createOrUpdateCampus(supabaseProfile);
      
      // Save campus ID to localStorage
      localStorage.setItem('currentCampusId', saved.id!);
      
      // Update local state
      const updatedProfile = mapSupabaseToCampusProfile(saved);
      setCampusProfile(updatedProfile);
      
      // Generate and save simulation data
      await generateAndSaveSimulationData(saved.id!, updatedProfile);
    } catch (error) {
      console.error('Error updating campus profile:', error);
      // Fallback to local storage
      setCampusProfile(profile);
      generateLocalSimulationData(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const resetCampus = async () => {
    try {
      localStorage.removeItem('currentCampusId');
      setCampusProfile(null);
      setSimulationData(null);
    } catch (error) {
      console.error('Error resetting campus:', error);
    }
  };

  return (
    <CampusContext.Provider
      value={{
        campusProfile,
        simulationData,
        isSimulationMode,
        isConfigured: campusProfile !== null,
        isLoading,
        updateCampusProfile,
        resetCampus,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const context = useContext(CampusContext);
  if (context === undefined) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
}
