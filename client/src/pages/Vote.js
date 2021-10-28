import { Icon } from '@iconify/react';
import { useContext, useEffect, useState } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Card,
  Stack,
  Button,
  Container,
  Typography,
  Backdrop, CircularProgress, CardContent, Radio
} from '@mui/material';
import Page from '../components/Page';
import UserContext from '../UserContext';
import { fDateTimeNormal } from '../utils/formatTime';
import { api } from "../config";
import ActivationRequired from "../components/authentication/ActivationRequired";

export default function Vote() {
  const [proposals, setProposals] = useState([]);
  const [backDropOpen, setBackDropOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [userCanVote, setUserCanVote] = useState(true);

  useEffect(() => {
    setBackDropOpen(true)
    fetchProposals();
  }, [])

  const fetchProposals = () => {
    fetch(`${api.url}/api/v1/proposal/listCanVote`,
      {
        method: "GET",
        headers: {
          "token": localStorage.getItem('token')
        }
      }).then(response => response.json()).then(data => {
        if (data.code === 200) {
          const proposals = data.data.result;
          setProposals(data.data.result);

          fetch(`${api.url}/api/v1/proposal/userHaveVoted`,
            {
              method: "GET",
              headers: {
                "token": localStorage.getItem('token')
              }
            }).then(response => response.json()).then(data => {
              if (data.code === 200) {
                console.log(data.data);
                proposals.forEach(item => {
                  if (data.data.includes(item.id)) {
                    setSelectedValue(item.id);
                    setUserCanVote(false)
                  }
                })
              } else {
                console.log(data);
              }
            }).catch((error) => {
              console.log(error)
            })
        } else {
          console.log(data);
        }
      }).catch((error) => {
        console.log(error)
      }).finally(() => {
        setBackDropOpen(false)
      })
  }

  const handleVote = () => {
    if (!selectedValue) {
      alert('Please choose one item to vote');
      return;
    }
    setBackDropOpen(true)
    fetch(`${api.url}/api/v1/proposal/vote/${selectedValue}`,
      {
        method: "GET",
        headers: {
          "token": localStorage.getItem('token')
        },
      }).then(response => response.json()).then(data => {
        if (data.code === 200) {
          fetchProposals()
        } else {
          console.log(data);
        }
      }).catch((error) => {
        console.log(error)
      }).finally(() => {
        setBackDropOpen(false)
      })
  }

  function NoProposal() {
    return (<div>Currently no proposal to vote for</div>);
  }

  function ProposalsList() {
    proposals.map((row) => {
      const { id, title, link } = row;
      return (
        <Card sx={{ minWidth: 275, mb: "20px", padding: "20px" }} key={id}>
          <Stack direction="row" justifyContent="space-between">
            <Stack>
              <Typography variant="h5" color="text.primary" component="div" sx={{ mb: "15px" }}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                {link}
              </Typography>
            </Stack>
            <Stack direction="column" justifyContent="center">
              <Button
                sx={{ width: "150px", mb: "20px" }}
                variant="contained"
                component={Button}
                disabled={!userCanVote}
                onClick={() => { handleVote() }}
              >
                Vote
              </Button>
            </Stack>
          </Stack>
        </Card>
      );
    })
  }

  return (
    <Page title="Proposals | CR-Voting">
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backDropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" gutterBottom>
            Community proposals
          </Typography>
        </Stack>

        <ActivationRequired />

        {proposals.length === 0 ? <NoProposal /> : <ProposalsList />}

      </Container>
    </Page>
  );
}
