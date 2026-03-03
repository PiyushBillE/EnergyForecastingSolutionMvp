import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Building2, Users, MapPin, Home, Clock, Calendar, Sparkles, RotateCcw } from 'lucide-react';
import { useCampus, CampusProfile as CampusProfileType } from '../context/CampusContext';

export function CampusProfile() {
  const navigate = useNavigate();
  const { campusProfile, updateCampusProfile, resetCampus, isConfigured } = useCampus();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<CampusProfileType>({
    campusSize: 'Medium',
    numBuildings: 10,
    avgOccupancy: 75,
    location: 'Mumbai, Maharashtra',
    hasHostels: true,
    peakHoursStart: '09:00',
    peakHoursEnd: '17:00',
    specialEventFrequency: 'Monthly',
  });

  useEffect(() => {
    if (campusProfile) {
      setFormData(campusProfile);
    }
  }, [campusProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    updateCampusProfile(formData);
    setIsLoading(false);
    navigate('/');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the campus configuration? This will clear all simulated data.')) {
      resetCampus();
      setFormData({
        campusSize: 'Medium',
        numBuildings: 10,
        avgOccupancy: 75,
        location: 'Mumbai, Maharashtra',
        hasHostels: true,
        peakHoursStart: '09:00',
        peakHoursEnd: '17:00',
        specialEventFrequency: 'Monthly',
      });
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Campus Profile</h1>
              <p className="text-slate-600 mt-2">Configure your campus environment to generate personalized energy analytics</p>
            </div>
            {isConfigured && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Campus
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-900">Configure Your Campus Environment</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campus Size */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Building2 className="w-4 h-4" />
                Campus Size
              </label>
              <select
                value={formData.campusSize}
                onChange={(e) => setFormData({ ...formData, campusSize: e.target.value as 'Small' | 'Medium' | 'Large' })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Small">Small (1–5 buildings)</option>
                <option value="Medium">Medium (6–15 buildings)</option>
                <option value="Large">Large (16+ buildings)</option>
              </select>
            </div>

            {/* Number of Buildings */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Building2 className="w-4 h-4" />
                Number of Academic Buildings
              </label>
              <input
                type="number"
                value={formData.numBuildings}
                onChange={(e) => setFormData({ ...formData, numBuildings: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="50"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Enter the total number of academic and administrative buildings</p>
            </div>

            {/* Average Daily Occupancy */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Users className="w-4 h-4" />
                Average Daily Occupancy: <span className="text-blue-600 font-semibold">{formData.avgOccupancy}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.avgOccupancy}
                onChange={(e) => setFormData({ ...formData, avgOccupancy: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Typical percentage of campus capacity during weekdays</p>
            </div>

            {/* Campus Location */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <MapPin className="w-4 h-4" />
                Campus Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Used for climate-based energy modeling</p>
            </div>

            {/* Has Residential Hostels */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-slate-600" />
                <div>
                  <label className="text-sm font-medium text-slate-700">Residential Hostels</label>
                  <p className="text-xs text-slate-500 mt-1">Does your campus have student or staff housing?</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasHostels: !formData.hasHostels })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.hasHostels ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.hasHostels ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Peak Activity Hours */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Clock className="w-4 h-4" />
                Peak Activity Hours
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Start Time</label>
                  <input
                    type="time"
                    value={formData.peakHoursStart}
                    onChange={(e) => setFormData({ ...formData, peakHoursStart: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">End Time</label>
                  <input
                    type="time"
                    value={formData.peakHoursEnd}
                    onChange={(e) => setFormData({ ...formData, peakHoursEnd: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">When is your campus most active (e.g., class hours)?</p>
            </div>

            {/* Special Event Frequency */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4" />
                Special Event Frequency
              </label>
              <select
                value={formData.specialEventFrequency}
                onChange={(e) => setFormData({ ...formData, specialEventFrequency: e.target.value as 'Rare' | 'Monthly' | 'Weekly' })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Rare">Rare (1-2 per semester)</option>
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Frequency of large events, conferences, or exams</p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Simulation...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {isConfigured ? 'Update Campus Simulation' : 'Initialize Campus Simulation'}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">How It Works</h4>
                <p className="text-sm text-blue-800">
                  Your configuration will generate a realistic 30-day energy simulation with personalized analytics, forecasts, 
                  and recommendations tailored to your campus characteristics. All dashboard data will update to reflect your settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
