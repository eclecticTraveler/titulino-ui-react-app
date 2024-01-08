import { Route, Redirect } from "react-router-dom";
import { AUTH_PREFIX_PATH } from '../configs/AppConfig'

 export function retry(fn, retriesLeft = 5, interval = 1000) {
    return new Promise((resolve, reject) => {
      fn()
        .then(resolve)
        .catch((error) => {
          setTimeout(() => {
            if (retriesLeft === 1) {
              reject(error);
              return;
            }
  
            // Passing on "reject" is the important part
            retry(fn, retriesLeft - 1, interval).then(resolve, reject);
          }, interval);
        });
    });
  } 

export function RouteInterceptor({ children, isAuthenticated, ...rest }) {
    return (
      <Route
        {...rest}
        render={({ location }) =>
          isAuthenticated ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: AUTH_PREFIX_PATH,
                state: { from: location }
              }}
            />
          )
        }
      />
    );
  }  