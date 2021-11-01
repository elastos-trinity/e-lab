import { useContext, useState } from "react";
import { Button, Grid } from '@mui/material';
import { styled } from '@mui/system';
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
    setUserTelegramActivationOpen(true);
  }

  function onClose() {
    setUserTelegramActivationOpen(false);
  }

  if (!user.active)
    return (
      <RootStyle>
        <Grid container sx={{ color: 'white', display: 'flex', padding: "20px", background: '#027B55', borderRadius: '10px' }}>
          <Grid item xs={8} md={8} padding="5px" alignSelf="center" >
            Your account is not yet activated. Please activate it before voting or submitting a proposal.
          </Grid>
          <Grid item xs={4} md={4} alignSelf="center">
            <Button
              variant="contained"
              component={Button}
              // disabled={!userCanVote}
              onClick={() => { handleActivationPrompt() }}>
              Activate account {userTelegramActivationOpen}
            </Button>
          </Grid>
        </Grid>
        <TelegramActivation open={userTelegramActivationOpen} onClose={() => onClose()} />
      </RootStyle>
    )
  else
    return null;
}
