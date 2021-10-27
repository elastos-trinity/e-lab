import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  Table,
  Stack,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination, Backdrop, CircularProgress
} from '@mui/material';
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar, NewUser } from '../components/_dashboard/user';

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'email', label: 'Email', alignRight: false },
  { id: 'tgName', label: 'Telegram', alignRight: false },
  { id: 'did', label: 'DID', alignRight: false },
  { id: 'code', label: 'Code', alignRight: false },
  { id: 'active', label: 'Active', alignRight: false },
];


export default function User() {
  const [page, setPage] = useState(0);
  const [filterName, setFilterName] = useState('');
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [backDropOpen, setBackDropOpen] = useState(false);
  const [newUserOpen, setNewUserOpen] = useState(false);

  useEffect(() => {
    setBackDropOpen(true)
    getAllUsers()
  }, [page])

  const getAllUsers = () => {
    fetch(`/api/v1/user/list?pageNum=${page+1}&key=${filterName}`,
      {
        method: "GET",
        headers: {
          "token": localStorage.getItem('token')
        }
      }).then( response => response.json()).then( data => {
      if(data.code === 200) {
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

  const handleClose = () => {
    setNewUserOpen(false);
  };

  const handleAdd = (tgName, did) => {
    setNewUserOpen(false);
    setBackDropOpen(true)
    fetch(`/api/v1/user/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": localStorage.getItem('token')
        },
        body: JSON.stringify({tgName, did})
      }).then( response => response.json()).then( data => {
      if(data.code === 200) {
        getAllUsers()
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

  const isUserNotFound = users.length === 0;

  return (
    <Page title="User | CR-Voting">
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backDropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <NewUser open={newUserOpen} handleClose={handleClose} handleAdd={handleAdd} />

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Users
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="#"
            startIcon={<Icon icon={plusFill} />}
            onClick={() => setNewUserOpen(true)}
          >
            New User
          </Button>
        </Stack>

        <Card>
          <UserListToolbar
            filterName={filterName}
            onFilterName={handleFilterByName}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  headLabel={TABLE_HEAD}
                />
                <TableBody>
                  {users.map((row) => {
                      const { id, name, email, tgName, did, code, active } = row;
                      return (
                        <TableRow
                          hover
                          key={id}
                          tabIndex={-1}
                          role="checkbox"
                        >
                          <TableCell align="left" size="small">
                            <Typography variant="subtitle2" noWrap>
                              {name}
                            </Typography>
                          </TableCell>
                          <TableCell align="left" size="small">{email}</TableCell>
                          <TableCell align="left" size="small">{tgName}</TableCell>
                          <TableCell align="left">{did}</TableCell>
                          <TableCell align="left" size="small">{code}</TableCell>
                          <TableCell align="left" size="small">
                            <Label
                              variant="ghost"
                              color={(!active && 'error') || 'success'}
                            >
                              {active ? "true" : "false"}
                            </Label>
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
