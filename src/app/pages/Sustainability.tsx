import { Header } from '../components/Header';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Leaf, TrendingDown, Award, AlertCircle, Zap, TreePine } from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import { Link } from 'react-router';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

export function Sustainability() {
  const { campusProfile, simulationData, isConfigured } = useCampus();

  if (!isConfigured || !simulationData || !campusProfile) {
    return (
      <div>
        <Header 
          title="Sustainability Impact" 
          subtitle="Track your environmental footprint and savings"
        />
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Campus Not Configured</h3>
            <p className="text-slate-600 mb-6">
              Configure your campus profile to track sustainability metrics and environmental impact.
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

  // Calculate sustainability metrics
  const annualEnergy = simulationData.currentMetrics.currentUsage * 365;
  const annualCO2 = Math.round(annualEnergy * 0.82); // kg CO2
  
  // Calculate potential reductions from recommendations
  const totalPotentialSavings = simulationData.recommendations.reduce((sum, rec) => sum + rec.savings, 0);
  const annualMoneySavings = totalPotentialSavings * 12;
  const potentialEnergyReduction = (totalPotentialSavings * 12) / 8.5; // Convert ₹ to kWh
  const potentialCO2Reduction = Math.round(potentialEnergyReduction * 0.82);
  
  // Calculate sustainability score based on campus efficiency
  const efficiencyPerBuilding = simulationData.currentMetrics.currentUsage / campusProfile.numBuildings;
  const occupancyEfficiency = 100 - Math.abs(campusProfile.avgOccupancy - 70);
  const baseScore = 50 + (occupancyEfficiency * 0.3);
  const sustainabilityScore = Math.min(95, Math.round(baseScore));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  // Generate monthly CO2 data
  const monthlyCO2Data = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2026, i).toLocaleDateString('en-US', { month: 'short' });
    const baseEmissions = (annualCO2 / 12);
    const seasonalFactor = Math.sin((i - 2) * Math.PI / 6) * 0.15 + 1; // Higher in summer
    const emissions = Math.round(baseEmissions * seasonalFactor);
    const withOptimization = Math.round(emissions * 0.82); // 18% reduction
    
    return {
      month,
      baseline: emissions,
      emissions: withOptimization,
    };
  });

  // Generate renewable energy potential
  const solarPotential = campusProfile.numBuildings * 50; // kW per building
  const annualSolarGeneration = solarPotential * 5 * 365; // 5 hours/day average
  const renewablePercentage = Math.round((annualSolarGeneration / annualEnergy) * 100);

  // Environmental equivalents
  const treesEquivalent = Math.round(potentialCO2Reduction / 21); // 21kg CO2/tree/year
  const carsOffRoad = Math.round(potentialCO2Reduction / 4600); // 4.6 tons CO2/car/year

  return (
    <div>
      <Header 
        title="Sustainability Impact" 
        subtitle={`Environmental metrics for ${campusProfile.campusSize} Campus • ${campusProfile.numBuildings} Buildings`}
      />

      <div className="p-8 space-y-6">
        {/* Campus Context Banner */}
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm text-green-900">
            <strong>Based on:</strong> {campusProfile.campusSize} Campus with {campusProfile.numBuildings} Buildings • 
            {campusProfile.avgOccupancy}% Occupancy • Located in {campusProfile.location}
            {campusProfile.hasHostels && ' • Includes Residential Facilities'}
          </p>
        </Card>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sustainability Score */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Sustainability Score</h3>
                <p className="text-sm text-slate-600">Overall rating</p>
              </div>
            </div>

            <div className="text-center py-4">
              <div className={`text-5xl font-bold ${getScoreColor(sustainabilityScore)} mb-2`}>
                {sustainabilityScore}
              </div>
              <div className="text-sm font-medium text-slate-600">
                {getScoreLabel(sustainabilityScore)}
              </div>
            </div>

            <Progress value={sustainabilityScore} className="mb-2" />
            <p className="text-xs text-slate-500 text-center">
              Based on efficiency per building and occupancy optimization
            </p>
          </Card>

          {/* Annual Savings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Potential Annual Savings</h3>
                <p className="text-sm text-slate-600">With optimization</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-blue-600">₹{Math.round(annualMoneySavings / 100000).toFixed(1)}L</span>
                </div>
                <p className="text-xs text-slate-600">Cost savings per year</p>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-green-600">
                    {Math.round(potentialEnergyReduction / 1000)}
                  </span>
                  <span className="text-slate-600">MWh</span>
                </div>
                <p className="text-xs text-slate-600">Energy reduction potential</p>
              </div>
            </div>
          </Card>

          {/* CO2 Reduction */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">CO₂ Reduction</h3>
                <p className="text-sm text-slate-600">Potential annual impact</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-green-600">
                    {Math.round(potentialCO2Reduction / 1000)}
                  </span>
                  <span className="text-slate-600">tons</span>
                </div>
                <p className="text-xs text-slate-600">CO₂ emissions avoided</p>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">🌳 Trees equivalent</span>
                  <span className="font-semibold text-slate-900">{treesEquivalent}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">🚗 Cars off road</span>
                  <span className="font-semibold text-slate-900">{carsOffRoad}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly CO2 Emissions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Monthly CO₂ Emissions Projection
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Current baseline vs. optimized scenario (18% reduction)
            </p>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyCO2Data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                    label={{ value: 'CO₂ (kg)', angle: -90, position: 'insideLeft' }}
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
                    dataKey="baseline" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Current Baseline"
                    dot={{ fill: '#ef4444', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="emissions" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="With Optimization"
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Renewable Energy Potential */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Solar Energy Potential
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Estimated rooftop solar capacity across {campusProfile.numBuildings} buildings
            </p>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900">{solarPotential} kW</div>
                    <div className="text-sm text-slate-600">Total solar capacity</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {Math.round(annualSolarGeneration / 1000)} MWh
                    </div>
                    <div className="text-xs text-slate-600">Annual generation</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      {Math.min(renewablePercentage, 40)}%
                    </div>
                    <div className="text-xs text-slate-600">Energy offset</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TreePine className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-slate-700">CO₂ avoided with solar</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {Math.round(annualSolarGeneration * 0.82 / 1000)} tons/year
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-slate-700">Annual savings</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    ₹{Math.round(annualSolarGeneration * 8.5 / 100000).toFixed(1)}L
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Impact Summary */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Your Campus Sustainability Journey
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Current Impact</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Annual energy consumption: <strong>{Math.round(annualEnergy / 1000)} MWh</strong></li>
                <li>• Carbon footprint: <strong>{Math.round(annualCO2 / 1000)} tons CO₂/year</strong></li>
                <li>• Energy per building: <strong>{Math.round(efficiencyPerBuilding)} kWh/day</strong></li>
                <li>• Current sustainability score: <strong>{sustainabilityScore}/100</strong></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-3">With Full Optimization</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Energy reduction: <strong>{Math.round(potentialEnergyReduction / 1000)} MWh/year</strong></li>
                <li>• CO₂ reduction: <strong>{Math.round(potentialCO2Reduction / 1000)} tons/year</strong></li>
                <li>• Cost savings: <strong>₹{Math.round(annualMoneySavings / 100000).toFixed(1)}L/year</strong></li>
                <li>• Projected score: <strong>{Math.min(95, sustainabilityScore + 12)}/100</strong></li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
