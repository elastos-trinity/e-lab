import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, Snackbar, Alert
} from '@mui/material';
import { useContext, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { api } from '../../config';
import ToastContext from '../../contexts/ToastContext';
import UserContext from '../../contexts/UserContext';

TelegramActivation.propTypes = {
  open: PropTypes.bool,
  handleActivation: PropTypes.func,
  onClose: PropTypes.func
};

export default function TelegramActivation({ open, handleActivation, onClose }) {
  const [code, setCode] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const { showToast } = useContext(ToastContext);
  const { user, setUser } = useContext(UserContext);

  function checkInputAndSubmit() {
    if (!code) {
      return;
    }

    setSubmitting(true);
    fetch(`${api.url}/api/v1/user/setTelegramVerificationCode?code=${code}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": localStorage.getItem('token')
      }
    }).then(response => response.json()).then(data => {
      setSubmitting(false);

      if (data.code === 200) {
        console.log(data);

        // Update local user with new active status
        user.active = true;
        setUser(user);

        showToast("Account successfully activated!", "success");
        onClose()
      } else {
        console.error(data);
        showToast("Wrong activation code", "error");
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
        {/* <Button onClick={() => { checkInputAndSubmit() }}>Activate</Button> */}
        <LoadingButton
          size="small"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          onClick={() => { checkInputAndSubmit() }}
        >
          Activate
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
