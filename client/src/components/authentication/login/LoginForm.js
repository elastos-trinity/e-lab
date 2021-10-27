import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik, Form, FormikProvider } from 'formik';
import { DID, connectivity } from "@elastosfoundation/elastos-connectivity-sdk-js";
import { EssentialsConnector } from "@elastosfoundation/essentials-connector-client-browser";

import { LoadingButton } from '@mui/lab';

export default function LoginForm() {
  const navigate = useNavigate();

  useEffect(() => {
    const ec = new EssentialsConnector();
    ec.name = 'cr-voting';
    connectivity.registerConnector(ec);

    return () => {connectivity.unregisterConnector('cr-voting')};
  }, [])

  const token = localStorage.getItem("token");
  if(token) {
    navigate('/', {replace: true})
  }

  const formik = useFormik({
    initialValues: {

    },
    onSubmit: async () => {
      const didAccess = new DID.DIDAccess();
      let presentation

      try {
        presentation = await didAccess.getCredentials({
          claims: {
            name: true,
            email: true,
          }
        });
      } catch (e) {
        console.log(e)
      }

      if (presentation) {
       const did = presentation.getHolder().getMethodSpecificId();
       fetch('/api/v1/login',
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(presentation.toJSON())
        }).then( response => response.json()).then( data => {
          if(data.code === 200) {
            const token = data.data;
            console.log(token);
            localStorage.setItem("did", did);
            localStorage.setItem("token", token);
            navigate('/dashboard/app', { replace: true });
          } else {
            console.log(data);
          }
       }).catch((error) => {
         console.log(error)
       })
      }
      formik.setSubmitting(false);
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
          Sign In
        </LoadingButton>
      </Form>
    </FormikProvider>
  );
}
