import { Box, Grid, Container, Typography, Link, CircularProgress, Backdrop, Button } from '@mui/material';
import { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Page from '../components/Page';
import UserContext from '../UserContext';
import { UserActive } from '../components/_dashboard/proposal';

export default function DashboardApp() {
  const navigate = useNavigate();
  const [backDropOpen, setBackDropOpen] = useState(false);
  const [userActiveOpen, setUserActiveOpen] = useState(false);

  const user = useContext(UserContext);

  if(user.type === 'user' && !user.active) {
    setUserActiveOpen(true);
  }

  const handleActive = (code) => {
    setBackDropOpen(true)
    fetch(`/api/v1/active?code=${code}`,
      {
        method: "GET",
        headers: {
          "token": localStorage.getItem('token')
        },
      }).then( response => response.json()).then( data => {
      if(data.code === 200) {
        navigate('/', { replace: true });
      } else {
        console.log(data);
      }
    }).catch((error) => {
      console.log(error)
    }).finally(() => {
      setBackDropOpen(false)
    })
  }

  return (
    <Page title="Dashboard | CR-Voting">
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backDropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <UserActive open={userActiveOpen} handleActive={handleActive} />

      <Container maxWidth="xl">
        <Box sx={{ pb: 5 }}>
          <Typography variant="h4">Hi, Welcome to CR Community Voting</Typography>
        </Box>

        {user.type === 'user' ? (<Box sx={{ pb: 5 }}>
          <Button
            sx={{width: "150px", mb: "20px"}}
            variant="contained"
            component={RouterLink}
            to="/dashboard/vote"
          >
            Go to Vote
          </Button>
        </Box>) : (<></>)}
      </Container>
    </Page>
  );
}
