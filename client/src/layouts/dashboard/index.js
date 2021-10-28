import { useEffect, useState, useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import peopleFill from '@iconify/icons-eva/people-fill';
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';
import UserContext from '../../UserContext';
import { api } from "../../config";

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});

const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));

const getIcon = (name) => <Icon icon={name} width={22} height={22} />;

const menuConfigUser = [
  {
    title: 'Community proposals',
    path: '/dashboard/vote',
    icon: getIcon(peopleFill)
  },
  {
    title: 'My proposals',
    path: '/dashboard/my-proposal',
    icon: getIcon(peopleFill)
  },
  {
    title: 'Sign out',
    path: '/logout',
    icon: getIcon(peopleFill)
  }
];

const menuConfigAdmin = [
  {
    title: '(admin) Manage users',
    path: '/dashboard/user',
    icon: getIcon(peopleFill)
  },
  {
    title: '(admin) Manage proposals',
    path: '/dashboard/proposal',
    icon: getIcon(peopleFill)
  },
  ...menuConfigUser // An admin is also a user
];

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useContext(UserContext);

  return (
    <RootStyle>
      <DashboardNavbar onOpenSidebar={() => setOpen(true)} />
      <DashboardSidebar sidebarConfig={user.type === "admin" ? menuConfigAdmin : menuConfigUser}
        isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />
      <MainStyle>
        <Outlet />
      </MainStyle>
    </RootStyle>
  );
}
