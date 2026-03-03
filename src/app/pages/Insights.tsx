import { Header } from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowRight, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { Link } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function Insights() {
  const { campusProfile, simulationData, isConfigured } = useCampus();
  const [appliedStrategies, setAppliedStrategies] = useState<string[]>([]);

  if (!isConfigured || !simulationData || !campusProfile) {
    return (
      <div>
        <Header 
          title="Optimization Insights" 
          subtitle="AI-powered recommendations and explainable analytics"
        />
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Campus Not Configured</h3>
            <p className="text-slate-600 mb-6">
              Configure your campus profile to receive personalized optimization recommendations.
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

  const recommendations = simulationData.recommendations;

  // Feature importance based on campus configuration
  const featureImportance = [
    { 
      feature: 'Occupancy Level', 
      importance: campusProfile.avgOccupancy > 70 ? 85 : 65,
      color: '#3b82f6'
    },
    { 
      feature: 'Campus Size', 
      importance: campusProfile.campusSize === 'Large' ? 78 : campusProfile.campusSize === 'Medium' ? 60 : 45,
      color: '#8b5cf6'
    },
    { 
      feature: 'Peak Hours', 
      importance: 72,
      color: '#ec4899'
    },
    { 
      feature: campusProfile.hasHostels ? 'Hostel Loads' : 'Building Count', 
      importance: campusProfile.hasHostels ? 68 : 55,
      color: '#f59e0b'
    },
    { 
      feature: 'Event Frequency', 
      importance: campusProfile.specialEventFrequency === 'Weekly' ? 62 : 
                  campusProfile.specialEventFrequency === 'Monthly' ? 45 : 30,
      color: '#10b981'
    },
  ].sort((a, b) => b.importance - a.importance);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleApplyStrategy = (id: string) => {
    setAppliedStrategies(prev => [...prev, id]);
  };

  // Calculate total potential savings
  const totalPotentialSavings = recommendations.reduce((sum, rec) => sum + rec.savings, 0);

  return (
    <div>
      <Header 
        title="Optimization Insights" 
        subtitle={`Personalized recommendations for ${campusProfile.campusSize} Campus with ${campusProfile.numBuildings} buildings`}
      />

      <div className="p-8 space-y-6">
        {/* AI Explanation Box */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Analysis Summary</h3>
              <p className="text-slate-700">
                Based on your <strong>{campusProfile.campusSize.toLowerCase()} campus</strong> with{' '}
                <strong>{campusProfile.numBuildings} buildings</strong> and{' '}
                <strong>{campusProfile.avgOccupancy}% average occupancy</strong>, our AI has identified{' '}
                <strong>{recommendations.length} optimization opportunities</strong>.
                {campusProfile.hasHostels && ' Your residential hostels present unique load balancing opportunities.'}{' '}
                Peak activity during {campusProfile.peakHoursStart}–{campusProfile.peakHoursEnd} is a key optimization window.
                By implementing these recommendations, you can achieve up to{' '}
                <strong>₹{totalPotentialSavings.toLocaleString()}/month in savings</strong>.
              </p>
            </div>
          </div>
        </Card>

        {/* Feature Importance Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Top Energy Impact Factors for Your Campus
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            These factors have the greatest impact on your energy consumption based on your configuration
          </p>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis 
                  type="category" 
                  dataKey="feature" 
                  width={120}
                  tick={{ fontSize: 12 }} 
                  stroke="#64748b"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Impact']}
                />
                <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
                  {featureImportance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recommendations Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Optimization Recommendations ({recommendations.length})
            </h2>
            <div className="text-sm text-slate-600">
              Potential Monthly Savings: <span className="font-semibold text-green-600">₹{totalPotentialSavings.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((rec) => {
              const isApplied = appliedStrategies.includes(rec.id);
              
              return (
                <Card key={rec.id} className={`p-6 ${isApplied ? 'bg-green-50 border-green-200' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(rec.priority)}`}>
                        {rec.priority} Priority
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {rec.category}
                      </span>
                    </div>
                    {isApplied && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {rec.title}
                  </h3>

                  <p className="text-sm text-slate-600 mb-4">
                    {rec.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Expected Impact</p>
                      <p className="text-sm font-semibold text-blue-600">{rec.impact}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Monthly Savings</p>
                      <p className="text-sm font-semibold text-green-600">₹{rec.savings.toLocaleString()}</p>
                    </div>
                  </div>

                  {!isApplied ? (
                    <Button 
                      onClick={() => handleApplyStrategy(rec.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <span>Mark as Applied</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <div className="w-full py-2 text-center text-sm font-medium text-green-700 bg-green-100 rounded-lg">
                      ✓ Strategy Applied
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Additional Info */}
        <Card className="p-6 bg-slate-50">
          <h3 className="font-semibold text-slate-900 mb-3">Why These Recommendations?</h3>
          <div className="space-y-2 text-sm text-slate-700">
            {campusProfile.campusSize === 'Large' && (
              <p>• Your large campus benefits from zone-based control systems</p>
            )}
            {campusProfile.campusSize === 'Small' && (
              <p>• Small campuses see high ROI from lighting automation</p>
            )}
            {campusProfile.avgOccupancy > 70 && (
              <p>• High occupancy levels require active demand management</p>
            )}
            {campusProfile.hasHostels && (
              <p>• Residential hostels offer nighttime load optimization opportunities</p>
            )}
            <p>• Peak hours ({campusProfile.peakHoursStart}–{campusProfile.peakHoursEnd}) are critical for demand charges</p>
            <p>• All recommendations are tailored to {campusProfile.location} climate conditions</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
