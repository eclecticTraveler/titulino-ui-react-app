import React, { useState, useEffect } from 'react';
import RegisterOne from "../../../auth-views/authentication/register-1";
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from "@supabase/auth-ui-shared";
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
