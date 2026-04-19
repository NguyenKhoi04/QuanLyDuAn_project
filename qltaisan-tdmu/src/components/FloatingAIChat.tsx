import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Sparkles,
  X,
  Shield,
  Send,
  ChevronDown,
  CheckCircle,
  Info,
} from "lucide-react";
import { askAI } from "@/services/aiService";
import { supabase } from "@/lib/supabaseClient";

interface GoiYAIBaoTri {
  MaGoiY: number;
  MaTaiSan: string;
  MucRuiRo: number;
  DuDoan: string;
  NgayDeXuat: string;
  quickQuestion?: string;
}

type TabId = "chat" | "suggestions" | "risk" | "lookup";

const LOGIC_QUESTIONS = [
  "Rủi ro đáng lo ngại nhất?",
  "Phân tích hiệu suất thiết bị",
  "Kế hoạch bảo trì tháng tới",
  "Tài sản nào cần thanh lý?",
];

const TRANG_THAI: Record<number, string> = {
  1: "Đang sử dụng",
  2: "Chờ cấp phát",
  3: "Đang sửa chữa",
  4: "Thanh lý",
};

// Rich Message Renderer
function RenderAIMessage({ text }: { text: string }) {
  const normalized = text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^---+$/gm, "")
    .replace(/^(\s{2,})-\s/gm, "* ")
    .replace(/^-\s/gm, "* ");

  const lines = normalized.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((raw, i) => {
    const t = raw.trim();
    if (!t) {
      elements.push(<div key={i} className="h-2" />);
      return;
    }

    if (/^\*\*[^*]+\*\*[:\s]*$/.test(t)) {
      const content = t.replace(/^\*\*|\*\*[:\s]*$/g, "").replace(/:$/, "");
      const isHigh = /cao|nguy|hỏng|cấp bách/i.test(content);
      const isMid = /trung|vừa|cần theo dõi/i.test(content);

      elements.push(
        <div
          key={i}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold mt-3 mb-1 ${
            isHigh
              ? "text-red-400 bg-red-950/50 border-red-900/50"
              : isMid
                ? "text-amber-400 bg-amber-950/40 border-amber-900/50"
                : "text-emerald-400 bg-emerald-950/40 border-emerald-900/50"
          }`}
        >
          {isHigh && <AlertTriangle className="w-4 h-4" />}
          {isMid && <Info className="w-4 h-4" />}
          {!isHigh && !isMid && <CheckCircle className="w-4 h-4" />}
          {content}
        </div>,
      );
      return;
    }

    if (/^\*\s/.test(t)) {
      const content = t.replace(/^\*\s+/, "");
      elements.push(
        <div
          key={i}
          className="flex gap-2 text-zinc-300 text-[15px] leading-relaxed"
        >
          <span className="text-emerald-500 mt-1.5">•</span>
          <span>{content}</span>
        </div>,
      );
      return;
    }

    elements.push(
      <p key={i} className="text-[15px] text-zinc-200 leading-relaxed">
        {t}
      </p>,
    );
  });

  return <div className="space-y-3">{elements}</div>;
}

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
    </span>
  );
}

export default function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("chat");
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([
    {
      role: "ai",
      text: "Xin chào! Tôi là **Grok 4.20** – Chuyên gia AI Bảo trì Dự đoán. Bạn cần hỗ trợ gì hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<GoiYAIBaoTri[]>([]);
  const [loading, setLoading] = useState(false);
  const [lookupInput, setLookupInput] = useState("");
  const [assets, setAssets] = useState<any[]>([]);
  const [suggestionPage, setSuggestionPage] = useState(0);

  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // ==================== FETCH DATA ====================
  const fetchAll = async () => {
  try {
    // Sử dụng cú pháp join của Supabase: tên_bảng_khóa_ngoại(cột_muốn_lấy)
    const { data: assetData, error } = await supabase
      .from("taisan")
      .select(`
        *,
        vitri:mavitri ( tenvitri )
      `)
      .order("macode", { ascending: false });

    if (error) throw error;

    if (assetData) {
      // assetData lúc này sẽ có cấu trúc: { ..., vitri: { tenvitri: "Phòng A" } }
      setAssets(assetData);
      mapToSuggestions(assetData, 0);
    }
  } catch (e) {
    console.error("Lỗi fetch dữ liệu:", e);
  }
};

  const mapToSuggestions = (data: any[], page: number) => {
    const itemsPerPage = 4;
    const start = (page * itemsPerPage) % (data.length || 1);
    const chunk = data.slice(start, start + itemsPerPage);

    setSuggestions(
      chunk.map((a, idx) => {
        const risk = Math.floor(Math.random() * 65) + 30;
        let quickQ = `Tình trạng của ${a.macode} như thế nào?`;
        if (risk > 80) quickQ = `Cần sửa gấp ${a.macode}, quy trình khắc phục?`;
        else if (risk > 50) quickQ = `Đề xuất bảo trì cho ${a.macode}`;

        return {
          MaGoiY: Date.now() + idx,
          MaTaiSan: a.macode,
          MucRuiRo: risk,
          DuDoan:
            risk > 80
              ? `Cảnh báo khẩn: ${a.tentaisan} cần sửa chữa hoặc thay thế ngay.`
              : risk > 50
                ? `Đề xuất bảo trì định kỳ cho ${a.tentaisan}.`
                : "Thiết bị đang hoạt động ổn định.",
          NgayDeXuat: new Date().toISOString().split("T")[0],
          quickQuestion: quickQ,
        };
      }),
    );
  };

  // ==================== HANDLERS ====================
  const handleRefreshSuggestions = () => {
    const nextPage = (suggestionPage + 1) % Math.ceil(assets.length / 4 || 1);
    setSuggestionPage(nextPage);
    mapToSuggestions(assets, nextPage);
  };

  const handlePrevSuggestions = () => {
    const totalPages = Math.ceil(assets.length / 4) || 1;
    const prevPage = (suggestionPage - 1 + totalPages) % totalPages;
    setSuggestionPage(prevPage);
    mapToSuggestions(assets, prevPage);
  };

  const sendMessage = async (preset?: string) => {
  const q = preset || input;
  if (!q.trim() || loading) return;

  const contextData = assets
    .map((a) => {
      // Lấy tên vị trí từ object đã join, nếu không có thì để "Chưa xác định"
      const tenViTri = a.vitri?.tenvitri || "Chưa xác định";
      const tenTrangThai = TRANG_THAI[a.trangthai] || "Không xác định";

      return `- ${a.macode}: ${a.tentaisan}, Vị trí: ${tenViTri}, Trạng thái: ${tenTrangThai}`;
    })
    .join("\n");

  const userMsg: { role: "user"; text: string } = { role: "user", text: q };
  setMessages((prev) => [...prev, userMsg]);
  setInput("");
  setLoading(true);

  try {
    const reply = await askAI(
      q,
      contextData,
      [...messages, userMsg].slice(-10)
    );
    setMessages((prev) => [...prev, { role: "ai", text: reply }]);
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      { role: "ai", text: "❌ Có lỗi xảy ra khi kết nối với Grok." },
    ]);
  } finally {
    setLoading(false);
  }
};

  const riskBadge = (risk: number) => {
    if (risk >= 80) return "bg-red-500/10 text-red-400 border-red-500/30";
    if (risk >= 55) return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => chatInputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-50"
        >
          <Bot className="w-8 h-8" />
          <div className="absolute -top-1 -right-1 bg-emerald-500 text-[10px] font-bold px-1.5 rounded-full">
            Grok
          </div>
        </button>
      )}

      {/* Main Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-[380px] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[620px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 flex items-center justify-between text-white rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Grok AI Bảo trì</h3>
                <p className="text-xs opacity-75 flex items-center gap-1.5">
                  <LiveDot /> Grok 4.20 • Thời gian thực
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-white/20 rounded-2xl transition"
              >
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${isMinimized ? "rotate-180" : ""}`}
                />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-2xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800 bg-zinc-900">
            {(["chat", "suggestions", "risk", "lookup"] as TabId[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3.5 text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "text-white border-b-2 border-violet-500"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {tab === "chat" && "💬 Chat"}
                  {tab === "suggestions" && "📅 Gợi ý"}
                  {tab === "risk" && "⚠️ Rủi ro"}
                  {tab === "lookup" && "🔍 Tra cứu"}
                </button>
              ),
            )}
          </div>

          {/* Content Area */}
          {!isMinimized && (
            <div
              className="flex-1 overflow-auto p-5 space-y-5 bg-zinc-950"
              ref={chatRef}
            >
              {/* Chat Tab */}
              {activeTab === "chat" && (
                <>
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] px-5 py-3.5 rounded-3xl text-[15px] leading-relaxed ${
                          m.role === "user"
                            ? "bg-violet-600 text-white"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-100"
                        }`}
                      >
                        {m.role === "user" ? (
                          m.text
                        ) : (
                          <RenderAIMessage text={m.text} />
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="text-zinc-500 text-sm">
                      Grok đang suy nghĩ...
                    </div>
                  )}
                </>
              )}

              {/* Suggestions Tab */}
              {activeTab === "suggestions" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">Gợi ý bảo trì</p>
                      <p className="text-xs text-zinc-500">
                        Trang {suggestionPage + 1}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePrevSuggestions}
                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-2xl text-sm"
                      >
                        ←
                      </button>
                      <button
                        onClick={handleRefreshSuggestions}
                        className="px-4 py-2 bg-white text-black hover:bg-zinc-100 rounded-2xl text-sm font-medium"
                      >
                        Tiếp →
                      </button>
                    </div>
                  </div>

                  {suggestions.map((item) => (
                    <div
                      key={item.MaGoiY}
                      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 hover:border-violet-500/30 transition-all"
                    >
                      <div className="flex justify-between mb-3">
                        <span className="font-mono text-violet-400 font-bold">
                          {item.MaTaiSan}
                        </span>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-2xl border ${riskBadge(item.MucRuiRo)}`}
                        >
                          {item.MucRuiRo}% RISK
                        </span>
                      </div>
                      <p className="text-zinc-200 text-[15px]">{item.DuDoan}</p>
                      <button
                        onClick={() => {
                          setActiveTab("chat");
                          sendMessage(item.quickQuestion);
                        }}
                        className="mt-4 w-full py-3 bg-zinc-800 hover:bg-violet-600 hover:text-white rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition"
                      >
                        <Sparkles className="w-4 h-4" />
                        Hỏi Grok về tài sản này
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Risk Tab */}
              {activeTab === "risk" && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Shield className="w-20 h-20 text-violet-400 mb-6" />
                  <h4 className="text-xl font-semibold mb-2">
                    Phân tích rủi ro tiên tiến
                  </h4>
                  <p className="text-zinc-400 mb-8 max-w-[260px]">
                    Grok sẽ quét và cảnh báo sớm các tài sản có nguy cơ cao
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab("chat");
                      sendMessage(
                        "Thực hiện quét rủi ro toàn hệ thống và liệt kê top tài sản nguy hiểm.",
                      );
                    }}
                    className="px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl font-semibold text-white hover:scale-105 transition"
                  >
                    🚀 Chạy phân tích ngay
                  </button>
                </div>
              )}

              {/* Lookup Tab */}
              {activeTab === "lookup" && (
                <div className="space-y-4 pt-4">
                  <input
                    type="text"
                    value={lookupInput}
                    onChange={(e) => setLookupInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      lookupInput &&
                      sendMessage(`Tra cứu chi tiết: ${lookupInput}`)
                    }
                    placeholder="Nhập mã tài sản (ví dụ: TS001)"
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-violet-500 rounded-3xl px-6 py-4 text-base outline-none text-white placeholder:text-zinc-500"
                  />
                  <button
                    onClick={() => {
                      sendMessage(`Tra cứu chi tiết tài sản: ${lookupInput}`);
                      setActiveTab("chat");
                    }}
                    disabled={!lookupInput.trim()}
                    className="w-full py-4 bg-white text-black rounded-3xl font-semibold hover:bg-zinc-100 disabled:opacity-50"
                  >
                    🔍 Tra cứu ngay
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Input Area - Quick Questions + Input */}
          {activeTab === "chat" && (
            <div className="border-t border-zinc-800 bg-zinc-900 p-4">
              {/* Quick Questions */}
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2 hide-scroll">
                {LOGIC_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs whitespace-nowrap 
                                bg-zinc-800 hover:bg-zinc-700 
                                text-zinc-200 hover:text-white
                                px-4 py-2.5 rounded-2xl 
                                border border-zinc-700 hover:border-violet-500/50 
                                font-medium transition-all active:scale-95"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input Field */}
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 focus-within:border-violet-500 rounded-3xl px-5 py-2 transition-all">
                <input
                  ref={chatInputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Hỏi Grok về bảo trì..."
                  className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-zinc-500"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="w-9 h-9 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 rounded-2xl flex items-center justify-center transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
