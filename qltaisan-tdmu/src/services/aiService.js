import axios from "axios";

// Lấy Key từ Vite env
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const askAI = async (question, context = "", history = []) => {
  if (!question) return "";

  // KIỂM TRA KEY NGAY TẠI ĐÂY
  if (!GROQ_API_KEY) {
    console.error("❌ Groq API Key bị trống!");
    return "❌ Lỗi cấu hình: Thiếu API Key trong file .env";
  }

  try {
    const messages = [
      {
        role: "system",
        content: `Bạn là Grok AI - Chuyên gia tối ưu hóa tài sản TDMU.
        DỮ LIỆU TÀI SẢN CỦA HỆ THỐNG:
        ---
        ${context || "Hiện không có dữ liệu tài sản nào được cung cấp."}
        ---
        Hãy dựa vào dữ liệu trên để trả lời người dùng.`
      },
      ...history.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text
      })),
      { role: "user", content: question }
    ];

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.6,
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY.replace(/['";]/g, '')}`, // Tự động dọn dẹp ký tự thừa
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error("Lỗi gọi Groq:", err.response?.data || err.message);
    if (err.response?.status === 401) return "❌ Lỗi: API Key không hợp lệ.";
    if (err.response?.status === 429) return "⚠️ Grok AI đang quá tải, thử lại sau 15p.";
    return "❌ Hệ thống AI gặp sự cố.";
  }
}

// import axios from "axios";

// const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// console.log("🔑 Groq API Key:", GROQ_API_KEY ? "✅ Có key" : "❌ Không có key");
// console.log("VITE_GROQ_API_KEY =", import.meta.env.VITE_GROQ_API_KEY);

// if (!GROQ_API_KEY) {
//   console.error("❌ Groq API Key chưa được thiết lập. Vui lòng thêm vào file .env");
// }

// const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// export const askAI = async (question, context = "", history = []) => {
//  if (!question) return "";

//   try {
//     const messages = [
//       {
//         role: "system",
//         content: `Bạn là Grok AI - Chuyên gia tối ưu hóa tài sản TDMU (Đại học Thủ Dầu Một). 
//         NHIỆM VỤ: Phân tích dữ liệu, đề xuất bảo trì và tra cứu thông tin chi tiết.
        
//         KHI TRA CỨU TÀI SẢN (LOOKUP): Bạn phải trả về đầy đủ các thông tin sau nếu có trong dữ liệu:
//         - Tên tài sản & Mã tài sản
//         - Loại tài sản (Loại)
//         - Đơn vị sử dụng (Phòng ban)
//         - Vị trí cụ thể (Vị trí)
//         - Nhà cung cấp (NCC)
//         - Ngày mua & Trạng thái hiện tại
        
//         GỢI Ý BẢO TRÌ (SUGGESTIONS): Với các tài sản rủi ro cao, hãy đưa ra hành động khắc phục cụ thể (Ví dụ: "Thay pin", "Vệ sinh quạt", "Nâng cấp RAM").
        
//         DỮ LIỆU TÀI SẢN (Mã CODE | Tên | Loại | Phòng | Vị trí | NCC | Ngày mua | Trạng thái):
//         ---
//         ${contextData || "Hệ thống đang trống dữ liệu tài sản."}
//         ---
//         PHONG CÁCH: Chuyên nghiệp, dùng Markdown để trình bày thông tin đẹp mắt, ưu tiên tính chính xác tuyệt đối.`
//       },
//       ...history.map(msg => ({
//         role: msg.role === "user" ? "user" : "assistant",
//         content: msg.text
//       })),
//       {
//         role: "user",
//         content: question
//       }
//     ];

//     const response = await axios.post(
//       GROQ_API_URL,
//       {
//         model: "llama-3.3-70b-versatile",
//         messages: messages,
//         temperature: 0.6,
//         max_tokens: 1500,
//         top_p: 1,
//       },
//       {
//         headers: {
//           "Authorization": `Bearer ${GROQ_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return response.data.choices[0].message.content;
//   } catch (err) {
//     if (err.response?.status === 429) {
//       return "⚠️ Grok AI hiện đang quá tải lượt dùng. Bạn hãy thử lại sau khoảng 15 phút nhé!";
//     }
//     return "❌ Hệ thống Grok AI tạm thời gián đoạn. Vui lòng thử lại sau.";
//   }
// }

// export const getAssets = async () => {
//   // Assuming Supabase is used elsewhere, this might be a placeholder or actual axios call
//   const res = await axios.get("http://localhost:3000/assets");
//   return res.data;
// };
