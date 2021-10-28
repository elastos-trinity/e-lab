import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik, Form, FormikProvider } from 'formik';
import jwtDecode from 'jwt-decode';
import { DID, connectivity, } from "@elastosfoundation/elastos-connectivity-sdk-js";
import { LoadingButton } from '@mui/lab';
import { api } from "../../../config";
import { essentialsConnector } from "../../../utils/connectivity";
import UserContext from "../../../UserContext";

export default function LoginForm(props) {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const formik = useFormik({
    initialValues: {

    },
    onSubmit: async () => {
      if (props.action === "signin") {
        const didAccess = new DID.DIDAccess();
        let presentation;

        console.log("Trying to sign in using the connectivity SDK");
        try {
          presentation = await didAccess.getCredentials({
            claims: {
              name: false
            }
          });
        } catch (e) {
          // Possible exception while using wallet connect (i.e. not an identity wallet)
          // Kill the wallet connect session
          console.warn("Error while getting credentials", e);

          try {
            await essentialsConnector.getWalletConnectProvider().disconnect();
          }
          catch (e) {
            console.error("Error while trying to disconnect wallet connect session", e);
          }

          return;
        }

        if (presentation) {
          const did = presentation.getHolder().getMethodSpecificId();
          fetch(`${api.url}/api/v1/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(presentation.toJSON())
            }).then(response => response.json()).then(data => {
              if (data.code === 200) {
                const token = data.data;
                console.log(token);
                localStorage.setItem("did", did);
                localStorage.setItem("token", token);

                const user = jwtDecode(token);

                console.log("Sign in: setting user to:", user);

                setUser(user);

                navigate('/dashboard/home');
              } else {
                console.log(data);
              }
            }).catch((error) => {
              console.log(error)
            })
        }
        formik.setSubmitting(false);
      }
      else {
        navigate('/dashboard/home');
      }
    }
  });

  const { isSubmitting, handleSubmit } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          {props.title}
        </LoadingButton>
      </Form>
    </FormikProvider>
  );
}
