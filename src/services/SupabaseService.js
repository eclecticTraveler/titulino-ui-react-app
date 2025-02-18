import { supabase } from 'auth/SupabaseAuth';

const SupabaseService = {};
// **AUTHENTICATION METHODS**

// Sign in with email and password
SupabaseService.signInEmailRequest = async (email, password) => {
  const { user, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    console.error("Error signing in with email:", error);
    return error;
  }
  return user;
};

// Sign out
SupabaseService.signOutRequest = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error);
    return error;
  }
  return 'Signed out successfully';
};

// Sign in with Google
SupabaseService.signInGoogleRequest = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) {
    console.error("Error signing in with Google:", error);
    return error;
  }
  return data.session?.user;
};

// Sign in with Facebook
SupabaseService.signInFacebookRequest = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
  });
  if (error) {
    console.error("Error signing in with Facebook:", error);
    return error;
  }
  return data.session?.user;
};

// Sign up with email & password
SupabaseService.signUpEmailRequest = async (email, password) => {
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    console.error("Error signing up with email:", error);
    return error;
  }
  return user;
};

export default SupabaseService;
