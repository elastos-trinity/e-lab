import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

import Router from './routes';
import ThemeConfig from './theme';
import GlobalStyles from './theme/globalStyles';
import ScrollToTop from './components/base/ScrollToTop';
import UserContext from './contexts/UserContext';
import ToastContext from './contexts/ToastContext';
import { api } from "./config";
import ConnectivityContext from './contexts/ConnectivityContext';

export default function App() {
  const [user, setUser] = useState(null);
  const [isToastShowing, setToastShowing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("");
  const [isLinkedToEssentials, setIsLinkedToEssentials] = useState(false);

  console.log("Entering App component");

  const signOut = () => {
    console.log("Signing out user. Deleting session info, auth token", user);
    localStorage.removeItem("token");
    localStorage.removeItem("did");
    setUser(null);
  }

  const showToast = (message, severity) => {
    setToastMessage(message);
    setToastSeverity(severity);

    setToastShowing(true);
    setTimeout(() => setToastShowing(false), 5000);
  }

  useEffect(() => {
    console.log("APP effect auth")

    const authToken = localStorage.getItem('token');
    if (authToken) {
      fetch(`${api.url}/api/v1/currentUser`,
        {
          method: "GET",
          headers: {
            "token": localStorage.getItem('token')
          },
        }).then(response => response.json()).then(data => {
          if (data.code === 200) {
            const user = data.data;
            console.log("Existing user retrieved:", user);
            setUser(user);
          } else {
            console.log("No active user", data);
          }
        }).catch((error) => {
          console.log(error)
        })
    }
  }, [])

  return (
    <ConnectivityContext.Provider value={{ isLinkedToEssentials, setIsLinkedToEssentials }}>
      <UserContext.Provider value={{ user, setUser, signOut }}>
        <ToastContext.Provider value={{ showToast }}>
          <ThemeConfig>
            <ScrollToTop />
            <GlobalStyles />
            <Router />
          </ThemeConfig>
          <Snackbar
            open={isToastShowing}
            autoHideDuration={6000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert severity={toastSeverity} sx={{ width: '100%' }}>
              {toastMessage}
            </Alert>
          </Snackbar>
        </ToastContext.Provider>
      </UserContext.Provider>
    </ConnectivityContext.Provider>
  );
}
