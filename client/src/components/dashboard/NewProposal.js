import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button
} from '@mui/material';
import { useContext, useState } from 'react';
import ToastContext from '../../contexts/ToastContext';

NewProposal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  handleAdd: PropTypes.func
};

export default function NewProposal({ open, handleClose, handleAdd }) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const { showToast } = useContext(ToastContext);

  function checkInputAndSubmit() {
    if (!title || !link || !description) {
      showToast("Please fill in everything.", "error");
      return;
    }
    handleAdd(title, link, description);
    setTitle("");
    setLink("");
    setDescription("");
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add Proposal</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please a title, a url to an existing CR proposal from cyberrepublic.org, and a simple description.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="title"
          label="Title"
          type="text"
          fullWidth
          variant="standard"
          value={title}
          onChange={(event => { setTitle(event.target.value) })}
        />
        <TextField
          autoFocus
          margin="dense"
          id="link"
          label="Link"
          type="text"
          fullWidth
          variant="standard"
          value={link}
          onChange={(event => { setLink(event.target.value) })}
        />
        <TextField
          autoFocus
          margin="dense"
          id="description"
          label="Description"
          type="text"
          fullWidth
          multiline
          minRows={3}
          variant="standard"
          value={description}
          onChange={(event => { setDescription(event.target.value) })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { checkInputAndSubmit() }}>Add</Button>
      </DialogActions>
    </Dialog>
  )
}
