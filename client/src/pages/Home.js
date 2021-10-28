import { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Card, Stack, Link, Container, Typography } from '@mui/material';
// layouts
import Page from '../components/Page';
import { MHidden } from '../components/@material-extend';
import { LoginForm } from '../components/authentication/login';
import UserContext from '../UserContext';

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
  const { user } = useContext(UserContext);

  console.log("User context", user)

  function SignIn() {
    return (
      <div>
        <LoginForm title="Sign in with your DID" action="signin" />
      </div>
    )
  }

  function ReturningSignIn() {
    return (
      <div>
        <p>Signed in with DID <b>{user.did}</b></p>
        <LoginForm title="Continue with previous DID" action="dashboard" />
        <br />
        <LoginForm title="Use another DID" action="signin" />
      </div>
    )
  }

  function SignInButtons() {
    if (user)
      return <ReturningSignIn />;

    return <SignIn />;
  }
  return (
    <RootStyle title="Home | CR-Voting">
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
              Welcome to CR Community Voting
            </Typography>
          </Stack>

          <SignInButtons />

        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
