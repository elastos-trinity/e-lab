import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  Stack,
  Button,
  Container,
  Typography,
  Backdrop, CircularProgress, CardContent
} from '@mui/material';
import Page from '../../components/Page';
import { NewProposal } from '../../components/_dashboard/proposal';
import { fDateTimeNormal } from '../../utils/formatTime';
import { api } from "../../config";
import ActivationRequired from '../../components/authentication/ActivationRequired';

export default function UserProposal() {
  const [proposal, setProposal] = useState([]);
  const [backDropOpen, setBackDropOpen] = useState(false);
  const [newProposalOpen, setNewProposalOpen] = useState(false);

  useEffect(() => {
    setBackDropOpen(true)
    getProposal();
  }, [])

  const getProposal = () => {
    fetch(`${api.url}/api/v1/proposals/mine?pageNum=1&pageSize=100`,
      {
        method: "GET",
        headers: {
          "token": localStorage.getItem('token')
        }
      }).then(response => response.json()).then(data => {
        if (data.code === 200) {
          console.log(data.data);
          setProposal(data.data.result);
        } else {
          console.log(data);
        }
      }).catch((error) => {
        console.log(error)
      }).finally(() => {
        setBackDropOpen(false)
      })
  }

  const handleClose = () => {
    setNewProposalOpen(false);
  };

  const handleAdd = (title, link) => {
    setNewProposalOpen(false);
    setBackDropOpen(true)
    fetch(`${api.url}/api/v1/proposal/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": localStorage.getItem('token')
        },
        body: JSON.stringify({ title, link })
      }).then(response => response.json()).then(data => {
        if (data.code === 200) {
          getProposal()
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
    <Page title="Proposal | CR-Voting">
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backDropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <NewProposal open={newProposalOpen} handleClose={handleClose} handleAdd={handleAdd} />

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" gutterBottom>
            My Proposals
          </Typography>
        </Stack>

        <ActivationRequired />

        <Stack direction="row" alignItems="center" justifyContent="flex-end">
          <Button
            sx={{ width: "150px", mb: "20px" }}
            variant="contained"
            component={RouterLink}
            to="#"
            startIcon={<Icon icon={plusFill} />}
            onClick={() => setNewProposalOpen(true)}
          >
            New Proposal
          </Button>
        </Stack>

        {proposal.map((row) => {
          const { id, title, link, creationTime, status } = row;
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
                  <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                    <b>Created:</b> {fDateTimeNormal(creationTime)}
                  </Typography>
                </Stack>
                <Stack direction="column" justifyContent="center">
                  <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                    {status}
                  </Typography>
                </Stack>
              </Stack>
            </Card>
          );
        })}
      </Container>
    </Page>
  );
}
