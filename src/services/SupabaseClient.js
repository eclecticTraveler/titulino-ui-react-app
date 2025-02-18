import { supabase } from 'auth/SupabaseAuth';

const SupabaseAuthClient = {};

// **SESSION MANAGEMENT**

// Get current session
SupabaseAuthClient.getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error fetching session:", error);
    return null;
  }
  return data.session;
};

// Get access token
SupabaseAuthClient.getToken = async () => {
  const session = await SupabaseAuthClient.getSession();
  return session?.access_token || null;
};

// Check if user is logged in
SupabaseAuthClient.isLoggedIn = async () => {
  const session = await SupabaseAuthClient.getSession();
  return !!session?.access_token;
};

// **USER & ROLE MANAGEMENT**

// Get user metadata
SupabaseAuthClient.getUserMetadata = async () => {
  const session = await SupabaseAuthClient.getSession();
  if (!session) return null;

  const user = session.user;
  return {
    email: user.email,
    fullName: user.user_metadata?.full_name,
    avatarUrl: user.user_metadata?.avatar_url,
    emailVerified: user.user_metadata?.email_verified,
    isAnonymous: user.is_anonymous,
    roles: user.app_metadata?.roles || [],  // Roles from Supabase
  };
};


// Check if user has a specific role
SupabaseAuthClient.hasRole = async (requiredRoles) => {
  const user = await SupabaseAuthClient.getUserMetadata();
  if (!user) return false;

  return requiredRoles.some((role) => user.roles.includes(role));
};

// Check if user is an admin
SupabaseAuthClient.isUserAdmin = async () => {
  return await SupabaseAuthClient.hasRole(["enrollment.admin"]);
};

// Check if user is a special admin (modify based on your needs)
SupabaseAuthClient.isUserSpecialAdmin = async () => {
  return await SupabaseAuthClient.hasRole(["administrator", "customer", "default-roles-master"]);
};

export default SupabaseAuthClient;
