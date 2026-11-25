import React, { useState, useEffect } from 'react';
import { GitFork, Star, Plus, Cpu, Radio, RefreshCw, ExternalLink, X } from 'lucide-react';
import { AI_NEWS_POOL } from '../data/roboticsData';

export default function OpenSourceAndAiNews({ projects, onAddProject, onStarProject, currentUser }) {
  const [newsList, setNewsList] = useState(AI_NEWS_POOL.slice(0, 3));
  const [isUpdating, setIsUpdating] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [form, setForm] = useState({ name: '', tags: '', description: '', bom: '' });

  const refreshAiNews = () => {
    setIsUpdating(true);
    setTimeout(() => {
      const shuffled = [...AI_NEWS_POOL].sort(() => 0.5 - Math.random());
      setNewsList(shuffled.slice(0, 3));
      setIsUpdating(false);
    }, 600);
  };

  useEffect(() => {
    if (!autoUpdate) return;
    const timer = setInterval(refreshAiNews, 25000);
    return () => clearInterval(timer);
  }, [autoUpdate]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;
    onAddProject({
      id: `proj-${Date.now()}`,
      name: form.name.trim(),
      author: currentUser.name,
      authorRank: currentUser.rankName,
      license: 'MIT Open Source',
      stars: 1,
      forks: 0,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      description: form.description.trim(),
      bom: form.bom
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean),
      repoUrl: 'https://github.com/trang-sang-tao-robotics',
    });
    setForm({ name: '', tags: '', description: '', bom: '' });
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6">
      {/* AI Auto-Updating News Radar */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-400" />
              AI Radar — Tự động cập nhật công nghệ Robotics
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
                className="accent-cyan-400"
              />
              Tự cập nhật (25s)
            </label>
            <button
              onClick={refreshAiNews}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 hover:bg-indigo-500/30 text-xs font-medium transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              AI Cập nhật ngay
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {newsList.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 hover:border-indigo-500/40 transition"
            >
              <div className="flex items-center justify-between text-[11px] text-indigo-300 mb-1.5">
                <span className="font-semibold">{item.category}</span>
                <span className="text-slate-500">{item.time}</span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.summary}</p>
              <div className="mt-3 text-[11px] text-slate-500">{item.source}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Open Source Projects */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Kho Dự án Mã nguồn mở
          </h2>
          <p className="text-sm text-slate-400">
            Khám phá sơ đồ mạch, danh sách linh kiện (BOM) và mã nguồn mở từ cộng đồng.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition"
        >
          <Plus className="w-4 h-4" /> Đăng dự án (+60 XP)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-500/40 transition"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-medium">
                  {proj.license}
                </span>
                <span>bởi {proj.author}</span>
              </div>
              <h3 className="text-base font-bold text-white">{proj.name}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{proj.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {proj.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onStarProject(proj.id)}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  <Star className="w-4 h-4 fill-amber-400/20" /> {proj.stars}
                </button>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <GitFork className="w-3.5 h-3.5" /> {proj.forks}
                </span>
              </div>
              <button
                onClick={() => setSelectedProject(proj)}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                Xem BOM & Code <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedProject.name}</h3>
                <p className="text-xs text-slate-400">
                  Tác giả: {selectedProject.author} ({selectedProject.authorRank})
                </p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-300">{selectedProject.description}</p>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
                Danh sách linh kiện (BOM)
              </h4>
              <ul className="space-y-1.5">
                {selectedProject.bom.map((b, idx) => (
                  <li key={idx} className="text-xs text-slate-300 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                    • {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Chia sẻ Dự án Mã nguồn mở</h3>
              <button type="button" onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              required
              placeholder="Tên dự án (VD: Xe dò line PID ESP32)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
            <input
              placeholder="Tags (cách nhau bằng dấu phẩy: ESP32, PID, C++)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
            <textarea
              required
              rows={3}
              placeholder="Mô tả cách hoạt động..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
            <input
              placeholder="Linh kiện chính (cách nhau bằng dấu phẩy)"
              value={form.bom}
              onChange={(e) => setForm({ ...form, bom: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm"
            >
              Đăng dự án ngay
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
