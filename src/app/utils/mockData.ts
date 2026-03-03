// Mock data for the Smart Energy Dashboard

export interface EnergyDataPoint {
  time: string;
  actual: number;
  predicted?: number;
  timestamp?: number;
}

export interface ForecastEntry {
  time: string;
  predictedEnergy: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  energyReduction: number;
  costSavings: number;
  priority: 'High' | 'Medium' | 'Low';
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

// Generate mock historical data for the last 7 days
export const generateHistoricalData = (): EnergyDataPoint[] => {
  const data: EnergyDataPoint[] = [];
  const now = new Date();
  
  for (let i = 168; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    
    // Simulate realistic energy usage patterns
    let baseLoad = 150;
    if (hour >= 6 && hour <= 9) baseLoad = 280; // Morning peak
    else if (hour >= 10 && hour <= 17) baseLoad = 350; // Day usage
    else if (hour >= 18 && hour <= 21) baseLoad = 320; // Evening peak
    else baseLoad = 120; // Night low
    
    const variance = Math.random() * 40 - 20;
    const actual = Math.max(80, baseLoad + variance);
    
    data.push({
      time: time.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' }),
      actual: Math.round(actual),
      timestamp: time.getTime()
    });
  }
  
  return data;
};

// Generate mock daily data for charts
export const generateDailyData = (): EnergyDataPoint[] => {
  const data: EnergyDataPoint[] = [];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  days.forEach((day, index) => {
    const isWeekend = index >= 5;
    const baseLoad = isWeekend ? 180 : 280;
    const variance = Math.random() * 60 - 30;
    const actual = baseLoad + variance;
    const predicted = actual + (Math.random() * 30 - 15);
    
    data.push({
      time: day,
      actual: Math.round(actual),
      predicted: Math.round(predicted)
    });
  });
  
  return data;
};

// Generate 24-hour forecast
export const generate24HourForecast = (): ForecastEntry[] => {
  const forecast: ForecastEntry[] = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hour = time.getHours();
    
    let baseLoad = 150;
    if (hour >= 6 && hour <= 9) baseLoad = 290;
    else if (hour >= 10 && hour <= 17) baseLoad = 360;
    else if (hour >= 18 && hour <= 21) baseLoad = 330;
    
    const predictedEnergy = Math.round(baseLoad + (Math.random() * 40 - 20));
    
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (predictedEnergy > 350) riskLevel = 'High';
    else if (predictedEnergy > 280) riskLevel = 'Medium';
    
    forecast.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      predictedEnergy,
      riskLevel
    });
  }
  
  return forecast;
};

// Mock recommendations
export const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Optimize HVAC Schedule During Low Occupancy',
    description: 'Analysis shows that HVAC systems are running at full capacity during periods of low building occupancy (6 AM - 8 AM). Adjusting the schedule can reduce unnecessary energy consumption.',
    energyReduction: 18,
    costSavings: 12500,
    priority: 'High'
  },
  {
    id: '2',
    title: 'Implement Daylight Harvesting in South Wing',
    description: 'The south wing receives significant natural light during daytime hours. Installing automated dimming controls can reduce artificial lighting needs by utilizing available daylight.',
    energyReduction: 12,
    costSavings: 8200,
    priority: 'High'
  },
  {
    id: '3',
    title: 'Reduce Peak Demand Through Load Shifting',
    description: 'Non-critical loads such as water heating and charging stations can be shifted to off-peak hours (11 PM - 5 AM) to reduce demand charges.',
    energyReduction: 15,
    costSavings: 15800,
    priority: 'Medium'
  },
  {
    id: '4',
    title: 'Upgrade to Energy-Efficient LED Fixtures',
    description: 'Several areas still use outdated fluorescent lighting. Upgrading to LED fixtures would provide immediate energy savings and improved light quality.',
    energyReduction: 10,
    costSavings: 6500,
    priority: 'Medium'
  },
  {
    id: '5',
    title: 'Enable Smart Thermostat Zones',
    description: 'Create micro-zones with individual temperature controls to prevent over-conditioning of unoccupied spaces while maintaining comfort in active areas.',
    energyReduction: 8,
    costSavings: 5400,
    priority: 'Low'
  }
];

// Feature importance for explainable AI
export const mockFeatureImportance: FeatureImportance[] = [
  { feature: 'Temperature', importance: 85 },
  { feature: 'Occupancy', importance: 72 },
  { feature: 'Day of Week', importance: 58 },
  { feature: 'Humidity', importance: 45 },
  { feature: 'Special Events', importance: 38 }
];

// Monthly savings data
export const generateMonthlySavings = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => ({
    month,
    savings: Math.round(15000 + Math.random() * 10000),
    target: 20000
  }));
};

// CO2 emissions data
export const generateCO2Data = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    month,
    emissions: Math.round(8000 - Math.random() * 2000),
    baseline: 10000
  }));
};

// Current KPIs
export const getCurrentKPIs = () => {
  return {
    currentUsage: 287,
    predictedNext24h: 6450,
    peakLoadTime: '18:30',
    monthlySavings: 28500,
    carbonReduced: 1250,
    trends: {
      usage: -5.2,
      predicted: 3.1,
      savings: 12.5,
      carbon: 8.3
    }
  };
};

// External factors
export const getExternalFactors = () => {
  return {
    temperature: Math.round(22 + Math.random() * 8),
    humidity: Math.round(45 + Math.random() * 20),
    occupancy: Math.round(60 + Math.random() * 30),
    dayType: new Date().getDay() === 0 || new Date().getDay() === 6 ? 'Weekend' : 'Weekday',
    specialEvent: Math.random() > 0.8
  };
};

// Forecast confidence
export const getForecastConfidence = () => {
  return Math.round(85 + Math.random() * 10);
};

// Sustainability score
export const getSustainabilityScore = () => {
  return Math.round(72 + Math.random() * 15);
};
