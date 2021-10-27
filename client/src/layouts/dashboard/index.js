import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import peopleFill from '@iconify/icons-eva/people-fill';
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';
import UserContext from '../../UserContext';

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

const menuConfigAdmin = [
  {
    title: 'user',
    path: '/dashboard/user',
    icon: getIcon(peopleFill)
  },
  {
    title: 'proposal',
    path: '/dashboard/proposal',
    icon: getIcon(peopleFill)
  }
];

const menuConfigUser = [
  {
    title: 'vote',
    path: '/dashboard/vote',
    icon: getIcon(peopleFill)
  },
  {
    title: 'my proposal',
    path: '/dashboard/my-proposal',
    icon: getIcon(peopleFill)
  }
];

export default function DashboardLayout() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    fetch('/api/v1/currentUser',
      {
        method: "GET",
        headers: {
          "token": localStorage.getItem('token')
        },
      }).then( response => response.json()).then( data => {
      if(data.code === 200) {
        const user = data.data;
        console.log(user);
        setUser(user);
      } else {
        console.log(data);
        navigate('/login', {replace: true})
      }
    }).catch((error) => {
      console.log(error)
    })
  }, [])

  return (
    <UserContext.Provider value={user}>
      <RootStyle>
        <DashboardNavbar onOpenSidebar={() => setOpen(true)} />
        <DashboardSidebar sidebarConfig={user.type === "admin" ? menuConfigAdmin : menuConfigUser}
                          isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />
        <MainStyle>
            <Outlet />
        </MainStyle>
      </RootStyle>
    </UserContext.Provider>
  );
}
