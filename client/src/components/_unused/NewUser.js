import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button
} from '@mui/material';
import { useState } from 'react';

NewUser.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  handleAdd: PropTypes.func
};

export default function NewUser({open, handleClose, handleAdd}) {
  const [tgName, setTgName] = useState("");
  const [did, setDid] = useState("");

  function checkInputAndSubmit() {
    if(!tgName || !did) {
      return;
    }
    handleAdd(tgName, did);
    setDid("");
    setTgName("");
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add User</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please input user's Telegram id and DID to create a user.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="tgName"
          label="Telegram"
          type="text"
          fullWidth
          variant="standard"
          value={tgName}
          onChange={(event => {setTgName(event.target.value)})}
        />
        <TextField
          autoFocus
          margin="dense"
          id="did"
          label="DID"
          type="text"
          fullWidth
          variant="standard"
          value={did}
          onChange={(event => {setDid(event.target.value)})}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {checkInputAndSubmit()}}>Add</Button>
      </DialogActions>
    </Dialog>
  )
}
