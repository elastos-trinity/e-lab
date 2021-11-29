import { Icon } from '@iconify/react';
import { useContext, useEffect, useState } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  Stack,
  Button,
  Container,
  Typography,
  Backdrop, CircularProgress
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import Page from '../../components/base/Page';
import NewProposal from '../../components/dashboard/NewProposal';
import { fDateTimeNormal, msTimestampIsMoreThanOneMonthAgo } from '../../utils/dateUtils';
import { api } from "../../config";
import ActivationRequired from '../../components/authentication/ActivationRequired';
import UserContext from '../../contexts/UserContext';
import ToastContext from '../../contexts/ToastContext';
import { getVotePeriodInfo } from '../../utils/voteinfo';
import Label from '../../components/base/Label';

export default function UserProposal() {
  const { user } = useContext(UserContext);
  const { showToast } = useContext(ToastContext);
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

  const handleAdd = (title, link, description) => {
    setNewProposalOpen(false);
    setBackDropOpen(true)
    fetch(`${api.url}/api/v1/proposal/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": localStorage.getItem('token')
        },
        body: JSON.stringify({ title, link, description })
      }).then(response => response.json()).then(data => {
        if (data.code === 200) {
          getProposal();
          showToast("Proposal was created", "success");
        } else {
          console.log(data);
          showToast(`Failed to created the proposal was created: ${data.message}`, "error");
        }
      }).catch((error) => {
        console.log(error)
      }).finally(() => {
        setBackDropOpen(false)
      })
  }

  const getDisplayableStatus = (status) => {
    // TODO: approved -> show "active" or "finished" or "not started" depending on the vote period
    switch (status) {
      case "approved": return "Approved";
      case "rejected": return "Rejected";
      case "new": return "Awaiting validation";
      default: return status;
    }
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
            sx={{ width: "150px", mb: "20px", mt: "10px" }}
            variant="contained"
            component={RouterLink}
            to="#"
            disabled={!user.active}
            startIcon={<Icon icon={plusFill} />}
            onClick={() => setNewProposalOpen(true)}
          >
            New Proposal
          </Button>
        </Stack>

        {proposal.map((row) => {
          const { id, title, link, description, creationTime, status, grant } = row;
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
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    <i>{description}</i>
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                    <b>Created on:</b> {fDateTimeNormal(creationTime)}
                  </Typography>
                </Stack>
                <Stack direction="column" justifyContent="center">
                  <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                    {getDisplayableStatus(status)}

                    {status === 'approved' && !msTimestampIsMoreThanOneMonthAgo(creationTime) ?
                      <div>Vote starts on {getVotePeriodInfo().displayableStartDate}</div>
                      :
                      <div>
                        Vote ended
                        <Stack direction="row" justifyContent="center" textAlign="center">
                          <Icon component={ThumbUpIcon} sx={{ marginRight: "5px" }} /> {proposal.votesFor}
                        </Stack>
                        <Stack direction="row" justifyContent="center" textAlign="center">
                          <Icon component={ThumbDownIcon} sx={{ marginRight: "5px" }} />{proposal.votesAgainst}
                        </Stack>
                        {/*Admin proposal grant status*/}
                        <Label
                          variant="ghost"
                          color={grant === 'granted' ? 'success' : grant === 'notgranted' ? 'error' : 'warning'}>
                          {grant}
                        </Label>
                      </div>
                    }
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
