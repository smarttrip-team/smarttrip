# SMARTTRIP

## Tài liệu tổng thể dự án -- Smart Travel Booking Platform

> **Phiên bản:** 1.0\
> **Ngày lập:** 05/11/2026\
> **Quy mô nhóm:** 2 thành viên\
> **Định hướng phát triển:** Web trước, Mobile sau\
> **Kiến trúc:** Microservices\
> **Mẫu giao dịch phân tán:** Saga Orchestration\
> **Ngôn ngữ tài liệu:** Tiếng Việt\
> **Trạng thái:** Baseline đề xuất -- cần nhóm xác nhận trước khi triển
> khai

------------------------------------------------------------------------

# MỤC LỤC

1.  [Tổng quan dự án](#1-tổng-quan-dự-án)
2.  [Bài toán và mục tiêu](#2-bài-toán-và-mục-tiêu)
3.  [Phạm vi sản phẩm](#3-phạm-vi-sản-phẩm)
4.  [Stakeholders và phân quyền](#4-stakeholders-và-phân-quyền)
5.  [Yêu cầu chức năng](#5-yêu-cầu-chức-năng)
6.  [Yêu cầu phi chức năng](#6-yêu-cầu-phi-chức-năng)
7.  [Business Rules](#7-business-rules)
8.  [Quy trình nghiệp vụ chính](#8-quy-trình-nghiệp-vụ-chính)
9.  [Kiến trúc tổng thể](#9-kiến-trúc-tổng-thể)
10. [Thiết kế từng Microservice](#10-thiết-kế-từng-microservice)
11. [Thiết kế dữ liệu](#11-thiết-kế-dữ-liệu)
12. [Saga Pattern](#12-saga-pattern)
13. [RabbitMQ và Event-Driven
    Communication](#13-rabbitmq-và-event-driven-communication)
14. [Tính nhất quán và độ tin cậy](#14-tính-nhất-quán-và-độ-tin-cậy)
15. [API Design](#15-api-design)
16. [Thiết kế Web Application](#16-thiết-kế-web-application)
17. [Thiết kế Mobile Application](#17-thiết-kế-mobile-application)
18. [Tech Stack](#18-tech-stack)
19. [Cấu trúc Repository](#19-cấu-trúc-repository)
20. [GitHub Workflow và phối hợp
    nhóm](#20-github-workflow-và-phối-hợp-nhóm)
21. [Kế hoạch triển khai](#21-kế-hoạch-triển-khai)
22. [Chiến lược kiểm thử](#22-chiến-lược-kiểm-thử)
23. [Docker và Deployment](#23-docker-và-deployment)
24. [Logging, Monitoring và
    Troubleshooting](#24-logging-monitoring-và-troubleshooting)
25. [Rủi ro và phương án giảm thiểu](#25-rủi-ro-và-phương-án-giảm-thiểu)
26. [Tiêu chí nghiệm thu](#26-tiêu-chí-nghiệm-thu)
27. [Hướng phát triển tương lai](#27-hướng-phát-triển-tương-lai)
28. [Checklist bắt đầu dự án](#28-checklist-bắt-đầu-dự-án)
29. [Thuật ngữ](#29-thuật-ngữ)
30. [Tài liệu tham khảo](#30-tài-liệu-tham-khảo)

------------------------------------------------------------------------

# 1. Tổng quan dự án

## 1.1. Tên dự án

**SmartTrip -- Smart Travel Booking Platform**

SmartTrip là nền tảng đặt tour du lịch trực tuyến, cho phép khách hàng
tìm kiếm tour, xem lịch khởi hành, lựa chọn khách sạn tùy chọn, đặt dịch
vụ, thanh toán bằng ví mô phỏng và theo dõi trạng thái đặt tour.

Hệ thống được xây dựng theo kiến trúc Microservices nhằm thực hành các
vấn đề trong hệ thống phân tán, đặc biệt là:

-   Database per Service.
-   Synchronous và asynchronous communication.
-   Saga Orchestration.
-   Compensating Transaction.
-   Eventual Consistency.
-   Idempotency.
-   Transactional Outbox.
-   Retry, timeout và Dead Letter Queue.
-   Concurrency control.
-   Observability và distributed tracing.

## 1.2. Định hướng sản phẩm

SmartTrip không đặt mục tiêu trở thành một nền tảng OTA hoàn chỉnh. Đây
là sản phẩm học tập có nghiệp vụ đủ thực tế để nhóm hai người có thể
triển khai và chứng minh kiến thức Microservices.

### Giả định baseline của MVP

  Hạng mục            Quyết định
  ------------------- -----------------------------------------
  Thị trường          Tour nội địa Việt Nam
  Loại tour           Tour trọn gói, có lịch khởi hành cụ thể
  Khách sạn           Tùy chọn thêm khi đặt tour
  Đơn vị tiền tệ      VND
  Thanh toán          Mock Wallet
  Hoàn tiền           Hoàn vào Mock Wallet
  Khách hàng          Người dùng đã đăng ký và đăng nhập
  Đối tác tour        Tour Operator
  Đối tác khách sạn   Hotel Manager
  Quản trị            Admin
  Web                 React + Vite
  Mobile              Flutter, triển khai sau Web
  Backend             Java 21 + Spring Boot
  Messaging           RabbitMQ
  Database            MySQL, database riêng theo service

Các giả định này là baseline để tài liệu có thể đi tiếp. Nhóm có thể
thay đổi bằng cách cập nhật Project Decision Log, nhưng không nên thay
đổi rải rác trong code mà không cập nhật tài liệu.

## 1.3. Tầm nhìn

Tạo ra một hệ thống đặt tour có khả năng xử lý một giao dịch nghiệp vụ
xuyên nhiều dịch vụ độc lập, đảm bảo không bán vượt số chỗ, không giữ
tài nguyên vô thời hạn và có thể phục hồi khi một service hoặc message
broker gặp sự cố.

------------------------------------------------------------------------

# 2. Bài toán và mục tiêu

## 2.1. Bài toán

Quy trình đặt tour thường liên quan đến nhiều nguồn dữ liệu và dịch vụ:

1.  Thông tin tour và lịch khởi hành.
2.  Số chỗ còn lại của tour.
3.  Phòng khách sạn nếu khách chọn thêm.
4.  Thông tin thanh toán.
5.  Trạng thái đơn đặt tour.

Nếu các thành phần này được triển khai thành những service độc lập, hệ
thống không thể sử dụng một database transaction duy nhất để bao trùm
tất cả. Ví dụ, tour đã được giữ chỗ nhưng thanh toán thất bại thì hệ
thống cần giải phóng chỗ đã giữ.

SmartTrip sử dụng Saga để điều phối các local transaction và
compensation khi quy trình không thể hoàn thành.

## 2.2. Mục tiêu sản phẩm

-   Cho phép khách hàng tìm kiếm và đặt tour trực tuyến.
-   Quản lý lịch khởi hành và số lượng chỗ.
-   Hỗ trợ lựa chọn khách sạn, loại phòng và số phòng.
-   Quản lý ví mô phỏng và giao dịch thanh toán.
-   Cho phép khách hàng xem, theo dõi và hủy booking theo chính sách.
-   Cung cấp trang quản trị cho các vai trò vận hành.

## 2.3. Mục tiêu kỹ thuật

-   Tách service theo bounded context và quyền sở hữu dữ liệu.
-   Không cho service truy cập trực tiếp database của service khác.
-   Dùng REST cho request-response phù hợp và RabbitMQ cho xử lý bất
    đồng bộ.
-   Dùng Saga Orchestration cho Booking và Cancellation.
-   Có khả năng retry message an toàn.
-   Chống xử lý trùng bằng idempotency.
-   Giảm rủi ro dual-write bằng Transactional Outbox.
-   Có integration test cho happy path và failure path.
-   Có thể chạy toàn hệ thống bằng Docker Compose ở môi trường phát
    triển.

## 2.4. Không phải mục tiêu của MVP

-   Tích hợp thanh toán ngân hàng thật.
-   Tích hợp hãng hàng không.
-   Đồng bộ với hệ thống khách sạn bên ngoài.
-   Tự động đề xuất tour bằng AI.
-   Xây dựng hệ thống microservices trên Kubernetes.
-   Hỗ trợ đa quốc gia và đa tiền tệ.
-   Tối ưu cho hàng triệu người dùng.
-   Xây dựng hệ thống chat hoặc mạng xã hội du lịch.

------------------------------------------------------------------------

# 3. Phạm vi sản phẩm

## 3.1. In Scope -- MVP

### Customer

-   Đăng ký, đăng nhập, đăng xuất.
-   Xem và cập nhật hồ sơ.
-   Tìm kiếm, lọc và xem chi tiết tour.
-   Xem lịch khởi hành và số chỗ còn lại.
-   Chọn lịch khởi hành.
-   Chọn hoặc bỏ qua khách sạn.
-   Nhập thông tin hành khách.
-   Tạo booking.
-   Thanh toán bằng Mock Wallet.
-   Xem trạng thái booking.
-   Xem lịch sử thanh toán.
-   Hủy booking theo chính sách.
-   Nhận kết quả hoàn tiền.

### Tour Operator

-   Tạo, sửa, ẩn và xem tour.
-   Quản lý lịch khởi hành.
-   Thiết lập tổng số chỗ.
-   Xem số chỗ còn lại.
-   Xem danh sách booking liên quan đến tour.
-   Hủy lịch khởi hành theo quy trình quản trị.

### Hotel Manager

-   Tạo và cập nhật thông tin khách sạn.
-   Quản lý loại phòng.
-   Quản lý số lượng phòng.
-   Quản lý giá phòng.
-   Xem reservation.
-   Đóng/mở bán phòng theo ngày.

### Admin

-   Quản lý người dùng và vai trò.
-   Theo dõi tour, khách sạn, booking và payment.
-   Xem Saga đang chạy hoặc thất bại.
-   Xem lỗi và các compensation cần xử lý thủ công.
-   Xem audit log.

## 3.2. Out of Scope -- MVP

-   Đặt vé máy bay.
-   Đặt xe đưa đón.
-   Coupon và loyalty point.
-   Review có kiểm duyệt phức tạp.
-   Dynamic pricing.
-   Thanh toán thật.
-   Hoàn tiền qua ngân hàng thật.
-   Multi-tenant cho nhiều công ty du lịch.
-   Notification Service độc lập.
-   Search Engine chuyên dụng như Elasticsearch.

## 3.3. Ưu tiên phát triển

  Priority   Nội dung
  ---------- -------------------------------------------------------
  P0         Chức năng bắt buộc để có sản phẩm chạy được
  P1         Chức năng chứng minh kiến thức Microservices nâng cao
  P2         Chức năng mở rộng nếu còn thời gian

**P0** - User, Tour, Hotel, Payment, Booking. - API Gateway. - Database
per Service. - RabbitMQ. - Booking Saga happy path. - Compensation cơ
bản. - React Web Customer. - Management Dashboard cơ bản. - Docker
Compose.

**P1** - Cancellation Saga. - Transactional Outbox. - Idempotent
consumer. - Retry và DLQ. - Reservation expiration. - Concurrency
test. - Saga Monitoring Dashboard. - Flutter Customer App.

**P2** - Notification. - Review. - Promotion. - Distributed tracing đầy
đủ. - Prometheus/Grafana. - Recommendation.

------------------------------------------------------------------------

# 4. Stakeholders và phân quyền

## 4.1. Actors

  Actor           Mô tả
  --------------- -------------------------------------------
  Guest           Người chưa đăng nhập, chỉ xem và tìm kiếm
  Customer        Người đặt tour và quản lý booking
  Tour Operator   Quản lý tour và lịch khởi hành
  Hotel Manager   Quản lý khách sạn và phòng
  Admin           Quản trị hệ thống

## 4.2. Permission Matrix

  Chức năng                  Guest   Customer   Tour Operator   Hotel Manager   Admin
  ------------------------ ------- ---------- --------------- --------------- -------
  Xem tour                       ✓          ✓               ✓               ✓       ✓
  Đặt tour                                  ✓                                 
  Xem booking của mình                      ✓                                 
  Hủy booking của mình                      ✓                                 
  Quản lý tour                                              ✓                       ✓
  Quản lý departure                                         ✓                       ✓
  Quản lý hotel                                                             ✓       ✓
  Quản lý room inventory                                                    ✓       ✓
  Xem toàn bộ booking                                     ✓\*             ✓\*       ✓
  Quản lý user                                                                      ✓
  Xem Saga monitoring                                                               ✓

`*` Tour Operator và Hotel Manager chỉ được xem dữ liệu thuộc phạm vi
tài nguyên họ quản lý.

## 4.3. Quy tắc bảo mật

-   Customer chỉ được xem và thao tác booking của chính mình.
-   Tour Operator chỉ quản lý tour/departure thuộc quyền sở hữu.
-   Hotel Manager chỉ quản lý khách sạn thuộc quyền sở hữu.
-   Admin có quyền quản trị nhưng các thao tác nhạy cảm phải được audit.
-   Không tin tưởng role hoặc userId do client tự gửi.
-   Gateway có thể xác thực JWT, nhưng service vẫn phải kiểm tra quyền ở
    các nghiệp vụ nhạy cảm.
-   Password phải được hash bằng thuật toán phù hợp, không lưu
    plaintext.
-   Không ghi access token, password hoặc thông tin nhạy cảm vào log.

------------------------------------------------------------------------

# 5. Yêu cầu chức năng

## 5.1. Authentication và User

  ID           Yêu cầu                             Actor      Priority
  ------------ ----------------------------------- ---------- ----------
  FR-USER-01   Đăng ký tài khoản                   Guest      P0
  FR-USER-02   Đăng nhập                           Guest      P0
  FR-USER-03   Lấy thông tin người dùng hiện tại   Customer   P0
  FR-USER-04   Cập nhật hồ sơ                      Customer   P0
  FR-USER-05   Đổi mật khẩu                        Customer   P1
  FR-USER-06   Quản lý vai trò                     Admin      P0
  FR-USER-07   Khóa/mở khóa tài khoản              Admin      P1

## 5.2. Tour

  ID           Yêu cầu                      Actor            Priority
  ------------ ---------------------------- ---------------- ----------
  FR-TOUR-01   Xem danh sách tour           Guest/Customer   P0
  FR-TOUR-02   Tìm tour theo từ khóa        Guest/Customer   P0
  FR-TOUR-03   Lọc theo điểm đến            Guest/Customer   P0
  FR-TOUR-04   Lọc theo giá và thời lượng   Guest/Customer   P1
  FR-TOUR-05   Xem chi tiết tour            Guest/Customer   P0
  FR-TOUR-06   Xem lịch khởi hành           Guest/Customer   P0
  FR-TOUR-07   Tạo/cập nhật tour            Tour Operator    P0
  FR-TOUR-08   Quản lý departure            Tour Operator    P0
  FR-TOUR-09   Ẩn/ngừng bán tour            Tour Operator    P1

## 5.3. Hotel

  ID            Yêu cầu                    Actor            Priority
  ------------- -------------------------- ---------------- ----------
  FR-HOTEL-01   Xem danh sách khách sạn    Guest/Customer   P0
  FR-HOTEL-02   Xem loại phòng             Guest/Customer   P0
  FR-HOTEL-03   Kiểm tra phòng theo ngày   Customer         P0
  FR-HOTEL-04   Quản lý khách sạn          Hotel Manager    P0
  FR-HOTEL-05   Quản lý loại phòng         Hotel Manager    P0
  FR-HOTEL-06   Quản lý inventory          Hotel Manager    P0

## 5.4. Booking

  ID           Yêu cầu                            Actor      Priority
  ------------ ---------------------------------- ---------- ----------
  FR-BOOK-01   Tạo booking                        Customer   P0
  FR-BOOK-02   Xem trạng thái booking             Customer   P0
  FR-BOOK-03   Xem lịch sử booking                Customer   P0
  FR-BOOK-04   Xem chi tiết booking               Customer   P0
  FR-BOOK-05   Hủy booking                        Customer   P1
  FR-BOOK-06   Theo dõi trạng thái Saga           Admin      P1
  FR-BOOK-07   Xử lý compensation cần can thiệp   Admin      P1

## 5.5. Payment

  ID          Yêu cầu                 Actor               Priority
  ----------- ----------------------- ------------------- ----------
  FR-PAY-01   Xem số dư Mock Wallet   Customer            P0
  FR-PAY-02   Nạp tiền giả lập        Customer            P0
  FR-PAY-03   Authorize payment       Booking Saga        P0
  FR-PAY-04   Capture payment         Booking Saga        P0
  FR-PAY-05   Void authorization      Booking Saga        P0
  FR-PAY-06   Refund payment          Cancellation Saga   P1
  FR-PAY-07   Xem lịch sử giao dịch   Customer            P0

Mock top-up chỉ là thao tác giả lập trong môi trường học tập. Không tích
hợp ngân hàng và không được mô tả là giao dịch tiền thật.

------------------------------------------------------------------------

# 6. Yêu cầu phi chức năng

## 6.1. Reliability

-   Booking không được xác nhận nếu chưa hoàn thành các bước bắt buộc.
-   Không được bán vượt số chỗ hoặc số phòng.
-   Message có thể được giao lại nhưng không được tạo tác động nghiệp vụ
    lặp.
-   Saga phải lưu trạng thái bền vững.
-   Service restart không được làm mất trạng thái giao dịch đã commit.
-   Compensation thất bại phải được ghi nhận và có cơ chế xử lý tiếp.

## 6.2. Security

-   HTTPS ở môi trường production.
-   JWT có thời hạn.
-   Password hashing.
-   Authorization ở từng service.
-   Validate input.
-   Rate limiting ở Gateway.
-   CORS chỉ cho phép origin được cấu hình.
-   Không commit secret vào Git.
-   Dùng environment variables hoặc secret manager.

## 6.3. Performance

Mục tiêu ban đầu để kiểm thử, không phải cam kết SLA:

-   API đọc thông thường: p95 dưới 1 giây trong môi trường demo.
-   API tạo booking: phản hồi tiếp nhận nhanh, không giữ HTTP connection
    trong toàn bộ Saga.
-   Trạng thái booking được cập nhật sau khi nhận event.
-   Tìm kiếm có pagination.
-   Không tải toàn bộ dữ liệu tour hoặc booking cùng lúc.

## 6.4. Maintainability

-   Code theo layer rõ ràng.
-   Business logic không nằm trong Controller.
-   Mỗi service có README và API documentation.
-   Có migration database.
-   Có unit test cho domain/application logic.
-   Có integration test cho persistence và messaging.
-   Có logging với correlation ID.

## 6.5. Scalability

-   Service có thể chạy nhiều instance nếu cần.
-   Không lưu state nghiệp vụ quan trọng chỉ trong memory.
-   RabbitMQ queue có thể được consumer theo nhóm.
-   Database index theo các truy vấn thường dùng.
-   Không giả định scale-out tự động giải quyết concurrency.

------------------------------------------------------------------------

# 7. Business Rules

## 7.1. Tour và Departure

1.  Một Tour có thể có nhiều Departure.
2.  Mỗi Departure có ngày khởi hành, ngày kết thúc, tổng sức chứa và số
    chỗ khả dụng.
3.  Tổng sức chứa phải lớn hơn 0.
4.  Số chỗ khả dụng không được âm.
5.  Không cho đặt departure đã đóng hoặc đã qua thời gian cho phép đặt.
6.  Giá tại thời điểm booking phải được snapshot.
7.  Không xóa cứng tour đã có booking; dùng trạng thái ngừng bán/ẩn.

## 7.2. Hotel và Room Inventory

1.  Một Hotel có nhiều Room Type.
2.  Inventory phải được quản lý theo ngày hoặc theo khoảng ngày phù hợp
    với mô hình dữ liệu.
3.  Không được xác nhận số phòng vượt inventory.
4.  Giá phòng tại thời điểm booking phải được snapshot.
5.  Nếu khách không chọn hotel, Booking không tạo hotel reservation.
6.  Nếu khách chọn hotel, ngày lưu trú phải tương thích với lịch tour
    hoặc quy tắc check-in/check-out đã định nghĩa.

## 7.3. Booking

1.  Booking thuộc về một Customer.
2.  Một booking MVP đặt một departure.
3.  Một booking có thể có nhiều passenger.
4.  Hotel là tùy chọn.
5.  Booking ban đầu ở trạng thái `PENDING`.
6.  Chỉ chuyển sang `CONFIRMED` khi mọi bước bắt buộc thành công.
7.  Nếu Saga thất bại và compensation hoàn tất, booking chuyển `FAILED`
    hoặc `CANCELLED` tùy nguyên nhân và quy ước trạng thái.
8.  Mỗi booking có mã định danh công khai duy nhất.
9.  Giá booking được tính ở backend, không tin tổng tiền do frontend
    gửi.
10. Client phải gửi idempotency key khi tạo booking.

## 7.4. Payment

1.  Chỉ Payment Service được phép thay đổi wallet balance.
2.  Booking Service không truy cập bảng wallet.
3.  Authorize tạo khoản tiền giữ chỗ, chưa phải giao dịch capture cuối
    cùng.
4.  Capture chỉ được thực hiện trên authorization hợp lệ.
5.  Void chỉ áp dụng cho authorization chưa capture.
6.  Refund tham chiếu payment đã capture.
7.  Không cho số dư âm.
8.  Mỗi thao tác tài chính phải có transaction reference và idempotency
    key.
9.  Mọi biến động số dư phải có ledger/transaction record.

## 7.5. Reservation Timeout

-   Reservation tạm thời có thời hạn, ví dụ 10 phút.
-   Thời hạn phải được lưu bằng `expires_at`.
-   Worker định kỳ tìm reservation hết hạn.
-   Trước khi release, phải kiểm tra reservation còn ở trạng thái
    `HELD`.
-   Nếu Saga đã xác nhận reservation, worker không được release.
-   Timeout event và compensation phải idempotent.

## 7.6. Chính sách hủy tham khảo

Chính sách minh họa:

  Thời điểm yêu cầu hủy           Tỷ lệ hoàn
  ----------------------------- ------------
  Trên 7 ngày trước khởi hành           100%
  Từ 3 đến 7 ngày                        50%
  Dưới 3 ngày                             0%

Nhóm cần xác định cách tính mốc thời gian, timezone, ngày khởi hành và
phí dịch vụ. Chính sách này chỉ là rule học tập, không phải quy định
pháp luật hoặc chính sách của một doanh nghiệp cụ thể.

------------------------------------------------------------------------

# 8. Quy trình nghiệp vụ chính

## 8.1. Customer đặt tour

1.  Customer đăng nhập.
2.  Tìm kiếm tour.
3.  Xem chi tiết tour.
4.  Chọn departure.
5.  Chọn số lượng khách.
6.  Chọn hotel nếu muốn.
7.  Nhập thông tin hành khách.
8.  Backend tính giá.
9.  Customer xác nhận.
10. Booking Service tạo booking và khởi chạy Saga.
11. Client nhận booking ID và trạng thái `PENDING`.
12. Saga xử lý các bước giữ tài nguyên và thanh toán.
13. Booking chuyển `CONFIRMED` hoặc trạng thái thất bại.
14. Client polling trạng thái hoặc nhận cập nhật qua SSE/WebSocket nếu
    được triển khai.

## 8.2. Booking không có khách sạn

Nếu khách bỏ qua khách sạn:

-   Saga không gửi `ReserveHotel`.
-   Không có Hotel Reservation.
-   Tổng tiền chỉ bao gồm các thành phần thực tế được chọn.
-   Các bước còn lại vẫn chạy bình thường.

## 8.3. Booking có khách sạn

-   Tour Service giữ chỗ.
-   Hotel Service giữ phòng.
-   Payment Service authorize tiền.
-   Các service xác nhận tài nguyên.
-   Payment capture.
-   Booking hoàn tất.

## 8.4. Customer hủy booking

1.  Customer gửi yêu cầu hủy.
2.  Booking kiểm tra booking có thuộc Customer không.
3.  Kiểm tra trạng thái booking.
4.  Kiểm tra cancellation policy.
5.  Tính refund amount.
6.  Khởi chạy Cancellation Saga.
7.  Payment refund theo chính sách.
8.  Tour reservation được release.
9.  Hotel reservation được cancel.
10. Booking cập nhật trạng thái cuối.

Không cho hủy một booking đang có Saga tạo booking chưa kết thúc, trừ
khi nhóm thiết kế rõ cơ chế yêu cầu hủy và phối hợp với Saga hiện tại.

------------------------------------------------------------------------

# 9. Kiến trúc tổng thể

## 9.1. Danh sách thành phần

SmartTrip có 5 Business Services, 1 Service Discovery (Eureka Server) và 1 API Gateway.

  Thành phần                  Trách nhiệm
  --------------------------- -------------------------------------------------------------
  Eureka Server               Service Discovery & Registry, quản lý danh bạ service
  API Gateway                 Routing động qua Eureka, JWT pre-check, rate limiting, CORS
  User Service                Account, profile, roles (Identity Service)
  Tour Service                Tour, departure, capacity, reserve & confirm seats
  Hotel Service               Hotel, room, inventory, reserve & confirm rooms
  Payment Service             Mock Wallet, authorize, capture, void, refund, ledger
  Booking Service             Booking aggregate, snapshot giá, điều phối Saga Orchestration
  RabbitMQ                    Message broker cho giao tiếp bất đồng bộ và Saga
  OpenFeign                   HTTP client đồng bộ giữa các microservices
  MySQL instances/databases   Lưu dữ liệu độc lập từng service (Database per Service)
  React Web                   Customer và management UI
  Flutter App                 Customer mobile UI (tùy chọn giai đoạn mở rộng)

## 9.2. Sơ đồ kiến trúc

``` mermaid
flowchart TB
    WEB[React Web]
    MOBILE[Flutter Mobile]
    GW[Spring Cloud API Gateway]
    EUREKA[Eureka Discovery Server]

    WEB --> GW
    MOBILE --> GW

    GW -.->|Lookup Services| EUREKA
    USER -.->|Register| EUREKA
    TOUR -.->|Register| EUREKA
    HOTEL -.->|Register| EUREKA
    BOOKING -.->|Register| EUREKA
    PAYMENT -.->|Register| EUREKA

    GW -->|lb://user-service| USER[User Service]
    GW -->|lb://tour-service| TOUR[Tour Service]
    GW -->|lb://hotel-service| HOTEL[Hotel Service]
    GW -->|lb://booking-service| BOOKING[Booking Service]
    GW -->|lb://payment-service| PAYMENT[Payment Service]

    %% Đồng bộ qua OpenFeign
    BOOKING -->|OpenFeign: Check Customer Status| USER
    BOOKING -->|OpenFeign: Get Departure & Price Snapshot| TOUR
    HOTEL -->|OpenFeign: Verify Manager Role| USER

    USER --> UDB[(smarttrip_user_db)]
    TOUR --> TDB[(smarttrip_tour_db)]
    HOTEL --> HDB[(smarttrip_hotel_db)]
    BOOKING --> BDB[(smarttrip_booking_db)]
    PAYMENT --> PDB[(smarttrip_payment_db)]

    %% Bất đồng bộ qua RabbitMQ (Saga)
    BOOKING <-->|Commands / Events| MQ[RabbitMQ]
    TOUR <-->|Reserve / Confirm / Release| MQ
    HOTEL <-->|Reserve / Confirm / Release| MQ
    PAYMENT <-->|Authorize / Capture / Void / Refund| MQ
```

## 9.3. Nguyên tắc kiến trúc

-   Mỗi service sở hữu database riêng (Database per Service).
-   Không join xuyên database.
-   Không chia sẻ JPA Entity giữa các service.
-   Giao tiếp đồng bộ bằng Spring Cloud OpenFeign qua Eureka cho các nhu cầu đọc/xác thực tức thời.
-   Giao tiếp bất đồng bộ bằng RabbitMQ cho các giao dịch phân tán và thay đổi trạng thái trong Saga.
-   Service có thể deploy và mở rộng độc lập.
-   Booking Service điều phối Saga nhưng không can thiệp trực tiếp vào dữ liệu nội bộ của service khác.
-   Mỗi service có local transaction riêng.
-   Chấp nhận trạng thái trung gian do Eventual Consistency.
-   Có timeout, retry, idempotency và compensation.

## 9.4. API Gateway

Trách nhiệm:

-   Nhận request từ Web/Mobile là điểm truy cập duy nhất (Single Entry Point).
-   Tích hợp Eureka Server để phân giải địa chỉ service động bằng cú pháp `lb://<service-name>`.
-   Xác thực JWT ở lớp gateway trước khi chuyển tiếp request vào mạng nội bộ.
-   Rate limiting, CORS, gán Correlation ID cho distributed tracing.
-   Chuẩn hóa các mã lỗi gateway (401 Unauthorized, 403 Forbidden, 503 Service Unavailable).

Gateway tuyệt đối không chứa business logic đặt tour, tính giá hoặc quản lý inventory.

## 9.5. Service Discovery với Spring Cloud Netflix Eureka

Hệ thống sử dụng **Spring Cloud Netflix Eureka Server** làm trung tâm Service Registry & Discovery, đáp ứng chuẩn yêu cầu bắt buộc của kiến trúc Microservices:

-   **Service Registration:** Tất cả các microservices (`user-service`, `tour-service`, `hotel-service`, `payment-service`, `booking-service`) khi khởi động sẽ tự động đăng ký tên service, IP và Port với Eureka Server.
-   **Dynamic Routing tại Gateway:** API Gateway cấu hình routes dựa trên Eureka ID (ví dụ: `uri: lb://booking-service`). Khi có nhiều instance của một service chạy đồng thời, Gateway tự động cân bằng tải (Client-side Load Balancing qua Spring Cloud LoadBalancer).
-   **Health Check & Heartbeat:** Eureka định kỳ nhận heartbeat từ các service instance. Nếu một service ngừng hoạt động hoặc bị lỗi, Eureka sẽ tự động gỡ bỏ instance đó khỏi registry.
-   **Khử phụ thuộc IP/Port tĩnh:** Các service không cần biết địa chỉ IP cụ thể của nhau trong môi trường Docker, cho phép scale-out linh hoạt.

## 9.6. Giao tiếp đồng bộ giữa các Microservices bằng Spring Cloud OpenFeign

Hệ thống áp dụng **Spring Cloud OpenFeign** kết hợp với Eureka Service Discovery cho các kịch bản gọi đồng bộ (Synchronous HTTP REST) giữa các microservice nội bộ:

### Kịch bản 1: Booking Service xác thực tài khoản khách hàng qua User Service
-   **Bối cảnh:** Khi Customer gửi yêu cầu đặt tour (`POST /api/v1/bookings`), trước khi khởi tạo đơn hàng và kích hoạt Saga, Booking Service cần kiểm tra trạng thái hoạt động của tài khoản khách hàng.
-   **Feign Client:** `UserFeignClient` khai báo `@FeignClient(name = "user-service")`.
-   **Endpoint được gọi:** `GET /internal/v1/users/{userId}/status`.
-   **Xử lý nghiệp vụ:**
    -   Nếu `User Service` trả về `status == "ACTIVE"`, `Booking Service` tiếp tục quy trình.
    -   Nếu tài khoản bị `BLOCKED`, `SUSPENDED` hoặc không tồn tại: Booking Service chặn ngay lập tức, trả lỗi `403 Forbidden` / `400 Bad Request` kèm thông báo *"Tài khoản người dùng đang bị khóa hoặc không hợp lệ"*, không cần khởi chạy Saga.
    -   **Chịu lỗi:** Áp dụng timeout (ví dụ 2 giây) và fallback exception rõ ràng, tránh nghẽn thread.

### Kịch bản 2: Booking Service lấy thông tin Departure & snapshot giá từ Tour Service
-   **Bối cảnh:** Khi tạo đơn hàng, Booking Service không được tin tưởng giá và tên tour do Client gửi lên. Booking Service phải gọi trực tiếp Tour Service để lấy thông tin mới nhất và snapshot vào `booking_items`.
-   **Feign Client:** `TourFeignClient` khai báo `@FeignClient(name = "tour-service")`.
-   **Endpoint được gọi:** `GET /internal/v1/departures/{departureId}`.
-   **Xử lý nghiệp vụ:**
    -   `Tour Service` trả về `tourId`, `tourName`, `departureDate`, `returnDate`, `basePrice`, `status`.
    -   Nếu lịch khởi hành đã quá hạn hoặc đang ở trạng thái `CLOSED` / `CANCELLED`: `Booking Service` báo lỗi `400 Bad Request` ("Lịch khởi hành đã đóng hoặc không khả dụng").
    -   Nếu hợp lệ: `Booking Service` lấy `basePrice` để tính toán chính xác `totalAmount`, lưu snapshot bất biến vào database của mình rồi mới kích hoạt luồng giữ chỗ.

### Kịch bản 3 (Bổ sung): Hotel Service xác thực quyền quản trị của Hotel Manager qua User Service
-   **Bối cảnh:** Khi Hotel Manager tạo khách sạn hoặc cập nhật cấu hình phòng (`POST /api/v1/manager/hotels`), Hotel Service cần xác minh `managerId` gửi trong token có thực sự mang quyền `ROLE_HOTEL_MANAGER` và tài khoản còn hiệu lực.
-   **Feign Client:** `UserFeignClient` trong `hotel-service`.
-   **Endpoint được gọi:** `GET /internal/v1/users/{userId}/verify-role?role=HOTEL_MANAGER`.
-   **Xử lý:** Đảm bảo toàn vẹn dữ liệu đa service mà không cần query chéo database.

------------------------------------------------------------------------

# 10. Thiết kế từng Microservice

## 10.1. User Service

### Trách nhiệm

-   Register/Login.
-   Password hashing.
-   User profile.
-   Role và permission.
-   Account status.

### Database gợi ý

-   `users`
-   `user_profiles`
-   `roles`
-   `user_roles`
-   `refresh_tokens` (nếu triển khai refresh token)
-   `audit_logs` (nếu audit được quản lý ở service này)

### API

``` http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/users/me
PUT  /api/v1/users/me
GET  /api/v1/admin/users
PATCH /api/v1/admin/users/{id}/status
```

### Lưu ý

-   Dùng BCrypt hoặc Argon2.
-   Không trả password hash ra API.
-   Role phải được kiểm soát ở backend.
-   Token cần có expiration.
-   Nếu dùng JWT stateless, cần có chiến lược thu hồi token phù hợp.

## 10.2. Tour Service

### Trách nhiệm

-   Quản lý tour và destination.
-   Quản lý departure.
-   Quản lý capacity.
-   Giữ chỗ, xác nhận và giải phóng chỗ.
-   Cung cấp dữ liệu tìm kiếm tour.

### Entity gợi ý

-   `tours`
-   `destinations`
-   `tour_departures`
-   `tour_reservations`
-   `tour_images`
-   `tour_itinerary_days`

### API

``` http
GET    /api/v1/tours
GET    /api/v1/tours/{id}
GET    /api/v1/tours/{id}/departures
POST   /api/v1/operator/tours
PUT    /api/v1/operator/tours/{id}
POST   /api/v1/operator/tours/{id}/departures
POST   /internal/tour-reservations
POST   /internal/tour-reservations/{id}/confirm
POST   /internal/tour-reservations/{id}/release
```

Các endpoint `/internal` minh họa giao tiếp nội bộ nếu dùng REST. Nếu xử
lý qua RabbitMQ, command/event contract sẽ là giao diện nội bộ chính.

### Concurrency

Không dùng mô hình read-then-write thiếu khóa.

Ví dụ cập nhật có điều kiện:

``` sql
UPDATE tour_departures
SET available_seats = available_seats - :quantity
WHERE id = :departureId
  AND available_seats >= :quantity;
```

Chỉ coi là giữ chỗ thành công nếu số dòng cập nhật bằng 1. Thao tác cập
nhật inventory và tạo reservation phải nằm trong cùng local transaction.

## 10.3. Hotel Service

### Trách nhiệm

-   Quản lý hotel.
-   Quản lý room type.
-   Quản lý inventory theo ngày.
-   Reserve, confirm, release room.
-   Hủy reservation.

### Entity gợi ý

-   `hotels`
-   `room_types`
-   `room_inventory`
-   `hotel_reservations`
-   `hotel_reservation_items`

### API

``` http
GET    /api/v1/hotels
GET    /api/v1/hotels/{id}
GET    /api/v1/hotels/{id}/rooms
GET    /api/v1/hotels/{id}/availability
POST   /api/v1/manager/hotels
POST   /internal/hotel-reservations
POST   /internal/hotel-reservations/{id}/confirm
POST   /internal/hotel-reservations/{id}/release
```

### Inventory theo ngày

Với MVP, có thể quản lý inventory theo từng ngày:

-   `room_type_id`
-   `inventory_date`
-   `total_rooms`
-   `available_rooms`

Khi đặt phòng từ ngày check-in đến trước ngày check-out, phải giữ
inventory cho từng đêm. Tất cả ngày cần được cập nhật nguyên tử trong
transaction cục bộ của Hotel Service. Nếu một ngày không đủ phòng,
rollback toàn bộ thao tác giữ phòng.

## 10.4. Payment Service

### Trách nhiệm

-   Mock Wallet.
-   Ledger/transaction.
-   Authorize.
-   Capture.
-   Void.
-   Refund.

### Entity gợi ý

-   `wallets`
-   `wallet_transactions`
-   `payment_authorizations`
-   `payments`
-   `refunds`
-   `outbox_events`
-   `processed_messages`

### API

``` http
GET  /api/v1/wallet
POST /api/v1/wallet/top-ups
GET  /api/v1/wallet/transactions
GET  /api/v1/payments/{id}
```

Các thao tác authorize/capture/void/refund là internal command hoặc
internal API, không cho client tự gọi trực tiếp với quyền tùy ý.

### Payment State

``` text
PENDING
  |
  v
AUTHORIZED
  |
  +----> VOIDED
  |
  v
CAPTURED
  |
  v
PARTIALLY_REFUNDED
  |
  v
REFUNDED
```

Không cho chuyển trạng thái ngược hoặc thực hiện capture nhiều lần.

### Ledger

Mọi biến động ví cần được ghi nhận thành transaction bất biến hoặc có
audit rõ ràng. Không chỉ cập nhật một cột balance mà không có lịch sử.

## 10.5. Booking Service

### Trách nhiệm

-   Tạo booking.
-   Lưu snapshot giá và thông tin tour.
-   Quản lý booking status.
-   Quản lý Saga Instance.
-   Điều phối Booking Saga.
-   Điều phối Cancellation Saga.
-   Xử lý event từ các service.
-   Cung cấp trạng thái booking cho client.
-   Cung cấp Saga monitoring cho Admin.

### Entity gợi ý

-   `bookings`
-   `booking_items`
-   `booking_passengers`
-   `booking_hotel_details`
-   `saga_instances`
-   `saga_steps`
-   `outbox_events`
-   `processed_messages`

### API

``` http
POST /api/v1/bookings
GET  /api/v1/bookings
GET  /api/v1/bookings/{bookingCode}
POST /api/v1/bookings/{bookingCode}/cancel
GET  /api/v1/admin/sagas
GET  /api/v1/admin/sagas/{sagaId}
```

### Booking Status đề xuất

-   `PENDING`
-   `CONFIRMED`
-   `CANCELLATION_PENDING`
-   `CANCELLED`
-   `FAILED`
-   `MANUAL_REVIEW`

Không dùng một status duy nhất để biểu diễn tất cả trạng thái của
booking, payment và saga. Mỗi aggregate cần trạng thái riêng.

------------------------------------------------------------------------

# 11. Thiết kế dữ liệu

## 11.1. Nguyên tắc Database per Service

Mỗi service sở hữu schema/database của riêng mình. Các database có thể
cùng chạy trên một MySQL server trong môi trường dev, nhưng user
database và quyền truy cập phải tách biệt.

  Database                 Owner
  ------------------------ -----------------
  `smarttrip_user_db`      User Service
  `smarttrip_tour_db`      Tour Service
  `smarttrip_hotel_db`     Hotel Service
  `smarttrip_payment_db`   Payment Service
  `smarttrip_booking_db`   Booking Service

Không tạo một database dùng chung rồi chỉ chia package Java. Điều đó
không thể hiện đúng quyền sở hữu dữ liệu của Microservices.

## 11.2. User Database

### users

  Column          Type gợi ý     Ghi chú
  --------------- -------------- ----------------
  id              BIGINT         PK
  email           VARCHAR(255)   Unique
  password_hash   VARCHAR(255)   Hash
  status          VARCHAR(30)    ACTIVE/BLOCKED
  created_at      DATETIME       
  updated_at      DATETIME       

### user_profiles

  Column       Type gợi ý
  ------------ --------------
  id           BIGINT
  user_id      BIGINT
  full_name    VARCHAR(150)
  phone        VARCHAR(30)
  avatar_url   VARCHAR(500)

### roles và user_roles

Dùng để quản lý CUSTOMER, TOUR_OPERATOR, HOTEL_MANAGER, ADMIN. Cần
unique constraint trên cặp user-role.

## 11.3. Tour Database

### tours

  Column           Type gợi ý
  ---------------- ---------------
  id               BIGINT
  operator_id      BIGINT
  name             VARCHAR(255)
  description      TEXT
  destination_id   BIGINT
  duration_days    INT
  base_price       DECIMAL(15,2)
  status           VARCHAR(30)
  created_at       DATETIME

`operator_id` là ID tham chiếu logic đến User Service, không phải
foreign key cross-database.

### tour_departures

  Column            Type gợi ý
  ----------------- -------------
  id                BIGINT
  tour_id           BIGINT
  departure_date    DATE
  return_date       DATE
  total_seats       INT
  available_seats   INT
  status            VARCHAR(30)

### tour_reservations

  Column         Type gợi ý
  -------------- --------------
  id             BIGINT
  booking_id     VARCHAR(100)
  departure_id   BIGINT
  quantity       INT
  status         VARCHAR(30)
  expires_at     DATETIME
  created_at     DATETIME

Unique/idempotency strategy cần bảo đảm một command retry không tạo
reservation thứ hai ngoài ý muốn.

## 11.4. Hotel Database

### hotels

-   `id`
-   `manager_id`
-   `name`
-   `address`
-   `description`
-   `status`

### room_types

-   `id`
-   `hotel_id`
-   `name`
-   `capacity`
-   `base_price`
-   `status`

### room_inventory

-   `id`
-   `room_type_id`
-   `inventory_date`
-   `total_rooms`
-   `available_rooms`

Unique key: `(room_type_id, inventory_date)`.

### hotel_reservations

-   `id`
-   `booking_id`
-   `room_type_id`
-   `check_in_date`
-   `check_out_date`
-   `room_quantity`
-   `status`
-   `expires_at`

Cần bảo đảm thao tác giữ phòng cho toàn bộ các đêm là nguyên tử trong
Hotel Service.

## 11.5. Payment Database

### wallets

-   `id`
-   `user_id`
-   `balance`
-   `currency`
-   `status`
-   `version`

### wallet_transactions

-   `id`
-   `wallet_id`
-   `transaction_type`
-   `amount`
-   `reference_type`
-   `reference_id`
-   `idempotency_key`
-   `created_at`

### payments

-   `id`
-   `booking_id`
-   `amount`
-   `currency`
-   `status`
-   `created_at`

### payment_authorizations

-   `id`
-   `payment_id`
-   `authorized_amount`
-   `status`
-   `expires_at`

### refunds

-   `id`
-   `payment_id`
-   `refund_amount`
-   `status`
-   `reason`
-   `created_at`

Đối với ví, cần thiết kế transaction/ledger và cơ chế khóa hoặc
optimistic locking để hai giao dịch đồng thời không làm balance sai.

## 11.6. Booking Database

### bookings

-   `id`
-   `booking_code`
-   `customer_id`
-   `status`
-   `total_amount`
-   `currency`
-   `idempotency_key`
-   `created_at`
-   `updated_at`

### booking_items

-   `id`
-   `booking_id`
-   `tour_id`
-   `departure_id`
-   `tour_name_snapshot`
-   `departure_date_snapshot`
-   `unit_price_snapshot`
-   `quantity`
-   `subtotal`

### booking_passengers

-   `id`
-   `booking_id`
-   `full_name`
-   `phone`
-   `date_of_birth` (nếu thực sự cần)

### booking_hotel_details

-   `id`
-   `booking_id`
-   `hotel_id`
-   `hotel_name_snapshot`
-   `room_type_id`
-   `room_name_snapshot`
-   `check_in_date`
-   `check_out_date`
-   `room_quantity`
-   `price_snapshot`

### saga_instances

-   `id`
-   `saga_id`
-   `booking_id`
-   `saga_type`
-   `status`
-   `current_step`
-   `version`
-   `failure_reason`
-   `started_at`
-   `completed_at`

### saga_steps

-   `id`
-   `saga_id`
-   `step_name`
-   `action_type`
-   `status`
-   `attempt_count`
-   `last_error`
-   `started_at`
-   `completed_at`

## 11.7. Snapshot và dữ liệu tham chiếu

Booking Service lưu snapshot các thông tin cần giữ nguyên tại thời điểm
đặt:

-   Tên tour.
-   Ngày khởi hành.
-   Giá tour.
-   Tên hotel.
-   Loại phòng.
-   Giá phòng.
-   Số lượng.

Không tạo foreign key xuyên database. ID của service khác là external
reference.

## 11.8. Migration

Dùng Flyway cho từng service:

``` text
src/main/resources/db/migration/
  V1__create_initial_schema.sql
  V2__add_booking_status.sql
  V3__add_outbox_events.sql
```

Không sửa migration đã chạy trên môi trường dùng chung; tạo migration
mới.

------------------------------------------------------------------------

# 12. Saga Pattern

## 12.1. Vì sao dùng Saga?

Booking liên quan đến nhiều service có database riêng. Không thể dựa vào
một transaction ACID duy nhất bao trùm tất cả database.

Saga chia quy trình thành nhiều local transaction. Nếu một bước không
thể hoàn thành, các bước đã thực hiện có thể cần được bù trừ bằng
compensating transaction.

Saga không phải distributed ACID transaction và không đảm bảo mọi thay
đổi được rollback tức thì. Hệ thống phải chấp nhận trạng thái trung gian
và eventual consistency.

## 12.2. Chọn Orchestration

SmartTrip chọn Saga Orchestration:

-   Booking Service là orchestrator.
-   Orchestrator lưu trạng thái Saga.
-   Orchestrator phát command.
-   Các service xử lý local transaction.
-   Service phát event kết quả.
-   Orchestrator nhận event và quyết định bước tiếp theo.

Ưu điểm cho dự án:

-   Luồng nghiệp vụ tập trung.
-   Dễ theo dõi.
-   Dễ trình bày sequence diagram.
-   Dễ xây dựng Saga Monitoring.
-   Phù hợp luồng có nhiều bước và compensation.

## 12.3. Booking Saga -- Happy Path

### Quy trình

1.  Create Booking.
2.  Reserve Tour.
3.  Reserve Hotel nếu khách chọn hotel.
4.  Authorize Payment.
5.  Confirm Tour.
6.  Confirm Hotel nếu có hotel.
7.  Capture Payment.
8.  Complete Booking.

### Sequence Diagram

``` mermaid
sequenceDiagram
    actor Customer
    participant API as API Gateway
    participant B as Booking Service
    participant MQ as RabbitMQ
    participant T as Tour Service
    participant H as Hotel Service
    participant P as Payment Service

    Customer->>API: POST /bookings
    API->>B: Create booking
    B->>B: Save PENDING + Saga
    B-->>Customer: 202 Accepted + bookingId

    B->>MQ: ReserveTour
    MQ->>T: ReserveTour
    T->>MQ: TourReserved
    MQ->>B: TourReserved

    opt Hotel selected
        B->>MQ: ReserveHotel
        MQ->>H: ReserveHotel
        H->>MQ: HotelReserved
        MQ->>B: HotelReserved
    end

    B->>MQ: AuthorizePayment
    MQ->>P: AuthorizePayment
    P->>MQ: PaymentAuthorized
    MQ->>B: PaymentAuthorized

    B->>MQ: ConfirmTour
    MQ->>T: ConfirmTour
    T->>MQ: TourConfirmed
    MQ->>B: TourConfirmed

    opt Hotel selected
        B->>MQ: ConfirmHotel
        MQ->>H: ConfirmHotel
        H->>MQ: HotelConfirmed
        MQ->>B: HotelConfirmed
    end

    B->>MQ: CapturePayment
    MQ->>P: CapturePayment
    P->>MQ: PaymentCaptured
    MQ->>B: PaymentCaptured

    B->>B: Mark CONFIRMED
```

### Vì sao authorize trước, capture sau?

Authorize giữ một khoản tiền trong ví, chưa hoàn tất thu tiền. Sau khi
các tài nguyên đã được xác nhận, Payment Service mới capture.

Trong hệ thống ví giả lập, nhóm cần định nghĩa rõ: - Balance khả dụng. -
Authorized amount. - Captured amount. - Void amount. - Refund amount.

Không được vừa trừ balance ở bước authorize, vừa trừ lần nữa ở capture.
Có thể triển khai bằng ledger và các bút toán giữ tiền/chuyển tiền rõ
ràng.

## 12.4. Booking Saga -- Failure Path

Ví dụ Confirm Hotel thất bại:

    Thứ tự Step                         Kết quả
  -------- ---------------------------- ------------------
         1 Create Booking               Success
         2 Reserve Tour                 Success
         3 Reserve Hotel                Success
         4 Authorize Payment            Success
         5 Confirm Tour                 Success
         6 Confirm Hotel                Failed
         7 Release Tour                 Compensation
         8 Release Hotel                Compensation
         9 Void Payment Authorization   Compensation
        10 Update Booking               Failed/Cancelled

Compensation phải dựa trên các bước thực sự đã thành công. Không gửi
compensation cho một reservation chưa từng được tạo.

## 12.5. Saga State

Đề xuất:

-   `STARTED`
-   `RUNNING`
-   `COMPENSATING`
-   `COMPLETED`
-   `FAILED`
-   `COMPENSATION_FAILED`
-   `MANUAL_REVIEW`

Không dùng `FAILED` để ngầm hiểu compensation đã thành công. Cần phân
biệt failure của nghiệp vụ và failure khi hoàn tác.

## 12.6. Saga Step State

-   `PENDING`
-   `IN_PROGRESS`
-   `SUCCEEDED`
-   `FAILED`
-   `COMPENSATION_PENDING`
-   `COMPENSATED`
-   `RETRYING`

Mỗi step cần lưu attempt count, error, thời điểm thực thi và correlation
ID.

## 12.7. Cancellation Saga

Cancellation là một Saga riêng, không phải thao tác sửa trạng thái
booking trực tiếp.

Luồng gợi ý:

1.  Validate booking.
2.  Validate cancellation policy.
3.  Tính refund amount.
4.  Mark cancellation pending.
5.  Refund payment.
6.  Release tour reservation.
7.  Cancel hotel reservation.
8.  Mark booking cancelled.

### Lưu ý về thứ tự

Thứ tự refund và release tài nguyên là quyết định nghiệp vụ cần thống
nhất. Nếu refund thành công nhưng release tài nguyên thất bại, hệ thống
phải retry release hoặc đưa vào manual review. Không được giả vờ refund
đã rollback vì refund là giao dịch tài chính mới.

MVP có thể chọn refund trước rồi release tài nguyên, với cơ chế retry
bền vững cho release. Cần ghi rõ đây là chính sách được lựa chọn cho
demo.

## 12.8. Timeout và retry trong Saga

-   Mỗi command có timeout.
-   Retry chỉ áp dụng cho lỗi có khả năng tạm thời.
-   Validation failure hoặc insufficient inventory không nên retry vô
    hạn.
-   Retry cần backoff.
-   Có giới hạn số lần retry.
-   Quá giới hạn thì chuyển DLQ hoặc manual review.
-   Timeout không đồng nghĩa chắc chắn command thất bại: service có thể
    đã commit nhưng event phản hồi bị mất. Vì vậy phải query/reconcile
    theo command ID hoặc reservation ID trước khi quyết định
    compensation.

## 12.9. Khôi phục Saga sau restart

-   Saga state lưu trong database.
-   Command/event được ghi nhận.
-   Outbox chưa publish được tiếp tục publish.
-   Consumer idempotent.
-   Worker quét Saga ở trạng thái RUNNING/COMPENSATING quá lâu.
-   Reconcile trạng thái với service liên quan khi cần.
-   Không lưu state duy nhất trong Java object hoặc memory.

------------------------------------------------------------------------

# 13. RabbitMQ và Event-Driven Communication

## 13.1. Vì sao dùng RabbitMQ?

-   Tách thời gian xử lý giữa các service.
-   Hỗ trợ command/event.
-   Cho phép retry và queue bền vững.
-   Hạn chế coupling đồng bộ.
-   Hỗ trợ xử lý bất đồng bộ của Saga.

## 13.2. Quy ước Exchange và Queue

Có thể dùng topic exchange:

-   `smarttrip.commands`
-   `smarttrip.events`
-   `smarttrip.dlx`

Ví dụ routing key:

``` text
tour.reserve.command
tour.reserved.event
tour.reserve.failed.event

hotel.reserve.command
hotel.reserved.event
hotel.reserve.failed.event

payment.authorize.command
payment.authorized.event
payment.authorize.failed.event

tour.confirm.command
tour.confirmed.event

hotel.confirm.command
hotel.confirmed.event

payment.capture.command
payment.captured.event

tour.release.command
tour.released.event
hotel.release.command
hotel.released.event

payment.void.command
payment.voided.event
payment.refund.command
payment.refunded.event
```

Tên routing key là quy ước nội bộ, phải được ghi trong Event Contract và
thống nhất giữa producer/consumer.

## 13.3. Message Envelope

Ví dụ command:

``` json
{
  "messageId": "MSG-000001",
  "correlationId": "SAGA-000001",
  "causationId": "MSG-000000",
  "messageType": "ReserveTourCommand",
  "schemaVersion": 1,
  "occurredAt": "2026-11-05T10:00:00Z",
  "payload": {
    "bookingId": "BOOK-000001",
    "departureId": 101,
    "quantity": 2
  }
}
```

Ý nghĩa:

-   `messageId`: ID duy nhất của message.
-   `correlationId`: liên kết toàn bộ message của một Saga.
-   `causationId`: message gây ra message hiện tại.
-   `messageType`: loại message.
-   `schemaVersion`: phiên bản schema.
-   `occurredAt`: thời điểm tạo.
-   `payload`: dữ liệu nghiệp vụ.

Không đưa password, access token hoặc dữ liệu thanh toán nhạy cảm vào
message.

## 13.4. Command và Event

Command yêu cầu service thực hiện hành động:

-   `ReserveTourCommand`
-   `AuthorizePaymentCommand`
-   `ReleaseHotelCommand`

Event thông báo điều đã xảy ra:

-   `TourReservedEvent`
-   `PaymentAuthorizedEvent`
-   `HotelReleasedEvent`

Tên command nên thể hiện ý định; tên event nên thể hiện sự kiện đã xảy
ra.

## 13.5. ACK/NACK

-   ACK sau khi consumer xử lý thành công và đã commit kết quả.
-   NACK/requeue có kiểm soát khi lỗi tạm thời.
-   Không requeue vô hạn cho lỗi dữ liệu hoặc lỗi nghiệp vụ không thể
    khắc phục.
-   Cấu hình DLQ cho message vượt retry.
-   Tránh ACK trước khi dữ liệu được commit.

## 13.6. Dead Letter Queue

DLQ lưu message không thể xử lý sau chính sách retry.

Admin hoặc developer cần có khả năng: - Xem message metadata. - Xem
exception. - Xác định nguyên nhân. - Sửa lỗi dữ liệu hoặc service. -
Replay có kiểm soát.

Không replay message tùy tiện nếu không bảo đảm idempotency.

------------------------------------------------------------------------

# 14. Tính nhất quán và độ tin cậy

## 14.1. Eventual Consistency

Trong quá trình Saga, dữ liệu các service có thể tạm thời khác trạng
thái cuối.

Ví dụ:

``` text
Booking: PENDING
Tour: RESERVED
Hotel: RESERVED
Payment: AUTHORIZED
Saga: RUNNING
```

Đây là trạng thái trung gian hợp lệ.

Frontend phải hiển thị "Đang xử lý" thay vì "Đặt tour thành công".

## 14.2. Idempotency

Mỗi command phải có ID duy nhất. Consumer lưu message đã xử lý.

Pseudo-flow:

``` text
Receive message
    |
    v
Check processed_messages
    |
    +-- Already processed --> Return prior result / ACK
    |
    +-- New message
           |
           v
      Begin local transaction
           |
           v
      Execute business operation
           |
           v
      Save processed message
           |
           v
      Save outbox event
           |
           v
      Commit
           |
           v
      ACK
```

Ghi nhận processed message và thay đổi nghiệp vụ phải nằm trong cùng
local transaction để tránh crash giữa hai thao tác.

## 14.3. Transactional Outbox

Vấn đề dual-write:

1.  Update database.
2.  Publish RabbitMQ.

Nếu database commit nhưng publish thất bại, service khác không nhận được
event.

Outbox giải quyết bằng cách:

1.  Thực hiện thay đổi nghiệp vụ.
2.  Insert outbox record trong cùng database transaction.
3.  Commit.
4.  Publisher đọc outbox.
5.  Publish lên RabbitMQ.
6.  Đánh dấu published sau khi broker xác nhận phù hợp.

Outbox publisher có thể publish trùng khi crash ở thời điểm không chắc
chắn. Vì vậy consumer vẫn phải idempotent.

### Outbox fields

-   `id`
-   `aggregate_type`
-   `aggregate_id`
-   `event_type`
-   `payload`
-   `created_at`
-   `published_at`
-   `status`
-   `retry_count`

## 14.4. Concurrency Control

### Tour

Dùng conditional update, optimistic lock hoặc pessimistic lock phù hợp
với tải và transaction.

### Hotel

Giữ phòng cho tất cả ngày trong khoảng lưu trú một cách nguyên tử. Nếu
một ngày không đủ, rollback toàn bộ local transaction.

### Wallet

Không cho hai payment đồng thời tiêu cùng một balance. Dùng transaction
isolation/locking hoặc optimistic locking và kiểm tra số dư ở thao tác
cập nhật.

## 14.5. Reservation Expiration

Reservation có:

-   `status`
-   `expires_at`
-   `created_at`
-   `confirmed_at`
-   `released_at`

Worker xử lý reservation hết hạn phải dùng điều kiện trạng thái để tránh
release reservation đã confirm.

## 14.6. Reconciliation

Do message có thể thất lạc ở tầng ứng dụng hoặc trạng thái không rõ sau
timeout, cần có job đối soát:

-   Saga chạy quá lâu.
-   Payment authorized nhưng booking không tiến triển.
-   Reservation HELD quá hạn.
-   Booking FAILED nhưng còn tài nguyên chưa release.
-   Refund đã thành công nhưng booking chưa cập nhật.

Reconciliation không tự ý sửa dữ liệu thiếu căn cứ. Nó nên xác minh
trạng thái từ service sở hữu dữ liệu và tạo hành động sửa chữa có audit.

------------------------------------------------------------------------

# 15. API Design

## 15.1. Quy ước chung

-   Prefix `/api/v1`.
-   JSON request/response.
-   Pagination cho danh sách.
-   Validation ở backend.
-   Dùng HTTP status phù hợp.
-   Error response thống nhất.
-   Không expose internal endpoint cho public client.
-   Không nhận total amount từ frontend làm giá trị đáng tin cậy.

## 15.2. Tạo Booking

Request:

``` http
POST /api/v1/bookings
Authorization: Bearer <access-token>
Idempotency-Key: <unique-key>
Content-Type: application/json
```

``` json
{
  "departureId": 101,
  "quantity": 2,
  "hotelSelection": {
    "enabled": true,
    "roomTypeId": 25,
    "checkInDate": "2026-12-15",
    "checkOutDate": "2026-12-17",
    "roomQuantity": 1
  },
  "passengers": [
    {
      "fullName": "Nguyen Van A",
      "phone": "0900000000"
    },
    {
      "fullName": "Nguyen Van B",
      "phone": "0900000001"
    }
  ]
}
```

Response:

``` http
202 Accepted
```

``` json
{
  "bookingCode": "ST-2026-000001",
  "bookingStatus": "PENDING",
  "sagaStatus": "RUNNING",
  "message": "Booking request accepted"
}
```

`202 Accepted` chỉ xác nhận hệ thống đã tiếp nhận yêu cầu, không có
nghĩa booking đã thành công.

## 15.3. Xem Booking

``` http
GET /api/v1/bookings/ST-2026-000001
```

Response khi đang xử lý:

``` json
{
  "bookingCode": "ST-2026-000001",
  "bookingStatus": "PENDING",
  "sagaStatus": "RUNNING",
  "paymentStatus": "AUTHORIZED",
  "totalAmount": 5000000,
  "currency": "VND"
}
```

Response khi thành công:

``` json
{
  "bookingCode": "ST-2026-000001",
  "bookingStatus": "CONFIRMED",
  "sagaStatus": "COMPLETED",
  "paymentStatus": "CAPTURED",
  "totalAmount": 5000000,
  "currency": "VND"
}
```

## 15.4. Error Response

``` json
{
  "timestamp": "2026-11-05T10:00:00Z",
  "status": 409,
  "code": "INSUFFICIENT_TOUR_CAPACITY",
  "message": "Not enough available seats",
  "traceId": "trace-000001"
}
```

Không trả stack trace hoặc thông tin database ra client.

## 15.5. Pagination

Ví dụ:

``` http
GET /api/v1/tours?page=0&size=12&sort=createdAt,desc
```

Response nên có content, page, size, totalElements và totalPages.

------------------------------------------------------------------------

# 16. Thiết kế Web Application

## 16.1. Mục tiêu

Web là sản phẩm đầu tiên. Cả hai thành viên cùng phát triển Web sau khi
backend contract và luồng nghiệp vụ ổn định.

## 16.2. Customer Website

### Homepage

-   Header và navigation.
-   Search form.
-   Featured tours.
-   Popular destinations.
-   Promotions (nếu có).
-   Footer.

### Tour Listing

-   Search keyword.
-   Filter destination.
-   Filter price.
-   Filter duration.
-   Sort.
-   Pagination.

### Tour Detail

-   Gallery.
-   Description.
-   Itinerary.
-   Departure list.
-   Capacity.
-   Price.
-   Hotel options.

### Checkout

-   Departure selection.
-   Quantity.
-   Passenger form.
-   Hotel selection optional.
-   Price breakdown.
-   Confirm booking.

### Booking Result

-   Booking code.
-   Current status.
-   Payment status.
-   Saga progress ở mức thông tin phù hợp.
-   Hướng dẫn khi booking đang xử lý.

### Booking History

-   Danh sách booking.
-   Filter theo status.
-   Booking detail.
-   Cancellation request.

### Wallet

-   Current balance.
-   Mock top-up.
-   Transaction history.

## 16.3. Management Dashboard

-   Dashboard overview.
-   User Management.
-   Tour Management.
-   Departure Management.
-   Hotel Management.
-   Room Inventory.
-   Booking Management.
-   Payment Management.
-   Saga Monitoring.
-   Audit Log.

## 16.4. Saga Monitoring UI

Hiển thị:

-   Saga ID.
-   Booking code.
-   Saga type.
-   Current status.
-   Current step.
-   Step timeline.
-   Retry count.
-   Error message đã được làm sạch.
-   Started/completed time.
-   Compensation status.

Không cho Admin sửa trực tiếp database hoặc ép trạng thái Saga thành
COMPLETED. Nếu có chức năng manual intervention, phải là command nghiệp
vụ có validation, authorization và audit.

## 16.5. Frontend Architecture

Gợi ý cấu trúc:

``` text
web/
  src/
    app/
      router/
      providers/
    components/
      common/
      layout/
    features/
      auth/
      tours/
      hotels/
      booking/
      wallet/
      admin/
      saga-monitoring/
    services/
      api-client.ts
    hooks/
    types/
    utils/
```

Có thể dùng React Query/TanStack Query để quản lý server state. Không
cần tự xây dựng state management phức tạp nếu chưa có nhu cầu.

## 16.6. Booking Status UI

-   `PENDING`: Đang xử lý.
-   `CONFIRMED`: Đặt tour thành công.
-   `CANCELLATION_PENDING`: Đang xử lý hủy.
-   `CANCELLED`: Đã hủy.
-   `FAILED`: Không thể hoàn tất.
-   `MANUAL_REVIEW`: Cần bộ phận hỗ trợ xử lý.

Frontend không tự suy luận thành công chỉ vì API create booking trả 202.

------------------------------------------------------------------------

# 17. Thiết kế Mobile Application

## 17.1. Nguyên tắc

Mobile triển khai sau khi Web và Backend API ổn định. Mobile sử dụng
chung API Gateway, không gọi trực tiếp từng service.

## 17.2. Phạm vi Mobile MVP

-   Register/Login.
-   Browse tours.
-   Search/filter.
-   Tour detail.
-   Departure selection.
-   Hotel selection.
-   Passenger information.
-   Booking.
-   Wallet.
-   Booking tracking.
-   Cancellation.

Không cần làm Management Dashboard trên Mobile trong MVP.

## 17.3. Flutter Structure

``` text
mobile/
  lib/
    app/
      router/
      theme/
    core/
      network/
      storage/
      error/
    features/
      auth/
      tours/
      hotels/
      booking/
      wallet/
      profile/
    shared/
      widgets/
      models/
```

## 17.4. Mobile State

-   Loading.
-   Success.
-   Empty.
-   Error.
-   Pending async operation.
-   Retryable failure.

Không lưu secret hoặc access token trong plain text storage. Dùng secure
storage phù hợp nền tảng.

------------------------------------------------------------------------

# 18. Tech Stack

  Layer                 Công nghệ                       Lý do
  --------------------- ------------------------------- ----------------------------------------------------
  Language              Java 21                         Backend chính
  Framework             Spring Boot 3.x / 4.x           REST Microservices
  Discovery             Spring Cloud Netflix Eureka     Service Registry & Discovery (Bắt buộc)
  Gateway               Spring Cloud Gateway            API routing động qua Eureka (`lb://`)
  Sync Communication    Spring Cloud OpenFeign          Gọi REST đồng bộ giữa các microservices (Bắt buộc)
  Security              Spring Security + JWT           Authentication & Role-based Authorization
  ORM                   Spring Data JPA                 Persistence
  Migration             Flyway                          Schema versioning độc lập từng database
  Database              MySQL 8.x                       Relational data (Database per Service)
  Messaging             RabbitMQ                        Async messaging & Event-Driven cho Saga
  Distributed Pattern   Saga Orchestration              Quản lý giao dịch phân tán cho Booking & Cancel
  Reliability           Transactional Outbox + DLQ     Chống dual-write và xử lý message lỗi
  Frontend              React + Vite                    Khách hàng & Trang quản trị (Web)
  UI                    Tailwind CSS                    Styling
  Mobile (P2)           Flutter                         Cross-platform (giai đoạn mở rộng)
  Container             Docker + Docker Compose         Local development & Đóng gói triển khai
  Testing               JUnit 5, Mockito                Unit test tầng Service
  Integration Testing   Testcontainers                  DB/Broker integration testing
  API Docs              OpenAPI/Swagger                 Tài liệu hóa API từng service và Gateway
  Load Testing          k6 hoặc JMeter                  Kiểm thử tải và concurrency

Không cần thêm Kubernetes, Kafka, Redis, Elasticsearch nếu chưa có use case rõ ràng. Mỗi công nghệ bổ sung làm tăng chi phí vận hành và debugging.

------------------------------------------------------------------------

# 19. Cấu trúc Repository

## 19.1. Monorepo đề xuất

Monorepo giúp quản lý API contract, docs và Docker Compose thuận tiện:

``` text
smarttrip/
├── backend/
│   ├── discovery-service/     # Eureka Server (Service Registry & Discovery)
│   ├── api-gateway/           # Spring Cloud Gateway (Routing & JWT Pre-check)
│   ├── user-service/          # Identity & User Management Service
│   ├── tour-service/          # Tour & Departure Management Service
│   ├── hotel-service/         # Hotel & Room Inventory Service
│   ├── payment-service/       # Mock Wallet & Payment Ledger Service
│   └── booking-service/       # Booking & Saga Orchestrator Service
│
├── web/                       # React + Vite Web Application
├── mobile/                    # Flutter Mobile Application (P2)
│
├── infrastructure/
│   ├── docker/
│   ├── rabbitmq/
│   ├── mysql/
│   └── monitoring/
│
├── docs/
│   ├── 01-project-overview/
│   ├── 02-requirements/
│   ├── 03-architecture/
│   ├── 04-database/
│   ├── 05-saga/
│   ├── 06-api-contracts/
│   ├── 07-testing/
│   └── decisions/
│
├── scripts/
├── .env.example
├── docker-compose.yml
└── README.md
```

## 19.2. Clean Architecture trong từng service

``` text
service/
  src/main/java/com/smarttrip/<service>/
    domain/
      model/
      valueobject/
      event/
      repository/
    application/
      usecase/
      service/
      port/
      dto/
    infrastructure/
      persistence/
      messaging/
      configuration/
      client/
    presentation/
      rest/
      request/
      response/
```

Nguyên tắc:

-   Domain không phụ thuộc Spring/JPA.
-   Application điều phối use case.
-   Infrastructure triển khai repository, broker và external adapter.
-   Presentation xử lý HTTP.
-   Không để Controller chứa business logic.
-   Không dùng JPA Entity làm API response.
-   Repository interface thuộc core/application boundary; implementation
    nằm ở infrastructure.

Có thể điều chỉnh package theo mức độ phức tạp, không cần tạo quá nhiều
abstraction không có giá trị.

------------------------------------------------------------------------

# 20. GitHub Workflow và phối hợp nhóm

## 20.1. GitHub Organization

Nên tạo GitHub Organization cho nhóm nếu muốn tách quyền sở hữu dự án
khỏi tài khoản cá nhân và quản lý thành viên, repository, team
permission tập trung.

Với nhóm hai người, có thể tạo một monorepo private/public tùy yêu cầu
môn học.

## 20.2. Branching

``` text
main
  |
  └── develop
       ├── feature/user-service
       ├── feature/tour-service
       ├── feature/hotel-service
       ├── feature/payment-service
       ├── feature/booking-saga
       ├── feature/web-customer
       └── feature/web-admin
```

Quy tắc:

-   Không push trực tiếp lên `main`.
-   Feature branch tách theo task.
-   PR vào `develop`.
-   PR phải build thành công.
-   Ít nhất một thành viên review.
-   Merge `develop` sang `main` khi có milestone ổn định.
-   Commit message rõ nghĩa.

## 20.3. Issue Template

Mỗi Issue nên có:

-   Problem/Goal.
-   Scope.
-   Acceptance Criteria.
-   API/Database impact.
-   Dependencies.
-   Test cases.
-   Assignee.
-   Priority.

Ví dụ:

``` text
[SAGA-001] Implement Reserve Tour Step

Goal:
Booking Saga can request Tour Service to reserve seats.

Acceptance Criteria:
- Command has unique messageId.
- Tour Service checks capacity atomically.
- Duplicate command does not reserve twice.
- Success event is published through Outbox.
- Failure event contains stable error code.
- Integration tests cover success and insufficient capacity.
```

## 20.4. Pull Request Template

``` text
## Summary
What changed?

## Related Issue
Closes #

## Changes
- ...

## Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual verification

## Risk / Migration
- ...

## Screenshots / API examples
- ...
```

## 20.5. Phân chia trách nhiệm

  Hạng mục              Thành viên 1                Thành viên 2
  --------------------- --------------------------- ---------------------------
  Project analysis      Cùng làm                    Cùng làm
  Architecture          Cùng thiết kế               Cùng thiết kế
  User Service          Owner                       Review
  Tour Service          Owner                       Review
  Hotel Service         Review                      Owner
  Payment Service       Review                      Owner
  Booking/Saga          Cùng thiết kế và tích hợp   Cùng thiết kế và tích hợp
  Web Tour UI           Owner                       Review
  Web Booking UI        Review                      Owner
  Admin Tour            Owner                       Review
  Admin Hotel/Payment   Review                      Owner
  Mobile                Cùng làm                    Cùng làm
  Integration Testing   Cùng làm                    Cùng làm

Không nên để một người chỉ làm frontend và một người chỉ làm backend
trong toàn bộ dự án. Cả hai cần hiểu contract và luồng end-to-end. Tuy
nhiên, vẫn phải có owner rõ ràng cho từng module.

------------------------------------------------------------------------

# 21. Kế hoạch triển khai

Roadmap tham khảo 10 tuần. Nếu hai thành viên chưa quen RabbitMQ, Saga
hoặc Flutter, cần tăng thời gian.

## Tuần 1 -- Discovery và Requirements

**Deliverables** - Project Charter. - SRS baseline. - Actor và
Permission Matrix. - Use Case Diagram. - Business Rules. - Scope
P0/P1/P2. - Decision Log.

**Exit Criteria** - Hai thành viên thống nhất nghiệp vụ. - Không còn mâu
thuẫn về flow booking. - Có definition cho booking, payment và
reservation status.

## Tuần 2 -- Architecture và Infrastructure

**Tasks** - Tạo GitHub Organization/repository. - Tạo Spring Boot
service skeleton cho tất cả service. - Setup Eureka Server (`discovery-service`). - Tạo React app. - Docker Compose cho MySQL và
RabbitMQ. - Setup API Gateway và route qua Eureka (`lb://`). - Cấu hình OpenFeign client cơ bản. - Setup Flyway. - Setup CI build cơ bản.

**Exit Criteria** - Tất cả service khởi động và đăng ký thành công vào Eureka Dashboard. - Database độc lập. -
Gateway route được request thử nghiệm đến các service qua Eureka. - RabbitMQ hoạt động.

## Tuần 3 -- Core Services

**Tasks** - User Service. - Tour Service. - Hotel Service. - CRUD. -
Validation. - API docs. - Database migration.

**Exit Criteria** - Có thể đăng ký/đăng nhập. - Có thể tạo tour và
departure. - Có thể tạo hotel và room type. - Có thể truy vấn inventory.

## Tuần 4 -- Payment và Booking Foundation

**Tasks** - Mock Wallet. - Ledger/transaction. -
Authorize/Capture/Void. - Booking create. - Booking snapshot. - Saga
instance persistence.

**Exit Criteria** - Có thể tạo booking PENDING. - Có thể kiểm tra số
dư. - Có thể authorize và void idempotently.

## Tuần 5 -- Booking Saga

**Tasks** - RabbitMQ commands/events. - Reserve Tour. - Reserve Hotel. -
Authorize Payment. - Confirm resources. - Capture Payment. -
Compensation. - Retry/timeout cơ bản.

**Exit Criteria** - Happy path hoàn thành. - Payment failure có
compensation. - Không đặt vượt inventory trong concurrency test cơ bản.

## Tuần 6 -- Customer Web

**Tasks** - Homepage. - Tour Listing. - Tour Detail. - Departure
selection. - Hotel selection. - Checkout. - Booking status.

**Exit Criteria** - Customer đi được luồng đặt tour từ UI đến Backend.

## Tuần 7 -- Management Web

**Tasks** - Tour Management. - Departure Management. - Hotel
Management. - Room Inventory. - Booking Management. - Payment history. -
Saga Monitoring cơ bản.

**Exit Criteria** - Manager quản lý được dữ liệu theo quyền. - Admin xem
được Saga.

## Tuần 8 -- Integration và Reliability

**Tasks** - Transactional Outbox. - Idempotent consumer. - DLQ. -
Cancellation Saga. - Reservation expiration. - Failure tests. - Docker
integration.

**Exit Criteria** - Có test duplicate message. - Có test service
restart. - Có test compensation. - Có test hủy booking.

## Tuần 9 -- Flutter Mobile

**Tasks** - Flutter setup. - Authentication. - Tour listing. - Tour
detail. - Booking. - Wallet. - Booking status.

**Exit Criteria** - Mobile dùng được API Gateway. - Customer có thể tạo
và theo dõi booking.

## Tuần 10 -- Finalization

**Tasks** - End-to-end tests. - Bug fixing. - Performance smoke test. -
README. - Architecture diagrams. - Demo data. - Deployment. -
Presentation.

**Exit Criteria** - Web và Mobile chạy được. - Có thể demo happy path và
failure path. - Tài liệu khớp với implementation.

------------------------------------------------------------------------

# 22. Chiến lược kiểm thử

## 22.1. Unit Test

Kiểm tra domain/application logic:

-   Tính giá tour.
-   Tính tổng booking.
-   Tính refund.
-   Validate cancellation policy.
-   Validate booking status transition.
-   Saga transition.
-   Wallet balance rule.

## 22.2. Integration Test

Dùng Testcontainers nếu môi trường hỗ trợ:

-   MySQL repository.
-   RabbitMQ producer/consumer.
-   Outbox publisher.
-   Idempotent consumer.
-   Transaction rollback.

## 22.3. End-to-End Test

Luồng chính:

1.  Register.
2.  Login.
3.  Search tour.
4.  Select departure.
5.  Select hotel.
6.  Create booking.
7.  Saga completes.
8.  Booking confirmed.
9.  Payment captured.

## 22.4. Failure Test Matrix

  -----------------------------------------------------------------------
  ID                      Kịch bản                Kết quả mong đợi
  ----------------------- ----------------------- -----------------------
  TC01                    Booking hợp lệ          CONFIRMED

  TC02                    Tour không đủ chỗ       Không tạo reservation

  TC03                    Hotel không đủ phòng    Release tour

  TC04                    Wallet thiếu tiền       Release reservation

  TC05                    Payment timeout nhưng   Reconcile, không
                          đã commit               authorize lần hai

  TC06                    Duplicate ReserveTour   Không trừ chỗ lần hai

  TC07                    Confirm Hotel thất bại  Compensation

  TC08                    Compensation tạm thời   Retry
                          lỗi                     

  TC09                    Compensation vượt retry MANUAL_REVIEW

  TC10                    Service restart         Saga tiếp tục từ trạng
                                                  thái lưu

  TC11                    Hai khách tranh chỗ     Chỉ một reservation
                          cuối                    thành công

  TC12                    Refund thất bại         Cancellation chưa hoàn
                                                  tất

  TC13                    Reservation hết hạn     Release nếu vẫn HELD

  TC14                    Reservation đã          Không release
                          CONFIRMED nhưng worker  
                          chạy                    

  TC15                    Client gửi lại create   Idempotency ngăn
                          booking                 booking trùng
  -----------------------------------------------------------------------

## 22.5. Concurrency Test

Ví dụ: - Departure còn 1 chỗ. - Gửi 20 request đồng thời, mỗi request
đặt 1 chỗ. - Kết quả chỉ một request giữ chỗ thành công. -
`available_seats` không âm. - Không có reservation thành công vượt
capacity.

Lặp lại test với room inventory và wallet.

## 22.6. Test báo cáo

Lưu lại: - Input. - Expected result. - Actual result. - Log/trace ID. -
Database state liên quan. - Kết luận PASS/FAIL.

------------------------------------------------------------------------

# 23. Docker và Deployment

## 23.1. Local Development

Docker Compose nên chạy:

-   Eureka Server (`discovery-service`).
-   API Gateway (`api-gateway`).
-   User Service (`user-service`).
-   Tour Service (`tour-service`).
-   Hotel Service (`hotel-service`).
-   Payment Service (`payment-service`).
-   Booking Service (`booking-service`).
-   MySQL (5 databases độc lập).
-   RabbitMQ.
-   Web (React client).

Mobile có thể chạy từ emulator hoặc thiết bị thật, trỏ về gateway phù
hợp.

## 23.2. Environment Variables

Tạo `.env.example`:

``` env
MYSQL_ROOT_PASSWORD=change_me
RABBITMQ_DEFAULT_USER=smarttrip
RABBITMQ_DEFAULT_PASS=change_me

USER_DB_URL=jdbc:mysql://mysql:3306/smarttrip_user_db
TOUR_DB_URL=jdbc:mysql://mysql:3306/smarttrip_tour_db
HOTEL_DB_URL=jdbc:mysql://mysql:3306/smarttrip_hotel_db
PAYMENT_DB_URL=jdbc:mysql://mysql:3306/smarttrip_payment_db
BOOKING_DB_URL=jdbc:mysql://mysql:3306/smarttrip_booking_db
```

Không commit `.env` thật. Production phải dùng secret management phù
hợp.

## 23.3. Health Check

Mỗi service nên có: - Liveness. - Readiness. - Database health. -
RabbitMQ connection health (nếu cần).

Spring Boot Actuator có thể hỗ trợ health endpoint. Không expose thông
tin nhạy cảm ra public.

## 23.4. Deployment Strategy

MVP: - Docker Compose trên một máy/VM hoặc môi trường demo. - Frontend
deploy riêng nếu thuận tiện. - Backend services chạy container. -
Database và RabbitMQ có persistent storage. - Backup dữ liệu trước demo
quan trọng.

Không cần Kubernetes cho MVP.

------------------------------------------------------------------------

# 24. Logging, Monitoring và Troubleshooting

## 24.1. Logging

Mỗi log quan trọng nên có:

-   timestamp.
-   serviceName.
-   level.
-   traceId.
-   correlationId.
-   sagaId.
-   bookingId.
-   messageId.
-   stepName.

Không log password, JWT, secret hoặc dữ liệu cá nhân không cần thiết.

## 24.2. Saga Monitoring

Admin cần thấy: - Saga status. - Current step. - Started time. -
Duration. - Retry count. - Failure reason. - Compensation progress.

## 24.3. Metrics đề xuất

-   HTTP request count.
-   HTTP latency.
-   Error rate.
-   RabbitMQ queue depth.
-   Consumer processing time.
-   Outbox pending count.
-   Saga running count.
-   Saga failure count.
-   Compensation failure count.
-   Booking success/failure count.

## 24.4. Troubleshooting checklist

Khi booking bị treo:

1.  Lấy booking code và saga ID.
2.  Kiểm tra saga_instances.
3.  Kiểm tra saga_steps.
4.  Kiểm tra outbox.
5.  Kiểm tra RabbitMQ queue và DLQ.
6.  Kiểm tra consumer log theo correlation ID.
7.  Kiểm tra trạng thái reservation ở Tour/Hotel.
8.  Kiểm tra payment authorization/capture.
9.  Xác định trạng thái thực tế trước khi replay.
10. Ghi audit nếu can thiệp thủ công.

------------------------------------------------------------------------

# 25. Rủi ro và phương án giảm thiểu

  -----------------------------------------------------------------------
  Rủi ro                  Tác động                Giảm thiểu
  ----------------------- ----------------------- -----------------------
  Quá nhiều service       Chậm tiến độ            Giữ 5 business service

  Saga quá phức tạp       Khó debug               Làm happy path trước

  Message duplicate       Sai inventory/payment   Idempotency

  Dual-write              Mất event               Outbox

  Service downtime        Saga treo               Retry, timeout,
                                                  recovery

  Compensation failure    Tài nguyên bị giữ       Reconciliation, manual
                                                  review

  Overbooking             Sai nghiệp vụ           Atomic inventory update

  Wallet race condition   Balance sai             Lock/version/ledger

  API contract thay đổi   Frontend lỗi            Contract versioning

  Hai người conflict code Chậm tích hợp           Module ownership, PR

  Mobile bắt đầu quá sớm  Tăng phạm vi            Hoàn thiện Web trước

  Deploy quá phức tạp     Mất thời gian           Docker Compose trước
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 26. Tiêu chí nghiệm thu

## 26.1. Product Acceptance

-   [ ] Guest xem được tour.
-   [ ] Customer đăng ký và đăng nhập.
-   [ ] Customer tìm kiếm tour.
-   [ ] Customer xem departure.
-   [ ] Customer chọn hotel hoặc bỏ qua.
-   [ ] Customer tạo booking.
-   [ ] Customer xem trạng thái booking.
-   [ ] Customer xem wallet.
-   [ ] Operator quản lý tour.
-   [ ] Hotel Manager quản lý phòng.
-   [ ] Admin xem Saga.

## 26.2. Microservices Acceptance

-   [ ] Có Eureka Server làm Service Registry & Discovery.
-   [ ] Có 5 Business Services đăng ký vào Eureka.
-   [ ] Có API Gateway định tuyến động qua Eureka (`lb://`).
-   [ ] Có tối thiểu 2 kịch bản gọi đồng bộ bằng Spring Cloud OpenFeign.
-   [ ] Mỗi service sở hữu database riêng.
-   [ ] Không có cross-service database join.
-   [ ] Có REST API contract & Swagger cho từng service.
-   [ ] Có RabbitMQ command/event cho giao tiếp bất đồng bộ.
-   [ ] Có Booking Saga Orchestration.
-   [ ] Có Compensation (bù trừ khi lỗi giao dịch phân tán).
-   [ ] Saga state được persist bền vững trong database.
-   [ ] Có idempotent consumer.
-   [ ] Có Transactional Outbox chống dual-write.
-   [ ] Có retry và DLQ cơ bản.
-   [ ] Có concurrency test chống bán vượt chỗ/phòng.
-   [ ] Có cancellation flow qua Saga.

## 26.3. Delivery Acceptance

-   [ ] README hướng dẫn chạy dự án.
-   [ ] `.env.example`.
-   [ ] Docker Compose.
-   [ ] Database migrations.
-   [ ] API documentation.
-   [ ] Architecture diagrams.
-   [ ] Test report.
-   [ ] Demo script.
-   [ ] GitHub Issues và PR history.

------------------------------------------------------------------------

# 27. Hướng phát triển tương lai

Sau MVP, có thể cân nhắc:

1.  Notification Service gửi email/push.
2.  Promotion Service.
3.  Review and Rating.
4.  Search Service với Elasticsearch/OpenSearch.
5.  Redis cache.
6.  Recommendation Engine.
7.  Payment Gateway thật ở môi trường sandbox.
8.  Distributed tracing với OpenTelemetry.
9.  Prometheus và Grafana.
10. Kubernetes khi cần orchestration container quy mô lớn.

Chỉ tách service mới khi có bounded context và nhu cầu độc lập rõ ràng.
Không tách service chỉ để tăng số lượng.

------------------------------------------------------------------------

# 28. Checklist bắt đầu dự án

## Phase A -- Chốt nghiệp vụ

-   [ ] Hai thành viên xác nhận baseline.
-   [ ] Chốt tour trọn gói.
-   [ ] Chốt hotel optional.
-   [ ] Chốt Mock Wallet.
-   [ ] Chốt cancellation policy.
-   [ ] Chốt vai trò.
-   [ ] Chốt trạng thái Booking/Payment/Saga.
-   [ ] Chốt scope P0/P1/P2.

## Phase B -- Documentation

-   [ ] Project Charter.
-   [ ] SRS.
-   [ ] Use Case Diagram.
-   [ ] Activity Diagram.
-   [ ] System Architecture.
-   [ ] Service Boundary.
-   [ ] ERD từng service.
-   [ ] Booking Saga Sequence.
-   [ ] Cancellation Saga Sequence.
-   [ ] API Contract.
-   [ ] Event Contract.
-   [ ] Test Plan.

## Phase C -- Repository

-   [ ] Tạo GitHub Organization hoặc repository.
-   [ ] Tạo `main`, `develop`.
-   [ ] Tạo Issue Template.
-   [ ] Tạo PR Template.
-   [ ] Tạo README.
-   [ ] Tạo `.gitignore`.
-   [ ] Tạo `.env.example`.
-   [ ] Tạo Docker Compose.

## Phase D -- Implementation

-   [ ] Setup API Gateway.
-   [ ] Setup User Service.
-   [ ] Setup Tour Service.
-   [ ] Setup Hotel Service.
-   [ ] Setup Payment Service.
-   [ ] Setup Booking Service.
-   [ ] Implement Saga.
-   [ ] Implement Web.
-   [ ] Test end-to-end.
-   [ ] Implement Mobile.

## Phase E -- Release

-   [ ] Build all services.
-   [ ] Run migrations.
-   [ ] Seed demo data.
-   [ ] Run integration tests.
-   [ ] Run Saga failure tests.
-   [ ] Verify Docker deployment.
-   [ ] Prepare demo scenarios.
-   [ ] Finalize documentation.

------------------------------------------------------------------------

# 29. Thuật ngữ

  -----------------------------------------------------------------------
  Thuật ngữ                           Ý nghĩa
  ----------------------------------- -----------------------------------
  Microservices                       Kiến trúc chia hệ thống thành các
                                      service độc lập

  API Gateway                         Cổng tiếp nhận và định tuyến
                                      request

  Database per Service                Mỗi service sở hữu dữ liệu riêng

  Saga                                Mẫu quản lý giao dịch phân tán qua
                                      local transactions

  Orchestration                       Một thành phần điều phối các bước
                                      Saga

  Compensation                        Giao dịch nghiệp vụ bù trừ cho bước
                                      đã thực hiện

  Eventual Consistency                Các bản sao/trạng thái hội tụ sau
                                      xử lý bất đồng bộ

  RabbitMQ                            Message broker

  Command                             Yêu cầu service thực hiện hành động

  Event                               Thông báo một sự kiện đã xảy ra

  Idempotency                         Xử lý lặp lại nhưng không tạo tác
                                      động nghiệp vụ lặp

  Outbox                              Bảng lưu message cần publish cùng
                                      transaction nghiệp vụ

  DLQ                                 Dead Letter Queue, nơi chứa message
                                      không xử lý được

  Retry                               Thử xử lý lại

  Timeout                             Giới hạn thời gian chờ

  Reservation                         Giữ tài nguyên tạm thời

  Capture                             Hoàn tất thu khoản tiền đã
                                      authorize

  Void                                Hủy khoản tiền đang authorize

  Refund                              Hoàn lại khoản tiền đã capture

  Correlation ID                      ID liên kết các message thuộc cùng
                                      luồng

  Reconciliation                      Đối soát và khôi phục trạng thái
                                      không nhất quán
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 30. Tài liệu tham khảo

Nên đọc tài liệu chính thức trong quá trình triển khai:

1.  [Spring Boot
    Documentation](https://docs.spring.io/spring-boot/index.html)
2.  [Spring Cloud
    Gateway](https://docs.spring.io/spring-cloud-gateway/reference/)
3.  [Spring Security](https://docs.spring.io/spring-security/reference/)
4.  [RabbitMQ Documentation](https://www.rabbitmq.com/docs)
5.  [MySQL Documentation](https://dev.mysql.com/doc/)
6.  [Docker Compose Documentation](https://docs.docker.com/compose/)
7.  [React Documentation](https://react.dev/)
8.  [Vite Documentation](https://vite.dev/guide/)
9.  [Flutter Documentation](https://docs.flutter.dev/)
10. [Microsoft -- Saga
    Pattern](https://learn.microsoft.com/azure/architecture/patterns/saga)
11. [AWS -- Saga
    Pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga.html)
12. [Transactional Outbox
    Pattern](https://microservices.io/patterns/data/transactional-outbox.html)

------------------------------------------------------------------------

# PHỤ LỤC A -- PROJECT DECISION LOG

Mọi thay đổi kiến trúc/nghiệp vụ quan trọng nên được ghi lại.

  ID        Quyết định                                            Trạng thái
  --------- ----------------------------------------------------- ------------
  ADR-001   Dùng Microservices                                    Accepted
  ADR-002   Dùng 5 Business Services                              Accepted
  ADR-003   Dùng Saga Orchestration                               Accepted
  ADR-004   Dùng RabbitMQ                                         Accepted
  ADR-005   Database per Service                                  Accepted
  ADR-006   Web trước, Mobile sau                                 Accepted
  ADR-007   Mock Wallet                                           Accepted
  ADR-008   Hotel optional                                        Accepted
  ADR-009   Tour Operator và Hotel Manager riêng                  Accepted
  ADR-010   Monorepo quản lý toàn bộ hệ thống                     Accepted
  ADR-011   Dùng Spring Cloud Netflix Eureka làm Discovery        Accepted
  ADR-012   Dùng Spring Cloud OpenFeign cho giao tiếp đồng bộ     Accepted

Khi đã thống nhất, chuyển trạng thái từ `Proposed` sang `Accepted`. Nếu
thay đổi, ghi lý do và tác động.

# PHỤ LỤC B -- NGUYÊN TẮC KHÔNG ĐƯỢC VI PHẠM

1.  Không truy cập database của service khác.
2.  Không dùng chung Entity giữa các service.
3.  Không xác nhận booking trước khi Saga hoàn tất.
4.  Không trừ inventory bằng thao tác read-then-write thiếu concurrency
    control.
5.  Không xử lý payment thiếu idempotency.
6.  Không giả định RabbitMQ chỉ giao message đúng một lần.
7.  Không đánh dấu compensation thành công khi chưa xác minh.
8.  Không lưu Saga state chỉ trong memory.
9.  Không để client tự quyết định tổng tiền.
10. Không đưa secret vào Git.
11. Không triển khai Mobile trước khi Web/API flow ổn định.
12. Không thêm service mới nếu chưa có lý do nghiệp vụ rõ ràng.

------------------------------------------------------------------------

**Kết thúc tài liệu SmartTrip Project Documentation v1.0**

Tài liệu này là baseline định hướng. Khi implementation có thay đổi được
nhóm chấp thuận, cần cập nhật tài liệu, API contract, database design và
test cases tương ứng để documentation luôn phản ánh đúng hệ thống thực
tế.
