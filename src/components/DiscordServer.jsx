import React, { useState } from 'react';
import { Hash, Volume2, Send, Users, SmilePlus, Radio, Wifi, RefreshCw } from 'lucide-react';
import { DISCORD_CHANNELS } from '../data/roboticsData';

export default function DiscordServer({
  messagesByChannel,
  onSendMessage,
  onReactMessage,
  currentUser,
  syncMode,
  onManualSync,
}) {
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
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: currentUser.name,
      email: currentUser.email || 'Khách',
      rank: currentUser.rankName,
      avatar: currentUser.badge,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      text,
      reactions: {},
    });

    setInput('');
  };

  const syncLabel =
    syncMode === 'firebase'
      ? 'Đồng bộ Đa thiết bị (Firebase)'
      : syncMode === 'cloudflare-kv'
      ? 'Đồng bộ Đa thiết bị (Cloudflare KV)'
      : 'Đồng bộ Tab nội bộ (Chưa nối DB)';

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px] shadow-sm">
      {/* Channels Sidebar */}
      <div className="lg:col-span-3 bg-slate-50 dark:bg-slate-950/90 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between">
        <div>
          <div className="font-bold text-slate-900 dark:text-white text-sm pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span>🤖 Kênh Cộng đồng</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              Live
            </span>
          </div>

          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              Kênh thảo luận liên kết
            </div>
            <div className="space-y-1">
              {DISCORD_CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    activeChannelId === ch.id
                      ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
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
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" /> Phòng Lab Chung
              </span>
              <span className="text-[10px]">{inVoice ? 'Đang kết nối' : 'Sẵn sàng'}</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-base">
            {currentUser.badge}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</div>
            <div className="text-[11px] text-cyan-600 dark:text-cyan-400 truncate">{currentUser.rankName}</div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-6 flex flex-col justify-between bg-white dark:bg-slate-900/50">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-cyan-500" /> {activeChannel.name}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{activeChannel.topic}</p>
          </div>
          <button
            onClick={onManualSync}
            title="Đồng bộ tin nhắn mới nhất"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
              syncMode === 'local'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
            }`}
          >
            <Wifi className="w-3 h-3" /> {syncLabel} <RefreshCw className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[420px]">
          {messages.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-12">
              Chưa có tin nhắn nào trong #{activeChannel.name}. Hãy gửi tin nhắn để các tài khoản khác cùng xem!
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="group flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg shrink-0">
                  {msg.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{msg.author}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300">
                      {msg.rank}
                    </span>
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 mt-1 break-words">{msg.text}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {Object.entries(msg.reactions || {}).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => onReactMessage(activeChannelId, msg.id, emoji)}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {emoji} {count}
                      </button>
                    ))}
                    <button
                      onClick={() => onReactMessage(activeChannelId, msg.id, '👍')}
                      className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
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

        <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Nhắn vào #${activeChannel.name} (tài khoản khác sẽ cùng nhận được)...`}
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" /> Gửi
          </button>
        </form>
      </div>

      {/* Connected Account Info */}
      <div className="lg:col-span-3 bg-slate-50 dark:bg-slate-950/60 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-cyan-500" /> Tài khoản đang kết nối
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-base">{currentUser.badge}</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Radio className="w-3 h-3" /> Đang trực tuyến
          </div>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          💡 Để <strong>máy này nhắn là máy kia nghe ngay</strong> trên mọi thiết bị khác nhau, Quản trị viên chỉ cần dán URL <strong>Firebase Realtime Database</strong> (miễn phí) hoặc gắn <strong>Cloudflare KV</strong> trong mục <strong>Quản trị / Người bán</strong>.
        </p>
      </div>
    </div>
  );
}
