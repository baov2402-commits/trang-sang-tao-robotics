import React, { useState } from 'react';
import { Gamepad2, Zap, Play, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { TECH_QUIZ_QUESTIONS } from '../data/roboticsData';

const MAZE_SIZE = 5;
const START = { x: 0, y: 4 };
const GOAL = { x: 4, y: 0 };
const WALLS = new Set(['1,4', '1,3', '3,1', '3,2', '2,0']);

export default function GamesAndChallenges({ onEarnXp }) {
  const [activeGame, setActiveGame] = useState('maze');

  // --- RoboMaze State ---
  const [robotPos, setRobotPos] = useState(START);
  const [commands, setCommands] = useState([]);
  const [mazeStatus, setMazeStatus] = useState('Lập trình chuỗi bước đi để đưa Robot tới trạm sạc ⚡');
  const [isRunning, setIsRunning] = useState(false);

  // --- Quiz State ---
  const [qIndex, setQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [quizScore, setQuizScore] = useState(0);

  // --- Weekly Challenges ---
  const [joinedChallenges, setJoinedChallenges] = useState([]);

  const addCmd = (dir) => {
    if (isRunning || commands.length >= 14) return;
    setCommands((prev) => [...prev, dir]);
  };

  const resetMaze = () => {
    setRobotPos(START);
    setCommands([]);
    setIsRunning(false);
    setMazeStatus('Đã đặt lại! Hãy lập trình đường đi cho Robot.');
  };

  const runMaze = async () => {
    if (commands.length === 0 || isRunning) return;
    setIsRunning(true);
    let pos = { ...START };
    setRobotPos(pos);
    setMazeStatus('Đang thực thi mã điều khiển...');

    for (let i = 0; i < commands.length; i++) {
      await new Promise((r) => setTimeout(r, 280));
      const cmd = commands[i];
      const next = { ...pos };
      if (cmd === 'UP') next.y -= 1;
      if (cmd === 'DOWN') next.y += 1;
      if (cmd === 'LEFT') next.x -= 1;
      if (cmd === 'RIGHT') next.x += 1;

      if (
        next.x < 0 ||
        next.x >= MAZE_SIZE ||
        next.y < 0 ||
        next.y >= MAZE_SIZE ||
        WALLS.has(`${next.x},${next.y}`)
      ) {
        setMazeStatus('💥 Va chạm tường! Hãy thử chỉnh lại thuật toán.');
        setIsRunning(false);
        return;
      }
      pos = next;
      setRobotPos(pos);
      if (pos.x === GOAL.x && pos.y === GOAL.y) {
        setMazeStatus('🎉 Thành công! Robot đã tới trạm sạc (+100 XP)');
        onEarnXp(100, 'Hoàn thành mê cung RoboMaze');
        setIsRunning(false);
        return;
      }
    }
    setMazeStatus('Hết lệnh nhưng Robot chưa tới đích. Thử thêm bước nhé!');
    setIsRunning(false);
  };

  const currentQ = TECH_QUIZ_QUESTIONS[qIndex];

  const handleAnswer = (idx) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    if (idx === currentQ.answer) {
      setQuizScore((s) => s + 1);
      onEarnXp(30, 'Trả lời đúng Tech Quiz');
    }
  };

  const nextQuestion = () => {
    setSelectedOpt(null);
    setQIndex((prev) => (prev + 1) % TECH_QUIZ_QUESTIONS.length);
  };

  const weeklyChallenges = [
    { id: 'c1', title: 'Thiết kế mạch cầu H không dùng IC chuyên dụng', xp: 150, level: 'Kỹ sư tập sự' },
    { id: 'c2', title: 'Tối ưu thông số PID cho xe vượt góc cua 90 độ', xp: 200, level: 'Kỹ sư chính' },
    { id: 'c3', title: 'Viết Node ROS2 phát hiện vật cản bằng LiDAR', xp: 250, level: 'Cấp cao' },
  ];

  const cmdIcon = (cmd) => {
    if (cmd === 'UP') return '⬆️';
    if (cmd === 'DOWN') return '⬇️';
    if (cmd === 'LEFT') return '⬅️';
    return '➡️';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            Đấu trường Game & Thử thách Kỹ thuật
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Luyện tư duy thuật toán, kiến thức điện tử và cày XP thăng hạng nhanh chóng.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveGame('maze')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeGame === 'maze' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            🤖 RoboMaze Logic
          </button>
          <button
            onClick={() => setActiveGame('quiz')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeGame === 'quiz' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            ⚡ Đố vui Kỹ thuật
          </button>
        </div>
      </div>

      {activeGame === 'maze' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="grid grid-cols-5 gap-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              {Array.from({ length: MAZE_SIZE * MAZE_SIZE }).map((_, idx) => {
                const x = idx % MAZE_SIZE;
                const y = Math.floor(idx / MAZE_SIZE);
                const isRobot = robotPos.x === x && robotPos.y === y;
                const isGoal = GOAL.x === x && GOAL.y === y;
                const isWall = WALLS.has(`${x},${y}`);
                return (
                  <div
                    key={idx}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-xl font-bold border transition ${
                      isWall
                        ? 'bg-slate-800 border-slate-700 text-slate-600'
                        : isRobot
                        ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : isGoal
                        ? 'bg-amber-500/20 border-amber-400'
                        : 'bg-slate-900 border-slate-800/80'
                    }`}
                  >
                    {isRobot ? '🤖' : isGoal ? '⚡' : isWall ? '🧱' : ''}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-cyan-300 mt-4 text-center font-medium">{mazeStatus}</p>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Bảng điều khiển lệnh (Tối đa 14 bước)</h3>
              <p className="text-xs text-slate-400 mt-1">
                Chọn các hướng di chuyển để lập trình đường đi tránh tường gạch 🧱.
              </p>

              <div className="grid grid-cols-4 gap-2 mt-4">
                <button
                  onClick={() => addCmd('UP')}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex flex-col items-center gap-1 text-xs"
                >
                  <ArrowUp className="w-4 h-4 text-cyan-400" /> Tiến
                </button>
                <button
                  onClick={() => addCmd('DOWN')}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex flex-col items-center gap-1 text-xs"
                >
                  <ArrowDown className="w-4 h-4 text-cyan-400" /> Lùi
                </button>
                <button
                  onClick={() => addCmd('LEFT')}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex flex-col items-center gap-1 text-xs"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-400" /> Trái
                </button>
                <button
                  onClick={() => addCmd('RIGHT')}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex flex-col items-center gap-1 text-xs"
                >
                  <ArrowRight className="w-4 h-4 text-cyan-400" /> Phải
                </button>
              </div>

              <div className="mt-4 bg-slate-950 border border-slate-800 rounded-xl p-3 min-h-[76px]">
                <div className="text-[11px] text-slate-500 mb-2">Hàng đợi lệnh ({commands.length}/14):</div>
                <div className="flex flex-wrap gap-1.5">
                  {commands.length === 0 ? (
                    <span className="text-xs text-slate-600 italic">Chưa có lệnh nào...</span>
                  ) : (
                    commands.map((c, i) => (
                      <span key={i} className="px-2 py-1 rounded bg-slate-800 text-sm">
                        {cmdIcon(c)}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={runMaze}
                disabled={isRunning || commands.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> Chạy Robot
              </button>
              <button
                onClick={resetMaze}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Làm lại
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 max-w-3xl mx-auto space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Câu hỏi {qIndex + 1} / {TECH_QUIZ_QUESTIONS.length}
            </span>
            <span className="text-amber-400 font-semibold">Điểm phiên này: {quizScore} đúng (+30 XP/câu)</span>
          </div>
          <h3 className="text-lg font-bold text-white">{currentQ.q}</h3>
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOpt === idx;
              const isCorrect = idx === currentQ.answer;
              let style = 'bg-slate-950 border-slate-800 hover:border-cyan-500/50 text-slate-200';
              if (selectedOpt !== null) {
                if (isCorrect) style = 'bg-emerald-500/20 border-emerald-500 text-emerald-200';
                else if (isSelected) style = 'bg-rose-500/20 border-rose-500 text-rose-200';
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border text-sm transition ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {selectedOpt !== null && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-300">
                <strong className="text-cyan-400">Giải thích:</strong> {currentQ.explain}
              </p>
              <button
                onClick={nextQuestion}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-xs shrink-0"
              >
                Câu tiếp theo →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Weekly Challenges */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-400" /> Thử thách Kỹ thuật Tuần này
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weeklyChallenges.map((ch) => {
            const joined = joinedChallenges.includes(ch.id);
            return (
              <div key={ch.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> +{ch.xp} XP • {ch.level}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-2">{ch.title}</h4>
                </div>
                <button
                  disabled={joined}
                  onClick={() => {
                    setJoinedChallenges((prev) => [...prev, ch.id]);
                    onEarnXp(ch.xp, `Hoàn thành thử thách: ${ch.title}`);
                  }}
                  className={`mt-4 w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    joined
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {joined ? 'Đã nộp thử thách' : 'Nhận & Hoàn thành thử thách'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
