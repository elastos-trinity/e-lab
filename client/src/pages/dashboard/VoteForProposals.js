import { useContext, useEffect, useState } from 'react';
import {
  Card,
  Stack,
  Button,
  Container,
  Paper,
  Grid,
  Icon,
  Link,
  Typography,
  Backdrop, CircularProgress, TableBody, TableRow, TableCell, Table
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import Page from '../../components/base/Page';
import { api } from "../../config";
import ActivationRequired from "../../components/authentication/ActivationRequired";
import ToastContext from '../../contexts/ToastContext';
import { fDateTime } from '../../utils/formatTime';
import UserContext from '../../contexts/UserContext';

export default function VoteForProposals() {
  const [proposals, setProposals] = useState([]);
  const [backDropOpen, setBackDropOpen] = useState(false);
  const { showToast } = useContext(ToastContext);
  const { user } = useContext(UserContext);

  useEffect(() => {
    setBackDropOpen(true)
    fetchProposals();
  }, [])

  const fetchProposals = () => {
    fetch(`${api.url}/api/v1/proposals/active`,
      {
        method: "GET",
        headers: {
          "token": localStorage.getItem('token')
        }
      }).then(response => response.json()).then(data => {
        if (data.code === 200) {
          const activeProposals = data.data.result;
          console.log("Received active proposals list:", activeProposals);
          setProposals(activeProposals);
        } else {
          console.log(data);
        }
      }).catch((error) => {
        console.log(error)
      }).finally(() => {
        setBackDropOpen(false)
      })
  }

  const handleVote = (proposalId, choice) => {
    setBackDropOpen(true)
    fetch(`${api.url}/api/v1/proposal/${proposalId}/vote?vote=${choice}`,
      {
        method: "POST",
        headers: {
          "token": localStorage.getItem('token')
        },
      }).then(response => response.json()).then(data => {
        if (data.code === 200) {
          // Vote success
          showToast("Your vote was recorded, thanks!", "success");
          fetchProposals();
        } else {
          console.log(data);
          showToast("Failed to vote. Already voted?", "error");
        }
      }).catch((error) => {
        console.log(error)
      }).finally(() => {
        setBackDropOpen(false)
      })
  }

  function NoProposal() {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
              <Paper>
                <Typography gutterBottom align="center" variant="subtitle1">
                  There is currently no proposal to vote for.
                </Typography>
              </Paper>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  function ProposalsList() {
    return proposals.map((proposal) => {
      const { id, title, link, description, creator, votedByUser, creationTime } = proposal;
      return (
        <Card sx={{ minWidth: 275, mb: "20px", mt: "10px", padding: "20px" }} key={id}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} alignSelf="center" >
              <Stack>
                <Typography variant="h5" color="text.primary" component="div" sx={{ mb: "15px" }}>
                  {title}
                </Typography>
                <Typography color="text.primary" component="div" sx={{ mb: "15px" }}>
                  {description}
                </Typography>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                  <Link href={link} underlined="none" target="_blank" rel="noreferrer">{link}</Link>
                </Typography>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                  <b>Submitted by:</b> {creator}
                </Typography>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                  <b>Created on:</b> {fDateTime(creationTime)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6} alignSelf="center" justifyItems="flex-end" >
              <Stack direction="row" justifyContent="flex-end">
                <Stack direction="column" justifyContent="center" textAlign="center">
                  <Button
                    sx={{ mb: "20px", margin: "10px" }}
                    variant="contained"
                    component={Button}
                    disabled={votedByUser || !user.active}
                    onClick={() => { handleVote(id, 'for') }}
                  >
                    It's a yes!
                  </Button>
                  <Stack direction="row" justifyContent="center" textAlign="center">
                    <Icon component={ThumbUpIcon} sx={{ marginRight: "5px" }} /> {proposal.votesFor}
                  </Stack>
                </Stack>
                <Stack direction="column" justifyContent="center" textAlign="center">
                  <Button
                    sx={{ mb: "20px", margin: "10px" }}
                    variant="contained"
                    color="warning"
                    component={Button}
                    disabled={votedByUser || !user.active}
                    onClick={() => { handleVote(id, 'against') }}
                  >
                    Sorry, no...
                  </Button>
                  <Stack direction="row" justifyContent="center" textAlign="center">
                    <Icon component={ThumbDownIcon} sx={{ marginRight: "5px" }} />{proposal.votesAgainst}
                  </Stack>
                </Stack>
              </Stack>
            </Grid>
          </Grid>

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

        {!proposals || proposals.length === 0 ? <NoProposal /> : <ProposalsList />}

      </Container>
    </Page>
  );
}
