import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Home, Dashboard, Login } from '../pages';
import { Callback } from '../components';
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
    ],
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}