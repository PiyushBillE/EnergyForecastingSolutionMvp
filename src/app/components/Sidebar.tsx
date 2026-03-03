import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Lightbulb, 
  Leaf, 
  FileText, 
  Settings,
  Sparkles,
  Building2
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard Overview', icon: LayoutDashboard },
  { path: '/campus-profile', label: 'Campus Profile', icon: Building2 },
  { path: '/forecast', label: 'Energy Forecast', icon: TrendingUp },
  { path: '/insights', label: 'Optimization Insights', icon: Lightbulb },
  { path: '/sustainability', label: 'Sustainability Impact', icon: Leaf },
  { path: '/custom-prediction', label: 'Custom Prediction', icon: Sparkles },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-semibold">Smart Energy</h1>
        <p className="text-sm text-slate-400 mt-1">Optimization Dashboard</p>
      </div>

      <nav className="flex-1 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">System Online</span>
          </div>
          <p className="text-xs text-slate-400">All sensors active</p>
        </div>
      </div>
    </aside>
  );
}