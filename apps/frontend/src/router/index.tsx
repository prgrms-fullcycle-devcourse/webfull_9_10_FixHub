import { createBrowserRouter } from 'react-router-dom';

// 로그인 전
import AuthLayout from '@/components/layout/AuthLayout';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';

// 로그인 후
import AppLayout from '@/components/layout/AppLayout';
import IssueCreate from '@/pages/IssueCreate';
import IssueDetail from '@/pages/IssueDetail';
import IssueEdit from '@/pages/IssueEdit';
import IssueFeed from '@/pages/IssueFeed';
import CreateTeamPage from '@/pages/teams/CreateTeamPage';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
    ],
  },

  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <IssueFeed /> },
      { path: '/issues/new', element: <IssueCreate /> },
      { path: '/teams/new', element: <CreateTeamPage /> },
      { path: '/issues/:issueId', element: <IssueDetail /> },
      { path: '/issues/:issueId/edit', element: <IssueEdit /> },
    ],
  },
]);
