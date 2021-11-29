import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination, Backdrop, CircularProgress, Link
} from '@mui/material';
import Page from '../../../components/base/Page';
import Label from '../../../components/base/Label';
import Scrollbar from '../../../components/base/Scrollbar';
import SearchNotFound from '../../../components/dashboard/SearchNotFound';
import UserListHead from '../../../components/dashboard/UserListHead';
import UserListToolbar from '../../../components/dashboard/UserListToolbar';
import { api } from "../../../config";
import EditUserDialog from '../../../components/dashboard/admin/EditUserDialog';

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'email', label: 'Email', alignRight: false },
  { id: 'did', label: 'DID', alignRight: false },
  /* { id: 'telegram', label: 'Telegram', alignRight: false },
  { id: 'telegramVerificationCode', label: 'Telegram code', alignRight: false }, */
  { id: 'active', label: 'KYC', alignRight: false },
];

export default function Users() {
  const [page, setPage] = useState(0);
  const [filterName, setFilterName] = useState('');
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [backDropOpen, setBackDropOpen] = useState(false);
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [editedUser, setEditedUser] = useState(null);

  const getAllUsers = () => {
    console.log("Fetching users");
    fetch(`${api.url}/api/v1/users/list?pageNum=${page + 1}&search=${filterName}`,
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
      })
  }

  const handleClose = () => {
    setNewUserOpen(false);
  };

  const handleAdd = (tgName, did) => {
    setNewUserOpen(false);
    setBackDropOpen(true);
    fetch(`${api.url}/api/v1/user/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": localStorage.getItem('token')
        },
        body: JSON.stringify({ tgName, did })
      }).then(response => response.json()).then(data => {
        if (data.code === 200) {
          getAllUsers()
        } else {
          console.log(data);
        }
      }).catch((error) => {
        console.log(error)
      }).finally(() => {
        setBackDropOpen(false);
      })
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleFilterByName = (event) => {
    console.log("USER FILTER")
    setFilterName(event.target.value);
  };

  const handleUserClicked = (event, user) => {
    setEditedUser(user);
  };

  const onEditUserDialogClosed = () => {
    setEditedUser(null);
  };

  const isUserNotFound = users.length === 0;

  useEffect(() => {
    getAllUsers();
  }, [page, filterName])

  return (
    <Page title="User | ELAB">
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backDropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/*  <NewUser open={newUserOpen} handleClose={handleClose} handleAdd={handleAdd} /> */}

      <Container>
        {/* <Typography variant="h4" gutterBottom>
          Telegram activation how to
        </Typography>
        <div style={{ padding: "20px" }}>
          <div style={{ marginBottom: "10px" }}>
            <i>The very first time, message this bot on telegram: <Link href="https://t.me/userinfobot" target="_blank">@userinfobot</Link></i>
          </div>
          <div>
            1. Wait for users to send you a direct message on telegram.
          </div>
          <div>
            2. Forward user's message to @userinfobot. The bot will give you the user ID.
          </div>
          <div>
            3. Save user's telegram name and telegram UID, a telegram code will be generated.
          </div>
          <div>
            4. Provide the telegram code to the user. He will have to enter this code to confirm his account.
          </div>
        </div> */}

        <Typography variant="h4" gutterBottom>
          Users
        </Typography>

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
                  {users.map((user) => {
                    const { name, email, telegramUserName, telegramUserId, telegramVerificationCode, did, active } = user;
                    return (
                      <TableRow
                        hover
                        key={did}
                        onClick={event => handleUserClicked(event, user)}
                        tabIndex={-1}
                        role="checkbox">
                        <TableCell align="left" size="small">
                          <Typography variant="subtitle2" noWrap>
                            {name}
                          </Typography>
                        </TableCell>
                        <TableCell align="left" size="small">{email}</TableCell>
                        <TableCell align="left">{did}</TableCell>
                        {/* <TableCell align="left" size="small">{telegramUserName} / {telegramUserId}</TableCell>
                        <TableCell align="left" size="small">{telegramVerificationCode}</TableCell> */}
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
              <EditUserDialog open={editedUser !== null} editedUser={editedUser} onClose={() => onEditUserDialogClosed()} />
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
