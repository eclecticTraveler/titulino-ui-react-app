import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import 'antd/dist/reset.css';
import './App.css';
import Views from './views'
import { Provider } from 'react-redux';
import store from './redux/store';
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { THEME_CONFIG } from './configs/AppConfig';
import { env } from './configs/EnvironmentConfig';
const themes = {
  dark: `${process.env.PUBLIC_URL}/css/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/css/light-theme.css`,
};

function App(){
    return (
      <div className="App">
          <Provider store={store}>
            <ThemeSwitcherProvider themeMap={themes} defaultTheme={THEME_CONFIG.currentTheme} insertionPoint="styles-insertion-point">
              <GoogleReCaptchaProvider
                reCaptchaKey={env.RECAPTCHA_SITE_KEY}
                scriptProps={{ async: true, defer: true, appendTo: "head" }}
              >
                <Router>
                  <Routes>
                    <Route path="/*" element={<Views />}/>
                  </Routes>
                </Router>
              </GoogleReCaptchaProvider>
            </ThemeSwitcherProvider>
          </Provider>
      </div>
  );
}

export default App;

