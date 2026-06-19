# FPT Student Management Mobile App 🎓📱

Ứng dụng di động quản lý thông tin sinh viên Đại học FPT được phát triển bằng **React Native** kết hợp **Expo Go**. Ứng dụng cung cấp một giao diện trực quan, hiện đại theo bảng màu đặc trưng của myFAP, giúp sinh viên dễ dàng theo dõi lịch học, lịch thi, hồ sơ cá nhân và kết quả học tập.

---

## 🚀 Các Tính Năng Chính
1. **Đăng nhập sinh viên (Authentication)**: Đăng nhập theo tài khoản cá nhân, phân quyền dữ liệu tương ứng của sinh viên đó.
2. **Trang chủ (Dashboard - Home)**: Giao diện lưới (grid layout) 2 cột trực quan gồm các danh mục thông báo, học tập, dịch vụ và hỗ trợ.
3. **Lịch học hàng tuần (Weekly Timetable)**:
   - Hiển thị theo dạng Slot học chi tiết (môn học, phòng học, giảng viên, thời gian).
   - Có bộ lọc Học kỳ (Semester) và Tuần (Week).
   - Badge trạng thái điểm danh: *Attended* (Đã học), *Absent* (Vắng), hoặc *Not Yet* (Chưa diễn ra).
4. **Lịch thi (Exam Schedule)**: Hiển thị danh sách các môn thi sắp tới chi tiết ngày giờ, phòng thi, ca thi và hình thức thi.
5. **Hồ sơ cá nhân (Student Profile)**: 
   - Banner màu navy chuyên nghiệp.
   - Mã QR cá nhân để quét nhanh thông tin.
   - Thông tin cá nhân chi tiết (MSSV, Email, Campus, Chuyên ngành, Khóa học...).
   - Tích hợp bật/tắt Chế độ tối (Dark Mode) và Nhận thông báo (Push Notifications).

---

## 🛠️ Công Nghệ Sử Dụng
- **React Native** & **Expo**
- **React Navigation** (Stack Navigation & Bottom Tab Navigation)
- **Expo Vector Icons** (Ionicons)
- **React Context API** (Quản lý trạng thái đăng nhập)

---

## 📁 Cấu Trúc Dự Án
```text
FPTStudent/
├── App.js                      # Điểm khởi đầu của ứng dụng (Root: Auth & Navigation)
├── app.json                    # Cấu hình Expo
├── package.json                # Quản lý dependencies và scripts
├── index.js                    # Entry point đăng ký app
├── src/
│   ├── context/
│   │   └── AuthContext.js      # Quản lý thông tin đăng nhập sinh viên toàn cục
│   ├── data/
│   │   └── fptData.js          # Mock data chi tiết (Học kỳ, Lịch học, Lịch thi, Sinh viên)
│   ├── navigation/
│   │   └── AppNavigator.js     # Cấu hình thanh điều hướng Bottom Tab & Stack
│   ├── screens/
│   │   ├── LoginScreen.js      # Giao diện Đăng nhập
│   │   ├── HomeScreen.js       # Giao diện Trang chủ (Dashboard)
│   │   ├── ScheduleScreen.js   # Giao diện Lịch học hàng tuần
│   │   ├── ExamScreen.js       # Giao diện Lịch thi
│   │   └── ProfileScreen.js    # Giao diện Hồ sơ & Cài đặt
│   └── utils/
│       └── theme.js            # Khai báo màu sắc chủ đạo (FPT Navy, Orange, v.v.)
```

---

## 🔑 Tài Khoản Đăng Nhập Demo
Bạn có thể sử dụng các tài khoản dưới đây để đăng nhập và trải nghiệm sự khác biệt về dữ liệu:

| Tài khoản (Username) | Mật khẩu | Tên sinh viên | Chuyên ngành |
| :--- | :--- | :--- | :--- |
| **thuan** | `123456` | Nguyễn Lương Hiếu Thuận | Kỹ thuật phần mềm (K18) |
| **hoai** | `123456` | Trần Thị Hoài | Quản trị kinh doanh (K17) |

---

## 💻 Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu Cầu Hệ Thống
- Đã cài đặt **Node.js** (Khuyến nghị bản LTS mới nhất).
- Đã cài đặt ứng dụng **Expo Go** trên điện thoại Android/iOS (nếu muốn test trên điện thoại thật).

### Các Bước Thực Hiện

1. **Di chuyển vào thư mục dự án**:
   ```bash
   cd d:/CODE/Androi/FPTStudent
   ```

2. **Cài đặt các thư viện phụ thuộc (Dependencies)**:
   ```bash
   npm install
   ```

3. **Chạy ứng dụng (Start Expo Dev Server)**:
   ```bash
   npm start
   ```
   hoặc:
   ```bash
   npx expo start
   ```

4. **Kết nối và kiểm tra**:
   - **Cách 1 (Quét QR - Khuyên dùng)**: Mở ứng dụng **Expo Go** trên điện thoại của bạn, quét mã QR hiển thị ở Terminal để chạy ứng dụng trực tiếp trên điện thoại thật.
   - **Cách 2 (Trình giả lập Android/iOS)**:
     - Nhấn `a` trên Terminal để chạy trên máy ảo Android (yêu cầu Android Studio Emulator đang mở).
     - Nhấn `i` trên Terminal để chạy trên máy ảo iOS (yêu cầu Xcode Simulator đang mở - chỉ hỗ trợ macOS).
