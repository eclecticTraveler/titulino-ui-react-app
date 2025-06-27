import { useEffect } from 'react';
import { supabase } from 'auth/SupabaseAuth';

const useSupabaseSessionSync = (onAuth) => {
  useEffect(() => {
    const sync = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) onAuth(session);
    };
    sync();
  }, [onAuth]);
};

export default useSupabaseSessionSync;
