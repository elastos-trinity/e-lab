import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, Button, Table,
  TableRow, TableCell, Typography, Input, TableBody
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useContext, useEffect, useState } from 'react';
import { api } from '../../../config';
import ToastContext from '../../../contexts/ToastContext';
import UserContext from '../../../contexts/UserContext';

EditUserDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  editedUser: PropTypes.object
};

export default function EditUserDialog({ open, onClose, editedUser }) {
  const [telegramUserName, setTelegramUserName] = useState(editedUser ? editedUser.telegramUserName : "");
  const [telegramUID, setTelegramUID] = useState(editedUser ? editedUser.telegramUserId : "");
  const [telegramVerificationCode, setTelegramVerificationCode] = useState(editedUser ? editedUser.telegramVerificationCode : "");
  const [submittingUserStatus, setSubmittingUserStatus] = useState(false);
  const { showToast } = useContext(ToastContext);
  const { user } = useContext(UserContext);

  useEffect(() => {
    setTelegramUserName(editedUser ? editedUser.telegramUserName : "");
    setTelegramUID(editedUser ? editedUser.telegramUserId : "");
    setTelegramVerificationCode(editedUser ? editedUser.telegramVerificationCode : "");
  }, [editedUser]);

  const onDialogClose = () => {
    onClose();
  }

  const saveTelegramUID = () => {
    // Update DB user with the entered telegram UID and get the verification code in return.
    console.log("Saving telegram UID");
    fetch(`${api.url}/api/v1/user/setTelegramUserInfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": localStorage.getItem('token')
      },
      body: JSON.stringify({
        did: editedUser.did,
        telegramUserName,
        telegramUserId: telegramUID
      })
    }).then(response => response.json()).then(data => {
      if (data.code === 200) {
        console.log(data);
        editedUser.telegramUserName = telegramUserName;
        editedUser.telegramUserId = telegramUID;
        editedUser.telegramVerificationCode = data.data;
        setTelegramVerificationCode(editedUser.telegramVerificationCode);

        showToast("User updated", "success");
      } else {
        console.error(data);
        showToast(`Update failed: ${data.message}`, "error");
      }
    }).catch((error) => {
      console.log(error)
    });
  }

  const toggleUserAdminStatus = () => {
    console.log("Changing user type status");

    const newUserType = (editedUser.type === "user" ? "admin" : "user");

    setSubmittingUserStatus(true);
    fetch(`${api.url}/api/v1/user/setUserType`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": localStorage.getItem('token')
      },
      body: JSON.stringify({
        targetDid: editedUser.did,
        type: newUserType
      })
    }).then(response => response.json()).then(data => {
      setSubmittingUserStatus(false);
      if (data.code === 200) {
        console.log(data);
        editedUser.type = newUserType;
        showToast(`User type changed to ${newUserType}`, "success");
      } else {
        console.error(data);
        showToast("Failed to change user type", "error");
      }
    }).catch((error) => {
      console.log(error);
      setSubmittingUserStatus(false);
      showToast("Server error", "error");
    });
  }

  return (
    <Dialog open={open} onClose={onDialogClose}>
      <DialogTitle>User information</DialogTitle>
      <DialogContent>
        {editedUser ?
          <Table>
            <TableBody>
              <TableRow>
                <TableCell align="left" size="small">
                  <Typography variant="subtitle2" noWrap>
                    DID
                  </Typography>
                </TableCell>
                <TableCell align="left" size="small">
                  {editedUser.did}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size="small">
                  <Typography variant="subtitle2" noWrap>
                    Name
                  </Typography>
                </TableCell>
                <TableCell align="left" size="small">
                  {editedUser.name}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size="small">
                  <Typography variant="subtitle2" noWrap>
                    Email
                  </Typography>
                </TableCell>
                <TableCell align="left" size="small">
                  {editedUser.email}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size="small">
                  <Typography variant="subtitle2" noWrap>
                    Telegram
                  </Typography>
                </TableCell>
                <TableCell align="left" size="small">
                  <Input value={telegramUserName} placeholder="Username" onChange={e => setTelegramUserName(e.target.value)} />
                  <br />
                  <Input value={telegramUID} placeholder="User ID (important)" onChange={e => setTelegramUID(e.target.value)} />
                  <br />
                  <Button variant="contained" onClick={() => { saveTelegramUID() }}>Save and create code</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size="small">
                  <Typography variant="subtitle2" noWrap>
                    TG Code
                  </Typography>
                </TableCell>
                <TableCell align="left" size="small">
                  <b>{telegramVerificationCode}</b> (give this code to the user)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size="small">
                  <Typography variant="subtitle2" noWrap>
                    Type
                  </Typography>
                </TableCell>
                <TableCell align="left" size="small">
                  {editedUser.type}
                  {user.canManageAdmins ?
                    (<LoadingButton
                      size="small"
                      type="submit"
                      variant="contained"
                      color="warning"
                      sx={{ marginLeft: "10px" }}
                      loading={submittingUserStatus}
                      onClick={() => { toggleUserAdminStatus() }}
                    >
                      {editedUser.type === "user" ? "Make admin" : "Make regular user"}
                    </LoadingButton>) : ''}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          : ''}

        {/* <DialogContentText>
          Please input your telegram confirmation code. If you don't have such code yet,
          join <a href="https://t.me/elastosgroup" target="_blank" rel="noreferrer">the Elastos community telegram group</a> and request a confirmation code to an admin.
        </DialogContentText> */}
        {/* <TextField
          autoFocus
          margin="dense"
          id="code"
          label="Code"
          type="number"
          fullWidth
          variant="standard"
          value={code}
          onChange={(event => { setCode(event.target.value) })}  /> */}
      </DialogContent>
      {/* <DialogActions>
        <Button onClick={() => { updateUser() }}>Update</Button>
      </DialogActions> */}
    </Dialog>
  )
}
