import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, Button, Table,
  TableRow, TableCell, Typography, Input, TableBody,
  DialogActions
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useContext, useEffect, useState } from 'react';
import { api } from '../../../config';
import ToastContext from '../../../contexts/ToastContext';
import UserContext from '../../../contexts/UserContext';

ConfirmWalletAddDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  walletAddress: PropTypes.string
};

export default function ConfirmWalletAddDialog({ open, onClose, walletAddress }) {
  const [submittingUserStatus, setSubmittingUserStatus] = useState(false);
  const { showToast } = useContext(ToastContext);
  const { user } = useContext(UserContext);

  const onDialogClose = () => {
    onClose(false);
  }

  const confirm = () => {
    onClose(true);
  }

  return (
    <Dialog open={open} onClose={onDialogClose}>
      <DialogTitle>New wallet confirmation</DialogTitle>
      <DialogContent>
        {walletAddress ?
          <div>
            Currently connected with wallet address:<br />
            <b>{walletAddress}</b><br /><br />
            Add this address to your profile?
          </div>
          : ''}

      </DialogContent>
      {<DialogActions>
        <Button onClick={() => { confirm() }}>Confirm</Button>
      </DialogActions>}
    </Dialog>
  )
}
