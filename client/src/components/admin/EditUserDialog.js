import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, Table,
  TableRow, TableCell, Typography, Input, TableBody
} from '@mui/material';
import { forceUpdate, useEffect, useState } from 'react';
import { api } from '../../config';

EditUserDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  user: PropTypes.object
};

export default function EditUserDialog({ open, onClose, user }) {
  const [telegramUID, setTelegramUID] = useState(user ? user.telegramUserId : "");
  const [telegramVerificationCode, setTelegramVerificationCode] = useState(user ? user.telegramVerificationCode : "");

  useEffect(() => {
    setTelegramUID(user ? user.telegramUserId : "");
    setTelegramVerificationCode(user ? user.telegramVerificationCode : "");
  }, [user]);

  const onDialogClose = () => {
    onClose();
  }

  const saveTelegramUID = () => {
    // Update DB user with the entered telegram UID and get the verification code in return.
    console.log("Saving telegram UID");
    fetch(`${api.url}/api/v1/user/setTelegramUserId`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": localStorage.getItem('token')
      },
      body: JSON.stringify({
        did: user.did,
        telegramUserId: telegramUID
      })
    }).then(response => response.json()).then(data => {
      if (data.code === 200) {
        console.log(data);
        user.telegramUserId = telegramUID;
        user.telegramVerificationCode = data.data;
        setTelegramVerificationCode(user.telegramVerificationCode);
      } else {
        console.error(data);
      }
    }).catch((error) => {
      console.log(error)
    });
  }

  return (
    <Dialog open={open} onClose={onDialogClose}>
      <DialogTitle>User information</DialogTitle>
      <DialogContent>
        {user ?
          <Table>
            <TableBody>
              <TableRow>
                <TableCell align="left" size="small">
                  <Typography variant="subtitle2" noWrap>
                    DID
                  </Typography>
                </TableCell>
                <TableCell align="left" size="small">
                  {user.did}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size="small">
                  <Typography variant="subtitle2" noWrap>
                    Name
                  </Typography>
                </TableCell>
                <TableCell align="left" size="small">
                  {user.name}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size="small">
                  <Typography variant="subtitle2" noWrap>
                    Email
                  </Typography>
                </TableCell>
                <TableCell align="left" size="small">
                  {user.email}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size="small">
                  <Typography variant="subtitle2" noWrap>
                    TG user ID
                  </Typography>
                </TableCell>
                <TableCell align="left" size="small">
                  <Input value={telegramUID} onChange={e => setTelegramUID(e.target.value)} />
                  <Button onClick={() => { saveTelegramUID() }}>Save and create code</Button>
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
