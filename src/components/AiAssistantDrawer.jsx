import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Minimize2 } from 'lucide-react';

function getLocalAiReply(prompt) {
  const q = prompt.toLowerCase();
  if (q.includes('pid')) {
    return 'Điều khiển **PID** gồm 3 khâu:\n• **P (Proportional)**: Phản ứng tỉ lệ với sai số hiện tại.\n• **I (Integral)**: Triệt tiêu sai số xác lập theo thời gian.\n• **D (Derivative)**: Giảm vọt lố và dao động.\nMẹo: Khi tinh chỉnh xe dò line, hãy đặt Ki=0, Kd=0 trước, tăng Kp đến khi xe bắt đầu lắc nhẹ rồi tăng Kd lên để làm mượt!';
  }
  if (q.includes('arduino') || q.includes('esp32') || q.includes('l298')) {
    return 'Với **Arduino / ESP32**:\n• ESP32 chạy logic 3.3V, có sẵn Wi-Fi & Bluetooth, xung PWM độ phân giải cao (LEDC).\n• Nếu dùng mạch cầu H **L298N** với nguồn >12V nhớ tháo jumper 5V-EN.\n• Để tránh nhiễu reset vi điều khiển, luôn nối chung Mass (GND) và cấp nguồn riêng cho động cơ!';
  }
  if (q.includes('ros') || q.includes('slam') || q.includes('lidar')) {
    return 'Trong **ROS2 & SLAM**:\n• Dùng `slam_toolbox` kết hợp LiDAR 2D và dữ liệu Odometry (`/odom`) để dựng bản đồ.\n• Lệnh vận tốc gửi qua topic `/cmd_vel` với message `geometry_msgs/Twist`.\n• Bạn có thể tham khảo dự án **VietBot-AMR** trong mục Mã nguồn mở để xem cấu hình mẫu!';
  }
  if (q.includes('servo') || q.includes('động cơ') || q.includes('motor')) {
    return 'Chọn động cơ cho Robot:\n• **Servo (SG90, MG996R)**: Quay góc chính xác (0-180°), dùng cho cánh tay robot nhẹ.\n• **Stepper (NEMA 17)**: Chính xác cao, giữ lực tốt cho máy CNC/robot 6 bậc tự do.\n• **DC Encoder**: Phù hợp làm bánh xe di chuyển có đo tốc độ/quãng đường.';
  }
  return 'Mình là **RoboAI** của *Trang sáng tạo Robotics*! Bạn có thể hỏi mình về **PID, Arduino/ESP32, ROS2/SLAM, Động cơ Servo/Stepper**, và các dự án robot thực tế.';
}

export default function AiAssistantDrawer({ isOpen, onToggle, externalPrompt, onClearExternalPrompt }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Xin chào! Mình là **RoboAI** 🤖 — Trợ lý kỹ thuật của *Trang sáng tạo Robotics*. Bạn cần hỗ trợ mạch điện, code Arduino/ROS2 hay chọn linh kiện?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (externalPrompt) {
      sendMessage(externalPrompt);
      onClearExternalPrompt();
    }
  }, [externalPrompt]);

  const sendMessage = async (customText) => {
    const text = (customText ?? input).trim();
    if (!text || loading) return;
    if (!customText) setInput('');

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    const fullPrompt = `Bạn là RoboAI, trợ lý kỹ thuật Robotics chuyên nghiệp của website "Trang sáng tạo Robotics". Trả lời ngắn gọn, chính xác bằng tiếng Việt:\n\n${text}`;

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      const data = await res.json();
      if (res.ok && data?.ok && data?.text) {
        setMessages((prev) => [...prev, { role: 'ai', text: data.text }]);
        setLoading(false);
        return;
      }
    } catch {
      // Use the built-in knowledge fallback when the server is unavailable.
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'ai', text: getLocalAiReply(text) }]);
      setLoading(false);
    }, 350);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 hover:scale-105 transition"
      >
        <Bot className="w-5 h-5" />
        <span>Hỏi RoboAI</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-[400px] h-[520px] bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">RoboAI Hỗ trợ Kỹ thuật</div>
            <div className="text-[10px] text-emerald-400">
              AI máy chủ • Gemini nếu đã cấu hình
            </div>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Thu nhỏ RoboAI"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                m.role === 'user'
                  ? 'bg-cyan-500 text-slate-950 font-medium'
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-slate-400 italic">RoboAI đang phân tích dữ liệu...</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi về PID, ESP32, ROS2, cảm biến..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
