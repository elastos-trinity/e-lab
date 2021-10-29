import PropTypes from 'prop-types';
import { useContext, useState } from "react";
import { Paper, Typography, Card, Stack, Button, Grid } from '@mui/material';
import { Box, styled } from '@mui/system';
import TelegramActivation from "./TelegramActivation";
import UserContext from '../../contexts/UserContext';

ActivationRequired.propTypes = {
  // searchQuery: PropTypes.string
};

const RootStyle = styled("div")({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-center',
});

export default function ActivationRequired() {
  const [userTelegramActivationOpen, setUserTelegramActivationOpen] = useState(false);
  const { user } = useContext(UserContext);

  function handleActivationPrompt() {
    console.log("handleActivationPrompt")
    setUserTelegramActivationOpen(true);
  }

  function onClose() {
    console.log("onclose")
    setUserTelegramActivationOpen(false);
  }

  function handleActivationRequest() {

  }

  if (!user.active)
    return (
      <RootStyle>
        <Grid container spacing={2} sx={{ color: 'white', display: 'flex', width: '100%', padding: "20px", background: '#027B55', borderRadius: '10px' }}>
          <Grid xs={8} md={8} alignSelf="center" >
            Your account is not yet activated. Please activate it before voting.
          </Grid>
          <Grid xs={4} md={4}>
            <Button
              variant="contained"
              component={Button}
              // disabled={!userCanVote}
              onClick={() => { handleActivationPrompt() }}>
              Activate account {userTelegramActivationOpen}
            </Button>
          </Grid>
        </Grid>
        <TelegramActivation open={userTelegramActivationOpen} onClose={() => onClose()} handleActivation={() => handleActivationRequest()} />
      </RootStyle>
    )
  else
    return null;
}
