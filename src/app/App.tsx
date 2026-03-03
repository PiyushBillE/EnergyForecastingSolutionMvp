import { RouterProvider } from 'react-router';
import { router } from './routes';
import { CampusProvider } from './context/CampusContext';

export default function App() {
  return (
    <CampusProvider>
      <RouterProvider router={router} />
    </CampusProvider>
  );
}