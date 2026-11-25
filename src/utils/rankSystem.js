export const TIERS = [
  {
    id: 'tan-binh',
    name: 'Tân binh',
    minXp: 0,
    maxXp: 499,
    badge: '🌱',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15 border-emerald-500/30',
    desc: 'Mới bước chân vào thế giới Robotics & Điện tử.',
  },
  {
    id: 'tap-su',
    name: 'Kỹ sư tập sự',
    minXp: 500,
    maxXp: 1499,
    badge: '🔧',
    color: 'text-sky-400',
    bg: 'bg-sky-500/15 border-sky-500/30',
    desc: 'Thành thạo mạch cơ bản, cảm biến và lập trình vi điều khiển.',
  },
  {
    id: 'ky-su',
    name: 'Kỹ sư chính',
    minXp: 1500,
    maxXp: 3499,
    badge: '⚙️',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15 border-violet-500/30',
    desc: 'Làm chủ ROS2, điều khiển PID và tích hợp hệ thống.',
  },
  {
    id: 'cap-cao',
    name: 'Cấp cao (Senior)',
    minXp: 3500,
    maxXp: 6999,
    badge: '🚀',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15 border-amber-500/30',
    desc: 'Chuyên gia kiến trúc robot tự hành, AI Edge và tối ưu phần cứng.',
  },
  {
    id: 'huyen-thoai',
    name: 'Huyền thoại Robotics',
    minXp: 7000,
    maxXp: Infinity,
    badge: '👑',
    color: 'text-rose-400',
    bg: 'bg-rose-500/15 border-rose-500/30',
    desc: 'Người dẫn dắt cộng đồng với nhiều dự án mã nguồn mở tầm cỡ.',
  },
];

export function getTierByXp(xp) {
  return TIERS.find((t) => xp >= t.minXp && xp <= t.maxXp) || TIERS[0];
}

export function getNextTierProgress(xp) {
  const current = getTierByXp(xp);
  const idx = TIERS.findIndex((t) => t.id === current.id);
  const next = TIERS[idx + 1];
  if (!next) {
    return { current, next: null, percent: 100, remaining: 0 };
  }
  const span = next.minXp - current.minXp;
  const gained = xp - current.minXp;
  const percent = Math.min(100, Math.max(0, Math.round((gained / span) * 100)));
  return {
    current,
    next,
    percent,
    remaining: next.minXp - xp,
  };
}
