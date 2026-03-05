import { RouterProvider } from 'react-router';
import { router } from './routes';
import { CampusProvider } from './context/CampusContext';
import './utils/seedData'; // Make seedData globally available via window

export default function App() {
  return (
    <CampusProvider>
      <RouterProvider router={router} />
    </CampusProvider>
  );
}