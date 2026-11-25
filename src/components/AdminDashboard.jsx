import React, { useState } from 'react';
import { Shield, Users, Cpu, ShoppingBag, Mail, Trash2, PlusCircle, Check } from 'lucide-react';
import { INITIAL_LEADERBOARD } from '../data/roboticsData';
import { getTierByXp } from '../utils/rankSystem';

export default function AdminDashboard({
  projects,
  onDeleteProject,
  marketItems,
  onDeleteMarketItem,
  emailConfig,
  onSaveEmailConfig,
  currentUser,
}) {
  const [members, setMembers] = useState(INITIAL_LEADERBOARD);
  const [cfg, setCfg] = useState(emailConfig);
  const [savedNotice, setSavedNotice] = useState(false);

  const boostMemberXp = (id, delta) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, xp: Math.max(0, m.xp + delta) } : m))
    );
  };

  const handleSaveCfg = (e) => {
    e.preventDefault();
    onSaveEmailConfig(cfg);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4" /> Cổng Quản trị viên (Admin Portal)
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">
            Bảng điều khiển Hệ thống — Trang sáng tạo Robotics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Đang đăng nhập với quyền Quản trị: <strong className="text-white">{currentUser.email}</strong>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{members.length + 1}</div>
            <div className="text-xs text-slate-400">Thành viên đang hoạt động</div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{projects.length}</div>
            <div className="text-xs text-slate-400">Dự án Mã nguồn mở</div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{marketItems.length}</div>
            <div className="text-xs text-slate-400">Tin đăng Chợ linh kiện</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Member Management */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" /> Quản lý Thành viên & Phân cấp
          </h3>
          <div className="space-y-2.5">
            {members.map((m) => {
              const tier = getTierByXp(m.xp);
              return (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-bold text-white">
                      {m.name}{' '}
                      <span className="text-[11px] font-normal text-cyan-300">
                        ({tier.badge} {tier.name})
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{m.xp} XP • {m.specialty}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => boostMemberXp(m.id, 200)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> +200 XP
                    </button>
                    <button
                      onClick={() => boostMemberXp(m.id, -200)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
                    >
                      -200 XP
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gmail OTP Config */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-400" /> Cấu hình Gửi mã OTP về Gmail (EmailJS)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Vì web chạy tĩnh trên GitHub + Cloudflare Pages, bạn có thể điền thông tin tài khoản miễn phí từ{' '}
            <strong>EmailJS</strong> để hệ thống gửi mã xác thực thật tới Gmail người đăng ký mới.
          </p>
          <form onSubmit={handleSaveCfg} className="space-y-3">
            <input
              placeholder="EmailJS Service ID (VD: service_xxx)"
              value={cfg.serviceId}
              onChange={(e) => setCfg({ ...cfg, serviceId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <input
              placeholder="EmailJS Template ID (VD: template_xxx)"
              value={cfg.templateId}
              onChange={(e) => setCfg({ ...cfg, templateId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <input
              placeholder="EmailJS Public Key"
              value={cfg.publicKey}
              onChange={(e) => setCfg({ ...cfg, publicKey: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
            >
              {savedNotice ? <Check className="w-4 h-4" /> : null}
              {savedNotice ? 'Đã lưu cấu hình Gmail!' : 'Lưu cấu hình gửi mã Gmail'}
            </button>
          </form>
        </div>
      </div>

      {/* Content Moderation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Kiểm duyệt Dự án Mã nguồn mở</h3>
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5">
              <div className="min-w-0 pr-2">
                <div className="text-xs font-bold text-white truncate">{p.name}</div>
                <div className="text-[11px] text-slate-400">bởi {p.author}</div>
              </div>
              <button
                onClick={() => onDeleteProject(p.id)}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/15"
                title="Xóa dự án"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Kiểm duyệt Chợ Linh kiện</h3>
          {marketItems.map((it) => (
            <div key={it.id} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5">
              <div className="min-w-0 pr-2">
                <div className="text-xs font-bold text-white truncate">{it.title}</div>
                <div className="text-[11px] text-slate-400">
                  {it.price.toLocaleString('vi-VN')} đ • {it.seller}
                </div>
              </div>
              <button
                onClick={() => onDeleteMarketItem(it.id)}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/15"
                title="Xóa tin đăng"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
