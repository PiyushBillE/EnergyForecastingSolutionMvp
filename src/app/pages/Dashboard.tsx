import { Header } from '../components/Header';
import { KPICard } from '../components/KPICard';
import { Card } from '../components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Leaf,
  Thermometer,
  Droplet,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCampus } from '../context/CampusContext';
import { Link } from 'react-router';

export function Dashboard() {
  const { campusProfile, simulationData, isConfigured } = useCampus();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isConfigured || !simulationData || !campusProfile) {
    return (
      <div>
        <Header 
          title="Dashboard Overview" 
          subtitle="Real-time energy monitoring and analytics"
        />
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Campus Not Configured</h3>
            <p className="text-slate-600 mb-6">
              Please configure your campus profile to generate personalized energy analytics and simulations.
            </p>
            <Link
              to="/campus-profile"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Configure Campus Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentHour = currentTime.getHours();
  const todayHourlyData = simulationData.hourlyData.slice(0, currentHour + 1);
  const predictedHourlyData = simulationData.hourlyData.slice(currentHour + 1);
  
  // Prepare chart data (last 7 days)
  const last7Days = simulationData.historicalData.slice(-7).map(d => ({
    time: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    actual: d.energy,
    date: d.date,
  }));

  // Add predicted next 3 days
  const forecastDays = 3;
  for (let i = 1; i <= forecastDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const avgEnergy = simulationData.currentMetrics.currentUsage;
    const predicted = avgEnergy * (isWeekend ? 0.6 : 1.0) * (0.95 + Math.random() * 0.1);
    
    last7Days.push({
      time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: undefined as any,
      predicted: Math.round(predicted),
      date: date.toISOString().split('T')[0],
    } as any);
  }

  // Calculate KPIs
  const currentUsage = simulationData.currentMetrics.currentUsage;
  const predictedNext24h = simulationData.hourlyData.reduce((sum, h) => sum + h.predicted, 0);
  const peakHour = simulationData.hourlyData.reduce((max, h, i) => 
    h.energy > simulationData.hourlyData[max].energy ? i : max, 0
  );
  const peakLoadTime = `${peakHour.toString().padStart(2, '0')}:00`;
  
  // Calculate trends
  const last7DaysAvg = simulationData.historicalData.slice(-7).reduce((sum, d) => sum + d.energy, 0) / 7;
  const prev7DaysAvg = simulationData.historicalData.slice(-14, -7).reduce((sum, d) => sum + d.energy, 0) / 7;
  const usageTrend = last7DaysAvg > prev7DaysAvg ? 'up' : 'down';
  const trendPercent = Math.abs(((last7DaysAvg - prev7DaysAvg) / prev7DaysAvg) * 100);

  // Simulated external factors
  const currentDayData = simulationData.historicalData[simulationData.historicalData.length - 1];
  const externalFactors = {
    temperature: 28 + Math.floor(Math.random() * 5),
    humidity: 55 + Math.floor(Math.random() * 20),
    occupancy: currentDayData.occupancy,
    dayType: new Date().getDay() === 0 || new Date().getDay() === 6 ? 'Weekend' : 'Weekday',
    specialEvent: false,
  };

  return (
    <div>
      <Header 
        title="Dashboard Overview" 
        subtitle={`${campusProfile.campusSize} Campus • ${campusProfile.numBuildings} Buildings • ${campusProfile.location}`}
      />

      <div className="p-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <KPICard
            title="Current Energy Usage"
            value={currentUsage}
            unit="kWh/day"
            trend={usageTrend as 'up' | 'down'}
            trendValue={`${trendPercent.toFixed(1)}%`}
            icon={<Zap className="w-5 h-5" />}
            sparklineData={simulationData.historicalData.slice(-7).map(d => d.energy)}
          />
          <KPICard
            title="Predicted Next 24 Hours"
            value={Math.round(predictedNext24h)}
            unit="kWh"
            trend="up"
            trendValue="2.3%"
            icon={<TrendingUp className="w-5 h-5" />}
            sparklineData={simulationData.hourlyData.map(h => h.predicted)}
          />
          <KPICard
            title="Peak Load Time"
            value={peakLoadTime}
            unit="Today"
            icon={<Clock className="w-5 h-5" />}
          />
          <KPICard
            title="Estimated Monthly Cost"
            value={(simulationData.currentMetrics.totalCost).toLocaleString()}
            unit="₹"
            trend="down"
            trendValue="5.2%"
            icon={<DollarSign className="w-5 h-5" />}
            sparklineData={simulationData.historicalData.slice(-7).map(d => d.cost)}
          />
          <KPICard
            title="Carbon Emissions"
            value={(simulationData.currentMetrics.carbonEmissions / 1000).toFixed(1)}
            unit="tons CO₂"
            trend="down"
            trendValue="8.1%"
            icon={<Leaf className="w-5 h-5" />}
            sparklineData={simulationData.historicalData.slice(-7).map(d => Math.round(d.energy * 0.82))}
          />
        </div>

        {/* Main Chart and External Factors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Energy Consumption Chart */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Energy Consumption Trend</h3>
                <p className="text-sm text-slate-600">Last 7 days + 3-day forecast</p>
              </div>
            </div>

            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                    label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Actual Usage"
                    dot={{ fill: '#3b82f6', r: 4 }}
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted"
                    dot={{ fill: '#10b981', r: 4 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* External Factors Panel */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">External Factors</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Temperature</p>
                    <p className="text-lg font-semibold text-slate-900">{externalFactors.temperature}°C</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Droplet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Humidity</p>
                    <p className="text-lg font-semibold text-slate-900">{externalFactors.humidity}%</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Occupancy</p>
                    <p className="text-lg font-semibold text-slate-900">{externalFactors.occupancy}%</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Day Type</p>
                    <p className="text-lg font-semibold text-slate-900">{externalFactors.dayType}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-2">Campus Configuration</p>
                <div className="space-y-1">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">{campusProfile.campusSize}</span> Campus
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">{campusProfile.numBuildings}</span> Buildings
                  </p>
                  <p className="text-sm text-slate-700">
                    Avg Occupancy: <span className="font-medium">{campusProfile.avgOccupancy}%</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
