import React, { useState } from 'react';
import {
  Shield,
  Users,
  Cpu,
  ShoppingBag,
  Mail,
  Trash2,
  PlusCircle,
  Check,
  Newspaper,
  Sparkles,
  Wifi,
  KeyRound,
} from 'lucide-react';
import { INITIAL_LEADERBOARD } from '../data/roboticsData';
import { getTierByXp } from '../utils/rankSystem';

export default function AdminDashboard({
  articles,
  onAddArticle,
  onDeleteArticle,
  projects,
  onDeleteProject,
  marketItems,
  onAddMarketItem,
  onDeleteMarketItem,
  emailConfig,
  onSaveEmailConfig,
  firebaseUrl,
  onSaveFirebaseUrl,
  currentUser,
}) {
  const [section, setSection] = useState('articles'); // 'articles' | 'seller' | 'members' | 'settings'
  const [members, setMembers] = useState(INITIAL_LEADERBOARD);

  // Article composer + Gemini AI
  const [artForm, setArtForm] = useState({
    title: '',
    category: 'AI & Thị giác',
    summary: '',
    content: '',
  });
  const [aiTopic, setAiTopic] = useState('');
  const [generating, setGenerating] = useState(false);

  // Seller product form
  const [prodForm, setProdForm] = useState({
    title: '',
    price: '',
    category: 'Cảm biến',
    condition: 'Mới 100%',
    location: 'TP. Hồ Chí Minh',
    description: '',
  });

  // Config states
  const [cfg, setCfg] = useState(emailConfig);
  const [fbUrl, setFbUrl] = useState(firebaseUrl || '');
  const [savedNotice, setSavedNotice] = useState('');

  const handleGenerateWithGemini = async () => {
    if (!aiTopic.trim()) return;
    const promptText = `Viết một bài thông tin công nghệ Robotics ngắn gọn, chuyên sâu bằng tiếng Việt về chủ đề: "${aiTopic}". Trả về JSON thuần (không markdown) gồm 3 trường: title, summary, content.`;

    setGenerating(true);
    try {
      let raw = '';
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) raw = data.text;

      if (raw) {
        const cleaned = raw.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        setArtForm((prev) => ({
          ...prev,
          title: parsed.title || aiTopic,
          summary: parsed.summary || '',
          content: parsed.content || raw,
        }));
      } else {
        setArtForm({
          title: `Phân tích kỹ thuật: ${aiTopic.trim()}`,
          category: 'AI & Thị giác',
          summary: `Tổng quan ứng dụng và kiến trúc triển khai "${aiTopic.trim()}" trong hệ thống Robotics hiện đại.`,
          content: `1. Giới thiệu công nghệ "${aiTopic.trim()}":\nĐây là hướng tiếp cận quan trọng giúp tối ưu hiệu năng điều khiển và khả năng tự hành của robot.\n\n(💡 Nhập Gemini API Key trong tab "Cấu hình Tích hợp" hoặc gắn GEMINI_API_KEY trên Cloudflare Pages để Gemini tự động viết bài!)`,
        });
      }
    } catch {
      setArtForm((prev) => ({
        ...prev,
        title: aiTopic,
        content: 'Không gọi được Gemini API (kiểm tra lại API Key). Bạn có thể tự nhập nội dung bài viết tại đây.',
      }));
    } finally {
      setGenerating(false);
    }
  };

  const handlePublishArticle = (e) => {
    e.preventDefault();
    if (!artForm.title.trim() || !artForm.content.trim()) return;
    onAddArticle({
      id: `art-${Date.now()}`,
      title: artForm.title.trim(),
      category: artForm.category,
      author: currentUser.name,
      date: new Date().toLocaleDateString('vi-VN'),
      readTime: '5 phút đọc',
      summary: artForm.summary.trim() || artForm.content.slice(0, 120) + '...',
      content: artForm.content.trim(),
    });
    setArtForm({ title: '', category: 'AI & Thị giác', summary: '', content: '' });
    setAiTopic('');
    setSavedNotice('Đã đăng bài viết công nghệ mới lên trang chủ!');
    setTimeout(() => setSavedNotice(''), 2500);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!prodForm.title.trim() || !prodForm.price) return;
    onAddMarketItem({
      id: `item-${Date.now()}`,
      title: prodForm.title.trim(),
      price: Number(prodForm.price),
      condition: prodForm.condition,
      category: prodForm.category,
      location: prodForm.location,
      seller: currentUser.name,
      sellerRank: currentUser.rankName,
      description: prodForm.description.trim() || 'Sản phẩm chính hãng từ Khu vực Người bán.',
      imageEmoji: '🤖',
    });
    setProdForm({
      title: '',
      price: '',
      category: 'Cảm biến',
      condition: 'Mới 100%',
      location: 'TP. Hồ Chí Minh',
      description: '',
    });
    setSavedNotice('Đã đăng sản phẩm mới lên Chợ Linh kiện!');
    setTimeout(() => setSavedNotice(''), 2500);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    onSaveEmailConfig(cfg);
    onSaveFirebaseUrl(fbUrl.trim());
    setSavedNotice('Đã lưu cấu hình đồng bộ & Gmail!');
    setTimeout(() => setSavedNotice(''), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500/10 via-white to-indigo-500/10 dark:from-rose-950/60 dark:via-slate-900 dark:to-slate-900 border border-rose-500/30 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4" /> Khu vực Quản trị & Người bán (Seller & Admin Studio)
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Quản lý Nội dung, Bán hàng & Tích hợp Gemini AI
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tài khoản hiện tại: <strong className="text-slate-900 dark:text-white">{currentUser.name}</strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'articles', label: 'Đăng Bài Công nghệ + Gemini', icon: Newspaper },
            { id: 'seller', label: 'Quản lý Gian hàng', icon: ShoppingBag },
            { id: 'members', label: 'Thành viên & Kiểm duyệt', icon: Users },
            { id: 'settings', label: 'Cấu hình Gemini & Đồng bộ', icon: KeyRound },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setSection(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  section === t.id
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4" /> {savedNotice}
        </div>
      )}

      {/* SECTION 1: Tech Articles + Gemini AI */}
      {section === 'articles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Viết bài Thông tin Công nghệ mới (Tích hợp Gemini)
            </h3>
            <div className="flex gap-2">
              <input
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="Nhập chủ đề để Gemini tự soạn bài (VD: Động cơ BLDC cho Robot 4 chân)..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
              <button
                type="button"
                disabled={generating}
                onClick={handleGenerateWithGemini}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" /> {generating ? 'Gemini đang viết...' : 'Gemini viết bài'}
              </button>
            </div>

            <form onSubmit={handlePublishArticle} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  required
                  placeholder="Tiêu đề bài viết"
                  value={artForm.title}
                  onChange={(e) => setArtForm({ ...artForm, title: e.target.value })}
                  className="sm:col-span-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
                />
                <select
                  value={artForm.category}
                  onChange={(e) => setArtForm({ ...artForm, category: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white"
                >
                  <option>AI & Thị giác</option>
                  <option>ROS2 & Drone</option>
                  <option>Phần cứng & Mạch</option>
                  <option>Tự động hóa</option>
                </select>
              </div>
              <input
                placeholder="Tóm tắt ngắn"
                value={artForm.summary}
                onChange={(e) => setArtForm({ ...artForm, summary: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
              />
              <textarea
                required
                rows={6}
                placeholder="Nội dung chi tiết bài viết công nghệ..."
                value={artForm.content}
                onChange={(e) => setArtForm({ ...artForm, content: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm"
              >
                Đăng bài lên Trang chủ Công nghệ
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Danh sách Bài viết ({articles.length})</h3>
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto">
              {articles.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{a.title}</div>
                    <div className="text-[11px] text-slate-500">{a.category} • {a.date}</div>
                  </div>
                  <button
                    onClick={() => onDeleteArticle(a.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/15 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Seller Store Management */}
      {section === 'seller' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleAddProduct}
            className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3.5"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Đăng sản phẩm mới (Người bán)</h3>
            <input
              required
              placeholder="Tên linh kiện / Kit Robot"
              value={prodForm.title}
              onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                type="number"
                placeholder="Giá bán (VNĐ)"
                value={prodForm.price}
                onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
              />
              <select
                value={prodForm.category}
                onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white"
              >
                <option>Cảm biến</option>
                <option>Vi điều khiển</option>
                <option>Động cơ</option>
                <option>Khung cơ khí</option>
              </select>
            </div>
            <textarea
              rows={3}
              placeholder="Thông số kỹ thuật & bảo hành..."
              value={prodForm.description}
              onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm"
            >
              Đăng bán lên Chợ Linh kiện
            </button>
          </form>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Sản phẩm đang niêm yết ({marketItems.length})
            </h3>
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
              {marketItems.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{it.title}</div>
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                      {it.price.toLocaleString('vi-VN')} đ • Người bán: {it.seller}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteMarketItem(it.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/15"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Members & Open-Source Moderation */}
      {section === 'members' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-500" /> Quản lý Thành viên & XP
            </h3>
            {members.map((m) => {
              const tier = getTierByXp(m.xp);
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {m.name} ({tier.badge} {tier.name})
                    </div>
                    <div className="text-[11px] text-slate-500">{m.xp} XP</div>
                  </div>
                  <button
                    onClick={() =>
                      setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, xp: x.xp + 200 } : x)))
                    }
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> +200 XP
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-500" /> Kiểm duyệt Dự án Mã nguồn mở
            </h3>
            {projects.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</div>
                  <div className="text-[11px] text-slate-500">bởi {p.author}</div>
                </div>
                <button
                  onClick={() => onDeleteProject(p.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/15"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: Integrations (Gemini, Cross-Device Sync, Gmail) */}
      {section === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 max-w-3xl"
        >
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" /> 1. Tích hợp Google Gemini API
            </h3>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-3 text-xs text-slate-600 dark:text-slate-300">
              Gemini dùng khóa API phía máy chủ. Thêm <code>GEMINI_API_KEY</code> trong Vercel → Project Settings → Environment Variables. Khóa sẽ không được lưu trong trình duyệt.
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-500" /> 2. Kết nối Đồng bộ Đa thiết bị (Máy này nhắn máy kia nghe)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dán URL <strong>Firebase Realtime Database</strong> (VD: <code>https://ten-du-an-default-rtdb.firebaseio.com</code>) hoặc gắn KV Namespace tên <code>ROBOTICS_KV</code> trên Cloudflare Pages để mọi tài khoản trên các máy khác nhau cùng xem tin nhắn & bài viết theo thời gian thực.
            </p>
            <input
              placeholder="https://your-project-default-rtdb.firebaseio.com"
              value={fbUrl}
              onChange={(e) => setFbUrl(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-500" /> 3. Cấu hình gửi mã OTP về Gmail (EmailJS)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                placeholder="Service ID"
                value={cfg.serviceId}
                onChange={(e) => setCfg({ ...cfg, serviceId: e.target.value })}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
              <input
                placeholder="Template ID"
                value={cfg.templateId}
                onChange={(e) => setCfg({ ...cfg, templateId: e.target.value })}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
              <input
                placeholder="Public Key"
                value={cfg.publicKey}
                onChange={(e) => setCfg({ ...cfg, publicKey: e.target.value })}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
          >
            Lưu toàn bộ cấu hình
          </button>
        </form>
      )}
    </div>
  );
}
