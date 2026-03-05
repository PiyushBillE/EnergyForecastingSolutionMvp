import { Header } from '../components/Header';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { Save, Bell, Zap, Users, Settings2, Database, Loader2, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { seedDemoData } from '../utils/seedData';
import { projectId } from '../../../utils/supabase/info';

export function Settings() {
  const [peakAlertThreshold, setPeakAlertThreshold] = useState(350);
  const [hvacOptimization, setHvacOptimization] = useState(true);
  const [occupancyIntegration, setOccupancyIntegration] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [peakAlerts, setPeakAlerts] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleSaveSettings = () => {
    alert('Settings saved successfully!\n\nYour preferences have been updated.');
  };

  return (
    <div>
      <Header 
        title="Settings" 
        subtitle="Configure system preferences and notifications"
      />

      <div className="p-8 space-y-6">
        {/* Alert Threshold Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Peak Alert Threshold</h3>
              <p className="text-sm text-slate-600">Set the energy level that triggers peak demand alerts</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Threshold Value (kWh)</Label>
                <span className="text-2xl font-bold text-blue-600">{peakAlertThreshold}</span>
              </div>
              <Slider 
                value={[peakAlertThreshold]}
                onValueChange={(value) => setPeakAlertThreshold(value[0])}
                min={200}
                max={500}
                step={10}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-slate-600">
                <span>200 kWh</span>
                <span>500 kWh</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                ⚠️ Alerts will be triggered when predicted energy consumption exceeds {peakAlertThreshold} kWh
              </p>
            </div>
          </div>
        </Card>

        {/* Optimization Features */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Optimization Features</h3>
              <p className="text-sm text-slate-600">Enable or disable automatic optimization systems</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="text-base">HVAC Optimization</Label>
                <p className="text-sm text-slate-600 mt-1">
                  Automatically adjust heating and cooling based on occupancy and weather
                </p>
              </div>
              <Switch 
                checked={hvacOptimization}
                onCheckedChange={setHvacOptimization}
              />
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-base">Occupancy Data Integration</Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Use real-time occupancy sensors to optimize energy usage
                  </p>
                </div>
                <Switch 
                  checked={occupancyIntegration}
                  onCheckedChange={setOccupancyIntegration}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Notification Preferences</h3>
              <p className="text-sm text-slate-600">Choose how you want to receive alerts and updates</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-slate-600 mt-1">
                  Receive daily summaries and important alerts via email
                </p>
              </div>
              <Switch 
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-base">SMS Notifications</Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Get critical alerts sent directly to your mobile phone
                  </p>
                </div>
                <Switch 
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-base">Peak Load Alerts</Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Get notified when energy demand approaches peak threshold
                  </p>
                </div>
                <Switch 
                  checked={peakAlerts}
                  onCheckedChange={setPeakAlerts}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* User Profile */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">User Profile</h3>
              <p className="text-sm text-slate-600">Manage your account information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name"
                defaultValue="Energy Manager"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email"
                type="email"
                defaultValue="manager@university.edu"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone"
                type="tel"
                defaultValue="+91 98765 43210"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input 
                id="department"
                defaultValue="Facilities Management"
                className="mt-2"
              />
            </div>
          </div>
        </Card>

        {/* System Configuration */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">System Configuration</h3>
              <p className="text-sm text-slate-600">Advanced settings and API configuration</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="api-endpoint">API Endpoint</Label>
              <Input 
                id="api-endpoint"
                defaultValue="https://api.energy-dashboard.edu/v1"
                className="mt-2 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="update-frequency">Data Update Frequency (seconds)</Label>
              <Input 
                id="update-frequency"
                type="number"
                defaultValue="5"
                className="mt-2"
              />
            </div>
          </div>
        </Card>

        {/* Database Management */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Database Management</h3>
              <p className="text-sm text-slate-600">Supabase backend configuration and demo data</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Supabase Project ID</span>
                <code className="text-xs bg-white px-2 py-1 rounded border border-slate-300">{projectId}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Database URL</span>
                <code className="text-xs bg-white px-2 py-1 rounded border border-slate-300">
                  https://{projectId}.supabase.co
                </code>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Demo Data Generator</h4>
              <p className="text-sm text-slate-600 mb-4">
                Create a sample campus with 30 days of historical energy data and 48 hours of predictions for testing.
              </p>
              <Button
                onClick={async () => {
                  if (!confirm('This will create a demo campus with 30 days of sample data. Continue?')) {
                    return;
                  }
                  setIsSeeding(true);
                  setSeedSuccess(false);
                  try {
                    const result = await seedDemoData();
                    setSeedSuccess(true);
                    alert(`✅ Demo data created!\\n\\nCampus ID: ${result.campusId}\\nEnergy Records: ${result.energyRecords}\\nPredictions: ${result.predictions}\\n\\nRefresh the page to see the data.`);
                  } catch (error: any) {
                    alert(`❌ Error: ${error.message}`);
                  } finally {
                    setIsSeeding(false);
                  }
                }}
                disabled={isSeeding}
                variant="outline"
                className="w-full"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Demo Data...
                  </>
                ) : seedSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Demo Data Created
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Generate Demo Data
                  </>
                )}
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                ℹ️ All dashboard data is stored in Supabase PostgreSQL. The demo data generator creates realistic energy consumption patterns for testing.
              </p>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveSettings}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
