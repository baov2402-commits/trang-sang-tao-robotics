import React, { useState } from 'react';
import { Mail, ShieldCheck, UserPlus, LogIn, Compass, X, CheckCircle2, ArrowRight, Key } from 'lucide-react';

export function AuthModal({ isOpen, onClose, onLoginSuccess, emailConfig }) {
  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
    const [otpInput, setOtpInput] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setErrorMsg('');
    setStatusMsg('');
    if (!email.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    setSending(true);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      const result = await response.json();
      if (!response.ok || !result?.ok) {
        setErrorMsg(result?.error || 'Không gửi được mã xác thực.');
        return;
      }
      setOtpSent(true);
      setStatusMsg(result.message || 'Đã gửi mã xác thực đến email của bạn.');
    } catch {
      setErrorMsg('Không thể kết nối dịch vụ gửi email. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!otpSent) {
      setErrorMsg('Hãy gửi mã xác thực đến email trước.');
      return;
    }
    setSending(true);
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, code: otpInput.trim() }),
      });
      const result = await response.json();
      if (!response.ok || !result?.ok) {
        setErrorMsg(result?.error || 'Không thể xác thực tài khoản.');
        return;
      }
      onLoginSuccess({ name: result.name, email: result.email, role: 'member', isNewUser: true });
      onClose();
    } catch {
      setErrorMsg('Không thể kết nối máy chủ xác thực. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.includes('@') || password.length < 10) {
      setErrorMsg('Vui lòng kiểm tra email và dùng mật khẩu ít nhất 10 ký tự.');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const result = await response.json();
      if (response.ok && result?.ok && (result?.role === 'admin' || result?.role === 'member')) {
        onLoginSuccess({
          name: result.name || 'Quản trị viên',
          email: email.trim(),
          role: result.role,
          isNewUser: false,
        });
        onClose();
        return;
      }
      if (response.status !== 401 && response.status !== 503) {
        throw new Error(result?.error || 'Không thể xác thực tài khoản.');
      }
      if (response.status === 503) {
        setErrorMsg(result?.error || 'Dịch vụ đăng nhập chưa được cấu hình trên máy chủ.');
        return;
      }
      setErrorMsg('Thông tin đăng nhập không hợp lệ.');
    } catch {
      setErrorMsg('Không thể kết nối máy chủ xác thực. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                mode === 'register' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Đăng ký mới
            </button>
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                mode === 'login' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Đăng nhập
            </button>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}
        {statusMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300">
            {statusMsg}
          </div>
        )}

        {mode === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <input
              required
              placeholder="Họ và tên (VD: Nguyễn Minh)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
            />
            <div className="flex gap-2">
              <input
                required
                type="email"
                placeholder="Địa chỉ Gmail của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
              />
              <button
                type="button"
                disabled={sending}
                onClick={handleSendOtp}
                className="px-3 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                <Mail className="w-3.5 h-3.5" /> {sending ? 'Đang gửi...' : 'Gửi mã Gmail'}
              </button>
            </div>
            <input
              required
              type="password"
              placeholder="Tạo mật khẩu (ít nhất 10 ký tự)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
            />
            {otpSent && (
              <div className="relative">
                <Key className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  placeholder="Nhập mã OTP 6 số từ Gmail"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={sending || !otpSent}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold text-sm flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Xác nhận & Bắt đầu học (+50 XP)
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <input
              required
              type="email"
              placeholder="Email đăng nhập"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
            />
            <input
              required
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
            />
            <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              Tài khoản thành viên và quản trị được xác thực ở máy chủ. Mật khẩu không lưu trong trình duyệt.
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold text-sm"
            >
              {sending ? 'Đang xác thực...' : 'Đăng nhập ngay'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function NewbieGuideModal({ isOpen, onClose, onNavigateTab }) {
  const [step, setStep] = useState(0);
  if (!isOpen) return null;

  const guides = [
    {
      title: 'Bước 1: Học từ Tân binh lên Cấp cao',
      desc: 'Bắt đầu với mục "Học Robotics". Xem mã nguồn Arduino/ESP32, ROS2 và nhấn "Hoàn thành bài học" để nhận XP thăng hạng.',
      tab: 'learn',
      btn: 'Đi tới Học Robotics',
    },
    {
      title: 'Bước 2: Hỏi RoboAI & Theo dõi AI Radar',
      desc: 'Nhấn nút "Hỏi RoboAI" ở góc dưới bên phải bất cứ lúc nào để hỏi về mạch cầu H, PID, cảm biến hoặc xem tin tức AI tự cập nhật.',
      tab: 'opensource',
      btn: 'Xem Mã nguồn mở & AI',
    },
    {
      title: 'Bước 3: Chơi Game & Leo Bảng xếp hạng',
      desc: 'Thử sức với game RoboMaze Logic và Đố vui Kỹ thuật để kiếm thêm XP, vượt qua các kỹ sư khác trên Bảng xếp hạng.',
      tab: 'games',
      btn: 'Vào Đấu trường Game',
    },
    {
      title: 'Bước 4: Tham gia Server Discord & Chợ Linh kiện',
      desc: 'Vào Server Cộng đồng để hỏi đáp trực tiếp cùng anh em (gõ /help hoặc /tinmoi) và trao đổi linh kiện tại Chợ Robotics.',
      tab: 'discord',
      btn: 'Vào Server Cộng đồng',
    },
  ];

  const current = guides[step];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Compass className="w-4 h-4" /> Hướng dẫn dành cho Người mới
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-1.5">
          {guides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-cyan-400' : 'bg-slate-800'}`}
            />
          ))}
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
          <h3 className="text-lg font-bold text-white">{current.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{current.desc}</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              onNavigateTab(current.tab);
              onClose();
            }}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            {current.btn} <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                Quay lại
              </button>
            )}
            {step < guides.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold"
              >
                Tiếp theo
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" /> Hoàn tất
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
