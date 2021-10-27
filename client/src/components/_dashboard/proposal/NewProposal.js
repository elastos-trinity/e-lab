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
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  function checkInputAndSubmit() {
    if(!title || !link) {
      return;
    }
    handleAdd(title, link);
    setTitle("");
    setLink("");
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add Proposal</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please input title and CR proposal link.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="title"
          label="title"
          type="text"
          fullWidth
          variant="standard"
          value={title}
          onChange={(event => {setTitle(event.target.value)})}
        />
        <TextField
          autoFocus
          margin="dense"
          id="link"
          label="link"
          type="text"
          fullWidth
          variant="standard"
          value={link}
          onChange={(event => {setLink(event.target.value)})}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {checkInputAndSubmit()}}>Add</Button>
      </DialogActions>
    </Dialog>
  )
}
