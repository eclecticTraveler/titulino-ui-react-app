import supabaseConfig from '../configs/SupabaseConfig';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
	supabaseConfig.supabaseProjectUrl,
	supabaseConfig.supabaseAnonApiKey
)

export {
	supabase
};