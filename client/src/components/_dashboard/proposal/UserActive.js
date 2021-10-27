import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button
} from '@mui/material';
import { useState } from 'react';

UserActive.propTypes = {
  open: PropTypes.bool,
  handleActive: PropTypes.func
};

export default function UserActive({open, handleActive}) {
  const [code, setCode] = useState("");

  function checkInputAndSubmit() {
    if(!code) {
      return;
    }
    handleActive(code);
  }

  return (
    <Dialog open={open}>
      <DialogTitle>Activate</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please input numerical activate code.
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
          onChange={(event => {setCode(event.target.value)})}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {checkInputAndSubmit()}}>Active</Button>
      </DialogActions>
    </Dialog>
  )
}
