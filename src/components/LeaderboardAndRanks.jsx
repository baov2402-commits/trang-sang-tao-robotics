import React from 'react';
import { Award, Crown, Flame, FolderGit2 } from 'lucide-react';
import { TIERS, getTierByXp, getNextTierProgress } from '../utils/rankSystem';
import { INITIAL_LEADERBOARD } from '../data/roboticsData';

export default function LeaderboardAndRanks({ currentUser }) {
  const progress = getNextTierProgress(currentUser.xp);

  const combined = [
    ...INITIAL_LEADERBOARD,
    {
      id: 'me',
      name: `${currentUser.name} (Bạn)`,
      xp: currentUser.xp,
      projects: currentUser.projectsCount,
      streak: 1,
      specialty: 'Robotics & Sáng tạo',
      isMe: true,
    },
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div className="space-y-6">
      {/* User Progress Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/50 border border-cyan-500/30 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
              Cấp bậc hiện tại của bạn
            </span>
            <h2 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
              <span>{progress.current.badge}</span> {progress.current.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{progress.current.desc}</p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-2xl font-black text-amber-400">{currentUser.xp.toLocaleString()} XP</div>
            {progress.next ? (
              <div className="text-xs text-slate-400">
                Còn <strong className="text-white">{progress.remaining} XP</strong> để lên{' '}
                <strong className="text-cyan-300">{progress.next.name}</strong>
              </div>
            ) : (
              <div className="text-xs text-rose-400 font-semibold">Bạn đã đạt cấp bậc tối đa!</div>
            )}
          </div>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden mt-4 border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {/* Tier System Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {TIERS.map((tier) => {
          const isCurrent = tier.id === progress.current.id;
          return (
            <div
              key={tier.id}
              className={`rounded-xl p-4 border transition ${
                isCurrent ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/10' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="text-2xl mb-1">{tier.badge}</div>
              <div className={`text-sm font-bold ${tier.color}`}>{tier.name}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {tier.minXp.toLocaleString()} {tier.maxXp === Infinity ? '+ XP' : `- ${tier.maxXp.toLocaleString()} XP`}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{tier.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" /> Bảng xếp hạng Kỹ sư Robotics
          </h3>
          <span className="text-xs text-slate-400">Cập nhật theo thời gian thực</span>
        </div>
        <div className="divide-y divide-slate-800/80">
          {combined.map((member, index) => {
            const tier = getTierByXp(member.xp);
            return (
              <div
                key={member.id}
                className={`flex flex-wrap items-center justify-between gap-4 px-5 py-4 ${
                  member.isMe ? 'bg-cyan-500/10' : 'hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : index === 1
                        ? 'bg-slate-300/20 text-slate-200'
                        : index === 2
                        ? 'bg-orange-500/20 text-orange-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      {member.name}
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${tier.bg} ${tier.color}`}>
                        {tier.badge} {tier.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{member.specialty}</div>
                  </div>
                </div>

                <div className="flex items-center gap-5 text-xs">
                  <span className="flex items-center gap-1 text-slate-400">
                    <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" /> {member.projects} dự án
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> {member.streak} ngày
                  </span>
                  <span className="flex items-center gap-1 font-bold text-amber-400 text-sm">
                    <Award className="w-4 h-4" /> {member.xp.toLocaleString()} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
