import React, { useState } from 'react';
import { Newspaper, ArrowRight, Sparkles, Clock, User, BookOpen, Cpu, MessageSquare } from 'lucide-react';

export default function TechArticlesHub({ articles, onNavigateTab, onAskAi }) {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [activeArticle, setActiveArticle] = useState(articles[0] || null);

  const categories = ['Tất cả', 'ROS2 & Drone', 'Phần cứng & Mạch', 'AI & Thị giác', 'Tự động hóa'];

  const filtered =
    selectedCategory === 'Tất cả'
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Wix-style Editorial Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-cyan-50 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/60 p-7 sm:p-10 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
            <Cpu className="w-3.5 h-3.5" /> Trang sáng tạo Robotics • Cổng Công nghệ & Kỹ thuật
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Kiến tạo Hệ thống Robot Thông minh & Cộng đồng Kỹ sư Thực chiến
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Đọc các bài phân tích chuyên sâu về công nghệ Robot, học lập trình vi điều khiển – ROS2, trao đổi linh kiện cùng người bán uy tín và trò chuyện trực tiếp đa thiết bị.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('learn')}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
            >
              <BookOpen className="w-4 h-4" /> Bắt đầu Học Kỹ thuật
            </button>
            <button
              onClick={() => onNavigateTab('discord')}
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-cyan-500 font-semibold text-sm flex items-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4 text-cyan-500" /> Nhắn tin Cộng đồng
            </button>
          </div>
        </div>
      </section>

      {/* Tech Articles Section */}
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-cyan-500" />
              Bài viết & Thông tin Công nghệ Mới nhất
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kiến thức chuyên sâu được biên tập bởi đội ngũ kỹ sư & Gemini AI.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-cyan-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Articles List */}
          <div className="lg:col-span-5 space-y-3">
            {filtered.map((art) => {
              const isSelected = activeArticle?.id === art.id;
              return (
                <button
                  key={art.id}
                  onClick={() => setActiveArticle(art)}
                  className={`w-full text-left p-4 rounded-2xl border transition ${
                    isSelected
                      ? 'bg-cyan-50/80 dark:bg-cyan-950/30 border-cyan-500 shadow-md'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-cyan-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
                    <span>{art.category}</span>
                    <span className="text-slate-400">{art.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                    {art.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">
                    {art.summary}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {art.author}
                    </span>
                    <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-semibold">
                      Đọc bài <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Article Reader */}
          {activeArticle && (
            <article className="lg:col-span-7 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 text-xs font-bold">
                    {activeArticle.category}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {activeArticle.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {activeArticle.readTime}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-4 leading-snug">
                  {activeArticle.title}
                </h3>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-3 italic border-l-2 border-cyan-500 pl-3">
                  {activeArticle.summary}
                </p>

                <div className="mt-5 text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {activeArticle.content}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500">Ngày đăng: {activeArticle.date}</span>
                <button
                  onClick={() =>
                    onAskAi(`Hãy tóm tắt và mở rộng thêm kiến thức thực tế cho bài viết: "${activeArticle.title}"`)
                  }
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600/25 text-xs font-semibold transition"
                >
                  <Sparkles className="w-4 h-4" /> Phân tích sâu hơn với Gemini AI
                </button>
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
