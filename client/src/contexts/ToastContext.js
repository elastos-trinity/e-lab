import { createContext } from 'react';

const ToastContext = createContext({
  // eslint-disable-next-line no-unused-vars
  showToast: (message, severity) => { }
});

export default ToastContext;
