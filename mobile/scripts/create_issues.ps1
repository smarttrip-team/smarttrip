# Script tự động tạo 12 Issues cho Checkpoint 5 (CP5) lên GitHub
# Yêu cầu: GitHub Personal Access Token (classic hoặc fine-grained có quyền repo / issues:write)

param(
    [string]$Token = $env:GITHUB_TOKEN,
    [string]$Repo = "smarttrip-team/smarttrip"
)

if (-not $Token) {
    $Token = Read-Host "Nhập GitHub Personal Access Token của bạn"
}

if (-not $Token) {
    Write-Error "Không có GitHub Token. Vui lòng cung cấp token để tiếp tục."
    exit 1
}

$headers = @{
    "Authorization" = "token $Token"
    "Accept"        = "application/vnd.github.v3+json"
    "User-Agent"    = "SmartTrip-Issue-Creator"
}

Write-Host ">>> Kiểm tra và tạo Milestone 'CP5 - Mobile Application' trên repo $Repo..." -ForegroundColor Cyan

$milestoneTitle = "CP5 - Mobile Application"
$milestoneNumber = $null

try {
    $existingMilestones = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/milestones?state=all" -Headers $headers -Method Get
    foreach ($m in $existingMilestones) {
        if ($m.title -eq $milestoneTitle) {
            $milestoneNumber = $m.number
            Write-Host "-> Đã tìm thấy Milestone: $milestoneTitle (#$milestoneNumber)" -ForegroundColor Green
            break
        }
    }
} catch {
    Write-Warning "Không thể lấy danh sách milestone: $_"
}

if (-not $milestoneNumber) {
    try {
        $bodyMilestone = @{
            title       = $milestoneTitle
            description = "Giai đoạn phát triển ứng dụng di động SmartTrip Standalone Offline-first SQLite"
            state       = "open"
        } | ConvertTo-Json
        $newMilestone = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/milestones" -Headers $headers -Method Post -Body $bodyMilestone
        $milestoneNumber = $newMilestone.number
        Write-Host "-> Đã tạo mới Milestone: $milestoneTitle (#$milestoneNumber)" -ForegroundColor Green
    } catch {
        Write-Warning "Không thể tạo mới milestone tự động. Sẽ tạo issue không gán milestone. Lỗi: $_"
    }
}

$issues = @(
    @{
        title     = "feat(mobile): Khởi tạo Flutter, SQLite Schema 4 vai trò & Auto-seeding"
        assignees = @("nguyenhongthai2005")
        labels    = @("mobile", "database", "core")
        body      = @"
### Mô tả công việc
Khởi tạo dự án Flutter trong thư mục `mobile/` và thiết lập hệ thống CSDL SQLite nội bộ cho 4 vai trò.

### Nhiệm vụ cụ thể
- [ ] Cập nhật `pubspec.yaml` với: `sqflite`, `sqflite_common_ffi`, `provider`, `go_router`, `shared_preferences`, `intl`.
- [ ] Cấu hình `sqfliteFfiInit()` trong `lib/main.dart` để chạy mượt mà trên Windows Desktop.
- [ ] Viết `lib/database/database_helper.dart` khởi tạo 6 bảng SQLite.
- [ ] Tự động seed sẵn dữ liệu mẫu khi mở app lần đầu cho 4 vai trò.
- [ ] Định nghĩa các model Dart tương ứng trong `lib/models/`.

### Tiêu chuẩn nghiệm thu
- App khởi động không lỗi trên Windows Desktop (`flutter run -d windows`).
- File SQLite `smarttrip.db` được tạo và có đầy đủ dữ liệu seed mẫu.
"@
    },
    @{
        title     = "feat(mobile): Cấu hình Theme Material 3, Navigation GoRouter & Guard"
        assignees = @("vinhlele")
        labels    = @("mobile", "ui", "navigation")
        body      = @"
### Mô tả công việc
Thiết kế hệ thống giao diện chuẩn Material 3 và cấu hình bộ định tuyến GoRouter hỗ trợ phân quyền điều hướng.

### Nhiệm vụ cụ thể
- [ ] Xây dựng App Theme trong `lib/theme/app_theme.dart` (màu chủ đạo Ocean Blue / Travel Teal).
- [ ] Xây dựng các widget dùng chung tại `lib/widgets/` (app_button, app_text_field, stat_card, tour_card).
- [ ] Cấu hình `lib/routes/app_router.dart` với router guard kiểm tra phiên đăng nhập và vai trò.

### Tiêu chuẩn nghiệm thu
- Chuyển màn hình mượt mà bằng GoRouter.
- Các widget hiển thị đồng bộ theo tông màu du lịch hiện đại.
"@
    },
    @{
        title     = "feat(mobile): AuthProvider, Màn hình Đăng nhập (Demo 4 Roles) & Đăng ký"
        assignees = @("nguyenhongthai2005")
        labels    = @("mobile", "auth")
        body      = @"
### Mô tả công việc
Xây dựng luồng xác thực đăng nhập/đăng ký với SQLite và tạo 4 nút chọn nhanh vai trò để demo cho giảng viên.

### Nhiệm vụ cụ thể
- [ ] Xây dựng `lib/providers/auth_provider.dart` kiểm tra SQLite và lưu phiên qua `shared_preferences`.
- [ ] Xây dựng `lib/screens/auth/login_screen.dart` có 4 nút shortcut điền nhanh 4 tài khoản test.
- [ ] Xây dựng `lib/screens/auth/register_screen.dart` tạo tài khoản và ví ban đầu 5 triệu.

### Tiêu chuẩn nghiệm thu
- Đăng nhập đúng tài khoản sẽ chuyển hướng sang màn hình tương ứng với vai trò.
- Đăng ký tài khoản mới lưu thành công vào SQLite.
"@
    },
    @{
        title     = "feat(mobile): TourProvider & Màn hình Khám phá Tour (Search/Filter live)"
        assignees = @("vinhlele")
        labels    = @("mobile", "customer", "tours")
        body      = @"
### Mô tả công việc
Xây dựng màn hình Trang chủ cho Khách hàng với danh sách tour và bộ lọc/tìm kiếm thời gian thực.

### Nhiệm vụ cụ thể
- [ ] Xây dựng `lib/providers/tour_provider.dart` truy vấn và lọc tour từ SQLite.
- [ ] Xây dựng `lib/screens/home/home_screen.dart` với thanh tìm kiếm live và filter chips.
- [ ] Widget hiển thị danh sách tour với giá tiền format VND đẹp mắt.

### Tiêu chuẩn nghiệm thu
- Gõ từ khóa tìm kiếm phản hồi tức thì mà không lag giật.
- Lọc đúng các tour theo danh mục tương ứng.
"@
    },
    @{
        title     = "feat(mobile): HotelProvider, Chi tiết Tour & Chọn Khách sạn liên kết"
        assignees = @("nguyenhongthai2005")
        labels    = @("mobile", "customer", "hotel")
        body      = @"
### Mô tả công việc
Xây dựng màn hình chi tiết tour du lịch và danh sách khách sạn đề xuất để ghép vào đơn đặt tour.

### Nhiệm vụ cụ thể
- [ ] Xây dựng `lib/providers/hotel_provider.dart` quản lý dữ liệu khách sạn.
- [ ] Xây dựng `lib/screens/tour/tour_detail_screen.dart` hiển thị chi tiết tour, lịch trình, giá.
- [ ] Cho phép khách hàng chọn 1 khách sạn đi kèm để ghép vào chuyến đi.

### Tiêu chuẩn nghiệm thu
- Xem chi tiết đầy đủ thông tin tour.
- Chọn khách sạn sẽ lưu lại thông tin để tính tiền ở bước thanh toán.
"@
    },
    @{
        title     = "feat(mobile): WalletProvider & Màn hình Ví điện tử (Nạp nhanh, Lịch sử)"
        assignees = @("vinhlele")
        labels    = @("mobile", "wallet", "payment")
        body      = @"
### Mô tả công việc
Xây dựng hệ thống Ví điện tử độc lập trong SQLite phục vụ thanh toán tour và hoàn tiền.

### Nhiệm vụ cụ thể
- [ ] Xây dựng `lib/providers/wallet_provider.dart` nạp tiền, trừ tiền, lấy biến động số dư.
- [ ] Xây dựng `lib/screens/wallet/wallet_screen.dart` hiển thị số dư và nút nạp nhanh (+1tr, +5tr).
- [ ] Hiển thị danh sách lịch sử giao dịch rõ ràng.

### Tiêu chuẩn nghiệm thu
- Nạp tiền tăng ngay số dư tức thì trong SQLite.
- Hiển thị đầy đủ lịch sử nạp/trừ tiền.
"@
    },
    @{
        title     = "feat(mobile): BookingProvider & Màn hình Đặt tour thanh toán qua Ví"
        assignees = @("nguyenhongthai2005")
        labels    = @("mobile", "booking", "checkout")
        body      = @"
### Mô tả công việc
Xây dựng luồng Đặt tour (Checkout) và thanh toán trừ tiền ví nguyên tử (Atomic transaction).

### Nhiệm vụ cụ thể
- [ ] Xây dựng `lib/providers/booking_provider.dart` kiểm tra ví, trừ tiền, tạo đơn CONFIRMED.
- [ ] Xây dựng `lib/screens/booking/booking_screen.dart` chọn ngày đi, số người lớn/trẻ em.
- [ ] Tính tổng tiền động và trừ ví an toàn trong SQLite.

### Tiêu chuẩn nghiệm thu
- Tính tiền tự động chính xác theo số lượng khách và khách sạn.
- Số dư ví bị trừ đúng số tiền, booking được lưu vào SQLite.
"@
    },
    @{
        title     = "feat(mobile): Màn hình Vé đã đặt & Tính năng Hủy tour tự động hoàn tiền"
        assignees = @("vinhlele")
        labels    = @("mobile", "booking", "refund")
        body      = @"
### Mô tả công việc
Xây dựng màn hình xem danh sách vé đã đặt và chức năng hủy tour tự động hoàn trả 100% tiền vào ví.

### Nhiệm vụ cụ thể
- [ ] Xây dựng `lib/screens/booking/booking_history_screen.dart` hiển thị danh sách vé.
- [ ] Nút Hủy tour kèm dialog xác nhận.
- [ ] Tự động chuyển vé sang CANCELLED và hoàn trả 100% tiền vào ví, ghi log REFUND.

### Tiêu chuẩn nghiệm thu
- Hủy tour thành công, vé chuyển sang trạng thái đã hủy.
- Số dư ví của user lập tức tăng lại đúng số tiền đã hoàn.
"@
    },
    @{
        title     = "feat(mobile): Tour Operator Portal - Quản lý CRUD Tour & Xem khách đặt"
        assignees = @("nguyenhongthai2005")
        labels    = @("mobile", "operator", "crud")
        body      = @"
### Mô tả công việc
Xây dựng phân hệ quản trị dành riêng cho vai trò Tour Operator (`operator@smarttrip.com`).

### Nhiệm vụ cụ thể
- [ ] Xây dựng `lib/screens/operator/operator_dashboard_screen.dart` danh sách tour và thống kê lượt đặt.
- [ ] Xây dựng form Thêm / Sửa / Xóa tour du lịch trực tiếp trong SQLite.
- [ ] Xem danh sách khách hàng đã đặt tour của mình.

### Tiêu chuẩn nghiệm thu
- Chỉ tài khoản `tour_operator` mới vào được màn hình này.
- Thêm, sửa, xóa tour lưu tức thì vào SQLite và hiển thị ngoài trang chủ.
"@
    },
    @{
        title     = "feat(mobile): Hotel Manager Portal - Quản lý CRUD Khách sạn & Giá phòng"
        assignees = @("vinhlele")
        labels    = @("mobile", "hotelier", "crud")
        body      = @"
### Mô tả công việc
Xây dựng phân hệ quản trị dành riêng cho vai trò Hotel Manager (`hotelier@smarttrip.com`).

### Nhiệm vụ cụ thể
- [ ] Xây dựng `lib/screens/hotelier/hotelier_dashboard_screen.dart` danh sách khách sạn.
- [ ] Form Thêm khách sạn mới, Sửa giá phòng/đêm, Xóa khách sạn khỏi SQLite.

### Tiêu chuẩn nghiệm thu
- Chỉ tài khoản `hotel_manager` mới vào được màn hình này.
- CRUD khách sạn cập nhật chuẩn xác vào SQLite.
"@
    },
    @{
        title     = "feat(mobile): Admin Dashboard - Quản trị User, Phân quyền & Thống kê KPI"
        assignees = @("nguyenhongthai2005")
        labels    = @("mobile", "admin", "management")
        body      = @"
### Mô tả công việc
Xây dựng Dashboard quản trị cấp cao dành riêng cho Quản trị viên (`admin@smarttrip.com`).

### Nhiệm vụ cụ thể
- [ ] Xây dựng `lib/screens/admin/admin_dashboard_screen.dart` với 4 thẻ KPI thống kê hệ thống.
- [ ] Màn hình Quản lý người dùng: Xem danh sách, Khóa/Mở tài khoản, Đổi quyền vai trò.

### Tiêu chuẩn nghiệm thu
- Chỉ tài khoản `admin` mới truy cập được.
- Thống kê KPI tính toán trực tiếp từ dữ liệu thực trong SQLite.
- Đổi trạng thái user cập nhật ngay lập tức.
"@
    },
    @{
        title     = "feat(mobile): Màn hình Profile cá nhân & Kiểm thử Windows Desktop"
        assignees = @("vinhlele")
        labels    = @("mobile", "profile", "testing")
        body      = @"
### Mô tả công việc
Hoàn thiện màn hình hồ sơ cá nhân cho cả 4 vai trò và rà soát kiểm thử toàn diện trên Windows Desktop.

### Nhiệm vụ cụ thể
- [ ] Xây dựng `lib/screens/profile/profile_screen.dart` hiển thị thông tin và huy hiệu vai trò.
- [ ] Kiểm thử toàn diện ứng dụng trên Windows Desktop (`flutter run -d windows`).
- [ ] Đảm bảo không lỗi crash, font tiếng Việt hiển thị đẹp, sẵn sàng demo.

### Tiêu chuẩn nghiệm thu
- Toàn bộ 4 vai trò hoạt động mượt mà, sẵn sàng demo lấy điểm tối đa.
"@
    }
)

Write-Host ">>> Bắt đầu tạo 12 issues lên GitHub..." -ForegroundColor Cyan

foreach ($item in $issues) {
    $payload = @{
        title     = $item.title
        body      = $item.body
        assignees = $item.assignees
        labels    = $item.labels
    }
    if ($milestoneNumber) {
        $payload["milestone"] = $milestoneNumber
    }

    $jsonBody = $payload | ConvertTo-Json -Depth 5
    try {
        $res = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/issues" -Headers $headers -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($jsonBody))
        Write-Host "[OK] Đã tạo Issue #${res.number}: $($res.title) -> Assignee: $($item.assignees -join ', ')" -ForegroundColor Green
    } catch {
        Write-Error "[FAIL] Lỗi tạo issue: $($item.title). Chi tiết: $_"
    }
    Start-Sleep -Milliseconds 800
}

Write-Host ">>> HOÀN THÀNH TẠO 12 ISSUES CHO CP5 TRÊN GITHUB!" -ForegroundColor Green
