import { useEffect, useState } from 'react';
import jwtDecode from "jwt-decode";
import { useNavigate } from 'react-router-dom';

import Router from './routes';
import ThemeConfig from './theme';
import GlobalStyles from './theme/globalStyles';
import ScrollToTop from './components/ScrollToTop';
import { BaseOptionChartStyle } from './components/charts/BaseOptionChart';
import { prepareConnectivitySDK } from './utils/connectivity';
import UserContext from './UserContext';
import { api } from "./config";

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  console.log("Entering App component")

  prepareConnectivitySDK();

  function updateUser(user) {
    setUser(user);
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

    /* if (!authToken)
      navigate('/login', { replace: true });
    else {
      const decodedUser = jwtDecode(authToken);
      setUser(decodedUser);
      navigate('/dashboard/home', { replace: true });
    } */

    // TODO: Not good - user data should be extracted from the existing auth JWT token
    /* fetch(`${api.url}/api/v1/currentUser`,
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
          console.log("No active user, redirecting to login page", data);
          navigate('/login', { replace: true })
        }
      }).catch((error) => {
        console.log(error)
      }) */
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser: updateUser }}>
      <ThemeConfig>
        <ScrollToTop />
        <GlobalStyles />
        <BaseOptionChartStyle />
        <Router />
      </ThemeConfig>
    </UserContext.Provider>
  );
}
