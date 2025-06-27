const SupabaseConfig = {
  supabaseProjectUrl: process.env.REACT_APP_SUPABASE_URL,
	supabaseAnonApiKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
  baseApiUrl: process.env.REACT_APP_SUPABASE_BASE_API_URL,
  enviroment: process.env.REACT_APP_ENV,
};

export default SupabaseConfig;

