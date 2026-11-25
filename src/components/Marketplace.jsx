import React, { useState } from 'react';
import { ShoppingBag, Search, Plus, MapPin, MessageCircle, X } from 'lucide-react';

export default function Marketplace({ items, onAddItem, currentUser }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [showPostModal, setShowPostModal] = useState(false);
  const [chatSeller, setChatSeller] = useState(null);
  const [buyerMsg, setBuyerMsg] = useState('');
  const [sentNotice, setSentNotice] = useState('');

  const [form, setForm] = useState({
    title: '',
    price: '',
    condition: 'Đã qua sử dụng (90%)',
    category: 'Cảm biến',
    location: 'TP. Hồ Chí Minh',
    description: '',
  });

  const categories = ['Tất cả', 'Cảm biến', 'Vi điều khiển', 'Động cơ', 'Khung cơ khí'];

  const filtered = items.filter((it) => {
    const matchCat = category === 'Tất cả' || it.category === category;
    const matchSearch =
      it.title.toLowerCase().includes(search.toLowerCase()) ||
      it.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price) return;
    onAddItem({
      id: `item-${Date.now()}`,
      title: form.title.trim(),
      price: Number(form.price),
      condition: form.condition,
      category: form.category,
      location: form.location,
      seller: currentUser.name,
      sellerRank: currentUser.rankName,
      description: form.description.trim() || 'Linh kiện hoạt động tốt, hỗ trợ test trực tiếp.',
      imageEmoji: '⚙️',
    });
    setForm({
      title: '',
      price: '',
      condition: 'Đã qua sử dụng (90%)',
      category: 'Cảm biến',
      location: 'TP. Hồ Chí Minh',
      description: '',
    });
    setShowPostModal(false);
  };

  const sendToSeller = (e) => {
    e.preventDefault();
    if (!buyerMsg.trim()) return;
    setSentNotice(`Đã gửi tin nhắn tới ${chatSeller.seller}: "${buyerMsg}"`);
    setBuyerMsg('');
    setTimeout(() => {
      setChatSeller(null);
      setSentNotice('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            Chợ Trao đổi & Mua bán Linh kiện Robotics
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Trao đổi đồ án, bán lại cảm biến, động cơ, kit vi điều khiển uy tín trong cộng đồng.
          </p>
        </div>
        <button
          onClick={() => setShowPostModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Đăng bán / Trao đổi
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm cảm biến, LiDAR, Arduino, Servo..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
                category === cat ? 'bg-cyan-500 text-slate-950 font-semibold' : 'bg-slate-900 border border-slate-800 text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-cyan-500/40 transition"
          >
            <div>
              <div className="h-36 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-5xl relative">
                {item.imageEmoji}
                <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-950/80 text-cyan-300 border border-slate-700">
                  {item.category}
                </span>
              </div>
              <div className="p-4">
                <div className="text-lg font-extrabold text-amber-400">
                  {item.price.toLocaleString('vi-VN')} đ
                </div>
                <h3 className="text-sm font-bold text-white mt-1 line-clamp-2">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{item.description}</p>
                <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {item.location} • {item.condition}
                  </div>
                  <div>
                    Người bán: <strong className="text-slate-300">{item.seller}</strong> ({item.sellerRank})
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <button
                onClick={() => setChatSeller(item)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-4 h-4" /> Nhắn tin người bán
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Post Listing Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Đăng tin Bán / Trao đổi</h3>
              <button type="button" onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              required
              placeholder="Tên linh kiện / thiết bị"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                type="number"
                placeholder="Giá (VNĐ)"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white"
              >
                <option>Cảm biến</option>
                <option>Vi điều khiển</option>
                <option>Động cơ</option>
                <option>Khung cơ khí</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Tình trạng"
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
              />
              <input
                placeholder="Khu vực"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
              />
            </div>
            <textarea
              rows={3}
              placeholder="Mô tả chi tiết tình trạng, phụ kiện đi kèm..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
            />
            <button type="submit" className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm">
              Đăng tin ngay
            </button>
          </form>
        </div>
      )}

      {/* Quick Seller Chat Modal */}
      {chatSeller && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={sendToSeller} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Nhắn tin cho {chatSeller.seller}</h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{chatSeller.title}</p>
              </div>
              <button type="button" onClick={() => setChatSeller(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sentNotice ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300">
                {sentNotice}
              </div>
            ) : (
              <>
                <textarea
                  required
                  rows={3}
                  placeholder="Chào bạn, sản phẩm này còn không ạ? Mình muốn hỏi thêm..."
                  value={buyerMsg}
                  onChange={(e) => setBuyerMsg(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                />
                <button type="submit" className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm">
                  Gửi tin nhắn
                </button>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
