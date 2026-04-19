import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Kiểm tra xem biến có bị undefined không
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Thiếu cấu hình Supabase trong file .env!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// import { createClient } from '@supabase/supabase-js';

// // Thay thế URL và Anon Key lấy từ trang Settings > API trong Supabase của bạn
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jdhorynqsvuitawvsmlo.supabase.co'; 
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkaG9yeW5xc3Z1aXRhd3ZzbWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzA5OTAsImV4cCI6MjA5MDQ0Njk5MH0.WfSfx2Rvgnji5GKM5ZqJ8kENQD_qxYHqxRVxC7iVT-Y';

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);