# Trang sáng tạo Robotics

Nền tảng web học công nghệ robot, kỹ thuật, chia sẻ dự án mã nguồn mở, AI tự cập nhật tin tức, chơi game thử thách, bảng xếp hạng phân cấp (Tân binh -> Cấp cao), server cộng đồng kiểu Discord và chợ trao đổi linh kiện kiểu Facebook Marketplace.

## Tính năng chính
- **Học Robotics & Kỹ thuật**: Lộ trình Arduino/ESP32, ROS2, Thị giác máy tính, Điều khiển PID, Cơ khí 3D với bài học tương tác và nhận điểm XP.
- **AI Hỗ trợ & Tự cập nhật (RoboAI)**: Khung chat AI giải đáp kỹ thuật (hỗ trợ cả chế độ offline thông minh và kết nối Gemini API Key trực tiếp) + luồng tin tức công nghệ robot tự động cập nhật.
- **Dự án Mã nguồn mở**: Kho dự án kèm danh sách linh kiện (BOM), mã nguồn mẫu, tính năng Star/Fork và đăng dự án mới.
- **Game & Thử thách**:
  - *RoboMaze Logic*: Game lập trình robot vượt mê cung.
  - *Tech Quiz*: Đấu trường câu hỏi kỹ thuật tính giờ.
  - *Thử thách tuần*: Nhiệm vụ thực hành nhận XP lớn.
- **Bảng xếp hạng & Phân cấp**: Tự động thăng hạng từ `Tân binh` -> `Kỹ sư tập sự` -> `Kỹ sư chính` -> `Cấp cao (Senior)` -> `Huyền thoại Robotics`.
- **Server Cộng đồng (kiểu Discord)**: Kênh chat theo chủ đề (`#chung`, `#hoi-dap-arduino`, `#ros2-ai`, `#chia-se-code`), phòng Voice Lab và bot lệnh (`/help`, `/tinmoi`).
- **Chợ Trao đổi & Bán hàng (kiểu Facebook Marketplace)**: Mua bán, trao đổi linh kiện cũ/mới, lọc theo danh mục, nhắn tin người bán và đăng tin mới.

## Chạy ở máy cá nhân (Local)
```bash
npm install
npm run dev
```

## Triển khai trên GitHub + Cloudflare Pages
1. Đẩy thư mục dự án này lên một repository trên **GitHub**.
2. Vào **Cloudflare Dashboard** -> **Workers & Pages** -> **Create** -> **Pages** -> **Connect to Git**.
3. Chọn repository GitHub vừa tạo và cấu hình:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Nhấn **Save and Deploy**. File `public/_redirects` đã được cấu hình sẵn để hỗ trợ SPA routing trên Cloudflare Pages.

## Robotics 3D + Gemini (Vercel)

- RoboMaze 3D uses a real Three.js/WebGL scene. The browser loads Three.js from the public ESM CDN, so an internet connection is required for the 3D scene.
- RoboAI and AI article drafting call `/api/gemini`. The Gemini key is read only by the server from the Vercel environment; it is not stored in localStorage or sent to the browser.
- Administrator sign-in is verified by the server and uses an HttpOnly session cookie.

### Required Vercel Environment Variables

Configure these in **Vercel → Project → Settings → Environment Variables**, then redeploy:

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Gemini API key used only by the server |
| `ADMIN_EMAIL` | Administrator email (for example, the site owner's configured email) |
| `ADMIN_PASSWORD` | A unique, strong administrator password |
| `ADMIN_SESSION_SECRET` | A long random secret used to sign the administrator session |

Do not commit API keys, passwords, or session secrets to GitHub. If a key has been pasted into a chat or source file, revoke it and create a replacement before adding it to Vercel.

The admin panel is unavailable until the three `ADMIN_*` variables are configured. The AI features use the offline knowledge fallback until `GEMINI_API_KEY` is configured.
