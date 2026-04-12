import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../database.types"; // File bạn vừa gen lúc nãy
import * as dotenv from "dotenv";

// Nạp các biến từ file .env
//dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Kiểm tra xem biến môi trường có tồn tại không để tránh crash app
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Thiếu SUPABASE_URL hoặc SUPABASE_ANON_KEY trong file .env");
}

// Khởi tạo client với Generic Type <Database>
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
