import { createBrowserRouter } from 'react-router-dom';

// import PublicLayout from '@/components/layout/PublicLayout';
import AppLayout from '@/components/layout/appLayout';

// import LoginPage from '@/pages/auth/LoginPage';
// import SignupPage from '@/pages/auth/SignupPage';
import CreateTeamPage from '@/pages/teams/createTeamPage';

export const router = createBrowserRouter([
  //   // 로그인 전
  //   {
  //     element: <PublicLayout />,
  //     children: [
  //       { path: '/login', element: <LoginPage /> },
  //       { path: '/signup', element: <SignupPage /> },
  //     ],
  //   },

  // 로그인 후
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <div>홈</div> },
      { path: '/teams/new', element: <CreateTeamPage /> },
    ],
  },
]);
