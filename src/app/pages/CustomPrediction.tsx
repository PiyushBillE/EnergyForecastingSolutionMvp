import { useState } from 'react';
import { Calendar, Clock, Users, Thermometer, Droplets, CalendarDays, Sparkles, AlertTriangle, TrendingDown, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface PredictionResult {
  predicted_energy: number;
  risk_level: 'Low' | 'Medium' | 'High';
  top_factors: { factor: string; impact: number }[];
  recommendation: string;
  estimated_savings: number;
  comparison_text: string;
  peak_risk: boolean;
  priority: 'Low' | 'Medium' | 'High';
}

export function CustomPrediction() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hour, setHour] = useState<string>('14');
  const [minute, setMinute] = useState<string>('00');
  const [occupancy, setOccupancy] = useState<number>(75);
  const [temperature, setTemperature] = useState<string>('24');
  const [humidity, setHumidity] = useState<string>('60');
  const [dayType, setDayType] = useState<'Weekday' | 'Weekend' | 'Holiday'>('Weekday');
  const [specialEvent, setSpecialEvent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

  const handleDateChange = (dateString: string) => {
    const newDate = new Date(dateString);
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
    }
  };

  const getFormattedDate = () => {
    try {
      if (selectedDate && !isNaN(selectedDate.getTime())) {
        return format(selectedDate, 'yyyy-MM-dd');
      }
      return format(new Date(), 'yyyy-MM-dd');
    } catch (error) {
      return format(new Date(), 'yyyy-MM-dd');
    }
  };

  const generatePrediction = async () => {
    setIsLoading(true);
    
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Calculate predicted energy based on inputs
    const baseEnergy = 450;
    const occupancyFactor = (occupancy / 100) * 200;
    const tempFactor = Math.abs(parseFloat(temperature) - 22) * 10;
    const humidityFactor = Math.abs(parseFloat(humidity) - 50) * 2;
    const hourNum = parseInt(hour);
    const peakHourFactor = (hourNum >= 9 && hourNum <= 17) ? 100 : 0;
    const dayTypeFactor = dayType === 'Weekend' ? -80 : dayType === 'Holiday' ? -120 : 0;
    const eventFactor = specialEvent ? 150 : 0;
    
    const predictedEnergy = Math.round(
      baseEnergy + occupancyFactor + tempFactor + humidityFactor + peakHourFactor + dayTypeFactor + eventFactor
    );
    
    // Determine risk level
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (predictedEnergy > 700) riskLevel = 'High';
    else if (predictedEnergy > 550) riskLevel = 'Medium';
    
    // Check peak risk
    const peakRisk = hourNum >= 12 && hourNum <= 18 && occupancy > 70;
    
    // Top influencing factors
    const factors = [
      { factor: 'Occupancy Level', impact: Math.round((occupancyFactor / predictedEnergy) * 100) },
      { factor: 'Time of Day', impact: Math.round((peakHourFactor / predictedEnergy) * 100) },
      { factor: 'Temperature', impact: Math.round((tempFactor / predictedEnergy) * 100) },
    ].sort((a, b) => b.impact - a.impact).slice(0, 3);
    
    // Generate recommendation
    let recommendation = '';
    let estimatedSavings = 0;
    let priority: 'Low' | 'Medium' | 'High' = 'Low';
    
    if (riskLevel === 'High') {
      recommendation = 'Reduce HVAC load by 20% and optimize lighting schedules during peak hours';
      estimatedSavings = Math.round(predictedEnergy * 0.15);
      priority = 'High';
    } else if (riskLevel === 'Medium') {
      recommendation = 'Adjust temperature setpoint to 23°C and implement smart lighting zones';
      estimatedSavings = Math.round(predictedEnergy * 0.10);
      priority = 'Medium';
    } else {
      recommendation = 'Maintain current settings and continue monitoring energy patterns';
      estimatedSavings = Math.round(predictedEnergy * 0.05);
      priority = 'Low';
    }
    
    // Comparison text
    const avgEnergy = dayType === 'Weekday' ? 520 : 380;
    const difference = Math.round(((predictedEnergy - avgEnergy) / avgEnergy) * 100);
    const comparisonText = difference > 0 
      ? `${Math.abs(difference)}% higher than average ${dayType.toLowerCase()}`
      : `${Math.abs(difference)}% lower than average ${dayType.toLowerCase()}`;
    
    const result: PredictionResult = {
      predicted_energy: predictedEnergy,
      risk_level: riskLevel,
      top_factors: factors,
      recommendation,
      estimated_savings: estimatedSavings,
      comparison_text: comparisonText,
      peak_risk: peakRisk,
      priority,
    };
    
    setPredictionResult(result);
    setIsLoading(false);
  };

  const handleClearForm = () => {
    setSelectedDate(new Date());
    setHour('14');
    setMinute('00');
    setOccupancy(75);
    setTemperature('24');
    setHumidity('60');
    setDayType('Weekday');
    setSpecialEvent(false);
  };

  const handleResetDefault = () => {
    handleClearForm();
    setPredictionResult(null);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Custom Energy Prediction</h1>
        <p className="text-slate-600 mt-2">Simulate energy usage scenarios and receive AI-powered optimization recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Input Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-900">Simulate Energy Usage Scenario</h2>
          </div>

          <div className="space-y-5">
            {/* Date Picker */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                type="date"
                value={getFormattedDate()}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Time Selector */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Clock className="w-4 h-4" />
                Time
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                    <option key={h} value={h.toString().padStart(2, '0')}>
                      {h.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {['00', '15', '30', '45'].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Occupancy Slider */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Users className="w-4 h-4" />
                Occupancy Percentage: <span className="text-blue-600 font-semibold">{occupancy}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={occupancy}
                onChange={(e) => setOccupancy(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Temperature */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Thermometer className="w-4 h-4" />
                Temperature (°C)
              </label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="15"
                max="40"
              />
            </div>

            {/* Humidity */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Droplets className="w-4 h-4" />
                Humidity (%)
              </label>
              <input
                type="number"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
              />
            </div>

            {/* Day Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <CalendarDays className="w-4 h-4" />
                Day Type
              </label>
              <select
                value={dayType}
                onChange={(e) => setDayType(e.target.value as 'Weekday' | 'Weekend' | 'Holiday')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Weekday">Weekday</option>
                <option value="Weekend">Weekend</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>

            {/* Special Event Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-slate-700">Special Event</label>
                <p className="text-xs text-slate-500 mt-1">Conference, exam, or large gathering</p>
              </div>
              <button
                onClick={() => setSpecialEvent(!specialEvent)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  specialEvent ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    specialEvent ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={generatePrediction}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Prediction
                </>
              )}
            </button>
            <button
              onClick={handleClearForm}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              Clear
            </button>
          </div>

          <button
            onClick={handleResetDefault}
            className="w-full mt-3 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Reset to Default Scenario
          </button>
        </div>

        {/* Right Side - Prediction Results */}
        <div className="space-y-6">
          {!predictionResult && !isLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to Predict</h3>
              <p className="text-slate-600">Configure the parameters and click "Generate Prediction" to see AI-powered energy insights</p>
            </div>
          )}

          {isLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Analyzing Scenario...</h3>
              <p className="text-slate-600">Our AI is processing your inputs</p>
            </div>
          )}

          {predictionResult && !isLoading && (
            <>
              {/* Predicted Energy Usage Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-4">Predicted Energy Usage</h3>
                <div className="flex items-end gap-4 mb-4">
                  <div className="text-5xl font-bold text-slate-900">
                    {predictionResult.predicted_energy}
                  </div>
                  <div className="text-xl text-slate-600 mb-2">kWh</div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskColor(predictionResult.risk_level)}`}>
                    {predictionResult.risk_level} Risk
                  </span>
                </div>
                <p className="text-sm text-slate-600">{predictionResult.comparison_text}</p>
              </div>

              {/* Peak Risk Indicator */}
              {predictionResult.peak_risk && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-red-900 mb-1">Peak Load Risk Detected</h3>
                      <p className="text-sm text-red-700">
                        Selected time falls under predicted peak load period. Consider shifting non-critical loads to off-peak hours.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Recommendation */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">AI Optimization Recommendation</h3>
                </div>
                <p className="text-slate-700 mb-4">{predictionResult.recommendation}</p>
                
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                      <TrendingDown className="w-4 h-4" />
                      Estimated Energy Reduction
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((predictionResult.estimated_savings / predictionResult.predicted_energy) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Estimated Cost Savings</div>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{Math.round(predictionResult.estimated_savings * 8.5)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-slate-600">Priority Level:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(predictionResult.priority)}`}>
                    {predictionResult.priority}
                  </span>
                </div>
              </div>

              {/* Explainable AI */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Why This Prediction?</h3>
                
                <div className="mb-4" style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={predictionResult.top_factors}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="factor" 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        label={{ value: 'Impact (%)', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                        formatter={(value: number) => [`${value}%`, 'Impact']}
                      />
                      <Bar dataKey="impact" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Analysis: </span>
                    Energy consumption is {predictionResult.risk_level.toLowerCase()} due to{' '}
                    {predictionResult.top_factors.map((f, i) => (
                      <span key={i}>
                        {f.factor.toLowerCase()} ({f.impact}%)
                        {i < predictionResult.top_factors.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                    .
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}