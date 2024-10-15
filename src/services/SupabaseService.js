import { supabase } from 'auth/SupabaseAuth';

const SupabaseService = {};

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
  return data;
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
  return data;
};

// Sign up with email and password
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


// Get detail user session
SupabaseService.getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Error fetching session:", error);
    return error;
  }
  
  return data.session;  // or just return data if you want more flexibility
};

export default SupabaseService;
