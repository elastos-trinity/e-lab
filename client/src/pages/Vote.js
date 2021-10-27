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


export default function Vote() {
  const [proposal, setProposal] = useState([]);
  const [backDropOpen, setBackDropOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [userCanVote, setUserCanVote] = useState(true);

  useEffect(() => {
    setBackDropOpen(true)
    getProposal();
  }, [])

  const getProposal = () => {
    fetch(`/api/v1/proposal/listCanVote`,
      {
        method: "GET",
        headers: {
          "token": localStorage.getItem('token')
        }
      }).then( response => response.json()).then( data => {
      if(data.code === 200) {
        const proposals = data.data.result;
        setProposal(data.data.result);

        fetch(`/api/v1/proposal/userHaveVoted`,
          {
            method: "GET",
            headers: {
              "token": localStorage.getItem('token')
            }
          }).then( response => response.json()).then( data => {
          if(data.code === 200) {
            console.log(data.data);
            proposals.forEach(item => {
              if(data.data.includes(item.id)) {
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
    if(!selectedValue) {
      alert('Please choose one item to vote');
      return;
    }
    setBackDropOpen(true)
    fetch(`/api/v1/proposal/vote/${selectedValue}`,
      {
        method: "GET",
        headers: {
          "token": localStorage.getItem('token')
        },
      }).then( response => response.json()).then( data => {
      if(data.code === 200) {
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

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" gutterBottom>
            Vote
          </Typography>
        </Stack>

        <Stack direction="row"  alignItems="center" justifyContent="flex-end">
          <Button
            sx={{width: "150px", mb: "20px"}}
            variant="contained"
            component={Button}
            disabled={!userCanVote}
            onClick={() => {handleVote()}}
          >
            Vote
          </Button>
        </Stack>

        {proposal.map((row) => {
          const { id, title, link } = row;
          return (
            <Card sx={{ minWidth: 275, mb: "20px", padding: "20px" }} key={id}>
              <Stack direction="row" justifyContent="space-between">
                <Stack>
                  <Typography variant="h5" color="text.primary" component="div" sx={{mb: "15px"}}>
                    {title}
                  </Typography>
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    {link}
                  </Typography>
                </Stack>
                <Stack direction="column" justifyContent="center">
                  <Radio
                    checked={selectedValue === id}
                    onChange={(event) => {setSelectedValue(event.target.value)}}
                    value={id}
                    name="radio-buttons"
                  />
                </Stack>
              </Stack>
            </Card>
          );
        })}
      </Container>
    </Page>
  );
}
