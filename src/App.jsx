import React, { useState, useEffect, useCallback } from 'react';
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
  Sun,
  Moon,
  Newspaper,
} from 'lucide-react';
import TechArticlesHub from './components/TechArticlesHub';
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
  INITIAL_ARTICLES,
  INITIAL_PROJECTS,
  INITIAL_DISCORD_MESSAGES,
  INITIAL_MARKETPLACE,
} from './data/roboticsData';
import { getTierByXp } from './utils/rankSystem';
import { pushSharedState, pullSharedState, subscribeTabSync } from './utils/realtimeSync';

const BASE_TABS = [
  { id: 'home', label: 'Trang chủ & Công nghệ', icon: Newspaper },
  { id: 'learn', label: 'Học Robotics', icon: BookOpen },
  { id: 'opensource', label: 'Mã nguồn mở & AI', icon: Cpu },
  { id: 'games', label: 'Game & Thử thách', icon: Gamepad2 },
  { id: 'ranks', label: 'Bảng xếp hạng', icon: Trophy },
  { id: 'discord', label: 'Chat Liên kết', icon: MessageSquare },
  { id: 'market', label: 'Chợ Linh kiện', icon: ShoppingBag },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState(() => localStorage.getItem('robotics_theme') || 'dark');
  const [userName, setUserName] = useState(() => localStorage.getItem('robotics_username') || 'Kỹ sư Mới');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('robotics_email') || '');
  const [userRole, setUserRole] = useState('guest');
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
  const [firebaseUrl, setFirebaseUrl] = useState(() => localStorage.getItem('robotics_firebase_url') || '');

  const [articles, setArticles] = useState(INITIAL_ARTICLES);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [discordMessages, setDiscordMessages] = useState(INITIAL_DISCORD_MESSAGES);
  const [marketItems, setMarketItems] = useState(INITIAL_MARKETPLACE);
  const [syncMode, setSyncMode] = useState('local');

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

  // Admin access is restored only from the server-verified HttpOnly session cookie.
  useEffect(() => {
    let active = true;
    fetch('/api/admin-session', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.ok && data?.role === 'admin') {
          setUserRole('admin');
          setUserEmail(data.email || '');
          setUserName(data.name || 'Quản trị viên');
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Apply Light/Dark theme to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('robotics_theme', theme);
  }, [theme]);

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

  useEffect(() => {
    localStorage.setItem('robotics_firebase_url', firebaseUrl);
  }, [firebaseUrl]);


  const applyRemoteState = useCallback((remote) => {
    if (!remote) return;
    if (remote.articles) setArticles(remote.articles);
    if (remote.projects) setProjects(remote.projects);
    if (remote.discordMessages) setDiscordMessages(remote.discordMessages);
    if (remote.marketItems) setMarketItems(remote.marketItems);
  }, []);

  const syncFromServer = useCallback(async () => {
    const res = await pullSharedState(firebaseUrl);
    setSyncMode(res.mode);
    if (res.data) applyRemoteState(res.data);
  }, [firebaseUrl, applyRemoteState]);

  // Initial pull + polling every 3s for cross-device sync + BroadcastChannel for same-browser tabs
  useEffect(() => {
    syncFromServer();
    const timer = setInterval(syncFromServer, 3000);
    const unsub = subscribeTabSync(applyRemoteState);
    return () => {
      clearInterval(timer);
      unsub();
    };
  }, [syncFromServer, applyRemoteState]);

  const broadcastState = async (nextState) => {
    const payload = {
      articles: nextState.articles ?? articles,
      projects: nextState.projects ?? projects,
      discordMessages: nextState.discordMessages ?? discordMessages,
      marketItems: nextState.marketItems ?? marketItems,
    };
    const res = await pushSharedState(payload, firebaseUrl);
    setSyncMode(res.mode);
  };

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
      showToast('Đã đăng nhập Khu vực Quản trị & Người bán!');
    } else {
      showToast(`Chào mừng trở lại, ${name}!`);
    }
  };

  const handleLogout = async () => {
    try { await fetch('/api/admin-logout', { method: 'POST', credentials: 'same-origin' }); } catch {}
    setUserRole('guest');
    setUserEmail('');
    if (activeTab === 'admin') setActiveTab('home');
    showToast('Đã đăng xuất tài khoản.');
  };

  const handleCompleteCourse = (course) => {
    if (completedCourses.includes(course.id)) return;
    setCompletedCourses((prev) => [...prev, course.id]);
    handleEarnXp(course.xp, `Hoàn thành "${course.title}"`);
  };

  const handleAddArticle = (art) => {
    const next = [art, ...articles];
    setArticles(next);
    broadcastState({ articles: next });
  };

  const handleDeleteArticle = (id) => {
    const next = articles.filter((a) => a.id !== id);
    setArticles(next);
    broadcastState({ articles: next });
  };

  const handleAddProject = (proj) => {
    const next = [proj, ...projects];
    setProjects(next);
    broadcastState({ projects: next });
    handleEarnXp(60, 'Đóng góp dự án mã nguồn mở');
  };

  const handleStarProject = (id) => {
    const next = projects.map((p) => (p.id === id ? { ...p, stars: p.stars + 1 } : p));
    setProjects(next);
    broadcastState({ projects: next });
  };

  const handleDeleteProject = (id) => {
    const next = projects.filter((p) => p.id !== id);
    setProjects(next);
    broadcastState({ projects: next });
    showToast('Đã xóa dự án.');
  };

  const handleSendDiscord = (channelId, msg) => {
    const next = {
      ...discordMessages,
      [channelId]: [...(discordMessages[channelId] || []), msg],
    };
    setDiscordMessages(next);
    broadcastState({ discordMessages: next });
  };

  const handleReactDiscord = (channelId, msgId, emoji) => {
    const next = {
      ...discordMessages,
      [channelId]: (discordMessages[channelId] || []).map((m) => {
        if (m.id !== msgId) return m;
        const count = (m.reactions?.[emoji] || 0) + 1;
        return { ...m, reactions: { ...(m.reactions || {}), [emoji]: count } };
      }),
    };
    setDiscordMessages(next);
    broadcastState({ discordMessages: next });
  };

  const handleAddMarketItem = (item) => {
    const next = [item, ...marketItems];
    setMarketItems(next);
    broadcastState({ marketItems: next });
    showToast('Đã đăng sản phẩm lên Chợ Linh kiện!');
  };

  const handleDeleteMarketItem = (id) => {
    const next = marketItems.filter((it) => it.id !== id);
    setMarketItems(next);
    broadcastState({ marketItems: next });
    showToast('Đã gỡ sản phẩm khỏi Chợ.');
  };

  const handleAskAi = (promptText) => {
    setAiOpen(true);
    setAiPrompt(promptText);
  };

  const tabs =
    userRole === 'admin'
      ? [...BASE_TABS, { id: 'admin', label: 'Quản trị & Người bán', icon: Shield }]
      : BASE_TABS;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Trang sáng tạo Robotics
              </h1>
              <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
                Công nghệ Robot • Học Kỹ thuật • Chat Liên kết • Gemini AI
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Light / Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Chuyển sang nền Sáng' : 'Chuyển sang nền Tối'}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-amber-300 hover:border-cyan-500 transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setGuideOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-500 text-xs font-semibold transition"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-500" /> Hướng dẫn
            </button>

            <button
              onClick={() => setAiOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-400/40 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-500/25 text-xs font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5" /> Gemini AI
            </button>

            {userRole === 'guest' ? (
              <button
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition"
              >
                <UserPlus className="w-3.5 h-3.5" /> Đăng ký / Đăng nhập
              </button>
            ) : (
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-lg">{tier.badge}</span>
              <div>
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 dark:text-white w-24 focus:outline-none border-b border-transparent focus:border-cyan-500"
                  title="Nhấn để đổi tên hiển thị"
                />
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
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
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                    : isAdminTab
                    ? 'text-rose-600 dark:text-rose-300 hover:bg-rose-500/15'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
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
        {activeTab === 'home' && (
          <TechArticlesHub
            articles={articles}
            onNavigateTab={(t) => setActiveTab(t)}
            onAskAi={handleAskAi}
          />
        )}
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
            syncMode={syncMode}
            onManualSync={syncFromServer}
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
            articles={articles}
            onAddArticle={handleAddArticle}
            onDeleteArticle={handleDeleteArticle}
            projects={projects}
            onDeleteProject={handleDeleteProject}
            marketItems={marketItems}
            onAddMarketItem={handleAddMarketItem}
            onDeleteMarketItem={handleDeleteMarketItem}
            emailConfig={emailConfig}
            onSaveEmailConfig={setEmailConfig}
            firebaseUrl={firebaseUrl}
            onSaveFirebaseUrl={setFirebaseUrl}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} <strong className="text-slate-700 dark:text-slate-300">Trang sáng tạo Robotics</strong> • Nền tảng Công nghệ Robot, Cộng đồng & Thương mại Kỹ thuật.
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
