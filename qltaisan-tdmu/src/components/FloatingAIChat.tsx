import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Calendar,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";

interface GoiYAIBaoTri {
  MaGoiY: number;
  MaTaiSan: number;
  MucRuiRo: number;
  DuDoan: string;
  NgayDeXuat: string;
}

type TabId = "chat" | "suggestions" | "risk" | "lookup";

export default function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("chat");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "Xin chào! Tôi là Grok 4.20 – Chuyên gia AI Bảo trì Dự đoán Tiên tiến. Bạn muốn phân tích rủi ro, gợi ý bảo trì hay tra cứu tài sản?",
    },
  ]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<GoiYAIBaoTri[]>([]);
  const [loading, setLoading] = useState(false);
  const [lookupInput, setLookupInput] = useState("");

  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => chatInputRef.current?.focus(), 0);
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      // Thay bằng API thật của bạn (DB)
      const mockData: GoiYAIBaoTri[] = [
        {
          MaGoiY: 1,
          MaTaiSan: 101,
          MucRuiRo: 85,
          DuDoan: "Máy bơm cần bảo trì trong 7 ngày tới",
          NgayDeXuat: "2026-04-05",
        },
        {
          MaGoiY: 2,
          MaTaiSan: 102,
          MucRuiRo: 92,
          DuDoan: "Hệ thống HVAC nguy cơ hỏng 80% vào tháng 5",
          NgayDeXuat: "2026-04-02",
        },
      ];
      setSuggestions(mockData);
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeTab !== "chat") return;
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [isOpen, activeTab, messages.length, loading]);

  const callGrok = async (userMessage: string, contextData?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/grok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `Bạn là Grok 4.20 - Chuyên gia AI Bảo trì Dự đoán Tiên tiến cho hệ thống tài sản.
Bạn có khả năng phân tích rủi ro, dự đoán thời điểm hư hỏng, đưa ra kế hoạch bảo trì tối ưu.
Dữ liệu hiện tại từ bảng GoiYAIBaoTri: ${contextData || "Không có dữ liệu"}.
Trả lời ngắn gọn, chuyên nghiệp, dùng emoji và số liệu cụ thể.`,
            },
            { role: "user", content: userMessage },
          ],
          model: "grok-4.20-reasoning",
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        return `❌ Lỗi gọi API (/api/grok): ${res.status} ${res.statusText}${errText ? `\n${errText}` : ""}`;
      }

      const data = await res.json();
      return data?.choices?.[0]?.message?.content ?? "⚠️ Grok không trả về nội dung.";
    } catch (err) {
      console.error(err);
      return "❌ Lỗi kết nối Grok API. Kiểm tra server/proxy và API key trong environment.";
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");

    const context = suggestions
      .map(
        (s) =>
          `Tài sản #${s.MaTaiSan} - Rủi ro ${s.MucRuiRo}% - ${s.DuDoan} (${s.NgayDeXuat})`,
      )
      .join("\n");

    const aiReply = await callGrok(userMsg, context);
    setMessages((prev) => [...prev, { role: "ai", text: aiReply }]);
  };

  const runAdvancedPrediction = async () => {
    if (loading) return;
    const context = suggestions
      .map((s) => `Tài sản #${s.MaTaiSan} - Rủi ro ${s.MucRuiRo}% - ${s.DuDoan}`)
      .join("\n");

    const prompt =
      "Dựa trên dữ liệu trên, hãy đưa ra phân tích dự đoán tiên tiến: rủi ro tương lai, thời điểm bảo trì tối ưu, và khuyến nghị cụ thể cho từng tài sản.";

    const aiReply = await callGrok(prompt, context);
    setMessages((prev) => [
      ...prev,
      { role: "ai", text: `🚀 Phân tích dự đoán tiên tiến:\n\n${aiReply}` },
    ]);
    setActiveTab("chat");
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center text-white hover:scale-110 transition z-50"
        >
          <Bot className="w-8 h-8" />
          <div className="absolute -top-1 -right-1 bg-emerald-500 text-[10px] font-bold px-1.5 rounded-full">
            Grok
          </div>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-8 right-8 w-96 bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[560px]">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 flex items-center justify-between text-white rounded-t-3xl">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Grok AI Bảo trì</h3>
                <p className="text-xs opacity-75">Dự đoán tiên tiến • Grok 4.20</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-2xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex border-b border-zinc-800 text-sm bg-zinc-950">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-3 ${
                activeTab === "chat"
                  ? "border-b-2 border-violet-500 text-white"
                  : "text-zinc-400"
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setActiveTab("suggestions")}
              className={`flex-1 py-3 ${
                activeTab === "suggestions"
                  ? "border-b-2 border-violet-500 text-white"
                  : "text-zinc-400"
              }`}
            >
              📅 Gợi ý
            </button>
            <button
              onClick={() => setActiveTab("risk")}
              className={`flex-1 py-3 ${
                activeTab === "risk"
                  ? "border-b-2 border-violet-500 text-white"
                  : "text-zinc-400"
              }`}
            >
              ⚠️ Dự đoán
            </button>
            <button
              onClick={() => setActiveTab("lookup")}
              className={`flex-1 py-3 ${
                activeTab === "lookup"
                  ? "border-b-2 border-violet-500 text-white"
                  : "text-zinc-400"
              }`}
            >
              🔍 Tra cứu
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4 bg-zinc-950" ref={chatRef}>
            {activeTab === "chat" && (
              <>
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-3xl whitespace-pre-line ${
                        m.role === "user" ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-200"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && <div className="text-center text-zinc-500 text-sm">Grok đang suy nghĩ...</div>}
              </>
            )}

            {activeTab === "suggestions" && (
              <div className="space-y-3">
                <button
                  onClick={() => alert("Demo: thêm mới gợi ý (gọi API POST)")}
                  className="flex items-center gap-2 text-emerald-400 text-sm"
                >
                  <Plus className="w-4 h-4" /> Thêm gợi ý mới
                </button>
                {suggestions.map((item) => (
                  <div key={item.MaGoiY} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-700 text-zinc-200">
                    <div className="flex justify-between text-sm">
                      <span>Tài sản #{item.MaTaiSan}</span>
                      <span className="text-emerald-400 font-bold">{item.MucRuiRo}%</span>
                    </div>
                    <p className="mt-1">{item.DuDoan}</p>
                    <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {item.NgayDeXuat}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "risk" && (
              <div className="text-center py-8 text-zinc-200">
                <AlertTriangle className="w-12 h-12 mx-auto text-orange-400 mb-4" />
                <h4 className="font-semibold mb-2">AI Dự đoán Tiên tiến</h4>
                <p className="text-zinc-400 text-sm">
                  Grok 4.20 sẽ phân tích dữ liệu và dự báo rủi ro tương lai
                </p>
                <button
                  onClick={runAdvancedPrediction}
                  disabled={loading}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-3xl font-medium flex items-center gap-2 mx-auto hover:scale-105 transition"
                >
                  {loading ? "Đang dự đoán..." : "🚀 Chạy dự đoán tiên tiến"}
                </button>
              </div>
            )}

            {activeTab === "lookup" && (
              <div className="text-zinc-200">
                <input
                  type="text"
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  placeholder="Nhập mã tài sản..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl px-5 py-4"
                />
                <button
                  onClick={async () => {
                    const code = lookupInput.trim();
                    const prompt = code
                      ? `Tra cứu nhanh tài sản mã ${code}. Nếu thiếu dữ liệu thì hỏi lại người dùng cần trường nào.`
                      : "Hướng dẫn người dùng nhập mã tài sản để tra cứu.";
                    const aiReply = await callGrok(prompt);
                    setMessages((prev) => [...prev, { role: "ai", text: aiReply }]);
                    setActiveTab("chat");
                  }}
                  disabled={loading}
                  className="mt-4 w-full py-4 bg-indigo-600 rounded-3xl text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  Tra cứu ngay với Grok
                </button>
              </div>
            )}
          </div>

          {activeTab === "chat" && (
            <div className="p-4 border-t border-zinc-800">
              <div className="flex gap-2">
                <input
                  ref={chatInputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Hỏi Grok về bảo trì, rủi ro..."
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-3xl px-5 py-3 focus:outline-none focus:border-violet-500 text-zinc-200 placeholder:text-zinc-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading}
                  className="bg-violet-600 hover:bg-violet-700 px-6 rounded-3xl text-white disabled:opacity-60"
                >
                  Gửi
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

