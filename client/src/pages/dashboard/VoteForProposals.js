import { useContext, useEffect, useState } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Card,
  Stack,
  Button,
  Container,
  Paper,
  Icon,
  Link,
  Typography,
  Backdrop, CircularProgress, CardContent, Radio, TableBody, TableRow, TableCell, Table
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import Page from '../../components/Page';
import UserContext from '../../contexts/UserContext';
import { fDateTimeNormal } from '../../utils/formatTime';
import { api } from "../../config";
import ActivationRequired from "../../components/authentication/ActivationRequired";
import ToastContext from '../../contexts/ToastContext';

export default function VoteForProposals() {
  const [proposals, setProposals] = useState([]);
  const [backDropOpen, setBackDropOpen] = useState(false);
  const [userCanVote, setUserCanVote] = useState(true);
  const { showToast } = useContext(ToastContext);

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

          /* fetch(`${api.url}/api/v1/proposal/userHaveVoted`,
            {
              method: "GET",
              headers: {
                "token": localStorage.getItem('token')
              }
            }).then(response => response.json()).then(data => {
              if (data.code === 200) {
                console.log(data.data);
                activeProposals.forEach(item => {
                  if (data.data.includes(item.id)) {
                    setUserCanVote(false)
                  }
                })
              } else {
                console.log(data);
              }
            }).catch((error) => {
              console.log(error)
            }) */
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
      const { id, title, link, creator, votedByUser } = proposal;
      return (
        <Card sx={{ minWidth: 275, mb: "20px", padding: "20px" }} key={id}>
          <Stack direction="row" justifyContent="space-between">
            <Stack>
              <Typography variant="h5" color="text.primary" component="div" sx={{ mb: "15px" }}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                <Link href={link} underlined="none" target="_blank" rel="noreferrer">{link}</Link>
              </Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                <b>Submitted by:</b> {creator}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="column" justifyContent="center" textAlign="center">
                <Button
                  sx={{ mb: "20px", margin: "10px" }}
                  variant="contained"
                  component={Button}
                  disabled={votedByUser}
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
                  disabled={votedByUser}
                  onClick={() => { handleVote(id, 'against') }}
                >
                  Sorry, no...
                </Button>
                <Stack direction="row" justifyContent="center" textAlign="center">
                  <Icon component={ThumbDownIcon} sx={{ marginRight: "5px" }} />{proposal.votesAgainst}
                </Stack>
              </Stack>
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

        {!proposals || proposals.length === 0 ? <NoProposal /> : <ProposalsList />}

      </Container>
    </Page>
  );
}
