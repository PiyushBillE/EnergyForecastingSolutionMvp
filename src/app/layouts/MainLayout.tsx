import { Outlet } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { useCampus } from '../context/CampusContext';
import { Info, Loader2 } from 'lucide-react';

export function MainLayout() {
  const { isSimulationMode, isConfigured, isLoading } = useCampus();

  // Show loading state while initial data loads
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading campus data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        {/* Mode Indicator */}
        {isConfigured && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
            <div className="bg-white shadow-lg rounded-lg px-4 py-2 border border-slate-200 flex items-center gap-2 group relative">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-slate-700">Simulation Mode</span>
              <Info className="w-4 h-4 text-slate-400" />
              
              {/* Tooltip */}
              <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl">
                <p className="mb-2">Data is generated based on your configured campus profile.</p>
                <div className="pt-2 border-t border-slate-700 text-slate-400">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                    Live Mode: Requires smart meter integration
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <Outlet />
      </main>
    </div>
  );
}