import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Calendar,
  Edit,
  List,
  MessageCircle,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

// Mock data (thay bằng API thật)
const mockGoiYData = [
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
    DuDoan: "Hệ thống HVAC có nguy cơ hỏng 80% vào tháng 5",
    NgayDeXuat: "2026-04-02",
  },
];

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
    { role: "ai", text: "Xin chào! Tôi là AI Hỗ trợ Bảo trì. Bạn muốn tôi giúp gì?" },
  ]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<GoiYAIBaoTri[]>(mockGoiYData);
  const [lookupInput, setLookupInput] = useState("");

  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => chatInputRef.current?.focus(), 0);
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // Ví dụ:
        // const res = await fetch("/api/goi-y-ai");
        // const data = await res.json();
        // setSuggestions(data);
        console.log("✅ Đã fetch bảng GoiYAIBaoTri thành công");
      } catch {
        console.log("⚠️ Dùng mock data (bạn thay API thật)");
      }
    };
    if (isOpen && activeTab === "suggestions") fetchSuggestions();
  }, [isOpen, activeTab]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    const userInput = input;
    setInput("");

    setTimeout(() => {
      let reply = "";
      const lower = userInput.toLowerCase();
      if (lower.includes("gợi ý") || lower.includes("bảo trì")) {
        reply =
          "📅 Gợi ý bảo trì mới nhất từ bảng GoiYAIBaoTri:\nMáy bơm (MaTaiSan=101) - Rủi ro 85% - Bảo trì trong 7 ngày";
      } else if (lower.includes("nguy cơ") || lower.includes("rủi ro")) {
        reply =
          "⚠️ Phân tích nguy cơ: Tài sản #102 đang có rủi ro cao (92%). Khuyến nghị kiểm tra ngay!";
      } else if (lower.includes("tra cứu") || lower.includes("tài sản")) {
        reply = "🔍 Tra cứu thông tin: Nhập mã tài sản để tôi tra cứu ngay từ database.";
      } else {
        reply =
          "Tôi đã hiểu yêu cầu của bạn. Bạn muốn xem **Quản lý gợi ý**, **Phân tích nguy cơ**, hay **Tra cứu thông tin**?";
      }
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    }, 800);
  };

  const addNewSuggestion = () => {
    const newSug: GoiYAIBaoTri = {
      MaGoiY: Date.now(),
      MaTaiSan: 999,
      MucRuiRo: 70,
      DuDoan: "Gợi ý mới từ AI - cần cập nhật",
      NgayDeXuat: "2026-04-10",
    };
    setSuggestions((prev) => [...prev, newSug]);
    alert("✅ Đã thêm gợi ý mới (demo). Thực tế sẽ gọi API POST.");
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-3xl shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 z-50 group"
        >
          <MessageCircle className="w-8 h-8 group-active:rotate-12 transition" />
          <div className="absolute -top-1 -right-1 bg-emerald-500 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
            AI
          </div>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-8 right-8 w-96 bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[560px]">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">AI Hỗ trợ Bảo trì</h3>
                <p className="text-xs opacity-75">Phân tích • Gợi ý • Tra cứu</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 hover:bg-white/20 rounded-2xl flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex border-b border-zinc-800 bg-zinc-950">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === "chat"
                  ? "border-b-2 border-violet-500 text-white"
                  : "text-zinc-400"
              }`}
            >
              💬 Chat AI
            </button>
            <button
              onClick={() => setActiveTab("suggestions")}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === "suggestions"
                  ? "border-b-2 border-violet-500 text-white"
                  : "text-zinc-400"
              }`}
            >
              📅 Gợi ý
            </button>
            <button
              onClick={() => setActiveTab("risk")}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === "risk"
                  ? "border-b-2 border-violet-500 text-white"
                  : "text-zinc-400"
              }`}
            >
              ⚠️ Rủi ro
            </button>
            <button
              onClick={() => setActiveTab("lookup")}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === "lookup"
                  ? "border-b-2 border-violet-500 text-white"
                  : "text-zinc-400"
              }`}
            >
              🔍 Tra cứu
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-zinc-950">
            {activeTab === "chat" && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto space-y-4 mb-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-3 rounded-3xl whitespace-pre-line ${
                          msg.role === "user"
                            ? "bg-violet-600 text-white"
                            : "bg-zinc-800 text-zinc-200"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Hỏi về bảo trì, rủi ro, gợi ý..."
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-3xl px-5 py-3 text-sm focus:outline-none focus:border-violet-500 text-zinc-200 placeholder:text-zinc-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-violet-600 hover:bg-violet-700 px-6 rounded-3xl text-white font-medium"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            )}

            {activeTab === "suggestions" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold flex items-center gap-2 text-zinc-200">
                    <List className="w-4 h-4" /> Quản lý gợi ý bảo trì
                  </h4>
                  <button
                    onClick={addNewSuggestion}
                    className="flex items-center gap-2 text-sm bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-2xl text-white"
                  >
                    <Plus className="w-4 h-4" /> Thêm gợi ý
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-auto">
                  {suggestions.map((item) => (
                    <div
                      key={item.MaGoiY}
                      className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 text-zinc-200"
                    >
                      <div className="flex justify-between">
                        <div>
                          <span className="text-xs bg-zinc-800 px-3 py-1 rounded-full">
                            Tài sản #{item.MaTaiSan}
                          </span>
                          <p className="font-medium mt-2">{item.DuDoan}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 text-sm font-bold">
                            {item.MucRuiRo}%
                          </div>
                          <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1 justify-end">
                            <Calendar className="w-3 h-3" /> {item.NgayDeXuat}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 text-xs flex items-center justify-center gap-1 py-2 border border-zinc-700 rounded-2xl hover:bg-zinc-800">
                          <Edit className="w-3 h-3" /> Sửa
                        </button>
                        <button className="flex-1 text-xs flex items-center justify-center gap-1 py-2 border border-red-900 text-red-400 rounded-2xl hover:bg-red-900/30">
                          <Trash2 className="w-3 h-3" /> Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "risk" && (
              <div className="text-center py-8 text-zinc-200">
                <AlertTriangle className="w-12 h-12 mx-auto text-orange-400 mb-4" />
                <h4 className="font-semibold">Phân tích nguy cơ hư hỏng</h4>
                <p className="text-zinc-400 text-sm mt-2">
                  AI đang quét dữ liệu từ bảng GoiYAIBaoTri...
                </p>
                <button
                  onClick={() => {
                    setMessages([
                      {
                        role: "ai",
                        text: "🚨 Phân tích hoàn tất: 3 tài sản có rủi ro > 80%. Bạn muốn xem chi tiết?",
                      },
                    ]);
                    setActiveTab("chat");
                  }}
                  className="mt-6 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-3xl text-white text-sm"
                >
                  Chạy phân tích ngay
                </button>
              </div>
            )}

            {activeTab === "lookup" && (
              <div className="text-zinc-200">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Search className="w-4 h-4" /> Chatbot tra cứu thông tin tài sản
                </h4>
                <input
                  type="text"
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  placeholder="Nhập mã tài sản (ví dụ: 101)"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl px-5 py-4 text-sm mb-4 focus:outline-none focus:border-violet-500 text-zinc-200 placeholder:text-zinc-500"
                />
                <button
                  onClick={() => {
                    const code = lookupInput.trim() || "101";
                    setMessages([
                      {
                        role: "ai",
                        text: `✅ Tài sản #${code}: (demo) - Trạng thái: Bình thường - Gợi ý bảo trì: 5 ngày tới`,
                      },
                    ]);
                    setActiveTab("chat");
                  }}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-3xl text-white font-medium"
                >
                  Tra cứu ngay
                </button>
                <p className="text-xs text-zinc-500 mt-4 text-center">
                  AI sẽ trả lời dựa trên dữ liệu tài sản + bảng GoiYAIBaoTri
                </p>
              </div>
            )}
          </div>

          <div className="px-4 py-3 text-xs text-zinc-500 border-t border-zinc-800 flex items-center justify-center gap-2 bg-zinc-950">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            AI đang online • Kết nối bảng{" "}
            <span className="font-mono bg-zinc-800 px-1.5 rounded">GoiYAIBaoTri</span>
          </div>
        </div>
      )}
    </>
  );
}

