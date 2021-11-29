import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Stack, Container, Typography } from '@mui/material';
// layouts
import Page from '../components/base/Page';
import UserContext from '../contexts/UserContext';

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
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

export default function Logout() {
  const navigate = useNavigate();
  const { user, signOut } = useContext(UserContext);

  // Delete the authentication token = sign out
  useEffect(() => {
    if (user) {
      signOut();
    }

    setTimeout(() => {
      console.log("Going back to home page");
      navigate("/");
    }, 2000);
  });

  return (
    <RootStyle title="Logout | ELAB">
      <Container maxWidth="sm">
        <ContentStyle>
          <Stack sx={{ mb: 5 }}>
            <Typography variant="h4" gutterBottom textAlign="center">
              All right, you are signed out, see you!
            </Typography>
          </Stack>

        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
