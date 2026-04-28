import { createBrowserRouter } from 'react-router-dom';

// 로그인 전 (Auth)
import AuthLayout from '@/components/layout/AuthLayout';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';

// 로그인 후 (App)
import AppLayout from '@/components/layout/appLayout';
import IssueDetail from '@/pages/IssueDetail';
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
      { path: '/issues/:issueId', element: <IssueDetail /> },
    ],
  },
]);
