import { Header } from '../components/Header';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { AlertTriangle, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import { Link } from 'react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function Forecast() {
  const { campusProfile, simulationData, isConfigured } = useCampus();

  if (!isConfigured || !simulationData || !campusProfile) {
    return (
      <div>
        <Header 
          title="Energy Forecast" 
          subtitle="24-hour predictive analytics and risk assessment"
        />
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Campus Not Configured</h3>
            <p className="text-slate-600 mb-6">
              Configure your campus profile to generate personalized energy forecasts.
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

  // Generate forecast data for next 24 hours
  const peakStart = parseInt(campusProfile.peakHoursStart.split(':')[0]);
  const peakEnd = parseInt(campusProfile.peakHoursEnd.split(':')[0]);
  
  const forecastData = simulationData.hourlyData.map((hourData, index) => {
    const hour = index;
    const isPeakHour = hour >= peakStart && hour <= peakEnd;
    const predicted = hourData.predicted;
    
    // Determine risk level based on predicted energy and peak hours
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    const avgHourly = simulationData.currentMetrics.currentUsage / 24;
    
    if (predicted > avgHourly * 1.5 && isPeakHour) {
      riskLevel = 'High';
    } else if (predicted > avgHourly * 1.2 || isPeakHour) {
      riskLevel = 'Medium';
    }

    return {
      hour: hourData.hour,
      predicted,
      riskLevel,
      isPeakHour,
    };
  });

  // Calculate confidence based on campus configuration consistency
  const confidence = Math.min(95, 85 + (campusProfile.avgOccupancy > 50 ? 5 : 0) + (campusProfile.numBuildings > 5 ? 5 : 0));

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const peakLoadAlert = forecastData.find(entry => entry.riskLevel === 'High');
  const totalPredicted = forecastData.reduce((sum, entry) => sum + entry.predicted, 0);

  // Chart data
  const chartData = forecastData.map(d => ({
    hour: d.hour,
    predicted: d.predicted,
  }));

  const avgThreshold = simulationData.currentMetrics.currentUsage / 24;

  return (
    <div>
      <Header 
        title="Energy Forecast" 
        subtitle={`Next 24-hour predictions • Peak hours: ${campusProfile.peakHoursStart}–${campusProfile.peakHoursEnd}`}
      />

      <div className="p-8 space-y-6">
        {/* Top Row - Confidence and Alert */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Forecast Confidence */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Forecast Confidence</h3>
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="text-5xl font-bold text-blue-600">{confidence}%</div>
                <div className="text-sm text-slate-600 pb-2">Model Accuracy</div>
              </div>
              <Progress value={confidence} className="h-3" />
              <p className="text-sm text-slate-600">
                Based on {campusProfile.campusSize.toLowerCase()} campus configuration with {campusProfile.numBuildings} buildings 
                and {campusProfile.avgOccupancy}% occupancy patterns. High confidence ensures reliable energy planning.
              </p>
            </div>
          </Card>

          {/* Peak Load Alert */}
          <Card className={`p-6 ${peakLoadAlert ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-start gap-3">
              {peakLoadAlert ? (
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              ) : (
                <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {peakLoadAlert ? 'Peak Load Warning' : 'Normal Load Expected'}
                </h3>
                {peakLoadAlert ? (
                  <div className="space-y-2">
                    <p className="text-sm text-red-900">
                      High demand expected at <strong>{peakLoadAlert.hour}</strong> with 
                      predicted usage of <strong>{Math.round(peakLoadAlert.predicted)} kWh</strong>.
                    </p>
                    <p className="text-sm text-red-800">
                      Recommendation: Consider load shifting or pre-cooling strategies during 
                      peak hours ({campusProfile.peakHoursStart}–{campusProfile.peakHoursEnd}).
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-green-900">
                    All forecasted loads are within normal operational ranges. 
                    Continue monitoring for optimal efficiency.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Forecast Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h4 className="text-sm font-medium text-slate-600">Total Predicted</h4>
            </div>
            <div className="text-2xl font-bold text-slate-900">{Math.round(totalPredicted)} kWh</div>
            <p className="text-xs text-slate-500 mt-1">Next 24 hours</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h4 className="text-sm font-medium text-slate-600">High Risk Hours</h4>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {forecastData.filter(d => d.riskLevel === 'High').length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Requires attention</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="text-sm font-medium text-slate-600">Peak Hour</h4>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {forecastData.reduce((max, d) => d.predicted > max.predicted ? d : max).hour}
            </div>
            <p className="text-xs text-slate-500 mt-1">Maximum demand</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-slate-600" />
              <h4 className="text-sm font-medium text-slate-600">Avg Hourly</h4>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {Math.round(totalPredicted / 24)} kWh
            </div>
            <p className="text-xs text-slate-500 mt-1">Per hour average</p>
          </Card>
        </div>

        {/* Forecast Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">24-Hour Energy Forecast</h3>
          <p className="text-sm text-slate-600 mb-6">
            Predicted energy consumption with average threshold reference
          </p>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="hour" 
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
                <ReferenceLine 
                  y={avgThreshold} 
                  stroke="#64748b" 
                  strokeDasharray="5 5"
                  label={{ value: 'Avg Threshold', position: 'right', fill: '#64748b', fontSize: 12 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="Predicted Usage"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Detailed Forecast Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Hourly Breakdown</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Predicted (kWh)</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Peak Hour</TableHead>
                  <TableHead>Recommendation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecastData.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{entry.hour}</TableCell>
                    <TableCell>{Math.round(entry.predicted)}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskBadgeVariant(entry.riskLevel)}`}>
                        {entry.riskLevel}
                      </span>
                    </TableCell>
                    <TableCell>
                      {entry.isPeakHour ? (
                        <span className="text-orange-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {entry.riskLevel === 'High' ? 'Consider load shifting' : 
                       entry.riskLevel === 'Medium' ? 'Monitor closely' : 
                       'Normal operation'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Configuration Context */}
        <Card className="p-6 bg-slate-50">
          <h3 className="font-semibold text-slate-900 mb-3">Forecast Model Parameters</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-600 mb-1">Campus Size</p>
              <p className="font-semibold text-slate-900">{campusProfile.campusSize}</p>
            </div>
            <div>
              <p className="text-slate-600 mb-1">Buildings</p>
              <p className="font-semibold text-slate-900">{campusProfile.numBuildings}</p>
            </div>
            <div>
              <p className="text-slate-600 mb-1">Occupancy Pattern</p>
              <p className="font-semibold text-slate-900">{campusProfile.avgOccupancy}%</p>
            </div>
            <div>
              <p className="text-slate-600 mb-1">Peak Hours</p>
              <p className="font-semibold text-slate-900">{campusProfile.peakHoursStart}–{campusProfile.peakHoursEnd}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
