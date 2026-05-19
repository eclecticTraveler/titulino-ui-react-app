import supabaseConfig from '../configs/SupabaseConfig';
import { createClient } from '@supabase/supabase-js'

let authLockQueue = Promise.resolve();

const browserSafeAuthLock = async (_name, _acquireTimeout, fn) => {
	const queuedRun = authLockQueue.then(fn, fn);
	authLockQueue = queuedRun.catch(() => undefined);
	return queuedRun;
};

const supabase = createClient(
	supabaseConfig.supabaseProjectUrl,
	supabaseConfig.supabaseAnonApiKey,
	{
		auth: {
			lock: browserSafeAuthLock
		}
	}
)

export {
	supabase
};
