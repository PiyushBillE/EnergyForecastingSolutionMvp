import { createBrowserRouter } from 'react-router';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Forecast } from './pages/Forecast';
import { Insights } from './pages/Insights';
import { Sustainability } from './pages/Sustainability';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { CustomPrediction } from './pages/CustomPrediction';
import { CampusProfile } from './pages/CampusProfile';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'campus-profile', Component: CampusProfile },
      { path: 'forecast', Component: Forecast },
      { path: 'insights', Component: Insights },
      { path: 'sustainability', Component: Sustainability },
      { path: 'custom-prediction', Component: CustomPrediction },
      { path: 'reports', Component: Reports },
      { path: 'settings', Component: Settings },
      { path: '*', Component: NotFound },
    ],
  },
]);