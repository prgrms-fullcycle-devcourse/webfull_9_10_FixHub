import { createBrowserRouter } from 'react-router-dom';

import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import AuthLayout from '@/components/layout/AuthLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
    ],
  },
]);
