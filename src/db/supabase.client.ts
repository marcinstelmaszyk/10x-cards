import { createClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type SupabaseClient = typeof supabaseClient;

//dev
export const DEFAULT_USER_ID = "b67f8a07-2140-481c-bccf-429cb2a2b59a";

//test
// export const DEFAULT_USER_ID = "6f8706cd-0a62-460b-a56b-76031cc205ad";
