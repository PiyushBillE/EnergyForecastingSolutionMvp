import { Header } from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Download, FileText, Calendar } from 'lucide-react';
import { useState } from 'react';

export function Reports() {
  const [startDate, setStartDate] = useState('2026-02-01');
  const [endDate, setEndDate] = useState('2026-03-03');

  const handleDownloadPDF = () => {
    alert('Generating comprehensive energy report PDF...\n\nThis would download a detailed report with:\n- Energy consumption analysis\n- Cost savings breakdown\n- Sustainability metrics\n- Recommendations summary');
  };

  const handleExportCSV = () => {
    alert('Exporting forecast data to CSV...\n\nThis would download a CSV file containing:\n- 24-hour forecast data\n- Historical consumption\n- Predicted values\n- Risk assessments');
  };

  const reports = [
    {
      title: 'Monthly Energy Report',
      description: 'Comprehensive analysis of energy consumption, costs, and savings for the selected month',
      type: 'PDF',
      icon: '📊',
    },
    {
      title: 'Forecast Data Export',
      description: 'Export 24-hour forecast predictions with risk levels and confidence scores',
      type: 'CSV',
      icon: '📈',
    },
    {
      title: 'Sustainability Report',
      description: 'Environmental impact analysis including CO₂ reduction and renewable energy metrics',
      type: 'PDF',
      icon: '🌱',
    },
    {
      title: 'Optimization Summary',
      description: 'Summary of applied strategies, energy reductions, and cost savings achieved',
      type: 'PDF',
      icon: '💡',
    },
  ];

  return (
    <div>
      <Header 
        title="Reports" 
        subtitle="Generate and export comprehensive analytics"
      />

      <div className="p-8 space-y-6">
        {/* Date Range Selector */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Select Date Range</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input 
                id="start-date"
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input 
                id="end-date"
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          
          <p className="text-sm text-slate-600 mt-4">
            Selected range: <strong>{startDate}</strong> to <strong>{endDate}</strong> 
            ({Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days)
          </p>
        </Card>

        {/* Available Reports */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{report.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-2">{report.title}</h4>
                    <p className="text-sm text-slate-600 mb-4">{report.description}</p>
                    <div className="flex items-center gap-3">
                      <Button 
                        onClick={report.type === 'PDF' ? handleDownloadPDF : handleExportCSV}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download {report.type}
                      </Button>
                      <span className="text-xs text-slate-500">{report.type} format</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="justify-start h-auto py-4"
              onClick={handleDownloadPDF}
            >
              <FileText className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Current Month Report</div>
                <div className="text-xs text-slate-600">March 2026</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto py-4"
              onClick={handleDownloadPDF}
            >
              <FileText className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Quarterly Summary</div>
                <div className="text-xs text-slate-600">Q1 2026</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto py-4"
              onClick={handleDownloadPDF}
            >
              <FileText className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Annual Report</div>
                <div className="text-xs text-slate-600">2025</div>
              </div>
            </Button>
          </div>
        </Card>

        {/* Report History */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {[
              { name: 'February 2026 Energy Report.pdf', date: '2026-03-01', size: '2.4 MB' },
              { name: 'Forecast Export - 2026-02-28.csv', date: '2026-02-28', size: '156 KB' },
              { name: 'January 2026 Sustainability Report.pdf', date: '2026-02-01', size: '3.1 MB' },
              { name: 'Q4 2025 Optimization Summary.pdf', date: '2026-01-05', size: '1.8 MB' },
            ].map((file, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-600">Generated on {file.date} • {file.size}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
