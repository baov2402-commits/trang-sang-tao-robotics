import React, { useState } from 'react';
import { Hash, Volume2, Send, Users, SmilePlus, Radio } from 'lucide-react';
import { DISCORD_CHANNELS, AI_NEWS_POOL } from '../data/roboticsData';

export default function DiscordServer({ messagesByChannel, onSendMessage, onReactMessage, currentUser }) {
  const [activeChannelId, setActiveChannelId] = useState('chung');
  const [input, setInput] = useState('');
  const [inVoice, setInVoice] = useState(false);

  const activeChannel = DISCORD_CHANNELS.find((c) => c.id === activeChannelId) || DISCORD_CHANNELS[0];
  const messages = messagesByChannel[activeChannelId] || [];

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    onSendMessage(activeChannelId, {
      id: `msg-${Date.now()}`,
      author: currentUser.name,
      rank: currentUser.rankName,
      avatar: currentUser.badge,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      text,
      reactions: {},
    });

    // Bot command responses
    if (text.startsWith('/help')) {
      setTimeout(() => {
        onSendMessage(activeChannelId, {
          id: `bot-${Date.now()}`,
          author: 'RoboAI Bot',
          rank: 'AI Assistant',
          avatar: '⚡',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          text: 'Các lệnh hỗ trợ: `/help` (xem hướng dẫn), `/tinmoi` (lấy tin tức Robotics mới nhất từ AI Radar).',
          reactions: { '🤖': 1 },
        });
      }, 300);
    } else if (text.startsWith('/tinmoi')) {
      const news = AI_NEWS_POOL[Math.floor(Math.random() * AI_NEWS_POOL.length)];
      setTimeout(() => {
        onSendMessage(activeChannelId, {
          id: `bot-${Date.now()}`,
          author: 'RoboAI Bot',
          rank: 'AI Assistant',
          avatar: '⚡',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          text: `📡 [${news.category}] ${news.title} — ${news.summary}`,
          reactions: { '🔥': 2 },
        });
      }, 300);
    }

    setInput('');
  };

  const onlineMembers = [
    { name: 'Hoàng Nam', badge: '👑', status: 'Đang code Drone PID' },
    { name: 'Minh Khoa', badge: '🚀', status: 'Chạy Gazebo ROS2' },
    { name: 'Lan Anh', badge: '⚙️', status: 'Thiết kế CAD 3D' },
    { name: currentUser.name, badge: currentUser.badge, status: 'Trực tuyến' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
      {/* Channels Sidebar */}
      <div className="lg:col-span-3 bg-slate-950/90 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 flex flex-col justify-between">
        <div>
          <div className="font-bold text-white text-sm pb-3 border-b border-slate-800 flex items-center justify-between">
            <span>🤖 Server Robotics VN</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Online</span>
          </div>

          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              Kênh thảo luận
            </div>
            <div className="space-y-1">
              {DISCORD_CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    activeChannelId === ch.id
                      ? 'bg-cyan-500/15 text-cyan-300'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Hash className="w-4 h-4 shrink-0" />
                  <span className="truncate">{ch.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              Phòng Voice Lab
            </div>
            <button
              onClick={() => setInVoice(!inVoice)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs border transition ${
                inVoice
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" /> Phòng Lab Chung
              </span>
              <span className="text-[10px]">{inVoice ? 'Đã vào' : '3 người'}</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-base">
            {currentUser.badge}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
            <div className="text-[11px] text-cyan-400 truncate">{currentUser.rankName}</div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-6 flex flex-col justify-between bg-slate-900/50">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-cyan-400" /> {activeChannel.name}
            </h3>
            <p className="text-[11px] text-slate-400">{activeChannel.topic}</p>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[420px]">
          {messages.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-12">
              Chưa có tin nhắn nào trong #{activeChannel.name}. Hãy là người đầu tiên chia sẻ!
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="group flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0">
                  {msg.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">{msg.author}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">{msg.rank}</span>
                    <span className="text-[10px] text-slate-500">{msg.time}</span>
                  </div>
                  <p className="text-sm text-slate-200 mt-1 break-words">{msg.text}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {Object.entries(msg.reactions || {}).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => onReactMessage(activeChannelId, msg.id, emoji)}
                        className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700"
                      >
                        {emoji} {count}
                      </button>
                    ))}
                    <button
                      onClick={() => onReactMessage(activeChannelId, msg.id, '🔥')}
                      className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white transition"
                      title="Thả cảm xúc"
                    >
                      <SmilePlus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Nhắn vào #${activeChannel.name} (thử gõ /help hoặc /tinmoi)...`}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" /> Gửi
          </button>
        </form>
      </div>

      {/* Members Sidebar */}
      <div className="lg:col-span-3 bg-slate-950/60 border-t lg:border-t-0 lg:border-l border-slate-800 p-4">
        <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-3">
          <Users className="w-4 h-4 text-cyan-400" /> Thành viên trực tuyến ({onlineMembers.length})
        </div>
        <div className="space-y-3">
          {onlineMembers.map((m, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm">
                {m.badge}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{m.name}</div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-emerald-400" /> {m.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
