# KẾ HOẠCH CHECKPOINT 5 (CP5): SMARTTRIP MOBILE APPLICATION
> **Milestone:** `CP5 - Mobile Application`  
> **Phạm vi tác động:** 100% trong thư mục `mobile/` (Không chạm vào `backend/`, `web/`, docker hay các file ngoài).  
> **Cơ sở dữ liệu:** SQLite cục bộ (`sqflite` + `sqflite_common_ffi`), tự động seed sẵn dữ liệu ban đầu cho 4 vai trò.  
> **Thành viên phụ trách:**
> - **Thái** (`nguyenhongthai2005`) — 6 Issues (#1, #3, #5, #7, #9, #11)
> - **Vinh** (`vinhlele`) — 6 Issues (#2, #4, #6, #8, #10, #12)

---

## BẢNG TỔNG HỢP 12 ISSUES CHO CP5

| Issue | Tiêu đề | Assignee | Nhánh đề xuất | Module / File trong `mobile/` |
| :---: | :--- | :---: | :---: | :--- |
| **#50** | `feat(mobile): Khởi tạo Flutter, SQLite Schema 4 vai trò & Auto-seeding` | `@nguyenhongthai2005` | `feature/50-mobile-sqlite-core` | `pubspec.yaml`, `lib/database/database_helper.dart`, `lib/models/*.dart` |
| **#51** | `feat(mobile): Cấu hình Theme Material 3, Navigation GoRouter & Guard` | `@vinhlele` | `feature/51-mobile-theme-router` | `lib/routes/app_router.dart`, `lib/widgets/app_*.dart` |
| **#52** | `feat(mobile): AuthProvider, Màn hình Đăng nhập (Demo 4 Roles) & Đăng ký` | `@nguyenhongthai2005` | `feature/52-mobile-auth-roles` | `lib/providers/auth_provider.dart`, `lib/screens/auth/*.dart` |
| **#53** | `feat(mobile): TourProvider & Màn hình Khám phá Tour (Search/Filter live)` | `@vinhlele` | `feature/53-mobile-tour-browse` | `lib/providers/tour_provider.dart`, `lib/screens/home/*.dart` |
| **#54** | `feat(mobile): HotelProvider, Chi tiết Tour & Chọn Khách sạn liên kết` | `@nguyenhongthai2005` | `feature/54-mobile-tour-detail` | `lib/providers/hotel_provider.dart`, `lib/screens/tour/*.dart` |
| **#55** | `feat(mobile): WalletProvider & Màn hình Ví điện tử (Nạp nhanh, Lịch sử)` | `@vinhlele` | `feature/55-mobile-wallet-flow` | `lib/providers/wallet_provider.dart`, `lib/screens/wallet/*.dart` |
| **#56** | `feat(mobile): BookingProvider & Màn hình Đặt tour thanh toán qua Ví` | `@nguyenhongthai2005` | `feature/56-mobile-booking-flow` | `lib/providers/booking_provider.dart`, `lib/screens/booking/booking_screen.dart` |
| **#57** | `feat(mobile): Màn hình Vé đã đặt & Tính năng Hủy tour tự động hoàn tiền` | `@vinhlele` | `feature/57-mobile-booking-history` | `lib/screens/booking/booking_history_screen.dart` |
| **#58** | `feat(mobile): Tour Operator Portal - Quản lý CRUD Tour & Xem khách đặt` | `@nguyenhongthai2005` | `feature/58-mobile-operator-portal` | `lib/screens/operator/*.dart` |
| **#59** | `feat(mobile): Hotel Manager Portal - Quản lý CRUD Khách sạn & Giá phòng` | `@vinhlele` | `feature/59-mobile-hotelier-portal` | `lib/screens/hotelier/*.dart` |
| **#60** | `feat(mobile): Admin Dashboard - Quản trị User, Phân quyền & Thống kê KPI` | `@nguyenhongthai2005` | `feature/60-mobile-admin-dashboard` | `lib/screens/admin/*.dart` |
| **#61** | `feat(mobile): Màn hình Profile cá nhân & Kiểm thử Windows Desktop` | `@vinhlele` | `feature/61-mobile-profile-testing` | `lib/screens/profile/*.dart`, `lib/main.dart` |

---

## NỘI DUNG CHI TIẾT TỪNG ISSUE ĐỂ TẠO TRÊN GITHUB

### 🔹 GIAI ĐOẠN 1: CORE NỀN TẢNG & TRẢI NGHIỆM KHÁCH HÀNG

#### Issue #50: `feat(mobile): Khởi tạo Flutter, SQLite Schema 4 vai trò & Auto-seeding`
* **Assignee:** `nguyenhongthai2005`
* **Labels:** `mobile`, `database`, `core`
* **Milestone:** `CP5 - Mobile Application`
* **Description:**
  ```markdown
  ### Mô tả công việc
  Khởi tạo dự án Flutter trong thư mục `mobile/` và thiết lập hệ thống CSDL SQLite nội bộ cho 4 vai trò.

  ### Nhiệm vụ cụ thể
  - [ ] Cập nhật `pubspec.yaml` với: `sqflite`, `sqflite_common_ffi`, `provider`, `go_router`, `shared_preferences`, `intl`.
  - [ ] Cấu hình `sqfliteFfiInit()` trong `lib/main.dart` để chạy mượt mà trên Windows Desktop.
  - [ ] Viết `lib/database/database_helper.dart` khởi tạo 6 bảng SQLite:
    - `users` (id, fullName, email, password, phone, role, status)
    - `tours` (id, operatorId, title, destination, description, price, duration, imageUrl, category, rating)
    - `hotels` (id, managerId, name, location, pricePerNight, imageUrl, starRating)
    - `wallets` (id, userId, balance)
    - `wallet_transactions` (id, userId, amount, type, description, createdAt)
    - `bookings` (id, userId, tourId, hotelId, departureDate, adultCount, childCount, totalAmount, status, createdAt)
  - [ ] Tự động seed sẵn dữ liệu mẫu khi mở app lần đầu:
    - 4 tài khoản cho 4 vai trò (customer, operator, hotelier, admin).
    - 6 tour Việt Nam (Đà Nẵng, Phú Quốc, Sa Pa, Hà Giang, Nha Trang, Ninh Bình).
    - 4 khách sạn chất lượng cao.
    - Tặng sẵn 10.000.000 VNĐ vào ví cho tài khoản customer.
  - [ ] Định nghĩa các model Dart tương ứng trong `lib/models/`.

  ### Tiêu chuẩn nghiệm thu
  - App khởi động không lỗi trên Windows Desktop (`flutter run -d windows`).
  - File SQLite `smarttrip.db` được tạo và có đầy đủ dữ liệu seed mẫu.
  ```

---

#### Issue #51: `feat(mobile): Cấu hình Theme Material 3, Navigation GoRouter & Guard`
* **Assignee:** `vinhlele`
* **Labels:** `mobile`, `ui`, `navigation`
* **Milestone:** `CP5 - Mobile Application`
* **Description:**
  ```markdown
  ### Mô tả công việc
  Thiết kế hệ thống giao diện chuẩn Material 3 và cấu hình bộ định tuyến GoRouter hỗ trợ phân quyền điều hướng.

  ### Nhiệm vụ cụ thể
  - [ ] Xây dựng App Theme trong `lib/theme/app_theme.dart` (màu chủ đạo Ocean Blue / Travel Teal).
  - [ ] Xây dựng các widget dùng chung tại `lib/widgets/`:
    - `app_button.dart`: Nút bấm bo góc, trạng thái loading.
    - `app_text_field.dart`: Ô nhập dữ liệu có icon và validation.
    - `stat_card.dart`: Thẻ thống kê KPI bo góc đẹp mắt.
    - `tour_card.dart`: Thẻ hiển thị tour kèm ảnh, điểm đến, giá tiền.
  - [ ] Cấu hình `lib/routes/app_router.dart`:
    - Khai báo các đường dẫn: `/login`, `/register`, `/home`, `/tour/:id`, `/wallet`, `/bookings`, `/operator`, `/hotelier`, `/admin`, `/profile`.
    - Router redirect guard kiểm tra phiên đăng nhập và vai trò người dùng.

  ### Tiêu chuẩn nghiệm thu
  - Chuyển màn hình mượt mà bằng GoRouter.
  - Các widget hiển thị đồng bộ theo tông màu du lịch hiện đại.
  ```

---

#### Issue #52: `feat(mobile): AuthProvider, Màn hình Đăng nhập (Demo 4 Roles) & Đăng ký`
* **Assignee:** `nguyenhongthai2005`
* **Labels:** `mobile`, `auth`
* **Milestone:** `CP5 - Mobile Application`
* **Description:**
  ```markdown
  ### Mô tả công việc
  Xây dựng luồng xác thực đăng nhập/đăng ký với SQLite và tạo 4 nút chọn nhanh vai trò để demo cho giảng viên.

  ### Nhiệm vụ cụ thể
  - [ ] Xây dựng `lib/providers/auth_provider.dart`:
    - Kiểm tra email/password trong SQLite.
    - Lưu trạng thái đăng nhập vào `shared_preferences`.
    - Quản lý thông tin `currentUser` và `currentRole`.
    - Đăng xuất và xóa session.
  - [ ] Xây dựng `lib/screens/auth/login_screen.dart`:
    - Form đăng nhập chuẩn.
    - 4 nút Shortcut tiện ích để test nhanh:
      * [Khách hàng]: Điền tự động `customer@smarttrip.com`
      * [Tour Op]: Điền tự động `operator@smarttrip.com`
      * [Khách sạn]: Điền tự động `hotelier@smarttrip.com`
      * [Admin]: Điền tự động `admin@smarttrip.com`
  - [ ] Xây dựng `lib/screens/auth/register_screen.dart`:
    - Đăng ký user mới (mặc định vai trò Customer).
    - Tự động tạo ví mới và tặng 5.000.000 VNĐ chào mừng.

  ### Tiêu chuẩn nghiệm thu
  - Đăng nhập đúng tài khoản sẽ chuyển hướng sang màn hình tương ứng với vai trò.
  - Đăng ký tài khoản mới lưu thành công vào SQLite.
  ```

---

#### Issue #53: `feat(mobile): TourProvider & Màn hình Khám phá Tour (Search/Filter live)`
* **Assignee:** `vinhlele`
* **Labels:** `mobile`, `customer`, `tours`
* **Milestone:** `CP5 - Mobile Application`
* **Description:**
  ```markdown
  ### Mô tả công việc
  Xây dựng màn hình Trang chủ cho Khách hàng với danh sách tour và bộ lọc/tìm kiếm thời gian thực.

  ### Nhiệm vụ cụ thể
  - [ ] Xây dựng `lib/providers/tour_provider.dart`:
    - Truy vấn danh sách tours từ SQLite.
    - Tìm kiếm theo từ khóa (tiêu đề, địa điểm).
    - Lọc theo danh mục (Biển đảo, Vùng cao, Nghỉ dưỡng).
    - Sắp xếp theo giá (Tăng dần, Giảm dần).
  - [ ] Xây dựng `lib/screens/home/home_screen.dart`:
    - Header chào mừng người dùng và hiển thị số dư ví thu nhỏ.
    - Search bar lọc trực tiếp ngay khi gõ (`onChanged`).
    - Filter chips danh mục du lịch.
    - Danh sách tour dạng Grid/List có ảnh, giá tiền VND và rating sao.

  ### Tiêu chuẩn nghiệm thu
  - Gõ từ khóa tìm kiếm phản hồi tức thì mà không lag giật.
  - Lọc đúng các tour theo danh mục tương ứng.
  ```

---

#### Issue #54: `feat(mobile): HotelProvider, Chi tiết Tour & Chọn Khách sạn liên kết`
* **Assignee:** `nguyenhongthai2005`
* **Labels:** `mobile`, `customer`, `hotel`
* **Milestone:** `CP5 - Mobile Application`
* **Description:**
  ```markdown
  ### Mô tả công việc
  Xây dựng màn hình chi tiết tour du lịch và danh sách khách sạn đề xuất để ghép vào đơn đặt tour.

  ### Nhiệm vụ cụ thể
  - [ ] Xây dựng `lib/providers/hotel_provider.dart`:
    - Truy vấn danh sách khách sạn từ SQLite.
  - [ ] Xây dựng `lib/screens/tour/tour_detail_screen.dart`:
    - Hiển thị ảnh cover lớn, tên tour, điểm đến, thời lượng (ngày/đêm), mô tả chi tiết, giá tiền.
    - Khu vực chọn khách sạn gợi ý: Hiển thị card khách sạn (tên, số sao, giá phòng/đêm).
    - Cho phép khách hàng chọn 1 khách sạn đi kèm hoặc chọn không lấy phòng.
    - Nút "Đặt Tour Ngay" chuyển tiếp sang màn hình Checkout.

  ### Tiêu chuẩn nghiệm thu
  - Xem chi tiết đầy đủ thông tin tour.
  - Chọn khách sạn sẽ lưu lại thông tin để tính tiền ở bước thanh toán.
  ```

---

### 🔹 GIAI ĐOẠN 2: VÍ ĐIỆN TỬ, BOOKING & 3 PHÂN HỆ QUẢN TRỊ

#### Issue #55: `feat(mobile): WalletProvider & Màn hình Ví điện tử (Nạp nhanh, Lịch sử)`
* **Assignee:** `vinhlele`
* **Labels:** `mobile`, `wallet`, `payment`
* **Milestone:** `CP5 - Mobile Application`
* **Description:**
  ```markdown
  ### Mô tả công việc
  Xây dựng hệ thống Ví điện tử độc lập trong SQLite phục vụ thanh toán tour và hoàn tiền.

  ### Nhiệm vụ cụ thể
  - [ ] Xây dựng `lib/providers/wallet_provider.dart`:
    - Truy vấn số dư ví của `userId`.
    - Nạp tiền vào ví (`topUp`).
    - Ghi log biến động số dư vào bảng `wallet_transactions`.
    - Lấy danh sách lịch sử giao dịch.
  - [ ] Xây dựng `lib/screens/wallet/wallet_screen.dart`:
    - Thẻ hiển thị số dư ví phong cách hiện đại.
    - Nút nạp nhanh: +1.000.000 VNĐ, +5.000.000 VNĐ để thuận tiện chấm thi.
    - Danh sách lịch sử giao dịch có badge màu sắc: Nạp tiền (Xanh dương), Thanh toán (Đỏ), Hoàn tiền (Xanh lá).

  ### Tiêu chuẩn nghiệm thu
  - Nạp tiền tăng ngay số dư tức thì trong SQLite.
  - Hiển thị đầy đủ lịch sử nạp/trừ tiền.
  ```

---

#### Issue #56: `feat(mobile): BookingProvider & Màn hình Đặt tour thanh toán qua Ví`
* **Assignee:** `nguyenhongthai2005`
* **Labels:** `mobile`, `booking`, `checkout`
* **Milestone:** `CP5 - Mobile Application`
* **Description:**
  ```markdown
  ### Mô tả công việc
  Xây dựng luồng Đặt tour (Checkout) và thanh toán trừ tiền ví nguyên tử (Atomic transaction).

  ### Nhiệm vụ cụ thể
  - [ ] Xây dựng `lib/providers/booking_provider.dart`:
    - Kiểm tra số dư ví trước khi thanh toán.
    - Thực hiện giao dịch nguyên tử trong SQLite: Trừ ví $\to$ Thêm log `PAYMENT` $\to$ Tạo booking `CONFIRMED`.
  - [ ] Xây dựng `lib/screens/booking/booking_screen.dart`:
    - Chọn ngày khởi hành.
    - Bộ chọn số lượng vé: Người lớn, Trẻ em.
    - Tổng hợp chi phí: Tiền vé tour + Tiền khách sạn (nếu chọn) = Tổng thanh toán.
    - Nút "Xác nhận & Thanh toán":
      * Nếu thiếu tiền: Báo lỗi và gợi ý mở ví nạp tiền.
      * Nếu đủ tiền: Trừ tiền ví, hiện Dialog chúc mừng và chuyển về danh sách vé.

  ### Tiêu chuẩn nghiệm thu
  - Tính tiền tự động chính xác theo số lượng khách và khách sạn.
  - Số dư ví bị trừ đúng số tiền, booking được lưu vào SQLite.
  ```

---

#### Issue #57: `feat(mobile): Màn hình Vé đã đặt & Tính năng Hủy tour tự động hoàn tiền`
* **Assignee:** `vinhlele`
* **Labels:** `mobile`, `booking`, `refund`
* **Milestone:** `CP5 - Mobile Application`
* **Description:**
  ```markdown
  ### Mô tả công việc
  Xây dựng màn hình xem danh sách vé đã đặt và chức năng hủy tour tự động hoàn trả 100% tiền vào ví.

  ### Nhiệm vụ cụ thể
  - [ ] Xây dựng `lib/screens/booking/booking_history_screen.dart`:
    - Danh sách các chuyến đi của người dùng (Tên tour, Ngày đi, Tổng tiền, Trạng thái `CONFIRMED` / `CANCELLED`).
    - Nút "Hủy tour" cho các vé đang ở trạng thái `CONFIRMED`.
    - Dialog xác nhận hủy chuyến.
  - [ ] Xử lý logic hoàn tiền:
    - Cập nhật trạng thái booking sang `CANCELLED`.
    - Tự động cộng trả 100% tiền vào ví của user.
    - Ghi log giao dịch `REFUND` vào bảng `wallet_transactions`.

  ### Tiêu chuẩn nghiệm thu
  - Hủy tour thành công, vé chuyển sang trạng thái đã hủy.
  - Số dư ví của user lập tức tăng lại đúng số tiền đã hoàn.
  ```

---

#### Issue #58: `feat(mobile): Tour Operator Portal - Quản lý CRUD Tour & Xem khách đặt`
* **Assignee:** `nguyenhongthai2005`
* **Labels:** `mobile`, `operator`, `crud`
* **Milestone:** `CP5 - Mobile Application`
* **Description:**
  ```markdown
  ### Mô tả công việc
  Xây dựng phân hệ quản trị dành riêng cho vai trò Tour Operator (`operator@smarttrip.com`).

  ### Nhiệm vụ cụ thể
  - [ ] Xây dựng `lib/screens/operator/operator_dashboard_screen.dart`:
    - Danh sách các tour do Operator sở hữu.
    - Thẻ thống kê: Tổng số tour, Số lượt khách đặt.
  - [ ] Xây dựng `lib/screens/operator/tour_form_screen.dart`:
    - Form Thêm tour mới (Tiêu đề, Địa điểm, Thời lượng, Giá tiền, Link ảnh, Danh mục, Lịch trình).
    - Form Cập nhật chỉnh sửa tour sẵn có.
  - [ ] Tính năng Xóa tour: Xóa tour khỏi SQLite kèm xác nhận.
  - [ ] Danh sách Booking: Xem các khách hàng đã đặt tour của Operator.

  ### Tiêu chuẩn nghiệm thu
  - Chỉ tài khoản `tour_operator` mới vào được màn hình này.
  - Thêm, sửa, xóa tour lưu tức thì vào SQLite và hiển thị ngoài trang chủ.
  ```

---

#### Issue #59: `feat(mobile): Hotel Manager Portal - Quản lý CRUD Khách sạn & Giá phòng`
* **Assignee:** `vinhlele`
* **Labels:** `mobile`, `hotelier`, `crud`
* **Milestone:** `CP5 - Mobile Application`
* **Description:**
  ```markdown
  ### Mô tả công việc
  Xây dựng phân hệ quản trị dành riêng cho vai trò Hotel Manager (`hotelier@smarttrip.com`).

  ### Nhiệm vụ cụ thể
  - [ ] Xây dựng `lib/screens/hotelier/hotelier_dashboard_screen.dart`:
    - Danh sách khách sạn do Manager quản lý.
    - Thống kê số lượng phòng và đánh giá sao.
  - [ ] Xây dựng `lib/screens/hotelier/hotel_form_screen.dart`:
    - Form Thêm khách sạn mới (Tên khách sạn, Địa chỉ, Số sao 1-5, Giá phòng/đêm, Link ảnh).
    - Form Sửa giá phòng hoặc cập nhật thông tin khách sạn.
    - Xóa khách sạn khỏi SQLite.

  ### Tiêu chuẩn nghiệm thu
  - Chỉ tài khoản `hotel_manager` mới vào được màn hình này.
  - CRUD khách sạn cập nhật chuẩn xác vào SQLite.
  ```

---

#### Issue #60: `feat(mobile): Admin Dashboard - Quản trị User, Phân quyền & Thống kê KPI`
* **Assignee:** `nguyenhongthai2005`
* **Labels:** `mobile`, `admin`, `management`
* **Milestone:** `CP5 - Mobile Application`
* **Description:**
  ```markdown
  ### Mô tả công việc
  Xây dựng Dashboard quản trị cấp cao dành riêng cho Quản trị viên (`admin@smarttrip.com`).

  ### Nhiệm vụ cụ thể
  - [ ] Xây dựng `lib/screens/admin/admin_dashboard_screen.dart`:
    - 4 thẻ KPI tổng quan hệ thống: Tổng người dùng, Tổng tour, Tổng khách sạn, Tổng giá trị giao dịch ví.
  - [ ] Xây dựng `lib/screens/admin/user_management_screen.dart`:
    - Danh sách tất cả tài khoản trong hệ thống.
    - Chức năng Khóa / Mở khóa tài khoản (`active` / `blocked`).
    - Chức năng Chuyển đổi vai trò user (`customer`, `tour_operator`, `hotel_manager`, `admin`).

  ### Tiêu chuẩn nghiệm thu
  - Chỉ tài khoản `admin` mới truy cập được.
  - Thống kê KPI tính toán trực tiếp từ dữ liệu thực trong SQLite.
  - Thay đổi trạng thái tài khoản hoặc phân quyền có tác dụng ngay lập tức.
  ```

---

#### Issue #61: `feat(mobile): Màn hình Profile cá nhân & Kiểm thử Windows Desktop`
* **Assignee:** `vinhlele`
* **Labels:** `mobile`, `profile`, `testing`
* **Milestone:** `CP5 - Mobile Application`
* **Description:**
  ```markdown
  ### Mô tả công việc
  Hoàn thiện màn hình hồ sơ cá nhân cho cả 4 vai trò và rà soát kiểm thử toàn diện trên Windows Desktop.

  ### Nhiệm vụ cụ thể
  - [ ] Xây dựng `lib/screens/profile/profile_screen.dart`:
    - Hiển thị avatar, họ tên, email, số điện thoại.
    - Hiển thị huy hiệu (Badge) vai trò rõ nét (Khách hàng, Đối tác Tour, Đối tác Khách sạn, Quản trị viên).
    - Nút Đăng xuất an toàn.
  - [ ] Kiểm thử toàn diện trên Windows Desktop (`flutter run -d windows`):
    - Đăng nhập thử lần lượt 4 vai trò.
    - Chạy thử luồng: Tìm kiếm $\to$ Đặt tour $\to$ Trừ tiền ví $\to$ Hủy tour $\to$ Hoàn tiền ví.
    - Thử thêm mới tour ở Tour Operator $\to$ Đăng nhập Customer thấy tour mới xuất hiện.
    - Đảm bảo app không bị crash, font tiếng Việt hiển thị đẹp không lỗi dấu.

  ### Tiêu chuẩn nghiệm thu
  - Toàn bộ 4 vai trò hoạt động mượt mà, sẵn sàng demo lấy điểm tối đa.
  ```

---

## 📌 QUY ƯỚC ĐẶT TÊN NHÁNH & COMMIT

1. **Tên nhánh:**
   `feature/<mã_issue>-mobile-<mô_tả_ngắn>`
   *Ví dụ:* `feature/50-mobile-sqlite-core`

2. **Commit Message:**
   Tuân thủ Conventional Commits:
   ```text
   feat(mobile): <nội dung ngắn gọn>

   Refs #<mã_issue>
   ```
   *Ví dụ:*
   ```text
   feat(mobile): create database helper and auto-seeding sample tours

   Refs #50
   ```
3. **Pull Request (PR):**
   Tiêu đề PR: `feat(mobile): <nội dung> (#<mã_issue>)`
   Nội dung PR chứa dòng: `Closes #<mã_issue>`
