import PropTypes from 'prop-types';
import { useState } from "react";
import { Paper, Typography, Card, Stack, Button } from '@mui/material';
import { Box, styled } from '@mui/system';
import TelegramActivation from "./TelegramActivation";

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

  return (
    <RootStyle>
      <Card sx={{ color: 'white', display: 'flex', width: '100%', padding: "20px", background: '#027B55' }}>
        <Stack direction="row" justifyContent="space-between">
          <Stack justifyContent="center">Your account is not yet activated. Please activate it before voting.</Stack>
          <Stack justifyContent="center">
            <Button
              sx={{ width: "150px", mb: "20px" }}
              variant="contained"
              component={Button}
              // disabled={!userCanVote}
              onClick={() => { handleActivationPrompt() }}
            >
              Activate account {userTelegramActivationOpen}
            </Button>
          </Stack>
        </Stack>
      </Card>
      <TelegramActivation open={userTelegramActivationOpen} onClose={() => onClose()} handleActivation={() => handleActivationRequest()} />
    </RootStyle>
  );
}
