import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Home, Dashboard, Login, Register } from '../pages';
import { Callback } from '../components';
import Trips from '../pages/dashboard/Trips';
import PlanTrip from '../pages/dashboard/PlanTrip';
import ProtectedRoute from './ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/auth/callback',
        element: <Callback />,
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard/trips',
        element: (
          <ProtectedRoute>
            <Trips />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard/plan',
        element: (
          <ProtectedRoute>
            <PlanTrip />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}