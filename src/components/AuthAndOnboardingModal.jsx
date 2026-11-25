import React, { useState } from 'react';
import { Mail, ShieldCheck, UserPlus, LogIn, Compass, X, CheckCircle2, ArrowRight, Key } from 'lucide-react';

export function AuthModal({ isOpen, onClose, onLoginSuccess, emailConfig }) {
  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setErrorMsg('');
    if (!email.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ Gmail hợp lệ.');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setSending(true);

    // Nếu Admin đã cấu hình EmailJS, gửi mã thật về Gmail
    if (emailConfig?.serviceId && emailConfig?.templateId && emailConfig?.publicKey) {
      try {
        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: emailConfig.serviceId,
            template_id: emailConfig.templateId,
            user_id: emailConfig.publicKey,
            template_params: {
              to_email: email,
              to_name: name || 'Thành viên mới',
              otp_code: code,
              app_name: 'Trang sáng tạo Robotics',
            },
          }),
        });
        if (res.ok) {
          setOtpSent(true);
          setStatusMsg(`Đã gửi mã xác thực 6 số tới Gmail: ${email}`);
          setSending(false);
          return;
        }
      } catch {
        // Fallback demo mode
      }
    }

    // Chế độ Demo khi chưa gắn EmailJS / SMTP
    setTimeout(() => {
      setOtpSent(true);
      setStatusMsg(
        `[Chế độ Demo] Mã xác thực gửi tới ${email} là: ${code} (Quản trị viên có thể gắn EmailJS trong Trang Quản trị để gửi mail thật).`
      );
      setSending(false);
    }, 400);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!otpSent) {
      setErrorMsg('Vui lòng nhấn "Gửi mã về Gmail" trước.');
      return;
    }
    if (otpInput.trim() !== generatedOtp) {
      setErrorMsg('Mã xác thực OTP chưa đúng. Vui lòng kiểm tra lại.');
      return;
    }
    onLoginSuccess({
      name: name.trim() || 'Tân binh Robotics',
      email: email.trim(),
      role: 'member',
      isNewUser: true,
    });
    onClose();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (email.trim() === 'admin@robotics.vn' && password === 'admin123') {
      onLoginSuccess({
        name: 'Quản trị viên',
        email: 'admin@robotics.vn',
        role: 'admin',
        isNewUser: false,
      });
      onClose();
      return;
    }
    if (!email.includes('@') || password.length < 4) {
      setErrorMsg('Email hoặc mật khẩu không hợp lệ (mật khẩu tối thiểu 4 ký tự).');
      return;
    }
    onLoginSuccess({
      name: email.split('@')[0],
      email: email.trim(),
      role: 'member',
      isNewUser: false,
    });
    onClose();
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
              placeholder="Tạo mật khẩu"
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
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2"
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
              💡 Tài khoản Quản trị mặc định: <strong className="text-cyan-300">admin@robotics.vn</strong> / mật khẩu:{' '}
              <strong className="text-cyan-300">admin123</strong>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm"
            >
              Đăng nhập ngay
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
