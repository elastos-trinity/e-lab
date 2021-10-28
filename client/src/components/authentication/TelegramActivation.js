import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button
} from '@mui/material';
import { useState } from 'react';
import { api } from '../../config';

TelegramActivation.propTypes = {
  open: PropTypes.bool,
  handleActivation: PropTypes.func,
  onClose: PropTypes.func
};

export default function TelegramActivation({ open, handleActivation, onClose }) {
  const [code, setCode] = useState("");

  function checkInputAndSubmit() {
    if (!code) {
      return;
    }

    fetch(`${api.url}/api/v1/user/setTelegramVerificationCode?code=${code}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": localStorage.getItem('token')
      }
    }).then(response => response.json()).then(data => {
      if (data.code === 200) {
        console.log(data);
        // TOOD
      } else {
        console.error(data);
      }
    }).catch((error) => {
      console.log(error)
    })

    // handleActivation(code);
  }

  return (
    <Dialog open={open} onClose={() => onClose()}>
      <DialogTitle>Activate your account</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please input your telegram confirmation code. If you don't have such code yet,
          join <a href="https://t.me/elastosgroup" target="_blank" rel="noreferrer">the Elastos community telegram group</a> and request a confirmation code to an admin.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="code"
          label="Code"
          type="number"
          fullWidth
          variant="standard"
          value={code}
          onChange={(event => { setCode(event.target.value) })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { checkInputAndSubmit() }}>Activate</Button>
      </DialogActions>
    </Dialog>
  )
}
