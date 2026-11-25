import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Code2, Clock, Sparkles, Copy, Check } from 'lucide-react';
import { INITIAL_COURSES } from '../data/roboticsData';

export default function LearningHub({ completedCourses, onCompleteCourse, onAskAi }) {
  const [selectedCourse, setSelectedCourse] = useState(INITIAL_COURSES[0]);
  const [filterLevel, setFilterLevel] = useState('Tất cả');
  const [copied, setCopied] = useState(false);

  const levels = ['Tất cả', 'Tân binh', 'Kỹ sư tập sự', 'Kỹ sư chính', 'Cấp cao'];

  const filteredCourses =
    filterLevel === 'Tất cả'
      ? INITIAL_COURSES
      : INITIAL_COURSES.filter((c) => c.level === filterLevel);

  const handleCopy = () => {
    navigator.clipboard?.writeText(selectedCourse.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const isCompleted = completedCourses.includes(selectedCourse.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Học viện Công nghệ Robot & Kỹ thuật
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Hoàn thành bài học để tích lũy XP, nâng cấp bậc từ Tân binh lên Cấp cao.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterLevel === lvl
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Course List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredCourses.map((course) => {
            const done = completedCourses.includes(course.id);
            const active = selectedCourse.id === course.id;
            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  active
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                    {course.category} • {course.level}
                  </span>
                  {done ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Đã xong
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-400">+{course.xp} XP</span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white mt-2">{course.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{course.summary}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {course.duration}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Course Detail & Interactive Code */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-cyan-400">
                  {selectedCourse.category} • Cấp độ: {selectedCourse.level}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedCourse.title}</h3>
              </div>
              <button
                onClick={() => onAskAi(`Giải thích chi tiết bài học "${selectedCourse.title}" và cách đấu nối mạch thực tế.`)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600/20 border border-violet-500/40 text-violet-300 hover:bg-violet-600/30 text-xs font-medium transition"
              >
                <Sparkles className="w-4 h-4" /> Hỏi RoboAI về bài này
              </button>
            </div>

            <p className="text-sm text-slate-300 mt-4 leading-relaxed">{selectedCourse.summary}</p>

            <div className="mt-5">
              <div className="flex items-center justify-between bg-slate-950 px-4 py-2 rounded-t-xl border border-b-0 border-slate-800">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-cyan-400" /> Mã nguồn thực hành
                </span>
                <button
                  onClick={handleCopy}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Đã chép' : 'Sao chép'}
                </button>
              </div>
              <pre className="bg-slate-950 border border-slate-800 rounded-b-xl p-4 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed">
                <code>{selectedCourse.codeSnippet}</code>
              </pre>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Phần thưởng: <strong className="text-amber-400">+{selectedCourse.xp} XP</strong>
            </span>
            <button
              disabled={isCompleted}
              onClick={() => onCompleteCourse(selectedCourse)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCompleted ? 'Đã hoàn thành bài học' : 'Đánh dấu hoàn thành & Nhận XP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
