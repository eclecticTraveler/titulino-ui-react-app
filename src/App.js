import React from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import './App.css';
import Views from './views'
import { Provider } from 'react-redux';
import store from './redux/store';
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { THEME_CONFIG } from './configs/AppConfig';
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "./auth/Keycloak"

const themes = {
  dark: `${process.env.PUBLIC_URL}/css/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/css/light-theme.css`,
};

const keycloakProviderInitConfig = {
  onLoad: 'login-required',
}

function App(){
    return (
      <div className="App">
        <ReactKeycloakProvider authClient={keycloak} initConfig={keycloakProviderInitConfig}>
          <Provider store={store}>
            <ThemeSwitcherProvider themeMap={themes} defaultTheme={THEME_CONFIG.currentTheme} insertionPoint="styles-insertion-point">
              <Router>
                <Switch>
                  <Route path="/" component={Views}/>
                </Switch>
              </Router>
            </ThemeSwitcherProvider>
          </Provider>
        </ReactKeycloakProvider>
      </div>
  );
}

export default App;

