
// export function askAI(question) {
//   return axios.post("http://localhost:3000/ai/chat", {
//     prompt: question
//   }).then(res => res.data.answer);
// };
export async function askAI(question: string): Promise<string> {
  if (!question) return "";

  try {
    // Replace /api/ai with your real backend AI endpoint if available
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    if (!res.ok) {
      // fallback to a friendly message on HTTP error
      return `Lỗi: ${res.status} ${res.statusText}`;
    }

    const data = await res.json();
    // adjust based on your backend response shape
    return (data?.answer as string) ?? JSON.stringify(data);
  } catch (err) {
    console.error("askAI error:", err);
    // local fallback for development
    return "Không thể kết nối tới dịch vụ AI. Vui lòng thử lại sau.";
  }
}

export const getAssets = async () => {
  const res = await axios.get("http://localhost:3000/assets");
  return res.data;
};