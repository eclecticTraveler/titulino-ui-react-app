import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import {env} from './configs/EnvironmentConfig';
import * as serviceWorker from './serviceWorker';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
// import HttpService from './services/HttpService';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleReCaptchaProvider reCaptchaKey={env.ReCAPTCHA_SITE_KEY}>
    <App />
  </GoogleReCaptchaProvider>
);
// HttpService.configure();
//   "homepage": "https://eclecticTraveler.github.io/titulino-ui-react-app",
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();