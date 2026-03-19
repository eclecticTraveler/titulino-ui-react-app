import { Navigate, useLocation } from "react-router-dom";
import { APP_PREFIX_PATH } from '../configs/AppConfig'

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

export function RouteInterceptor({ children, isAuthenticated }) {
    const location = useLocation();
    return isAuthenticated ? (
      children
    ) : (
      <Navigate
        to={{
          pathname: APP_PREFIX_PATH,
        }}
        state={{ from: location }}
        replace
      />
    );
  }  