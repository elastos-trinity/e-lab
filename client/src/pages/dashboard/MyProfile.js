import { Icon } from '@iconify/react';
import { useContext, useEffect, useState } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
import Web3 from "web3";
import {
  Card,
  Stack,
  Button,
  Container,
  Typography,
  Table, TableRow, TableBody, TableCell,
  Backdrop, CircularProgress
} from '@mui/material';
import Page from '../../components/base/Page';
import NewProposal from '../../components/dashboard/NewProposal';
import { fDateTimeNormal } from '../../utils/formatTime';
import { api } from "../../config";
import ActivationRequired from '../../components/authentication/ActivationRequired';
import UserContext from '../../contexts/UserContext';
import ToastContext from '../../contexts/ToastContext';
import { essentialsConnector } from '../../utils/connectivity';
import ConfirmWalletAddDialog from './dialogs/ConfirmWalletAddDialog';
import { connectivity } from '@elastosfoundation/elastos-connectivity-sdk-js';

export default function MyProfile() {
  const [confirmNewWalletAddress, setConfirmNewWalletAddress] = useState(null);
  const { user, setUser } = useContext(UserContext);
  const { showToast } = useContext(ToastContext);
  const [backDropOpen, setBackDropOpen] = useState(false);


  console.log(user);
  useEffect(() => {
    //setBackDropOpen(true)
    //getProposal();
  }, []);

  const bindNewWallet = async () => {
    // Call eth_getAccounts through connectivity sdk web3 provider
    let provider = connectivity.getActiveConnector().getWeb3Provider();
    const web3 = new Web3(provider);

    console.log("Getting wallet accounts");
    let accounts = await web3.eth.getAccounts();
    console.log("Wallet accounts:", accounts);

    if (accounts.length > 0) {
      let accountToAdd = accounts[0];
      if (user.wallets && user.wallets.indexOf(accountToAdd) >= 0) {
        // Already exists
        showToast("The active wallet is already in your list. Please select another wallet account in your wallet app if you want to add more addresses.", "success");
      }
      else {
        // Ask user to confirm
        console.log("Account to add:", accountToAdd)
        setConfirmNewWalletAddress(accountToAdd);
      }
    }
  }

  const onConfirmWalletAddDialogClosed = (confirmed) => {
    if (confirmed) {
      setBackDropOpen(true)
      console.log("AAA", confirmNewWalletAddress)
      fetch(`${api.url}/api/v1/user/wallet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "token": localStorage.getItem('token')
          },
          body: JSON.stringify({ walletAddress: confirmNewWalletAddress })
        }).then(response => response.json()).then(data => {
          if (data.code === 200) {
            showToast("Wallet successfully bound to your profile!", "success");

            user.wallets = user.wallets || [];
            user.wallets.push(confirmNewWalletAddress);
            setUser(user);

          } else {
            console.log(data);
            showToast(`Failed to bind the wallet with error: ${data.message}`, "error");
          }
        }).catch((error) => {
          console.log(error)
        }).finally(() => {
          setBackDropOpen(false)
        })
    }

    setConfirmNewWalletAddress(null);
  }

  return (
    <Page title="My profile | CR-Voting">
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backDropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" gutterBottom>
            My Profile
          </Typography>
        </Stack>

        <ActivationRequired />

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
                  Type
                </Typography>
              </TableCell>
              <TableCell align="left" size="small">
                {user.type}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small">
                <Typography variant="subtitle2" noWrap>
                  Wallets
                </Typography>
              </TableCell>
              <TableCell align="left" size="small">
                <Stack direction="column" alignItems="left" justifyContent="space-between" mb={2}>
                  <Typography variant="p" gutterBottom>
                    Bind one or more wallet address here to open more interesting features!
                  </Typography>
                  <Typography variant="p" gutterBottom>
                    <b>Wallets already bound:</b>
                  </Typography>

                  {user.wallets ?
                    user.wallets.map(wallet => {
                      return <div>{wallet}</div>
                    })
                    : <div>None</div>}

                  <Button
                    sx={{ width: "150px", mt: "10px" }}
                    variant="contained"
                    component={RouterLink}
                    to="#"
                    disabled={!user.active}
                    startIcon={<Icon icon={plusFill} />}
                    onClick={() => bindNewWallet()}
                  >
                    Bind a wallet
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

      </Container>

      <ConfirmWalletAddDialog open={confirmNewWalletAddress !== null} onClose={(confirmed) => onConfirmWalletAddDialogClosed(confirmed)} walletAddress={confirmNewWalletAddress} />
    </Page>
  );
}
