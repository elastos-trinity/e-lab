import { createContext } from 'react';

const ToastContext = createContext({
  showToast: (message, severity) => { }
});

export default ToastContext;
