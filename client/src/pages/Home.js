import { useContext } from 'react';
import { styled } from '@mui/material/styles';
import { Card, Stack, Container, Typography, Button } from '@mui/material';
// layouts
import Page from '../components/base/Page';
import { MHidden } from '../components/@material-extend';
import { LoginForm } from '../components/authentication/login';
import UserContext from '../contexts/UserContext';
import { essentialsConnector, useConnectivitySDK } from "../utils/connectivity";
import ConnectivityContext from '../contexts/ConnectivityContext';

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2)
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0)
}));

export default function Home() {
  const { user, signOut } = useContext(UserContext);
  const { isLinkedToEssentials, setIsLinkedToEssentials } = useContext(ConnectivityContext);

  useConnectivitySDK();

  const SignIn = () => (
    <div>
      <div style={{ marginBottom: "20px" }} >
        <LoginForm title="Sign in with your DID" action="signin" />
      </div>

      <h2>How to sign in?</h2>
      <div>
        1. Either by opening this dApp from the Elastos Essentials dApp browser.
      </div>
      <div>
        2. Or by scanning the Wallet Connect QR code using the Elastos Essentials scanner.
      </div>
    </div>

  )

  const ReturningSignIn = () => (
    <div>
      <p style={{ overflowWrap: "anywhere" }}>Signed in with DID <b>{user.did}</b></p>
      <LoginForm title="Continue" action="dashboard" />
    </div>
  )

  const SignInButtons = () => {
    if (user)
      return <ReturningSignIn />;

    return <SignIn />;
  }

  const clearEssentialsSession = () => {
    essentialsConnector.disconnectWalletConnect();
    signOut();
    setIsLinkedToEssentials(false);
  };

  return (
    <RootStyle title="Home | ELAB">
      <MHidden width="mdDown">
        <SectionStyle>
          <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
            Hi, Welcome!
          </Typography>
          <img src="/static/illustrations/illustration_login.png" alt="login" />
        </SectionStyle>
      </MHidden>

      <Container maxWidth="sm">
        <ContentStyle>
          <Stack sx={{ mb: 5 }}>
            <Typography variant="h2" gutterBottom textAlign="center">
              Welcome to ELAB
            </Typography>
          </Stack>

          <SignInButtons />

          {
            // using the essentials connector (used by desktop apps, not by the essentials built-in browser
            // => show a disconnection button to manually clear wallet connect if needed in case or problem.
            isLinkedToEssentials ?
              <Button
                sx={{ marginTop: "10px" }}
                variant="outlined"
                component={Button}
                onClick={() => { clearEssentialsSession() }}
              >
                Clear link to Elastos Essentials
              </Button> : null
          }

        </ContentStyle>
      </Container>
    </RootStyle >
  );
}
