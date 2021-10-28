import { Box, Grid, Container, Typography, Link, CircularProgress, Backdrop, Button } from '@mui/material';
import { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Page from '../../components/Page';
import UserContext from '../../UserContext';
import { TelegramActivation } from '../../components/_dashboard/proposal';
import { api } from "../../config";

export default function DashboardHome() {
  const navigate = useNavigate();
  const [backDropOpen, setBackDropOpen] = useState(false);
  const [userTelegramActivationOpen, setUserTelegramActivationOpen] = useState(false);

  const { user } = useContext(UserContext);

  console.log("Entering dashboard app page", user);

  if (user.type === 'user' && !user.active) {
    setUserTelegramActivationOpen(true);
  }

  const handleActive = (code) => {
    setBackDropOpen(true)
    fetch(`${api.url}/api/v1/active?code=${code}`,
      {
        method: "GET",
        headers: {
          "token": localStorage.getItem('token')
        },
      }).then(response => response.json()).then(data => {
        if (data.code === 200) {
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

      <Container maxWidth="xl">
        <Box sx={{ pb: 5 }}>
          <Typography variant="h4">Hi, Welcome to CR Community Voting</Typography>
        </Box>

        {user.type === 'user' ? (<Box sx={{ pb: 5 }}>
          <Button
            sx={{ width: "150px", mb: "20px" }}
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
