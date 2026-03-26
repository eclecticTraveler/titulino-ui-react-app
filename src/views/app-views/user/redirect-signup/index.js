import React, { useEffect } from 'react';
import RegisterOne from "../../../auth-views/authentication/register-1";
// react-router-dom imports removed (unused)

export const RedirectSignup = () => {
  useEffect(() => {
    // Add any login logic here if needed.
  }, []);

return (
	<><div><RegisterOne allowRedirect={true} /></div></>
)
};

export default RedirectSignup;
