import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination, Backdrop, CircularProgress
} from '@mui/material';
import Page from '../../../components/base/Page';
import Label from '../../../components/base/Label';
import Scrollbar from '../../../components/base/Scrollbar';
import SearchNotFound from '../../../components/dashboard/SearchNotFound';
import UserListHead from '../../../components/dashboard/UserListHead';
import UserListToolbar from '../../../components/dashboard/UserListToolbar';
import ProposalStatusMenu from '../../../components/dashboard/ProposalStatusMenu';
import { fDateTimeNormal } from '../../../utils/dateUtils';
import { api } from "../../../config";
import { currentlyInVotePeriod, getVotePeriodInfo, msTimestampIsMoreThanOneMonthBeforeVotePeriodStart } from '../../../utils/voteinfo';
import ProposalGrantMenu from '../../../components/dashboard/ProposalGrantMenu';

const TABLE_HEAD = [
  { id: 'title', label: 'Title', alignRight: false },
  { id: 'link', label: 'Link', alignRight: false },
  { id: 'creator', label: 'Creator', alignRight: false },
  { id: 'creationTime', label: 'Creation time', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '', label: 'Operation', alignRight: false },
];


export default function Proposal() {
  const [page, setPage] = useState(0);
  const [filterName, setFilterName] = useState('');
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [backDropOpen, setBackDropOpen] = useState(false);

  useEffect(() => {
    setBackDropOpen(true);
    getProposals();
  }, [page]);

  const getProposals = () => {
    fetch(`${api.url}/api/v1//proposals/all?pageNum=${page + 1}&title=${filterName}`,
      {
        method: "GET",
        headers: {
          "token": localStorage.getItem('token')
        }
      }).then(response => response.json()).then(data => {
        if (data.code === 200) {
          console.log(data.data);
          setUsers(data.data.result);
          setCount(data.data.total);
        } else {
          console.log(data);
        }
      }).catch((error) => {
        console.log(error)
      }).finally(() => {
        setBackDropOpen(false)
      })
  }


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const handleAudit = (result, id) => {
    setBackDropOpen(true)
    fetch(`${api.url}/api/v1//proposal/audit/${id}?result=${result}`,
      {
        method: "GET",
        headers: {
          "token": localStorage.getItem('token')
        }
      }).then(response => response.json()).then(data => {
        if (data.code === 200) {
          getProposals()
        } else {
          console.log(data);
        }
      }).catch((error) => {
        console.log(error)
      }).finally(() => {
        setBackDropOpen(false)
      })
  }

  const handleGrant = (result, id) => {
    setBackDropOpen(true)
    fetch(`${api.url}/api/v1//proposal/grant/${id}?result=${result}`,
      {
        method: "GET",
        headers: {
          "token": localStorage.getItem('token')
        }
      }).then(response => response.json()).then(data => {
        if (data.code === 200) {
          getProposals()
        } else {
          console.log(data);
        }
      }).catch((error) => {
        console.log(error)
      }).finally(() => {
        setBackDropOpen(false)
      })
  }

  const isUserNotFound = users.length === 0;

  return (
    <Page title="Proposal | ELAB">
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backDropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Proposals
          </Typography>
          <Typography gutterBottom>
            {currentlyInVotePeriod() ?
              <div><b>Vote in progress</b> - Vote ends on {getVotePeriodInfo().displayableEndDate}</div> :
              <div>Votes are <b>closed</b> - Next vote: {getVotePeriodInfo().displayableStartDate} - {getVotePeriodInfo().displayableEndDate}</div>
            }
          </Typography>
        </Stack>

        <Card>
          <UserListToolbar
            filterName={filterName}
            onFilterName={handleFilterByName}
          />

          <Scrollbar>
            <TableContainer /* sx={{ minWidth: 800 }} */>
              <Table>
                <UserListHead
                  headLabel={TABLE_HEAD}
                />
                <TableBody>
                  {users.map((row) => {
                    const { id, title, link, description, creator, creationTime, status, grant } = row;
                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        role="checkbox"
                        height="69px"
                      >
                        <TableCell align="left" size="small">
                          <Typography variant="subtitle2" noWrap>
                            {title}
                          </Typography>
                          <Typography style={{ paddingLeft: "10px" }}>
                            <i>{description}</i>
                          </Typography>
                        </TableCell>
                        <TableCell align="left" size="small">{link}</TableCell>
                        <TableCell align="left" size="small">{creator}</TableCell>
                        <TableCell align="left">{fDateTimeNormal(creationTime)}</TableCell>
                        <TableCell align="left" size="small">
                          {/*Admin proposal approval status*/}
                          <Label
                            variant="ghost"
                            color={status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning'}>
                            {status}
                          </Label>

                          {/*Admin proposal grant status*/}
                          <Label
                            variant="ghost"
                            color={grant === 'granted' ? 'success' : grant === 'notgranted' ? 'error' : 'warning'}>
                            {grant}
                          </Label>
                        </TableCell>
                        <TableCell align="center">
                          {status === 'new' ? (<ProposalStatusMenu proposalId={id} handleAction={handleAudit} />) : (<></>)}

                          {
                            status === 'approved' && grant === 'undecided' && msTimestampIsMoreThanOneMonthBeforeVotePeriodStart(creationTime)
                              ?
                              (<ProposalGrantMenu proposalId={id} handleAction={handleGrant} />)
                              :
                              (<></>)
                          }
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                {isUserNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[10]}
            component="div"
            count={count}
            rowsPerPage={10}
            page={page}
            onPageChange={handleChangePage}
          />
        </Card>
      </Container>
    </Page>
  );
}
