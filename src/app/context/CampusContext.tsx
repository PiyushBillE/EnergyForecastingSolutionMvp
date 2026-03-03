import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface CampusProfile {
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
  updateCampusProfile: (profile: CampusProfile) => void;
  resetCampus: () => void;
}

const defaultProfile: CampusProfile = {
  campusSize: 'Medium',
  numBuildings: 10,
  avgOccupancy: 75,
  location: 'Mumbai, Maharashtra',
  hasHostels: true,
  peakHoursStart: '09:00',
  peakHoursEnd: '17:00',
  specialEventFrequency: 'Monthly',
};

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export function CampusProvider({ children }: { children: ReactNode }) {
  const [campusProfile, setCampusProfile] = useState<CampusProfile | null>(() => {
    const saved = localStorage.getItem('campusProfile');
    return saved ? JSON.parse(saved) : null;
  });
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [isSimulationMode] = useState<boolean>(true);

  useEffect(() => {
    if (campusProfile) {
      localStorage.setItem('campusProfile', JSON.stringify(campusProfile));
      generateSimulationData(campusProfile);
    } else {
      localStorage.removeItem('campusProfile');
      setSimulationData(null);
    }
  }, [campusProfile]);

  const generateSimulationData = (profile: CampusProfile) => {
    // Generate dynamic simulation data based on campus profile
    const sizeMultiplier = profile.campusSize === 'Large' ? 1.5 : profile.campusSize === 'Small' ? 0.6 : 1.0;
    const baseEnergy = 500 * sizeMultiplier * (profile.numBuildings / 10);
    const occupancyFactor = profile.avgOccupancy / 100;
    
    // Generate 30 days of historical data
    const historicalData = [];
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
      
      historicalData.push({
        date: date.toISOString().split('T')[0],
        energy: Math.round(energy),
        cost: Math.round(energy * 8.5),
        occupancy: isWeekend ? Math.round(profile.avgOccupancy * 0.4) : Math.round(profile.avgOccupancy * (0.9 + Math.random() * 0.2)),
      });
    }
    
    // Generate hourly data for today
    const hourlyData = [];
    const peakStart = parseInt(profile.peakHoursStart.split(':')[0]);
    const peakEnd = parseInt(profile.peakHoursEnd.split(':')[0]);
    
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
    
    // Calculate current metrics
    const totalEnergy = historicalData.reduce((sum, d) => sum + d.energy, 0);
    const avgDailyEnergy = totalEnergy / 30;
    const peakDemand = Math.max(...hourlyData.map(h => h.energy));
    const totalCost = historicalData.reduce((sum, d) => sum + d.cost, 0);
    const avgCost = totalCost / 30;
    
    // Carbon emissions (kg CO2 per kWh = 0.82 for India grid average)
    const carbonEmissions = Math.round(totalEnergy * 0.82);
    
    // Generate adaptive recommendations
    const recommendations = generateRecommendations(profile, avgDailyEnergy);
    
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
      recommendations,
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

  const updateCampusProfile = (profile: CampusProfile) => {
    setCampusProfile(profile);
  };

  const resetCampus = () => {
    setCampusProfile(null);
    setSimulationData(null);
  };

  return (
    <CampusContext.Provider
      value={{
        campusProfile,
        simulationData,
        isSimulationMode,
        isConfigured: campusProfile !== null,
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
