import React, { useState, useEffect } from 'react';
import {
  Bot,
  BookOpen,
  Cpu,
  Gamepad2,
  Trophy,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  Award,
  Shield,
  UserPlus,
  Compass,
  LogOut,
} from 'lucide-react';
import LearningHub from './components/LearningHub';
import OpenSourceAndAiNews from './components/OpenSourceAndAiNews';
import GamesAndChallenges from './components/GamesAndChallenges';
import LeaderboardAndRanks from './components/LeaderboardAndRanks';
import DiscordServer from './components/DiscordServer';
import Marketplace from './components/Marketplace';
import AiAssistantDrawer from './components/AiAssistantDrawer';
import AdminDashboard from './components/AdminDashboard';
import { AuthModal, NewbieGuideModal } from './components/AuthAndOnboardingModal';
import {
  INITIAL_PROJECTS,
  INITIAL_DISCORD_MESSAGES,
  INITIAL_MARKETPLACE,
} from './data/roboticsData';
import { getTierByXp } from './utils/rankSystem';

const BASE_TABS = [
  { id: 'learn', label: 'Học Robotics', icon: BookOpen },
  { id: 'opensource', label: 'Mã nguồn mở & AI', icon: Cpu },
  { id: 'games', label: 'Game & Thử thách', icon: Gamepad2 },
  { id: 'ranks', label: 'Bảng xếp hạng', icon: Trophy },
  { id: 'discord', label: 'Server Cộng đồng', icon: MessageSquare },
  { id: 'market', label: 'Chợ Linh kiện', icon: ShoppingBag },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('learn');
  const [userName, setUserName] = useState(() => localStorage.getItem('robotics_username') || 'Kỹ sư Mới');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('robotics_email') || '');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('robotics_role') || 'guest'); // 'guest' | 'member' | 'admin'
  const [xp, setXp] = useState(() => Number(localStorage.getItem('robotics_xp') || 120));
  const [completedCourses, setCompletedCourses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('robotics_courses') || '[]');
    } catch {
      return [];
    }
  });
  const [emailConfig, setEmailConfig] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('robotics_email_cfg') || '{"serviceId":"","templateId":"","publicKey":""}');
    } catch {
      return { serviceId: '', templateId: '', publicKey: '' };
    }
  });

  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [discordMessages, setDiscordMessages] = useState(INITIAL_DISCORD_MESSAGES);
  const [marketItems, setMarketItems] = useState(INITIAL_MARKETPLACE);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const tier = getTierByXp(xp);
  const currentUser = {
    name: userName,
    email: userEmail,
    role: userRole,
    xp,
    rankName: tier.name,
    badge: tier.badge,
    projectsCount: projects.filter((p) => p.author === userName).length,
  };

  useEffect(() => {
    localStorage.setItem('robotics_xp', String(xp));
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('robotics_courses', JSON.stringify(completedCourses));
  }, [completedCourses]);

  useEffect(() => {
    localStorage.setItem('robotics_username', userName);
    localStorage.setItem('robotics_email', userEmail);
    localStorage.setItem('robotics_role', userRole);
  }, [userName, userEmail, userRole]);

  useEffect(() => {
    localStorage.setItem('robotics_email_cfg', JSON.stringify(emailConfig));
  }, [emailConfig]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const handleEarnXp = (amount, reason) => {
    setXp((prev) => prev + amount);
    showToast(`+${amount} XP • ${reason}`);
  };

  const handleLoginSuccess = ({ name, email, role, isNewUser }) => {
    setUserName(name);
    setUserEmail(email);
    setUserRole(role);
    if (isNewUser) {
      handleEarnXp(50, 'Đăng ký & xác thực Gmail thành công');
      setGuideOpen(true);
    } else if (role === 'admin') {
      setActiveTab('admin');
      showToast('Đã đăng nhập cổng Quản trị viên!');
    } else {
      showToast(`Chào mừng trở lại, ${name}!`);
    }
  };

  const handleLogout = () => {
    setUserRole('guest');
    setUserEmail('');
    if (activeTab === 'admin') setActiveTab('learn');
    showToast('Đã đăng xuất tài khoản.');
  };

  const handleCompleteCourse = (course) => {
    if (completedCourses.includes(course.id)) return;
    setCompletedCourses((prev) => [...prev, course.id]);
    handleEarnXp(course.xp, `Hoàn thành "${course.title}"`);
  };

  const handleAddProject = (proj) => {
    setProjects((prev) => [proj, ...prev]);
    handleEarnXp(60, 'Đóng góp dự án mã nguồn mở');
  };

  const handleStarProject = (id) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, stars: p.stars + 1 } : p)));
  };

  const handleDeleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    showToast('Quản trị viên đã xóa dự án.');
  };

  const handleSendDiscord = (channelId, msg) => {
    setDiscordMessages((prev) => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), msg],
    }));
  };

  const handleReactDiscord = (channelId, msgId, emoji) => {
    setDiscordMessages((prev) => ({
      ...prev,
      [channelId]: (prev[channelId] || []).map((m) => {
        if (m.id !== msgId) return m;
        const count = (m.reactions?.[emoji] || 0) + 1;
        return { ...m, reactions: { ...(m.reactions || {}), [emoji]: count } };
      }),
    }));
  };

  const handleAddMarketItem = (item) => {
    setMarketItems((prev) => [item, ...prev]);
    showToast('Đã đăng sản phẩm lên Chợ Robotics!');
  };

  const handleDeleteMarketItem = (id) => {
    setMarketItems((prev) => prev.filter((it) => it.id !== id));
    showToast('Quản trị viên đã gỡ tin đăng.');
  };

  const handleAskAi = (promptText) => {
    setAiOpen(true);
    setAiPrompt(promptText);
  };

  const tabs =
    userRole === 'admin'
      ? [...BASE_TABS, { id: 'admin', label: 'Quản trị (Admin)', icon: Shield }]
      : BASE_TABS;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bot className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                Trang sáng tạo Robotics
              </h1>
              <p className="text-[11px] text-cyan-400 font-medium">
                Học Kỹ thuật • Mã nguồn mở • AI Radar • Cộng đồng & Chợ Linh kiện
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setGuideOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:border-cyan-500 text-xs font-semibold transition"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" /> Hướng dẫn Tân binh
            </button>

            <button
              onClick={() => setAiOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 hover:bg-indigo-500/30 text-xs font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5" /> RoboAI
            </button>

            {userRole === 'guest' ? (
              <button
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition"
              >
                <UserPlus className="w-3.5 h-3.5" /> Đăng ký / Đăng nhập
              </button>
            ) : (
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-lg">{tier.badge}</span>
              <div>
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white w-24 focus:outline-none border-b border-transparent focus:border-cyan-500"
                  title="Nhấn để đổi tên hiển thị"
                />
                <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                  <Award className="w-3 h-3" /> {tier.name} • {xp} XP
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1.5 overflow-x-auto pb-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const isAdminTab = tab.id === 'admin';
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? isAdminTab
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : isAdminTab
                    ? 'text-rose-300 hover:bg-rose-500/15'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-5 z-50 bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xl animate-bounce">
          {toast}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'learn' && (
          <LearningHub
            completedCourses={completedCourses}
            onCompleteCourse={handleCompleteCourse}
            onAskAi={handleAskAi}
          />
        )}
        {activeTab === 'opensource' && (
          <OpenSourceAndAiNews
            projects={projects}
            onAddProject={handleAddProject}
            onStarProject={handleStarProject}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'games' && <GamesAndChallenges onEarnXp={handleEarnXp} />}
        {activeTab === 'ranks' && <LeaderboardAndRanks currentUser={currentUser} />}
        {activeTab === 'discord' && (
          <DiscordServer
            messagesByChannel={discordMessages}
            onSendMessage={handleSendDiscord}
            onReactMessage={handleReactDiscord}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'market' && (
          <Marketplace
            items={marketItems}
            onAddItem={handleAddMarketItem}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'admin' && userRole === 'admin' && (
          <AdminDashboard
            projects={projects}
            onDeleteProject={handleDeleteProject}
            marketItems={marketItems}
            onDeleteMarketItem={handleDeleteMarketItem}
            emailConfig={emailConfig}
            onSaveEmailConfig={setEmailConfig}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} <strong className="text-slate-300">Trang sáng tạo Robotics</strong> • Mã nguồn mở sẵn sàng triển khai trên GitHub & Cloudflare Pages.
      </footer>

      {/* Modals & Floating AI */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        emailConfig={emailConfig}
      />
      <NewbieGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        onNavigateTab={(tabId) => setActiveTab(tabId)}
      />
      <AiAssistantDrawer
        isOpen={aiOpen}
        onToggle={() => setAiOpen(!aiOpen)}
        externalPrompt={aiPrompt}
        onClearExternalPrompt={() => setAiPrompt('')}
      />
    </div>
  );
}
