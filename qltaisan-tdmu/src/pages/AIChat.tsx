import { useState } from "react";
// import { askAI } from "../api/aiService";

function AIChat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAsk = async () => {
    // const res = await askAI(question);
    // setAnswer(res);
  };

  return (
    <div>
      <h2>AI hỗ trợ bảo trì tài sản</h2>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button onClick={handleAsk}>Hỏi AI</button>
      <p>{answer}</p>
    </div>
  );
}

export default AIChat;
