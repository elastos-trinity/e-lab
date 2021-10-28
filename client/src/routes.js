import { Navigate, useRoutes } from 'react-router-dom';
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
import Logout from './pages/Logout';
import Home from './pages/Home';
import Users from './pages/dashboard/admin/Users';
import NotFound from './pages/Page404';
import Proposal from './pages/Proposal';
import UserProposal from './pages/UserProposal';
import Vote from './pages/Vote';

export default function Router() {
  return useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { path: 'home', element: <Vote /> },
        { path: 'user', element: <Users /> },
        { path: 'proposal', element: <Proposal /> },
        { path: 'my-proposal', element: <UserProposal /> },
        { path: 'vote', element: <Vote /> },
      ]
    },
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: [
        { path: 'logout', element: <Logout /> },
        // { path: 'register', element: <Register /> },
        { path: '404', element: <NotFound /> },
        { path: '/', element: <Home /> },
        { path: '*', element: <Navigate to="/404" /> }
      ]
    },
    { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}
