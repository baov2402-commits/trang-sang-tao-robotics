export const INITIAL_COURSES = [
  {
    id: 'arduino-esp32',
    title: 'Arduino & ESP32 Thực chiến',
    category: 'Vi điều khiển',
    level: 'Tân binh',
    xp: 80,
    duration: '45 phút',
    summary: 'Đọc cảm biến siêu âm HC-SR04, điều khiển động cơ qua mạch cầu H L298N và kết nối Wi-Fi MQTT trên ESP32.',
    codeSnippet: `// Đọc cảm biến siêu âm & điều khiển LED cảnh báo
#define TRIG_PIN 5
#define ECHO_PIN 18

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH);
  float distance = duration * 0.034 / 2;
  Serial.printf("Khoang cach: %.1f cm\\n", distance);
  delay(200);
}`,
  },
  {
    id: 'pid-control',
    title: 'Thuật toán Điều khiển PID cho Xe dò đường',
    category: 'Điều khiển tự động',
    level: 'Kỹ sư tập sự',
    xp: 120,
    duration: '60 phút',
    summary: 'Hiểu sâu Kp, Ki, Kd để giúp robot giữ thăng bằng và bám line mượt mà ở tốc độ cao không bị dao động.',
    codeSnippet: `// Vòng lặp tính PID cơ bản
float kp = 24.5, ki = 0.05, kd = 12.0;
float prevError = 0, integral = 0;

float computePID(float error, float dt) {
  integral += error * dt;
  float derivative = (error - prevError) / dt;
  prevError = error;
  return kp * error + ki * integral + kd * derivative;
}`,
  },
  {
    id: 'ros2-nav',
    title: 'ROS2 & SLAM Dẫn đường Tự hành',
    category: 'Hệ điều hành Robot',
    level: 'Kỹ sư chính',
    xp: 180,
    duration: '90 phút',
    summary: 'Thiết lập node Publisher/Subscriber trong ROS2, kết nối LiDAR 2D và dựng bản đồ phòng bằng Slam Toolbox.',
    codeSnippet: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class AutoMover(Node):
    def __init__(self):
        super().__init__('auto_mover')
        self.pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.timer = self.create_timer(0.1, self.move_forward)

    def move_forward(self):
        msg = Twist()
        msg.linear.x = 0.35
        self.pub.publish(msg)`,
  },
  {
    id: 'cv-yolo',
    title: 'Thị giác Máy tính & Nhận diện Vật thể Edge AI',
    category: 'AI & Robotics',
    level: 'Cấp cao',
    xp: 220,
    duration: '75 phút',
    summary: 'Triển khai mô hình nhận diện vật thể nhẹ trên Jetson Orin Nano / Raspberry Pi 5 để robot gắp vật chính xác.',
    codeSnippet: `from ultralytics import YOLO
import cv2

model = YOLO("yolo11n.pt")
cap = cv2.VideoCapture(0)
while True:
    ret, frame = cap.read()
    results = model(frame, imgsz=320, conf=0.5)
    cv2.imshow("Robot Vision", results[0].plot())
    if cv2.waitKey(1) == 27:
        break`,
  },
];

export const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    name: 'VietBot-AMR (Xe tự hành trong nhà)',
    author: 'Minh Khoa',
    authorRank: 'Cấp cao (Senior)',
    license: 'MIT Open Source',
    stars: 342,
    forks: 89,
    tags: ['ROS2', 'LiDAR', 'ESP32', 'SLAM'],
    description: 'Nền tảng xe tự hành 2 bánh vi sai sử dụng ROS2, RPLiDAR A1 và ESP32 làm bộ điều khiển cấp thấp qua micro-ROS.',
    bom: ['Raspberry Pi 4/5 (4GB)', 'RPLiDAR A1M8', 'ESP32 DevKit V1', '2x Động cơ Encoder JGA25-370', 'Pin Li-ion 3S 12.6V'],
    repoUrl: 'https://github.com/trang-sang-tao-robotics/vietbot-amr',
  },
  {
    id: 'proj-2',
    name: 'OpenArm-6DOF (Cánh tay Robot in 3D)',
    author: 'Lan Anh',
    authorRank: 'Kỹ sư chính',
    license: 'Apache-2.0',
    stars: 218,
    forks: 54,
    tags: ['In 3D', 'Inverse Kinematics', 'Stepper', 'Python'],
    description: 'Cánh tay robot 6 bậc tự do in 3D hoàn toàn bằng nhựa PETG, tích hợp thuật toán động học nghịch giải bằng Python.',
    bom: ['6x Động cơ bước NEMA 17', 'Mạch điều khiển CNC Shield + TMC2209', 'Nguồn tổ ong 24V 10A', 'Vòng bi 608ZZ'],
    repoUrl: 'https://github.com/trang-sang-tao-robotics/openarm-6dof',
  },
  {
    id: 'proj-3',
    name: 'SkyMini-ESP Drone Mã nguồn mở',
    author: 'Hoàng Nam',
    authorRank: 'Huyền thoại Robotics',
    license: 'GPL-3.0',
    stars: 510,
    forks: 142,
    tags: ['Drone', 'ESP32-S3', 'IMU', 'PID'],
    description: 'Quadcopter mini tự chế dùng ESP32-S3 kết hợp cảm biến MPU6050, điều khiển qua Wi-Fi UDP từ điện thoại.',
    bom: ['ESP32-S3 SuperMini', 'Cảm biến MPU6050', '4x Motor Coreless 8520', 'Pin LiPo 1S 600mAh'],
    repoUrl: 'https://github.com/trang-sang-tao-robotics/skymini-esp',
  },
];

export const AI_NEWS_POOL = [
  {
    id: 'news-1',
    title: 'Robot hình người thế hệ mới đạt tốc độ đi bộ 3.3 m/s nhờ học tăng cường (RL)',
    source: 'AI Radar • Tổng hợp tự động',
    category: 'Humanoid & RL',
    summary: 'Các mô hình Sim-to-Real mới giúp robot giữ thăng bằng trên địa hình gồ ghề chỉ sau 2 giờ huấn luyện trên GPU.',
    time: 'Vừa cập nhật',
  },
  {
    id: 'news-2',
    title: 'ROS2 Jazzy Jalisco tối ưu hóa độ trễ giao tiếp DDS cho hệ thống đa robot',
    source: 'AI Radar • Open Source',
    category: 'ROS2',
    summary: 'Bản cập nhật mới giảm 35% độ trễ truyền ảnh camera độ phân giải cao giữa các node phân tán.',
    time: '15 phút trước',
  },
  {
    id: 'news-3',
    title: 'Chip Edge AI tiêu thụ dưới 5W chạy mượt mô hình Vision-Language-Action (VLA)',
    source: 'AI Radar • Phần cứng',
    category: 'Edge AI',
    summary: 'Cho phép cánh tay robot hiểu câu lệnh tiếng Việt tự nhiên và tự lập kế hoạch gắp vật mà không cần Cloud.',
    time: '1 giờ trước',
  },
  {
    id: 'news-4',
    title: 'Cộng đồng mã nguồn mở ra mắt thư viện điều khiển FOC cho động cơ BLDC giá rẻ',
    source: 'AI Radar • Embedded',
    category: 'Motor Control',
    summary: 'Hỗ trợ STM32 và ESP32 điều khiển mô-men xoắn chính xác cao cho robot bốn chân.',
    time: '2 giờ trước',
  },
  {
    id: 'news-5',
    title: 'Cảm biến LiDAR thể rắn (Solid-State) giảm giá xuống dưới 40 USD cho maker',
    source: 'AI Radar • Cảm biến',
    category: 'Hardware',
    summary: 'Mở ra cơ hội trang bị quét 3D độ phân giải cao cho các dự án sinh viên và robot giáo dục.',
    time: 'Mới nhất',
  },
];

export const INITIAL_LEADERBOARD = [
  { id: 'u1', name: 'Hoàng Nam', xp: 7850, projects: 14, streak: 32, specialty: 'Drone & Flight Control' },
  { id: 'u2', name: 'Minh Khoa', xp: 4620, projects: 9, streak: 19, specialty: 'ROS2 & SLAM' },
  { id: 'u3', name: 'Lan Anh', xp: 2890, projects: 7, streak: 14, specialty: 'Cơ khí 3D & Kinematics' },
  { id: 'u4', name: 'Đức Thịnh', xp: 1640, projects: 4, streak: 8, specialty: 'ESP32 & IoT' },
  { id: 'u5', name: 'Thảo Vy', xp: 820, projects: 2, streak: 5, specialty: 'Arduino & Cảm biến' },
];

export const DISCORD_CHANNELS = [
  { id: 'chung', name: 'chung', topic: 'Thảo luận chung về Robotics, chia sẻ ý tưởng mới mỗi ngày' },
  { id: 'hoi-dap-arduino', name: 'hoi-dap-arduino', topic: 'Hỗ trợ debug mạch, code Arduino, ESP32, STM32' },
  { id: 'ros2-ai', name: 'ros2-ai', topic: 'ROS2, Gazebo, OpenCV, YOLO và điều khiển thông minh' },
  { id: 'chia-se-code', name: 'chia-se-code', topic: 'Đăng snippet hay, thư viện mã nguồn mở & tài liệu' },
  { id: 'tim-dong-doi', name: 'tim-dong-doi', topic: 'Tìm thành viên thi Robocon, nghiên cứu khoa học' },
];

export const INITIAL_DISCORD_MESSAGES = {
  chung: [
    {
      id: 'm1',
      author: 'Hoàng Nam',
      rank: 'Huyền thoại Robotics',
      avatar: '👑',
      time: '16:40',
      text: 'Chào mừng anh em đến với server Trang sáng tạo Robotics! Hôm nay ai đang build dự án gì show lên nhé!',
      reactions: { '🤖': 5, '🔥': 3 },
    },
    {
      id: 'm2',
      author: 'RoboAI Bot',
      rank: 'AI Assistant',
      avatar: '⚡',
      time: '16:42',
      text: 'Gợi ý: Gõ `/help` để xem các lệnh nhanh hoặc `/tinmoi` để mình tóm tắt tin tức Robotics mới nhất!',
      reactions: { '👍': 4 },
    },
  ],
  'hoi-dap-arduino': [
    {
      id: 'm3',
      author: 'Thảo Vy',
      rank: 'Kỹ sư tập sự',
      avatar: '🔧',
      time: '15:20',
      text: 'Mình dùng L298N cấp nguồn 12V cho 2 motor vàng nhưng IC hơi nóng, có cần gắn thêm tản nhiệt không mọi người?',
      reactions: { '💡': 2 },
    },
    {
      id: 'm4',
      author: 'Minh Khoa',
      rank: 'Cấp cao (Senior)',
      avatar: '🚀',
      time: '15:25',
      text: 'L298N sụt áp khoảng 2V nên tỏa nhiệt khá nhiều. Nếu có thể bạn đổi sang mạch TB6612FNG sẽ mát và hiệu suất cao hơn hẳn!',
      reactions: { '❤️': 6, '🙏': 2 },
    },
  ],
  'ros2-ai': [
    {
      id: 'm5',
      author: 'Minh Khoa',
      rank: 'Cấp cao (Senior)',
      avatar: '🚀',
      time: '14:10',
      text: 'Vừa đẩy cấu hình Nav2 mới cho xe VietBot-AMR lên mục Mã nguồn mở, anh em kéo về test thử nhé.',
      reactions: { '🚀': 7 },
    },
  ],
  'chia-se-code': [],
  'tim-dong-doi': [],
};

export const INITIAL_MARKETPLACE = [
  {
    id: 'item-1',
    title: 'Cảm biến RPLiDAR A1M8 quét 360 độ (Còn bảo hành)',
    price: 1650000,
    condition: 'Đã qua sử dụng (95%)',
    category: 'Cảm biến',
    location: 'TP. Hồ Chí Minh',
    seller: 'Minh Khoa',
    sellerRank: 'Cấp cao (Senior)',
    description: 'Hàng dùng test đồ án SLAM 2 tuần, đầy đủ cáp chuyển USB UART, hoạt động hoàn hảo trên ROS2.',
    imageEmoji: '📡',
  },
  {
    id: 'item-2',
    title: 'Combo Kit Arduino Mega 2560 + 37 Cảm biến',
    price: 420000,
    condition: 'Mới 100%',
    category: 'Vi điều khiển',
    location: 'Hà Nội',
    seller: 'Đức Thịnh',
    sellerRank: 'Kỹ sư chính',
    description: 'Phù hợp cho tân binh mới bắt đầu học điện tử và lập trình robot cơ bản.',
    imageEmoji: '🔌',
  },
  {
    id: 'item-3',
    title: 'Bộ 4 Động cơ Servo kim loại MG996R lực kéo 11kg',
    price: 260000,
    condition: 'Mới 100%',
    category: 'Động cơ',
    location: 'Đà Nẵng',
    seller: 'Lan Anh',
    sellerRank: 'Kỹ sư chính',
    description: 'Bánh răng kim loại bền bỉ, thích hợp làm cánh tay robot hoặc chân robot nhện.',
    imageEmoji: '🦾',
  },
  {
    id: 'item-4',
    title: 'Khung xe Robot 4WD Nhôm CNC + 4 Motor Encoder',
    price: 550000,
    condition: 'Đã qua sử dụng (90%)',
    category: 'Khung cơ khí',
    location: 'Cần Thơ',
    seller: 'Hoàng Nam',
    sellerRank: 'Huyền thoại Robotics',
    description: 'Khung nhôm chắc chắn, đã khoan sẵn lỗ gắn Raspberry Pi và mạch cầu H.',
    imageEmoji: '🚙',
  },
];

export const TECH_QUIZ_QUESTIONS = [
  {
    q: 'Trong mạch điều khiển động cơ DC, kỹ thuật PWM dùng để làm gì?',
    options: [
      'Thay đổi điện áp trung bình để điều chỉnh tốc độ',
      'Chuyển đổi dòng điện xoay chiều thành một chiều',
      'Đo khoảng cách bằng sóng siêu âm',
      'Tăng dung lượng bộ nhớ của vi điều khiển',
    ],
    answer: 0,
    explain: 'PWM (Pulse Width Modulation) điều chỉnh độ rộng xung để kiểm soát công suất/tốc độ trung bình cấp cho động cơ.',
  },
  {
    q: 'Chuẩn giao tiếp nào sau đây chỉ dùng 2 dây (SDA, SCL) để kết nối nhiều cảm biến?',
    options: ['SPI', 'UART', 'I2C', 'CAN Bus'],
    answer: 2,
    explain: 'I2C sử dụng 2 đường truyền là SDA (dữ liệu) và SCL (xung nhịp), hỗ trợ nhiều thiết bị qua địa chỉ.',
  },
  {
    q: 'Trong bộ điều khiển PID, thành phần nào giúp triệt tiêu sai số xác lập (steady-state error)?',
    options: ['Khâu Tỉ lệ (P)', 'Khâu Tích phân (I)', 'Khâu Vi phân (D)', 'Không khâu nào'],
    answer: 1,
    explain: 'Khâu Tích phân (I - Integral) cộng dồn sai số theo thời gian giúp đưa hệ thống về đúng giá trị đặt.',
  },
  {
    q: 'Topic `/cmd_vel` trong ROS2 thường sử dụng kiểu dữ liệu message nào?',
    options: ['std_msgs/String', 'sensor_msgs/LaserScan', 'geometry_msgs/Twist', 'nav_msgs/Odometry'],
    answer: 2,
    explain: '`geometry_msgs/Twist` chứa vận tốc dài (linear x,y,z) và vận tốc góc (angular x,y,z) để điều khiển robot di chuyển.',
  },
  {
    q: 'Định luật Ohm biểu diễn mối quan hệ nào?',
    options: ['P = U × I', 'U = I × R', 'F = m × a', 'E = m × c²'],
    answer: 1,
    explain: 'Định luật Ohm: Hiệu điện thế U bằng tích cường độ dòng điện I và điện trở R (U = I × R).',
  },
];
