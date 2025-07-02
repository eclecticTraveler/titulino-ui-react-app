import { supabase } from 'auth/SupabaseAuth';
import TitulinoNetService from "services/TitulinoNetService";
import LocalStorageService from "services/LocalStorageService";

const SupabaseAuthService = {
  async isLoggedIn() {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  },

  async getToken() {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  },

  async isTokenExpired() {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() > payload.exp * 1000;
    } catch (e) {
      return true;
    }
  },

  async onTokenChange(callback) {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" && session) {
        callback(session.access_token);
      }
    });
  },

  async isInternalTokenExpired(internalToken) {
    try {
      const payload = JSON.parse(atob(internalToken.split('.')[1]));
      return Date.now() > payload.exp * 1000;
    } catch (e) {
      return true;
    }
  },

  async refreshInternalTokenIfValidSupabase(dobOrYob) {
    const isExpired = await this.isTokenExpired();
    if (!isExpired) {      
      const internalToken = LocalStorageService.retrieveEncryptedObjectWithExpiry("internal_token");

      if (!internalToken || await this.isInternalTokenExpired(internalToken)) {
        const { email } = (await supabase.auth.getUser()).data?.user || {};
        if (!email || !dobOrYob) {
          console.warn("Can't renew internal token: missing email or birth date");
          return;
        }

        const userProfile = await TitulinoNetService.getUserProfileByEmailAndYearOfBirth(email, dobOrYob);
        if (userProfile?.token) {          
          LocalStorageService.storeEncryptedObjectWithExpiry("internal_token", userProfile?.token, 60); // e.g., 60 min TTL
        } else {
          console.warn("User profile loaded but token missing");
        }
      }
    } else {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error("Failed to refresh Supabase session:", error);
        // Optionally sign out if refresh fails
        await supabase.auth.signOut();
      }else{
        console.log("Successfully refreshed Supabase token");
        // Optionally sync internal token again after refresh
        const { email } = data.session.user;
        if (email && dobOrYob) {
          const userProfile = await TitulinoNetService.getUserProfileByEmailAndYearOfBirth(email, dobOrYob);
          if (userProfile?.token) {
            LocalStorageService.set("internal_token", userProfile.token);
          }
        }
      }
    }
  }
};

export default SupabaseAuthService;
