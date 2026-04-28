import { createBrowserRouter } from 'react-router-dom';

// 로그인 전 (Auth)
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import AuthLayout from '@/components/layout/AuthLayout';
// 로그인 후 (App)
// import PublicLayout from '@/components/layout/PublicLayout';
import AppLayout from '@/components/layout/appLayout';
import CreateTeamPage from '@/pages/teams/createTeamPage';

export const router = createBrowserRouter([
  // 로그인 전 
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
    ],
  },
  
  // 로그인 후
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <div>홈</div> },
      { path: '/teams/new', element: <CreateTeamPage /> },
    ],
  },
]);
  

