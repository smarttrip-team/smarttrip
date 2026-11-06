# HuongDan.md — Làm thủ công từng bước: issue → code → commit → Pull Request → review → merge

> **Dự án:** FU Cinema Ticket System (`fu-cinema-ticket-system`) — Assignment 01, HSF302
> **Đề bài:** `Assignment1_ReadMe.md` (TODO 1–32) · **Quy trình:** `Assignment1_teamwork.md`
> **Nhóm 4 người:** **A** (Leader — khởi tạo project, đăng nhập/phân quyền, README & release) · **B** · **C** · **D** (phát triển chức năng)
> **Công nghệ:** Java 21 · Spring Boot 4.1.1 · Spring Data JPA · Thymeleaf · SQL Server

Tài liệu này dành cho nhóm muốn **làm tay mọi thao tác trên GitHub** (không dùng script). Mỗi issue được viết thành một "kịch bản" theo thứ tự thời gian, ghi rõ **ai** làm **bước nào**:

| Ký hiệu | Nghĩa |
|---|---|
| `[A]`, `[B]`… trong tiêu đề bước | Người thực hiện bước đó |
| 👤 Người làm | Người được assign issue: tạo nhánh, code, commit, mở PR, merge |
| 👀 Reviewer | Người review PR (luôn **khác** người viết code) |
| **Commit k/n** | Commit thứ k trong n commit của issue — làm đúng thứ tự, mỗi commit build được |

**Vòng đời chuẩn của mọi issue** (nhóm lặp lại 20 lần — reviewer xoay vòng giữa 4 người):

```
[A] tạo issue ─► [Người làm] nhận việc, tạo nhánh từ develop ─► code + commit nhỏ (Refs #n)
   ─► tự kiểm thử (mvn clean verify) ─► push ─► mở PR theo mẫu (Closes #n) ─► [Reviewer] review
   ─► (sửa bằng commit mới nếu bị Request changes) ─► Approve ─► [Người làm] Squash and merge
   ─► issue tự đóng, board sang Done ─► xoá nhánh
```

**Quy tắc vàng:** không ai push thẳng `main`/`develop` · không có issue thì không code · người viết không tự approve · không commit mật khẩu, `target/`, `.idea/`, `application-local.properties`.

> 💡 Code trong tài liệu giống `Step.md` (đã rà soát). Với file nhiều người cùng sửa (`BookingRepository`, `BookingService(Impl)`, `layout.html`), tài liệu chỉ đưa **đoạn cần thêm** và chỉ rõ chỗ thêm.

## Mục lục

- [1. Ai làm gì — mục lục theo người](#1-ai-làm-gì--mục-lục-theo-người)
- [2. Bước 1–4: Leader chuẩn bị repo · cả nhóm chuẩn bị máy](#2-bước-14-leader-chuẩn-bị-repo--cả-nhóm-chuẩn-bị-máy)
- [3. Bước 5 — Leader tạo 20 issue thủ công trên web](#3-bước-5--leader-tạo-20-issue-thủ-công-trên-web)
- [4. Thực hiện từng issue: code → commit → PR → review → merge](#4-thực-hiện-từng-issue-code--commit--pr--review--merge)
- [5. Tester cuối sprint](#5-tester-cuối-sprint)
- [6. Release v1.0.0 & quy trình merge vào main](#6-release-v100--quy-trình-merge-vào-main)
- [7. Xử lý xung đột & lỡ tay](#7-xử-lý-xung-đột--lỡ-tay)
- [8. Checklist cuối cùng theo người](#8-checklist-cuối-cùng-theo-người)

---


## 1. Ai làm gì — mục lục theo người

| Người | Issue mình code (nhánh) | PR mình review |
|---|---|---|
| **A (Leader)** | [#1 — Repo templates & CODEOWNERS (A)](#1--repo-templates--codeowners-a)<br>[#2 — Project setup & configuration (TODO 1–3) (A)](#2--project-setup--configuration-todo-13-a)<br>[#6 — Login / logout / register / interceptor (TODO 13–15) (A)](#6--login--logout--register--interceptor-todo-1315-a)<br>[#19 — README & release v1.0.0 (TODO 32) (A)](#19--readme--release-v100-todo-32-a) | [#3](#3--entities--repositories-skeleton-todo-47-9-b), [#8](#8--genre-crud-todo-18-c), [#10](#10--room-crud-todo-22-d), [#14](#14--seat-selection--booking-todo-28-d), [#16](#16--customer-profile--change-password-todo-30-b), [#20](#20--admin-dashboard-statistics-d) |
| **B** | [#3 — Entities & repositories skeleton (TODO 4–7, 9) (B)](#3--entities--repositories-skeleton-todo-47-9-b)<br>[#7 — Admin customer management (TODO 16–17) (B)](#7--admin-customer-management-todo-1617-b)<br>[#12 — Admin booking management (TODO 24–25) (B)](#12--admin-booking-management-todo-2425-b)<br>[#15 — Booking history & cancel (TODO 29) (B)](#15--booking-history--cancel-todo-29-b)<br>[#16 — Customer profile & change password (TODO 30) (B)](#16--customer-profile--change-password-todo-30-b) | [#1](#1--repo-templates--codeowners-a), [#4](#4--seed-data-todo-8-d), [#11](#11--showtime-crud--overlap-check-todo-23-d), [#14](#14--seat-selection--booking-todo-28-d), [#17](#17--revenue-report-todo-26-d), [#18](#18--movie-review-todo-31-c) |
| **C** | [#5 — Global exception handling & error pages (TODO 12) (C)](#5--global-exception-handling--error-pages-todo-12-c)<br>[#8 — Genre CRUD (TODO 18) (C)](#8--genre-crud-todo-18-c)<br>[#9 — Movie CRUD + soft delete (TODO 19–21) (C)](#9--movie-crud--soft-delete-todo-1921-c)<br>[#13 — Home & movie detail (TODO 27) (C)](#13--home--movie-detail-todo-27-c)<br>[#18 — Movie review (TODO 31) (C)](#18--movie-review-todo-31-c) | [#2](#2--project-setup--configuration-todo-13-a), [#3](#3--entities--repositories-skeleton-todo-47-9-b), [#7](#7--admin-customer-management-todo-1617-b), [#15](#15--booking-history--cancel-todo-29-b), [#17](#17--revenue-report-todo-26-d), [#19](#19--readme--release-v100-todo-32-a) |
| **D** | [#4 — Seed data (TODO 8) (D)](#4--seed-data-todo-8-d)<br>[#10 — Room CRUD (TODO 22) (D)](#10--room-crud-todo-22-d)<br>[#11 — Showtime CRUD + overlap check (TODO 23) (D)](#11--showtime-crud--overlap-check-todo-23-d)<br>[#14 — Seat selection & booking (TODO 28) (D)](#14--seat-selection--booking-todo-28-d)<br>[#17 — Revenue report (TODO 26) (D)](#17--revenue-report-todo-26-d)<br>[#20 — Admin dashboard statistics (D)](#20--admin-dashboard-statistics-d) | [#3](#3--entities--repositories-skeleton-todo-47-9-b), [#5](#5--global-exception-handling--error-pages-todo-12-c), [#6](#6--login--logout--register--interceptor-todo-1315-a), [#9](#9--movie-crud--soft-delete-todo-1921-c), [#12](#12--admin-booking-management-todo-2425-b), [#13](#13--home--movie-detail-todo-27-c) |

Release `v1.0.0`: A làm, **C + D** approve (cần 2), B review back-merge — xem [mục 6](#6-release-v100--quy-trình-merge-vào-main).

**Review xoay vòng:** mỗi PR có 1 reviewer chính, xoay vòng giữa A, B, C, D để ai cũng đọc code của các module khác (mỗi người review 6–7 PR). Người viết không tự review. PR thêm code vào file của người khác (ví dụ `BookingRepository` của B) mời thêm chủ file làm reviewer thứ hai.

---


## 2. Bước 1–4: Leader chuẩn bị repo · cả nhóm chuẩn bị máy

### Bước 1 — [A] Tạo repository & mời thành viên

1. GitHub → góc phải trên **+** → **New repository**.
2. *Owner*: tài khoản của A (hoặc organization của nhóm) · *Repository name*: `fu-cinema-ticket-system` · *Description*: `FU Cinema Ticket System — Spring Boot, Spring Data JPA, Thymeleaf, SQL Server` · **Private** · **KHÔNG** tick *Add a README*, *.gitignore*, *license* → **Create repository**.
3. **Settings → Collaborators** (organization: *Collaborators and teams*) → **Add people** → nhập username từng người:
   - B, C, D: quyền **Write**.
   - Giảng viên: quyền **Read**.
4. Nhắn nhóm: *"Đã mời vào repo, mọi người kiểm tra email/GitHub notification và bấm Accept invitation"*. **[B][C][D]** chấp nhận lời mời.

### Bước 2 — [A] Tạo project & commit khởi tạo

1. https://start.spring.io:
   - **Maven**, **Java**, Spring Boot **4.1.x** (bản ổn định mới nhất).
   - Group `com.fu.cinema`, Artifact `fu-cinema-ticket-system`, **Package name `com.fu.cinema`**.
   - **Jar**, Java **21**.
   - Dependencies: *Spring Web, Thymeleaf, Spring Data JPA, Validation, MS SQL Server Driver, Lombok, Spring Boot DevTools*.
   - Bấm **Generate**, giải nén file tải về.
2. Mở Git Bash trong thư mục project vừa giải nén. Đây là **lần duy nhất** được push thẳng lên `main`:

```bash
git init -b main
git add .
git status                                       # không có target/, .idea/
git commit -m "chore(setup): init spring boot project"
git remote add origin https://github.com/<owner>/fu-cinema-ticket-system.git
git push -u origin main
git switch -c develop
git push -u origin develop
```

### Bước 3 — [A] Cấu hình repository

1. **Settings → General → Default branch** → bấm ⇄ → chọn `develop` → **Update** → xác nhận.
2. Cùng trang, kéo xuống **Pull Requests**:
   - ✔ *Allow merge commits*
   - ✔ *Allow squash merging*, *Default commit message* = **Pull request title and description**
   - ✘ *Allow rebase merging*
   - ✔ *Automatically delete head branches*
3. **Settings → Rules → Rulesets → New ruleset → New branch ruleset** *(nếu không có mục này — repo Private dùng GitHub Free — bỏ qua; cả nhóm coi bảng dưới là **quy ước bắt buộc**)*:
   - Ruleset 1: *Name* `protect-develop` · *Enforcement* **Active** · *Target branches* → **Add target → Include by pattern** `develop` · tick **Restrict deletions**, **Block force pushes**, **Require a pull request before merging** (*Required approvals* = 1, ✔ *Dismiss stale approvals*, ✔ *Require conversation resolution*) · **Bypass list → Add bypass → Repository admin** (để A merge được PR đầu tiên) → **Create**.
   - Ruleset 2: `protect-main`, target `main`, giống trên nhưng *Required approvals* = **2** và ✔ *Require review from Code Owners*.

### Bước 4 — [A] Labels, Milestones, Board (làm trên web)

**Labels:** **Issues → Labels**.
1. Xoá label mặc định: ở mỗi label bấm **⋯ → Delete**. Xoá `bug`, `documentation`, `duplicate`, `enhancement`, `help wanted`, `invalid`, `question`, `wontfix`; giữ `good first issue`.
2. **New label**, nhập tên và màu, bấm **Create label**. Làm lần lượt 18 label:

| Tên label (gõ chính xác) | Màu |
|---|---|
| `type: feature` · `type: bug` · `type: chore` · `type: docs` · `type: refactor` | `#1D76DB` · `#D73A4A` · `#C5DEF5` · `#0075CA` · `#FBCA04` |
| `module: auth` · `module: customer` · `module: movie` · `module: showtime` · `module: booking` · `module: report` · `module: infra` | `#5319E7` (cả 7) |
| `priority: high` · `priority: medium` · `priority: low` | `#B60205` · `#FBCA04` · `#0E8A16` |
| `status: blocked` · `status: needs-info` · `bonus` | `#000000` · `#D876E3` · `#F9D0C4` |

**Milestones:** **Issues → Milestones → New milestone**. Tạo lần lượt 4 milestone. Tên gõ chính xác, dấu `—` là gạch dài; nếu khó gõ thì copy từ đây:

| Title | Due date (ví dụ) | Description |
|---|---|---|
| `Sprint 0 — Foundation` | 18/10/2026 | Repo, project setup, entity, repository, seed, error handling |
| `Sprint 1 — Admin core` | 01/11/2026 | Auth + chức năng Admin |
| `Sprint 2 — Customer flow` | 08/11/2026 | Trang chủ, đặt vé, lịch sử, hồ sơ |
| `Sprint 3 — Report & Release v1.0.0` | 15/11/2026 | Báo cáo, bonus, dashboard, README, release |

**Board:**
1. Tạo board:
   - Bấm ảnh đại diện → **Your projects** → **New project**. Với organization: tab **Projects** của org.
   - Chọn **Board** → *Project name* `FUCinema Board` → **Create project**.
2. Đổi cột:
   - Cột *Todo*: **⋯ → Edit details** → đổi tên `Backlog`.
   - Cột *In Progress*: đổi tên `In progress`.
   - Bấm **+** ở cuối dãy cột để thêm cột `To do (Sprint)` và `In review`.
   - Kéo thả để có đúng thứ tự: **Backlog → To do (Sprint) → In progress → In review → Done**.
3. **⋯ (góc phải trên) → Workflows**, bật từng workflow rồi **Save and turn on**:
   - *Item added to project* → Status = Backlog
   - *Item closed* → Done
   - *Pull request merged* → Done
4. **⋯ → Settings → Manage access** → thêm B, C, D với quyền **Write**.
5. Vào repo → tab **Projects** → **Link a project** → chọn `FUCinema Board`.

> Chi tiết từng thao tác Bước 4 (có ảnh mô tả, view "Theo người"): xem `Step456.md`.

### Bước 4b — [B][C][D] và [A] chuẩn bị máy (làm song song với Bước 3–5)

Cài: JDK 21, Git (có Git Bash), IntelliJ IDEA (bật plugin Lombok + *Enable annotation processing*), SQL Server + SSMS (bật TCP/IP cổng 1433, bật *SQL Server and Windows Authentication*).

```bash
git config --global user.name "Nguyen Van B"
git config --global user.email "email-trung-voi-tai-khoan-github@fpt.edu.vn"   # để commit được tính cho bạn
git config --global pull.rebase true
git config --global core.autocrlf true

git clone https://github.com/<owner>/fu-cinema-ticket-system.git
cd fu-cinema-ticket-system
git switch develop
```

SSMS: `CREATE DATABASE FUCinemaTicketDB;`. File cấu hình DB cá nhân tạo **sau khi #1 merge** (có file mẫu), git hook bật **sau khi #2 merge** — tài liệu sẽ nhắc đúng lúc.

---


## 3. Bước 5 — Leader tạo 20 issue thủ công trên web

> **Quan trọng — tạo đủ 20 issue liền một lượt, theo đúng thứ tự dưới đây, TRƯỚC khi mở bất kỳ PR nào.** GitHub đánh số chung cho issue và PR; làm đúng thì issue sẽ là #1 → #20 khớp với tên nhánh (`feature/9-movie-crud` ↔ issue #9), PR đầu tiên nhận số #21.
> Lúc này repo **chưa có template** (template được thêm ở chính issue #1), nên trang *New issue* mở thẳng ô trống — cứ dán nội dung bên dưới.

**Thao tác cho mỗi issue** (lặp 20 lần, mỗi issue ~1 phút):

1. Repo → tab **Issues** → **New issue**.
2. **Add a title**: dán *Title*.
3. **Add a description**: dán *Body* (có thể bấm **Preview** để xem checkbox hiển thị đúng).
4. Cột bên phải:
   - **Assignees** (bánh răng) → chọn người.
   - **Labels** → tick các label.
   - **Projects** → `FUCinema Board`.
   - **Milestone** → chọn sprint.
5. **Create** (hoặc *Submit new issue*). Kiểm tra số issue trên tiêu đề.

Tạo xong cả 20: mở **FUCinema Board** → kiểm tra 20 thẻ ở cột **Backlog** → kéo **#1 → #5** sang **To do (Sprint)**. Nhắn nhóm: *"Đã tạo issue, mọi người vào Issues → lọc `assignee:@me` để xem việc của mình"*.

> Lỡ lệch số (vd. tạo nhầm 1 issue thử): **không cần làm lại** — đóng issue thừa bằng *Close as not planned*, và từ đó dùng **số thật** khi đặt tên nhánh, `Refs #`, `Closes #`.


### Issue 1

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[CHORE] Repo templates & CODEOWNERS` |
| **Assignees** | A (Leader) |
| **Labels** | `type: chore`, `module: infra` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 0 — Foundation` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
Chuẩn hoá repo: issue template, PR template, CODEOWNERS, file cấu hình DB mẫu, git hook chạy `mvn verify` trước khi push.

## Tiêu chí chấp nhận
- [ ] `.github/ISSUE_TEMPLATE/feature_request.md`, `bug_report.md`, `.github/pull_request_template.md`
- [ ] `.github/CODEOWNERS` với username thật
- [ ] `src/main/resources/application-local.properties.example` (không có mật khẩu thật)
- [ ] `.githooks/pre-push`

## Ghi chú kỹ thuật
Nhánh `chore/1-repo-templates` · Xem Step.md mục A.2
**Reviewer:** B
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#1**.

### Issue 2

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Project setup & configuration (TODO 1–3)` |
| **Assignees** | A (Leader) |
| **Labels** | `type: feature`, `module: infra` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 0 — Foundation` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
Khởi tạo project Spring Boot, cấu hình kết nối SQL Server theo profile local, cấu trúc package 3-layer, layout Thymeleaf dùng chung.

## TODO liên quan
TODO 1, TODO 2, TODO 3

## Tiêu chí chấp nhận
- [ ] `mvn spring-boot:run` khởi động thành công; có `.gitignore`, `README.md`
- [ ] Kết nối được `FUCinemaTicketDB`; không có mật khẩu thật trong repository; có `application-local.properties.example`
- [ ] Đủ package: entity, enums, repository, service, service.impl, dto, controller, config, exception, util
- [ ] Layout dùng chung (head, navbar, flash, pagination, footer); menu thay đổi theo vai trò; vùng flash message
- [ ] `mvn clean verify` pass (test dùng H2)

## Ghi chú kỹ thuật
Nhánh `feature/2-project-setup` · Spring Boot 4.1.x, Java 21 (TECH-01) · Xem Step.md mục A.3
**Reviewer:** C
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#2**.

### Issue 3

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Entities & repositories skeleton (TODO 4–7, 9)` |
| **Assignees** | B |
| **Labels** | `type: feature`, `module: infra` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 0 — Foundation` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
8 enum, 10 entity (Account, Customer, Genre, Movie, Room, Showtime, Booking, Ticket, Review, ReviewId) và 9 repository với derived query mục 9.1.

## TODO liên quan
TODO 4, 5, 6, 7, 9

## Tiêu chí chấp nhận
- [ ] Enum lưu dạng chuỗi (`EnumType.STRING`)
- [ ] Account 1–1 Customer (Customer giữ FK `account_id` unique)
- [ ] Genre 1–N Movie (FK `genre_id` NOT NULL); Showtime N–1 Movie, N–1 Room; `LocalDateTime`, `BigDecimal`
- [ ] Booking 1–N Ticket (cascade ALL + orphanRemoval); Review khoá kép `@EmbeddedId` + `@MapsId`
- [ ] Không `@Data` trên entity; mọi `@ManyToOne` LAZY
- [ ] Đủ derived query mục 9.1; app khởi động không lỗi `PropertyReferenceException`
- [ ] SSMS thấy đủ 9 bảng, PK/FK đúng

## Ghi chú kỹ thuật
Nhánh `feature/3-entities-repositories` · **Review:** A + C + D (C soi Genre/Movie/Review, D soi Room/Showtime, Booking/Ticket)
Sau khi merge: mọi thay đổi entity phải qua issue label `module: infra`.
**Reviewer:** A + C + D
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#3**.

### Issue 4

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Seed data (TODO 8)` |
| **Assignees** | D |
| **Labels** | `type: feature`, `module: infra` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 0 — Foundation` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
Seed dữ liệu mẫu khi khởi động (chỉ khi bảng rỗng), mật khẩu BCrypt.

## TODO liên quan
TODO 8 (dữ liệu mục 7)

## Tiêu chí chấp nhận
- [ ] 3 tài khoản: admin@fucinema.vn/Admin@123, an.nv@gmail.com/Customer@123, binh.tt@gmail.com/Customer@123 (binh < 16 tuổi)
- [ ] 5 thể loại; 6 phim (3 SHOWING, 2 COMING_SOON, 1 STOPPED, có phim T18)
- [ ] Room 01 (2D 8×12), Room 02 (3D 10×14), Room 03 (IMAX 12×16, MAINTENANCE)
- [ ] ≥ 6 suất trong 7 ngày tới, ≥ 1 suất đã qua, ≥ 1 suất CANCELLED
- [ ] ≥ 5 đơn đủ 3 trạng thái, trải nhiều ngày
- [ ] Khởi động lại không nhân đôi dữ liệu

## Ghi chú kỹ thuật
Nhánh `feature/4-seed-data` · PasswordConfig, DataSeeder (CommandLineRunner)
**Reviewer:** B
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#4**.

### Issue 5

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Global exception handling & error pages (TODO 12)` |
| **Assignees** | C |
| **Labels** | `type: feature`, `module: infra` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 0 — Foundation` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
BusinessException, ResourceNotFoundException, GlobalExceptionHandler (@ControllerAdvice), trang lỗi 403/404/500, flash message.

## TODO liên quan
TODO 11 (phần exception), TODO 12

## Tiêu chí chấp nhận
- [ ] Nhập ID không tồn tại → trang 404
- [ ] Vi phạm nghiệp vụ → thông báo rõ ràng (flash), không lộ stack trace
- [ ] Có `error/403.html`, `error/404.html`, `error/500.html`

## Ghi chú kỹ thuật
Nhánh `feature/5-error-handling` · Quy ước cho cả nhóm: service ném BusinessException khi vi phạm BR
**Reviewer:** D
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#5**.

### Issue 6

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Login / logout / register / interceptor (TODO 13–15)` |
| **Assignees** | A (Leader) |
| **Labels** | `type: feature`, `module: auth`, `priority: high` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 1 — Admin core` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
Đăng nhập/đăng xuất bằng HttpSession, đăng ký khách hàng, phân quyền bằng HandlerInterceptor.

## TODO liên quan
TODO 11 (AuthService), TODO 13, 14, 15

## Tiêu chí chấp nhận
- [ ] Đăng nhập kiểm tra BCrypt; lưu (id, name, role) vào session; Admin → `/admin`, Customer → `/`
- [ ] Sai mật khẩu / tài khoản LOCKED → báo lỗi; đăng xuất (POST) xoá session
- [ ] Đăng ký tạo Account (CUSTOMER, ACTIVE) + Customer trong 1 transaction; dữ liệu nhập được giữ khi lỗi
- [ ] Chưa đăng nhập vào `/customer/**` → `/login`; Customer vào `/admin/**` → 403

## Quy tắc nghiệp vụ áp dụng
BR-01, BR-02, BR-03

## Ghi chú kỹ thuật
Nhánh `feature/6-auth` · **Merge sớm nhất Sprint 1** — mọi chức năng Customer phụ thuộc · Cung cấp `SessionUtils.getCurrentCustomerId(session)`
**Reviewer:** D
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#6**.

### Issue 7

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Admin customer management (TODO 16–17)` |
| **Assignees** | B |
| **Labels** | `type: feature`, `module: customer` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 1 — Admin core` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
Admin quản lý khách hàng: danh sách, tìm kiếm, thêm/sửa, khoá/mở khoá, xoá.

## TODO liên quan
TODO 16, TODO 17 · Query Q1

## Tiêu chí chấp nhận
- [ ] Tìm theo tên/email/SĐT không phân biệt hoa thường; phân trang; sắp xếp theo tên; giữ từ khoá khi chuyển trang
- [ ] Hiển thị trạng thái tài khoản
- [ ] Thêm/sửa khách hàng kèm tài khoản; khoá/mở khoá
- [ ] Xoá: chưa có đơn → xoá Customer + Account; đã có đơn → LOCKED; có hộp xác nhận; thông báo "đã xoá"/"đã khoá"

## Quy tắc nghiệp vụ áp dụng
BR-01, BR-02, BR-04

## Ghi chú kỹ thuật
Nhánh `feature/7-customer-admin` · CustomerRepository Q1 `search`, `findWithAccountById` · CustomerForm, CustomerService(+Impl), AdminCustomerController
Phụ thuộc: #3, #5
**Reviewer:** C
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#7**.

### Issue 8

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Genre CRUD (TODO 18)` |
| **Assignees** | C |
| **Labels** | `type: feature`, `module: movie` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 1 — Admin core` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
CRUD thể loại phim cho Admin.

## TODO liên quan
TODO 18

## Tiêu chí chấp nhận
- [ ] Thêm/sửa/xoá thể loại; tên không trống, không trùng (không phân biệt hoa thường)
- [ ] Xoá thể loại còn phim → báo lỗi, không xoá

## Quy tắc nghiệp vụ áp dụng
BR-05

## Ghi chú kỹ thuật
Nhánh `feature/8-genre-crud` · Merge **trước** #9 · Phụ thuộc: #3, #5
**Reviewer:** A
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#8**.

### Issue 9

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Movie CRUD + soft delete (TODO 19–21)` |
| **Assignees** | C |
| **Labels** | `type: feature`, `module: movie` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 1 — Admin core` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
Admin quản lý phim: danh sách có tìm/lọc/phân trang/sắp xếp, thêm/sửa phim, xoá phim (xoá mềm khi đã có suất chiếu).

## TODO liên quan
TODO 19, TODO 20, TODO 21 · Query Q2

## Tiêu chí chấp nhận
- [ ] Danh sách: tìm theo tên, lọc thể loại + trạng thái, phân trang 10 dòng, sắp xếp ngày khởi chiếu / tên
- [ ] Các tiêu chí lọc kết hợp được; chuyển trang giữ bộ lọc
- [ ] Form MovieForm: dropdown thể loại, validate thời lượng [30, 300], ngày khởi chiếu, độ tuổi; lỗi cạnh từng trường
- [ ] Xoá: chưa có suất → xoá; đã có suất → STOPPED, thông báo tương ứng

## Quy tắc nghiệp vụ áp dụng
BR-06

## Ghi chú kỹ thuật
Nhánh `feature/9-movie-crud` · Phụ thuộc: #8 · Được dùng bởi #11 (`MovieService.findSchedulable()`)
**Reviewer:** D
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#9**.

### Issue 10

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Room CRUD (TODO 22)` |
| **Assignees** | D |
| **Labels** | `type: feature`, `module: showtime` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 1 — Admin core` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
CRUD phòng chiếu cho Admin.

## TODO liên quan
TODO 22

## Tiêu chí chấp nhận
- [ ] Thêm/sửa/xoá phòng; tên duy nhất; TotalRows ∈ [1, 26], SeatsPerRow ∈ [1, 30]
- [ ] Hiển thị sức chứa = TotalRows × SeatsPerRow
- [ ] Phòng đã có suất chiếu → không xoá, chuyển MAINTENANCE

## Ghi chú kỹ thuật
Nhánh `feature/10-room-crud` · Phụ thuộc: #3, #5
**Reviewer:** A
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#10**.

### Issue 11

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Showtime CRUD + overlap check (TODO 23)` |
| **Assignees** | D |
| **Labels** | `type: feature`, `module: showtime` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 1 — Admin core` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
CRUD suất chiếu, chống trùng giờ trong cùng phòng, xoá/huỷ suất kèm huỷ đơn.

## TODO liên quan
TODO 23 · Query Q3, Q9, Q11

## Tiêu chí chấp nhận
- [ ] Chọn phim, phòng, giờ bắt đầu, giá vé; gợi ý EndTime = StartTime + Duration + 15 phút
- [ ] Tạo suất trùng giờ cùng phòng → báo lỗi chỉ rõ suất bị trùng
- [ ] Xoá suất chưa có đơn → xoá; có đơn → CANCELLED + huỷ toàn bộ đơn của suất
- [ ] Danh sách lọc theo ngày, phim, phòng; phân trang

## Quy tắc nghiệp vụ áp dụng
BR-07, BR-08, BR-09

## Ghi chú kỹ thuật
Nhánh `feature/11-showtime-crud` · Q9 nằm trong BookingRepository (file của B) → báo B trước, thêm ở cuối file
Phụ thuộc: #9, #10 · Được dùng bởi #13 (`findUpcomingByMovie`), #20 (Q11)
**Reviewer:** B
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#11**.

### Issue 12

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Admin booking management (TODO 24–25)` |
| **Assignees** | B |
| **Labels** | `type: feature`, `module: booking` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 1 — Admin core` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
Admin xem/lọc đơn đặt vé, xem chi tiết, xác nhận hoặc huỷ đơn.

## TODO liên quan
TODO 24, TODO 25 · Query Q5, Q6

## Tiêu chí chấp nhận
- [ ] Lọc theo trạng thái, khoảng ngày đặt, từ khoá khách hàng (kết hợp); phân trang; mới nhất trước
- [ ] Chi tiết: khách, phim, suất chiếu, danh sách ghế, tổng tiền — không LazyInitializationException
- [ ] Xác nhận/huỷ đúng luồng trạng thái; sai luồng → báo lỗi

## Quy tắc nghiệp vụ áp dụng
BR-13

## Ghi chú kỹ thuật
Nhánh `feature/12-booking-admin` · Dùng đơn trong seed, không cần chờ #14 · B tạo BookingService (D bổ sung ở #14, B bổ sung ở #15)
**Reviewer:** D
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#12**.

### Issue 13

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Home & movie detail (TODO 27)` |
| **Assignees** | C |
| **Labels** | `type: feature`, `module: movie` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 2 — Customer flow` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
Trang chủ phim đang chiếu/sắp chiếu và trang chi tiết phim cho khách.

## TODO liên quan
TODO 27 · Query Q10

## Tiêu chí chấp nhận
- [ ] Trang chủ: phim SHOWING và COMING_SOON (không hiện STOPPED), tìm theo tên, lọc thể loại
- [ ] Chi tiết: thông tin phim, điểm đánh giá trung bình, suất OPEN sắp tới nhóm theo ngày
- [ ] Khách chưa đăng nhập xem được; bấm "Đặt vé" khi chưa đăng nhập → `/login`

## Quy tắc nghiệp vụ áp dụng
BR-06

## Ghi chú kỹ thuật
Nhánh `feature/13-home-movie-detail` · Thay HomeController/index.html tạm của A · Phụ thuộc: #8, #9, #11
**Reviewer:** D
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#13**.

### Issue 14

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Seat selection & booking (TODO 28)` |
| **Assignees** | D |
| **Labels** | `type: feature`, `module: booking`, `priority: high` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 2 — Customer flow` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
Khách chọn một hoặc nhiều ghế trên sơ đồ ghế và đặt vé.

## TODO liên quan
TODO 28 · Query Q4

## Tiêu chí chấp nhận
- [ ] Sơ đồ ghế của suất chiếu (trống / đã bán); chọn nhiều ghế; xem tổng tiền; xác nhận đặt
- [ ] Hai người cùng chọn một ghế: người thứ hai nhận thông báo ghế đã bán
- [ ] Đơn và vé được lưu đồng thời hoặc không lưu gì (1 transaction)
- [ ] Unit test cho validate đặt vé

## Quy tắc nghiệp vụ áp dụng
BR-10, BR-11, BR-12

## Ghi chú kỹ thuật
Nhánh `feature/14-seat-booking` (khuyến nghị chia 2 PR) · Thêm `create` vào BookingService của B 
Phụ thuộc: #6, #11, #12
**Reviewer:** A + B
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#14**.

### Issue 15

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Booking history & cancel (TODO 29)` |
| **Assignees** | B |
| **Labels** | `type: feature`, `module: booking` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 2 — Customer flow` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
Khách xem lịch sử đơn của mình, xem chi tiết, huỷ đơn hợp lệ.

## TODO liên quan
TODO 29

## Tiêu chí chấp nhận
- [ ] Danh sách đơn của khách đang đăng nhập; lọc trạng thái; phân trang; mới nhất trước
- [ ] Xem chi tiết đơn; huỷ đơn trước giờ chiếu ít nhất 2 giờ
- [ ] Không xem/huỷ được đơn của người khác (đổi ID trên URL → 403/404)

## Quy tắc nghiệp vụ áp dụng
BR-14

## Ghi chú kỹ thuật
Nhánh `feature/15-booking-history` · Rebase sau khi #14 merge (cùng sửa BookingService, CustomerBookingController)
Phụ thuộc: #6, #12
**Reviewer:** C
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#15**.

### Issue 16

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Customer profile & change password (TODO 30)` |
| **Assignees** | B |
| **Labels** | `type: feature`, `module: customer` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 2 — Customer flow` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
Khách xem/cập nhật hồ sơ cá nhân và đổi mật khẩu.

## TODO liên quan
TODO 30

## Tiêu chí chấp nhận
- [ ] Xem, cập nhật thông tin (không đổi username)
- [ ] Đổi mật khẩu: nhập mật khẩu cũ; sai mật khẩu cũ → báo lỗi; mật khẩu mới mạnh, lưu BCrypt

## Quy tắc nghiệp vụ áp dụng
BR-01, BR-02

## Ghi chú kỹ thuật
Nhánh `feature/16-profile` · Phụ thuộc: #6, #7
**Reviewer:** A
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#16**.

### Issue 17

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Revenue report (TODO 26)` |
| **Assignees** | D |
| **Labels** | `type: feature`, `module: report` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 3 — Report & Release v1.0.0` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
Báo cáo thống kê giao dịch bán vé theo khoảng StartDate → EndDate.

## TODO liên quan
TODO 26 · Query Q7, Q8

## Tiêu chí chấp nhận
- [ ] (a) Doanh thu theo phim: tên phim, số vé, doanh thu — giảm dần theo doanh thu
- [ ] (b) Danh sách đơn CONFIRMED trong kỳ — giảm dần theo ngày đặt
- [ ] (c) Dòng tổng: tổng đơn, tổng vé, tổng doanh thu
- [ ] StartDate > EndDate → báo lỗi; kỳ không có dữ liệu → "Không có dữ liệu"

## Quy tắc nghiệp vụ áp dụng
BR-15

## Ghi chú kỹ thuật
Nhánh `feature/17-revenue-report` · Q7 constructor expression → MovieRevenueDTO · Phụ thuộc: #12
**Reviewer:** C + B
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#17**.

### Issue 18

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Movie review (TODO 31)` |
| **Assignees** | C |
| **Labels** | `type: feature`, `module: movie`, `bonus` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 3 — Report & Release v1.0.0` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
(Bonus) Khách đã xem phim được đánh giá; hiển thị đánh giá và điểm trung bình.

## TODO liên quan
TODO 31 · Query Q10, Q12

## Tiêu chí chấp nhận
- [ ] Thêm/sửa đánh giá (mỗi khách mỗi phim một lần — khoá kép)
- [ ] Hiển thị danh sách đánh giá + điểm trung bình ở trang chi tiết phim
- [ ] Chưa xem phim → không hiện nút đánh giá

## Quy tắc nghiệp vụ áp dụng
BR-16

## Ghi chú kỹ thuật
Nhánh `feature/18-movie-review` · Q12 thêm vào cuối BookingRepository · Phụ thuộc: #13
**Reviewer:** B
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#18**.

### Issue 19

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[DOCS] README & release v1.0.0 (TODO 32)` |
| **Assignees** | A (Leader) |
| **Labels** | `type: docs` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 3 — Report & Release v1.0.0` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
Hoàn thiện README và phát hành v1.0.0.

## TODO liên quan
TODO 32

## Tiêu chí chấp nhận
- [ ] README: mô tả, công nghệ, cài đặt & chạy, tài khoản mẫu, thành viên & phân công, ảnh chụp màn hình
- [ ] Người khác clone về chạy được chỉ bằng README
- [ ] release/1.0.0 → main, tag v1.0.0, GitHub Release, back-merge develop

## Ghi chú kỹ thuật
Nhánh `docs/19-readme`, sau đó `release/1.0.0` · Xem Step.md mục 8
**Reviewer:** C
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#19**.

### Issue 20

| Ô trên form | Nhập / chọn |
|---|---|
| **Title** | `[FEATURE] Admin dashboard statistics` |
| **Assignees** | D |
| **Labels** | `type: feature`, `module: infra` |
| **Projects** | `FUCinema Board` |
| **Milestone** | `Sprint 3 — Report & Release v1.0.0` |

**Body** (dán toàn bộ vào ô *Add a description*):

```markdown
## Mô tả
Trang `/admin`: số phim đang chiếu, số khách hàng, số đơn PENDING, số suất chiếu hôm nay theo phòng.

## Tiêu chí chấp nhận
- [ ] 3 thẻ số liệu đúng với dữ liệu
- [ ] Bảng suất chiếu hôm nay theo phòng (Q11 native), phòng không có suất hiện 0
- [ ] Link "Xem đơn" lọc sẵn PENDING
- [ ] Controller chỉ gọi service

## Ghi chú kỹ thuật
Nhánh `feature/20-admin-dashboard` · Phụ thuộc: #7, #9, #11, #12
**Reviewer:** A
```

Bấm **Submit new issue** → kiểm tra số trên tiêu đề là **#20**.

---

## 4. Thực hiện từng issue: code → commit → PR → review → merge

Thứ tự dưới đây là **thứ tự thời gian**. Trong cùng một sprint, các issue của **những người khác nhau làm song song**; chỉ cần chú ý dòng "Cần merge trước".

**Các lệnh chung dùng ở mọi issue**

| Việc | Lệnh |
|---|---|
| Xem đang ở nhánh nào, file nào thay đổi | `git status` |
| Xem nội dung thay đổi | `git diff` (chưa add) · `git diff --staged` (đã add) |
| Huỷ add một file | `git restore --staged <file>` |
| Xem các commit của nhánh mình | `git log --oneline develop..HEAD` |
| Đồng bộ develop vào nhánh mình | `git fetch origin && git rebase origin/develop` rồi `git push --force-with-lease` |

**Mở PR trên web (dùng cho mọi issue):** sau khi push, vào repo sẽ thấy thanh vàng **Compare & pull request**. Không thấy thì vào tab **Pull requests → New pull request** → *base* `develop`, *compare* nhánh của bạn. Từ issue #2 trở đi, ô mô tả **tự điền PR template**. Nội dung đã điền sẵn trong tài liệu chỉ cần **dán đè** lên rồi chỉnh lại cho đúng.

**Review trên web (dùng cho mọi issue):**
1. Mở PR, vào tab **Files changed**.
2. Rê chuột vào dòng code, bấm **+** để comment, rồi bấm **Start a review**.
3. Comment hết các file, bấm **Review changes** (góc phải trên), chọn **Approve**, **Request changes** hoặc **Comment**, rồi **Submit review**.


## Sprint: Sprint 0 — Foundation

### #1 — Repo templates & CODEOWNERS (A)

| | |
|---|---|
| 👤 Người làm | **A (Leader)** |
| 👀 Reviewer | **B** |
| Nhánh | `chore/1-repo-templates` |
| Milestone | `Sprint 0 — Foundation` |
| Cần merge trước | Bước 1–5 (Sprint 0) đã xong |
| Tiêu đề PR | `chore(setup): add issue/pr templates and codeowners` |

#### #1.1 — [A] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#1** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c chore/1-repo-templates
```

#### #1.2 — [A] Code & commit

**Commit 1/3 — `chore(setup): add issue and pull request templates`**

📄 **`.github/ISSUE_TEMPLATE/feature_request.md`**

```markdown
---
name: Feature request
about: Chức năng mới theo TODO của Assignment
title: "[FEATURE] "
labels: "type: feature"
---

## Mô tả
<!-- Chức năng gì, cho vai trò nào (Admin/Customer) -->

## TODO liên quan
TODO ...

## Tiêu chí chấp nhận
- [ ] ...
- [ ] ...

## Quy tắc nghiệp vụ áp dụng
BR-...

## Ghi chú kỹ thuật
<!-- Repository/service/controller/template dự kiến, phụ thuộc issue khác (#...) -->
```
📄 **`.github/ISSUE_TEMPLATE/bug_report.md`**

```markdown
---
name: Bug report
about: Báo lỗi
title: "[BUG] "
labels: "type: bug"
---

## Mô tả lỗi

## Các bước tái hiện
1. Đăng nhập bằng ...
2. Vào trang ...
3. ...

## Kết quả mong đợi

## Kết quả thực tế
<!-- Ảnh chụp màn hình, log lỗi (không dán mật khẩu) -->

## Môi trường
Nhánh/commit: ...   ·   Trình duyệt: ...
```
📄 **`.github/pull_request_template.md`**

```markdown
## Mô tả
<!-- Thay đổi gì và vì sao -->

Closes #

## Loại thay đổi
- [ ] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. Đăng nhập bằng ...
2. ...
Kết quả mong đợi: ...

## Ảnh chụp màn hình
<!-- Bắt buộc với thay đổi giao diện -->

## Checklist
- [ ] Tiêu đề PR theo Conventional Commits
- [ ] Đã rebase/merge develop mới nhất
- [ ] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [ ] Đã tự test các trường hợp chính và trường hợp lỗi
- [ ] Controller không gọi repository; nghiệp vụ nằm ở service
- [ ] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add .github/ISSUE_TEMPLATE/feature_request.md \
        .github/ISSUE_TEMPLATE/bug_report.md \
        .github/pull_request_template.md
git commit -m "chore(setup): add issue and pull request templates" -m "Refs #1"
```

**Commit 2/3 — `chore(setup): add codeowners`**

📄 **`.github/CODEOWNERS`**

```text
# Người sở hữu mặc định (thay @leader-A, @member-B, @member-C, @member-D bằng username GitHub thật)
*                                                   @leader-A

/src/main/java/com/fu/cinema/entity/                @member-B
/pom.xml                                            @leader-A
/src/main/resources/application.properties          @leader-A
**/*Customer*                                       @member-B
**/*Profile*                                        @member-B
**/*Genre*                                          @member-C
**/*Movie*                                          @member-C
**/*Review*                                         @member-C
**/*Room*                                           @member-D
**/*Showtime*                                       @member-D
**/*Dashboard*                                      @member-D
**/*Booking*                                        @member-B
**/*Ticket*                                         @member-D
**/*Report*                                         @member-D
```
Thay `@leader-A`, `@member-B`… bằng **username GitHub thật** của nhóm trước khi commit.

```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add .github/CODEOWNERS
git commit -m "chore(setup): add codeowners" -m "Refs #1"
```

**Commit 3/3 — `chore(config): add local properties example and pre-push hook`**

📄 **`src/main/resources/application-local.properties.example`**

```properties
# Copy file này thành application-local.properties (đã .gitignore) và điền thông tin máy bạn
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=FUCinemaTicketDB;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=CHANGE_ME
```
📄 **`.githooks/pre-push`**

```bash
#!/bin/sh
# Chạy kiểm tra build + test trước mỗi lần push (thay cho CI).
# Bỏ qua khi thật cần: git push --no-verify
echo "pre-push: mvn verify..."
if [ -f ./mvnw ]; then MVN="sh ./mvnw"; else MVN="mvn"; fi   # ưu tiên Maven wrapper có sẵn trong project
$MVN -q -B -ntp verify || { echo "Build/test FAILED - push bị huỷ"; exit 1; }
```
```bash
git update-index --chmod=+x .githooks/pre-push      # đánh dấu file hook chạy được (sau git add)
```

```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/resources/application-local.properties.example \
        .githooks/pre-push
git update-index --chmod=+x .githooks/pre-push
git commit -m "chore(config): add local properties example and pre-push hook" -m "Refs #1"
```

#### #1.3 — [A] Tự kiểm thử

```bash
mvn -q compile                 # #1 chỉ cần compile được
```

> ⚠️ Ở #1 **chưa chạy `mvn verify`**: test mặc định của Initializr cần database nên sẽ fail — #2 thêm cấu hình test H2 để sửa. Reviewer cũng chỉ cần `mvn -q compile`.

- [ ] Mở từng file, kiểm tra đúng đường dẫn (`.github` nằm ở thư mục gốc, cùng cấp `pom.xml`)
- [ ] `grep -rn password src/main/resources` → chỉ thấy `CHANGE_ME`
- [ ] `git ls-files -s .githooks/pre-push` → cột đầu là `100755`

#### #1.4 — [A] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin chore/1-repo-templates
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `chore/1-repo-templates`**.

- **Title:** `chore(setup): add issue/pr templates and codeowners`
- **Reviewers:** B  ·  **Assignees:** A (Leader)  ·  **Labels:** `type: chore`, `module: infra`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 0 — Foundation`
- PR này chưa có mẫu tự điền (GitHub chỉ đọc template sau khi nó nằm trên `develop`) → dán nội dung PR bên dưới. Sau khi merge: **Issues → New issue** phải thấy 2 mẫu.
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
Chuẩn hoá repo: issue template, PR template, CODEOWNERS, file cấu hình DB mẫu, git hook chạy `mvn verify` trước khi push.

Các file chính: `feature_request.md`, `bug_report.md`, `pull_request_template.md`, `CODEOWNERS`, `application-local.properties.example`, `pre-push`

Closes #1

## Loại thay đổi
- [ ] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [x] chore  - [ ] test

## Cách kiểm thử
1. Mở từng file, kiểm tra đúng đường dẫn (`.github` nằm ở thư mục gốc, cùng cấp `pom.xml`)
2. `grep -rn password src/main/resources` → chỉ thấy `CHANGE_ME`
3. `git ls-files -s .githooks/pre-push` → cột đầu là `100755`

Kết quả `mvn -q compile`: OK

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [ ] `mvn verify` (chưa áp dụng ở #1 — xem #2)
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#1** sang **In review**. Nhắn reviewer link PR.

#### #1.5 — [B] Review

> Đây là PR đầu tiên của nhóm nên mục này hướng dẫn **toàn bộ thao tác review trên giao diện web GitHub**. Các PR sau (#2 → #20) làm y hệt, chỉ khác phần "cần soi kỹ".
> **Người review: B.** A (tác giả) **không tự approve** được PR của mình. Nút *Approve* bị ẩn với tác giả.

**Bước 1 — Tìm PR cần review**

- **Cách 1:** GitHub gửi thông báo *"A requested your review on #21"*. Bấm chuông 🔔 (góc phải trên) hoặc mở email đó.
- **Cách 2:** repo → tab **Pull requests** → bộ lọc **Reviews → Awaiting review from you**. Hoặc gõ vào ô tìm kiếm: `is:pr is:open review-requested:@me`.
- Nếu không thấy: A chưa thêm B vào *Reviewers*. Nhắn A thêm, hoặc B tự vào PR, ở cột phải **Reviewers**, bấm ⚙ và chọn mình.

**Bước 2 — Tab *Conversation*: kiểm tra thông tin PR**

| Kiểm tra | Đúng là | Sai thì |
|---|---|---|
| Dòng dưới tiêu đề | `A wants to merge 3 commits into` **`develop`** `from` **`chore/1-repo-templates`** | Base là `main` → nhờ A bấm **Edit** cạnh tiêu đề, đổi base thành `develop` |
| Tiêu đề | `chore(setup): add issue/pr templates and codeowners` | Comment yêu cầu sửa |
| Mô tả | Có `Closes #1`, có mục *Cách kiểm thử* | Comment yêu cầu bổ sung |
| Cột phải **Development** | Hiện issue **#1** (được liên kết nhờ `Closes #1`) | Mô tả thiếu hoặc viết sai `Closes #1` |
| Cột phải Labels / Milestone / Projects | `type: chore`, `module: infra` / `Sprint 0 — Foundation` / `FUCinema Board` | Comment nhắc |

**Bước 3 — Tab *Commits*: kiểm tra lịch sử commit**

Phải có đúng 3 commit theo Conventional Commits, mỗi commit có `Refs #1` (bấm vào commit để xem phần mô tả):

```
chore(setup): add issue and pull request templates
chore(setup): add codeowners
chore(config): add local properties example and pre-push hook
```

Commit kiểu `update`, `fix file`, `asdf` → góp ý `nit:`. Không chặn merge vì PR sẽ được squash thành 1 commit.

**Bước 4 — Tab *Files changed*: đọc từng file**

1. Cây thư mục bên trái (nếu bị ẩn, bấm icon ☰ *Show file tree*). Kiểm tra **vị trí** các file:

   ```
   .githooks/pre-push
   .github/CODEOWNERS
   .github/ISSUE_TEMPLATE/bug_report.md
   .github/ISSUE_TEMPLATE/feature_request.md
   .github/pull_request_template.md               ← KHÔNG được nằm trong ISSUE_TEMPLATE
   src/main/resources/application-local.properties.example
   ```

   Thừa file (ví dụ `application-local.properties`, `.idea/`, `target/`) → **blocker**.
2. Bấm ⚙ (góc trên) để chọn *Split* (2 cột) hoặc *Unified*. File mới thì cột trái trống.
3. Với file `.md`, bấm icon 📄 **Display the rich diff** ở đầu file để xem nội dung đã định dạng.
4. Soi nội dung từng file:

| File | Cần kiểm tra |
|---|---|
| `feature_request.md`, `bug_report.md` | Có phần đầu nằm giữa hai dòng `---` (khai báo `name`, `about`, `title`, `labels`). Tên label trong `labels:` khớp đúng label đã tạo (`type: feature`, `type: bug`). |
| `pull_request_template.md` | Có dòng `Closes #`, mục *Cách kiểm thử*, *Checklist* |
| `CODEOWNERS` | **Không còn** `@leader-A`, `@member-B`… Đã thay bằng username thật, đúng chủ module theo bảng phân công. |
| `application-local.properties.example` | Mật khẩu là `CHANGE_ME`, **không có mật khẩu thật** |
| `pre-push` | Dòng đầu `#!/bin/sh`, có lệnh `verify` |

5. Đọc xong một file → tick **Viewed** ở góc phải file đó. File được thu gọn, thanh tiến độ "x / 6 files viewed" tăng lên.

**Bước 5 — Viết góp ý ngay trên dòng code**

1. Rê chuột vào **số dòng**, bấm dấu **+** màu xanh. Muốn chọn nhiều dòng: bấm số dòng đầu, giữ **Shift**, bấm số dòng cuối.
2. Gõ góp ý, **bắt đầu bằng tiền tố**:
   - `blocker:` — sai, phải sửa.
   - `suggestion:` — nên sửa.
   - `nit:` — chi tiết nhỏ.
   - `question:` — cần tác giả giải thích.
3. *(Tuỳ chọn)* Bấm icon **±** *Insert a suggestion* để đề xuất nội dung thay thế. Tác giả bấm **Commit suggestion** là sửa xong, không cần sửa tay.
4. Bấm **Start a review**, **không** bấm *Add single comment*. Các góp ý được gom lại, gửi một lần ở Bước 6, tác giả chỉ nhận 1 thông báo.
5. Lặp lại cho các dòng khác. Các góp ý đang chờ có nhãn **Pending**.

Ví dụ góp ý cho PR này:

```markdown
blocker: `pull_request_template.md` đang nằm trong `.github/ISSUE_TEMPLATE/` — GitHub sẽ coi nó là mẫu issue thứ 3.
Chuyển lên `.github/pull_request_template.md`.
```

```markdown
blocker: CODEOWNERS còn `@member-C`, `@member-D` — chưa thay username thật.
```

```markdown
nit: `bug_report.md` dòng 4 nên để `labels: "type: bug"` (có dấu cách sau dấu `:`) cho khớp tên label.
```

**Bước 6 — Gửi kết quả review**

1. Bấm nút xanh **Review changes** (góc phải trên tab *Files changed*; giao diện mới ghi **Submit review**).
2. Ô *Leave a comment*: viết nhận xét tổng.
3. Chọn **một** trong ba:

| Lựa chọn | Khi nào |
|---|---|
| **Comment** | Chỉ hỏi (`question:`), chưa kết luận |
| **Approve** | Đạt yêu cầu, không còn `blocker:` (`nit:` vẫn approve được) |
| **Request changes** | Có ít nhất một `blocker:` → **chặn merge** cho đến khi B approve lại |

4. Bấm **Submit review**.

Nhận xét tổng mẫu khi **Approve**:

```markdown
Đã kiểm tra 6 file trên tab Files changed:
- Vị trí: 2 issue template trong `.github/ISSUE_TEMPLATE/`, PR template và CODEOWNERS ở `.github/` — đúng.
- CODEOWNERS đã dùng username thật, đúng chủ module.
- `application-local.properties.example` chỉ có `CHANGE_ME`.
- 3 commit đúng Conventional Commits, có `Refs #1`.
LGTM 👍 — sau khi merge mình sẽ thử Issues → New issue để xác nhận template hoạt động.
```

Nhận xét tổng mẫu khi **Request changes**:

```markdown
Còn 2 blocker (xem comment trên dòng): vị trí `pull_request_template.md` và username trong CODEOWNERS.
Sửa xong nhờ bạn bấm Re-request review, mình xem lại ngay.
```

**Bước 7 — Vòng sửa & review lại (nếu đã Request changes)**

1. **A** sửa bằng **commit mới**: `git commit -m "fix(setup): move pull request template to .github" -m "Refs #1"` rồi `git push`. Hoặc bấm **Commit suggestion** ngay trên web.
2. A trả lời từng comment ("Đã sửa ở commit abc123"). Ở cột phải PR, cạnh tên B, bấm 🔄 **Re-request review**.
3. **B** mở lại tab *Files changed*: GitHub hiện thông báo **"Changes since your last review"**, có nút xem riêng phần mới sửa. Kiểm tra từng chỗ đã sửa → bấm **Resolve conversation** dưới mỗi góp ý đã xử lý xong.
4. **Review changes → Approve → Submit review**.

**Bước 8 — Sau khi Approve**

- **B không merge.** Người merge là tác giả A, theo bước #1.6. Điều kiện merge: đủ approve, mọi conversation đã *Resolve*.
- Tab *Conversation* lúc này hiện ✅ **"Changes approved — B approved these changes"**.
- **Sau khi A merge**, B kiểm tra template đã chạy, vì GitHub chỉ đọc template từ nhánh mặc định `develop`, nên không kiểm tra được trước khi merge:
  - **Issues → New issue** → thấy 2 mẫu *Feature request*, *Bug report*. Mở thử rồi đóng tab, **không bấm Create**.
  - Mở file `.github/CODEOWNERS` trên GitHub → không có cảnh báo vàng về lỗi cú pháp.

*(Tuỳ chọn)* Kiểm tra trên máy. Với PR này chỉ cần `compile`, chưa chạy `verify`:

```bash
git fetch origin
git switch chore/1-repo-templates        # hoặc: gh pr checkout <số-PR>
mvn -q compile
git ls-files -s .githooks/pre-push       # cột đầu 100755 = có quyền chạy
git switch develop
```

#### #1.6 — [A] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn -q compile && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `chore(setup): add issue/pr templates and codeowners (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #1` → **Confirm squash and merge**.
4. Kiểm tra: issue #1 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D chore/1-repo-templates
git fetch --prune
```

✅ **Xong #1:** [ ] code đủ tiêu chí · [ ] 3 commit đúng chuẩn có `Refs #1` · [ ] PR có `Closes #1`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

### #2 — Project setup & configuration (TODO 1–3) (A)

| | |
|---|---|
| 👤 Người làm | **A (Leader)** |
| 👀 Reviewer | **C** |
| Nhánh | `feature/2-project-setup` |
| Milestone | `Sprint 0 — Foundation` |
| Cần merge trước | #1 |
| Tiêu đề PR | `chore(setup): bootstrap spring boot project structure and configuration` |

#### #2.1 — [A] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#2** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/2-project-setup
```

#### #2.2 — [A] Code & commit

**Commit 1/5 — `chore(setup): add dependencies for web, thymeleaf, jpa, validation, mssql and bcrypt`**

📄 **`pom.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- TECH-01: Spring Boot 4.x -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.1.1</version>
        <relativePath/>
    </parent>

    <groupId>com.fu.cinema</groupId>
    <artifactId>fu-cinema-ticket-system</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>fu-cinema-ticket-system</name>
    <description>FU Cinema Ticket System - Spring Boot, Spring Data JPA, Thymeleaf, SQL Server</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <!-- Spring Boot 4 đổi tên spring-boot-starter-web -> spring-boot-starter-webmvc
             (tên cũ vẫn dùng được nhưng đã deprecated) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webmvc</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <!-- Chỉ dùng BCryptPasswordEncoder, KHÔNG kéo cả Spring Security -->
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-crypto</artifactId>
        </dependency>
        <dependency>
            <groupId>com.microsoft.sqlserver</groupId>
            <artifactId>mssql-jdbc</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>

        <!-- Test: H2 in-memory để `mvn verify` chạy được mà không cần SQL Server -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <!-- Khai báo rõ Lombok là annotation processor (bắt buộc từ JDK 23+, an toàn với JDK 21) -->
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                            <version>${lombok.version}</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```
📄 **`.gitignore`**

```gitignore
HELP.md
target/
!.mvn/wrapper/maven-wrapper.jar
.idea/
*.iml
*.iws
*.ipr
.vscode/
.DS_Store
*.log
application-local.properties
.env
```
Tạo `README.md` bản ngắn (hoàn thiện ở #19):

```bash
printf '# FU Cinema Ticket System\n\nAssignment 01 — HSF302.\n' > README.md
```

```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add pom.xml .gitignore README.md
git commit -m "chore(setup): add dependencies for web, thymeleaf, jpa, validation, mssql and bcrypt" -m "Refs #2"
```

**Commit 2/5 — `chore(config): add application properties with local profile`**

📄 **`src/main/resources/application.properties`**

```properties
spring.application.name=fu-cinema-ticket-system

# Profile "local" chứa thông tin kết nối DB (file application-local.properties KHÔNG commit)
spring.profiles.active=local

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false
# SQL Server: String -> NVARCHAR để lưu tiếng Việt có dấu (mặc định Hibernate dùng VARCHAR)
spring.jpa.properties.hibernate.use_nationalized_character_data=true

# Thymeleaf
spring.thymeleaf.cache=false

# Hiển thị trang lỗi tuỳ biến, không lộ stack trace
spring.server.error.include-stacktrace=never
spring.server.error.whitelabel.enabled=false
```
📄 **`src/test/resources/application-test.properties`**

```properties
spring.datasource.url=jdbc:h2:mem:testdb;MODE=MSSQLServer;DB_CLOSE_DELAY=-1
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false
```
📄 **`src/main/java/com/fu/cinema/FuCinemaTicketSystemApplication.java`**

```java
package com.fu.cinema;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FuCinemaTicketSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(FuCinemaTicketSystemApplication.class, args);
    }
}
```
📄 **`src/test/java/com/fu/cinema/FuCinemaTicketSystemApplicationTests.java`**

```java
package com.fu.cinema;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")          // dùng H2 (src/test/resources/application-test.properties) → mvn verify không cần SQL Server
class FuCinemaTicketSystemApplicationTests {

    @Test
    void contextLoads() {
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/resources/application.properties \
        src/test/resources/application-test.properties \
        src/main/java/com/fu/cinema/FuCinemaTicketSystemApplication.java \
        src/test/java/com/fu/cinema/FuCinemaTicketSystemApplicationTests.java
git commit -m "chore(config): add application properties with local profile" -m "Refs #2"
```

**Commit 3/5 — `chore(setup): create layered package structure`**

Git không lưu thư mục rỗng → mỗi package một `package-info.java`. Chạy trong Git Bash ở thư mục gốc repo:

```bash
cd src/main/java/com/fu/cinema
for p in entity enums repository service service/impl dto controller controller/admin controller/customer config exception util; do
  mkdir -p $p; pkg=$(echo "com.fu.cinema.$p" | tr '/' '.')
  printf '/** Package %s */\npackage %s;\n' "$p" "$pkg" > $p/package-info.java
done
cd -
```

```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema
git commit -m "chore(setup): create layered package structure" -m "Refs #2"
```

**Commit 4/5 — `feat(layout): add session user and utility classes`**

📄 **`src/main/java/com/fu/cinema/dto/SessionUser.java`**

```java
package com.fu.cinema.dto;

import com.fu.cinema.enums.Role;
import lombok.Value;

import java.io.Serializable;

// Thông tin người dùng lưu trong HttpSession (KHÔNG lưu mật khẩu)
@Value
public class SessionUser implements Serializable {

    Long accountId;
    Long customerId;          // null nếu là ADMIN
    String displayName;
    Role role;

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    public boolean isCustomer() {
        return role == Role.CUSTOMER;
    }
}
```
📄 **`src/main/java/com/fu/cinema/util/SessionUtils.java`**

```java
package com.fu.cinema.util;

import com.fu.cinema.dto.SessionUser;
import jakarta.servlet.http.HttpSession;

public final class SessionUtils {

    public static final String CURRENT_USER = "currentUser";

    private SessionUtils() {
    }

    public static SessionUser getCurrentUser(HttpSession session) {
        return session == null ? null : (SessionUser) session.getAttribute(CURRENT_USER);
    }

    /** Luôn lấy customerId từ session, KHÔNG lấy từ form/URL. */
    public static Long getCurrentCustomerId(HttpSession session) {
        SessionUser user = getCurrentUser(session);
        return user == null ? null : user.getCustomerId();
    }
}
```
📄 **`src/main/java/com/fu/cinema/util/PageUtils.java`**

```java
package com.fu.cinema.util;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

public final class PageUtils {

    public static final int DEFAULT_SIZE = 10;

    private PageUtils() {
    }

    /** URL hiện tại (giữ nguyên các tham số lọc) nhưng bỏ tham số page → dùng cho thanh phân trang. */
    public static String currentUrlWithoutPage() {
        return ServletUriComponentsBuilder.fromCurrentRequest()
                .replaceQueryParam("page")
                .build()
                .toUriString();
    }
}
```
📄 **`src/main/java/com/fu/cinema/util/ValidationUtils.java`**

```java
package com.fu.cinema.util;

import java.time.LocalDate;
import java.time.Period;

public final class ValidationUtils {

    private ValidationUtils() {
    }

    public static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    public static int age(LocalDate birthday) {
        return Period.between(birthday, LocalDate.now()).getYears();
    }
}
```
📄 **`src/main/java/com/fu/cinema/util/DateUtils.java`**

```java
package com.fu.cinema.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class DateUtils {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private DateUtils() {
    }

    public static String format(LocalDateTime t) {
        return t == null ? "" : t.format(FMT);
    }
}
```
📄 **`src/main/java/com/fu/cinema/controller/GlobalModelAttributes.java`**

```java
package com.fu.cinema.controller;

import com.fu.cinema.dto.SessionUser;
import com.fu.cinema.util.SessionUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

// Đưa người dùng hiện tại vào Model của mọi view (menu theo vai trò)
@ControllerAdvice
public class GlobalModelAttributes {

    @ModelAttribute("currentUser")
    public SessionUser currentUser(HttpServletRequest request) {
        return SessionUtils.getCurrentUser(request.getSession(false));   // false: không tạo session mới
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/dto/SessionUser.java \
        src/main/java/com/fu/cinema/util/SessionUtils.java \
        src/main/java/com/fu/cinema/util/PageUtils.java \
        src/main/java/com/fu/cinema/util/ValidationUtils.java \
        src/main/java/com/fu/cinema/util/DateUtils.java \
        src/main/java/com/fu/cinema/controller/GlobalModelAttributes.java
git commit -m "feat(layout): add session user and utility classes" -m "Refs #2"
```

**Commit 5/5 — `feat(layout): add base thymeleaf layout with role-based menu`**

📄 **`src/main/resources/templates/fragments/layout.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">

<!-- ===== <head> dùng chung: th:replace="~{fragments/layout :: head('Tiêu đề')}" ===== -->
<head th:fragment="head(title)">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title th:text="${title} + ' | FU Cinema'">FU Cinema</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" th:href="@{/css/app.css}">
</head>

<body>

<!-- ===== Menu theo vai trò ===== -->
<nav th:fragment="navbar" class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
        <a class="navbar-brand fw-bold" th:href="@{/}">🎬 FU Cinema</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNav">
            <ul class="navbar-nav me-auto">
                <li class="nav-item"><a class="nav-link" th:href="@{/}">Phim</a></li>

                <th:block th:if="${currentUser != null and currentUser.admin}">
                    <li class="nav-item"><a class="nav-link" th:href="@{/admin}">Dashboard</a></li>
                    <!-- [B] menu Khách hàng (issue #7) -->
                    <!-- [C] menu Thể loại (issue #8) -->
                    <!-- [C] menu Quản lý phim (issue #9) -->
                    <!-- [D] menu Phòng chiếu (issue #10) -->
                    <!-- [D] menu Suất chiếu (issue #11) -->
                    <!-- [B] menu Đơn đặt vé (issue #12) -->
                    <!-- [D] menu Báo cáo (issue #17) -->
                </th:block>

                <th:block th:if="${currentUser != null and currentUser.customer}">
                    <!-- [B] menu Vé của tôi (issue #15) -->
                    <!-- [B] menu Hồ sơ (issue #16) -->
                </th:block>
            </ul>

            <div class="d-flex align-items-center gap-2">
                <th:block th:if="${currentUser == null}">
                    <a class="btn btn-outline-light btn-sm" th:href="@{/login}">Đăng nhập</a>
                    <a class="btn btn-warning btn-sm" th:href="@{/register}">Đăng ký</a>
                </th:block>
                <th:block th:if="${currentUser != null}">
                    <span class="text-light small" th:text="'Xin chào, ' + ${currentUser.displayName}">Xin chào</span>
                    <form th:action="@{/logout}" method="post" class="m-0">
                        <button class="btn btn-outline-light btn-sm" type="submit">Đăng xuất</button>
                    </form>
                </th:block>
            </div>
        </div>
    </div>
</nav>

<!-- ===== Flash message: biến "success" / "error" (flash attribute hoặc model) ===== -->
<div th:fragment="flash">
    <div th:if="${success}" class="alert alert-success alert-dismissible fade show" role="alert">
        <span th:text="${success}"></span>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
    <div th:if="${error}" class="alert alert-danger alert-dismissible fade show" role="alert">
        <span th:text="${error}"></span>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
</div>

<!-- ===== Thanh phân trang: page = Page<?>, url = URL hiện tại đã bỏ tham số page ===== -->
<nav th:fragment="pagination(page, url)" th:if="${page.totalPages > 1}">
    <ul class="pagination justify-content-center">
        <li class="page-item" th:classappend="${page.first} ? 'disabled'">
            <a class="page-link" th:href="${url + (url.contains('?') ? '&' : '?') + 'page=' + (page.number - 1)}">«</a>
        </li>
        <li class="page-item" th:each="i : ${#numbers.sequence(0, page.totalPages - 1)}"
            th:classappend="${i == page.number} ? 'active'">
            <a class="page-link" th:href="${url + (url.contains('?') ? '&' : '?') + 'page=' + i}" th:text="${i + 1}">1</a>
        </li>
        <li class="page-item" th:classappend="${page.last} ? 'disabled'">
            <a class="page-link" th:href="${url + (url.contains('?') ? '&' : '?') + 'page=' + (page.number + 1)}">»</a>
        </li>
    </ul>
    <p class="text-center text-muted small"
       th:text="|Trang ${page.number + 1}/${page.totalPages} · ${page.totalElements} bản ghi|"></p>
</nav>

<footer th:fragment="footer" class="border-top py-3 mt-5 text-center text-muted small">
    © FU Cinema Ticket System — HSF302
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</footer>

</body>
</html>
```
📄 **`src/main/resources/static/css/app.css`**

```css
.poster { width: 100%; aspect-ratio: 2 / 3; object-fit: cover; }
.seat-grid { display: inline-block; }
.seat-row { display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
.seat-row .row-label { width: 24px; font-weight: 600; }
.seat input { display: none; }
.seat label { width: 36px; height: 32px; display: flex; align-items: center; justify-content: center;
              border: 1px solid #198754; border-radius: 6px; font-size: 11px; cursor: pointer; }
.seat input:checked + label { background: #198754; color: #fff; }
.seat.sold label { background: #dee2e6; border-color: #adb5bd; color: #6c757d; cursor: not-allowed; }
.screen { background: #343a40; color: #fff; text-align: center; border-radius: 4px; margin-bottom: 16px; }
```
📄 **`src/main/java/com/fu/cinema/controller/HomeController.java`**

```java
package com.fu.cinema.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

// Bản TẠM của Leader để kiểm tra layout (TODO 3). C sẽ thay toàn bộ file này ở issue #13 (TODO 27).
@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "index";
    }
}
```
📄 **`src/main/resources/templates/index.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Trang chủ')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-5">
    <div th:replace="~{fragments/layout :: flash}"></div>
    <!-- Bản TẠM: C thay bằng danh sách phim ở issue #13 (TODO 27) -->
    <h1>FU Cinema</h1>
    <p class="lead">Hệ thống bán vé xem phim — đang xây dựng.</p>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/resources/templates/fragments/layout.html \
        src/main/resources/static/css/app.css \
        src/main/java/com/fu/cinema/controller/HomeController.java \
        src/main/resources/templates/index.html
git commit -m "feat(layout): add base thymeleaf layout with role-based menu" -m "Refs #2"
```

#### #2.3 — [A] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] `mvn clean verify` → BUILD SUCCESS (test chạy trên H2)
- [ ] `mvn spring-boot:run` → log `HikariPool-1 - Start completed` (đã kết nối SQL Server)
- [ ] http://localhost:8080 hiện layout có menu *Phim*, nút *Đăng nhập / Đăng ký*

#### #2.4 — [A] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/2-project-setup
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/2-project-setup`**.

- **Title:** `chore(setup): bootstrap spring boot project structure and configuration`
- **Reviewers:** C  ·  **Assignees:** A (Leader)  ·  **Labels:** `type: feature`, `module: infra`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 0 — Foundation`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
Khởi tạo project Spring Boot, cấu hình kết nối SQL Server theo profile local, cấu trúc package 3-layer, layout Thymeleaf dùng chung.

Các file chính: `pom.xml`, `.gitignore`, `application.properties`, `application-test.properties`, `FuCinemaTicketSystemApplication.java`, `FuCinemaTicketSystemApplicationTests.java`, `SessionUser.java`, `SessionUtils.java`, `PageUtils.java`, `ValidationUtils.java`, `layout.html`, `app.css`, `HomeController.java`, `index.html`

Closes #2

## Loại thay đổi
- [ ] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [x] chore  - [ ] test

## Cách kiểm thử
1. `mvn clean verify` → BUILD SUCCESS (test chạy trên H2)
2. `mvn spring-boot:run` → log `HikariPool-1 - Start completed` (đã kết nối SQL Server)
3. http://localhost:8080 hiện layout có menu *Phim*, nút *Đăng nhập / Đăng ký*

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#2** sang **In review**. Nhắn reviewer link PR.

#### #2.5 — [C] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/2-project-setup
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] Không có mật khẩu trong `application.properties`
- [ ] Đủ 10 package
- [ ] Layout dùng `th:replace`, có vùng flash và phân trang dùng chung

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": `mvn clean verify`; `mvn spring-boot:run` — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: A (Leader) sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #2"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #2.6 — [A] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `chore(setup): bootstrap spring boot project structure and configuration (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #2` → **Confirm squash and merge**.
4. Kiểm tra: issue #2 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/2-project-setup
git fetch --prune
```

> 📢 **Sau khi PR này merge**, mọi người bật git hook: `git config core.hooksPath .githooks` (từ giờ mỗi lần push sẽ tự chạy `mvn verify`).

✅ **Xong #2:** [ ] code đủ tiêu chí · [ ] 5 commit đúng chuẩn có `Refs #2` · [ ] PR có `Closes #2`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

### #3 — Entities & repositories skeleton (TODO 4–7, 9) (B)

| | |
|---|---|
| 👤 Người làm | **B** |
| 👀 Reviewer | **A + C + D (C, D review phần entity của module mình)** |
| Nhánh | `feature/3-entities-repositories` |
| Milestone | `Sprint 0 — Foundation` |
| Cần merge trước | #2 |
| Tiêu đề PR | `feat(entity): add domain entities and repositories` |

#### #3.1 — [B] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#3** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/3-entities-repositories
```

#### #3.2 — [B] Code & commit

**Commit 1/7 — `feat(entity): add enums for roles and statuses`**

📄 **`src/main/java/com/fu/cinema/enums/Role.java`**

```java
package com.fu.cinema.enums;

public enum Role {
    ADMIN, CUSTOMER
}
```
📄 **`src/main/java/com/fu/cinema/enums/AccountStatus.java`**

```java
package com.fu.cinema.enums;

public enum AccountStatus {
    ACTIVE, LOCKED
}
```
📄 **`src/main/java/com/fu/cinema/enums/AgeRating.java`**

```java
package com.fu.cinema.enums;

public enum AgeRating {
    P(0), T13(13), T16(16), T18(18);

    private final int minAge;

    AgeRating(int minAge) {
        this.minAge = minAge;
    }

    public int getMinAge() {
        return minAge;
    }
}
```
📄 **`src/main/java/com/fu/cinema/enums/MovieStatus.java`**

```java
package com.fu.cinema.enums;

public enum MovieStatus {
    COMING_SOON, SHOWING, STOPPED
}
```
📄 **`src/main/java/com/fu/cinema/enums/RoomType.java`**

```java
package com.fu.cinema.enums;

public enum RoomType {
    TWO_D("2D"), THREE_D("3D"), IMAX("IMAX");

    private final String label;

    RoomType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
```
📄 **`src/main/java/com/fu/cinema/enums/RoomStatus.java`**

```java
package com.fu.cinema.enums;

public enum RoomStatus {
    ACTIVE, MAINTENANCE
}
```
📄 **`src/main/java/com/fu/cinema/enums/ShowtimeStatus.java`**

```java
package com.fu.cinema.enums;

public enum ShowtimeStatus {
    OPEN, CANCELLED
}
```
📄 **`src/main/java/com/fu/cinema/enums/BookingStatus.java`**

```java
package com.fu.cinema.enums;

public enum BookingStatus {
    PENDING, CONFIRMED, CANCELLED
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/enums/Role.java \
        src/main/java/com/fu/cinema/enums/AccountStatus.java \
        src/main/java/com/fu/cinema/enums/AgeRating.java \
        src/main/java/com/fu/cinema/enums/MovieStatus.java \
        src/main/java/com/fu/cinema/enums/RoomType.java \
        src/main/java/com/fu/cinema/enums/RoomStatus.java \
        src/main/java/com/fu/cinema/enums/ShowtimeStatus.java \
        src/main/java/com/fu/cinema/enums/BookingStatus.java
git commit -m "feat(entity): add enums for roles and statuses" -m "Refs #3"
```

**Commit 2/7 — `feat(entity): add account and customer with one-to-one mapping`**

📄 **`src/main/java/com/fu/cinema/entity/Account.java`**

```java
package com.fu.cinema.entity;

import com.fu.cinema.enums.AccountStatus;
import com.fu.cinema.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long accountId;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false, length = 100)
    private String password;                 // BCrypt hash

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccountStatus status;

    public Account(String username, String password, Role role, AccountStatus status) {
        this.username = username;
        this.password = password;
        this.role = role;
        this.status = status;
    }
}
```
📄 **`src/main/java/com/fu/cinema/entity/Customer.java`**

```java
package com.fu.cinema.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long customerId;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 10)
    private String mobile;

    @Column(nullable = false)
    private LocalDate birthday;

    @Column(nullable = false, unique = true, length = 12)
    private String identityCard;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    // 1–1: Customer là owning side, giữ FK account_id (unique)
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private Account account;
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/entity/Account.java \
        src/main/java/com/fu/cinema/entity/Customer.java
git commit -m "feat(entity): add account and customer with one-to-one mapping" -m "Refs #3"
```

**Commit 3/7 — `feat(entity): add genre and movie entities`**

📄 **`src/main/java/com/fu/cinema/entity/Genre.java`**

```java
package com.fu.cinema.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "genres")
@Getter
@Setter
@NoArgsConstructor
public class Genre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long genreId;

    @Column(nullable = false, unique = true, length = 50)
    private String genreName;

    @Column(nullable = false, length = 500)
    private String description;

    @OneToMany(mappedBy = "genre")
    private List<Movie> movies = new ArrayList<>();

    public Genre(String genreName, String description) {
        this.genreName = genreName;
        this.description = description;
    }
}
```
📄 **`src/main/java/com/fu/cinema/entity/Movie.java`**

```java
package com.fu.cinema.entity;

import com.fu.cinema.enums.AgeRating;
import com.fu.cinema.enums.MovieStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long movieId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 100)
    private String director;

    @Column(nullable = false)
    private Integer duration;                // phút

    @Column(nullable = false)
    private LocalDate releaseDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AgeRating ageRating;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false, length = 500)
    private String posterUrl;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "genre_id", nullable = false)
    private Genre genre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MovieStatus status;
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/entity/Genre.java \
        src/main/java/com/fu/cinema/entity/Movie.java
git commit -m "feat(entity): add genre and movie entities" -m "Refs #3"
```

**Commit 4/7 — `feat(entity): add room and showtime entities`**

📄 **`src/main/java/com/fu/cinema/entity/Room.java`**

```java
package com.fu.cinema.entity;

import com.fu.cinema.enums.RoomStatus;
import com.fu.cinema.enums.RoomType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomId;

    @Column(nullable = false, unique = true, length = 50)
    private String roomName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private RoomType roomType;

    @Column(nullable = false)
    private Integer totalRows;               // 1..26 (A..Z)

    @Column(nullable = false)
    private Integer seatsPerRow;             // 1..30

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomStatus status;

    public Room(String roomName, RoomType roomType, int totalRows, int seatsPerRow, RoomStatus status) {
        this.roomName = roomName;
        this.roomType = roomType;
        this.totalRows = totalRows;
        this.seatsPerRow = seatsPerRow;
        this.status = status;
    }

    public int getCapacity() {
        return totalRows * seatsPerRow;
    }
}
```
📄 **`src/main/java/com/fu/cinema/entity/Showtime.java`**

```java
package com.fu.cinema.entity;

import com.fu.cinema.enums.ShowtimeStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "showtimes")
@Getter
@Setter
@NoArgsConstructor
public class Showtime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long showtimeId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal ticketPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ShowtimeStatus status;
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/entity/Room.java \
        src/main/java/com/fu/cinema/entity/Showtime.java
git commit -m "feat(entity): add room and showtime entities" -m "Refs #3"
```

**Commit 5/7 — `feat(entity): add booking and ticket with cascade`**

📄 **`src/main/java/com/fu/cinema/entity/Booking.java`**

```java
package com.fu.cinema.entity;

import com.fu.cinema.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "showtime_id", nullable = false)
    private Showtime showtime;

    @Column(nullable = false)
    private LocalDateTime bookingDate;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status;

    // Booking 1–N Ticket: lưu/xoá Booking thì lưu/xoá luôn Ticket
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("seatCode ASC")
    private List<Ticket> tickets = new ArrayList<>();

    public void addTicket(Ticket ticket) {
        tickets.add(ticket);
        ticket.setBooking(this);
    }
}
```
📄 **`src/main/java/com/fu/cinema/entity/Ticket.java`**

```java
package com.fu.cinema.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ticketId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "showtime_id", nullable = false)
    private Showtime showtime;

    @Column(nullable = false, length = 5)
    private String seatCode;                 // A1, B12...

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal price;

    public Ticket(Showtime showtime, String seatCode, BigDecimal price) {
        this.showtime = showtime;
        this.seatCode = seatCode;
        this.price = price;
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/entity/Booking.java \
        src/main/java/com/fu/cinema/entity/Ticket.java
git commit -m "feat(entity): add booking and ticket with cascade" -m "Refs #3"
```

**Commit 6/7 — `feat(entity): add review with composite key`**

📄 **`src/main/java/com/fu/cinema/entity/ReviewId.java`**

```java
package com.fu.cinema.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

// Khoá chính kép (CustomerID, MovieID): bắt buộc Serializable + equals/hashCode
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
public class ReviewId implements Serializable {

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "movie_id")
    private Long movieId;

    public ReviewId(Long customerId, Long movieId) {
        this.customerId = customerId;
        this.movieId = movieId;
    }
}
```
📄 **`src/main/java/com/fu/cinema/entity/Review.java`**

```java
package com.fu.cinema.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
public class Review {

    @EmbeddedId
    private ReviewId id;

    @MapsId("customerId")                    // lấy giá trị customerId của khoá kép từ quan hệ này
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @MapsId("movieId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @Column(nullable = false)
    private Integer rating;                  // 1..5

    @Column(nullable = false, length = 1000)
    private String comment;

    @Column(nullable = false)
    private LocalDateTime reviewDate;
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/entity/ReviewId.java \
        src/main/java/com/fu/cinema/entity/Review.java
git commit -m "feat(entity): add review with composite key" -m "Refs #3"
```

**Commit 7/7 — `feat(repository): add jpa repositories with derived queries`**

📄 **`src/main/java/com/fu/cinema/repository/AccountRepository.java`**

```java
package com.fu.cinema.repository;

import com.fu.cinema.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByUsernameAndAccountIdNot(String username, Long accountId);
}
```
📄 **`src/main/java/com/fu/cinema/repository/CustomerRepository.java`**

```java
package com.fu.cinema.repository;

import com.fu.cinema.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // ===== Derived query (mục 9.1) =====
    Optional<Customer> findByAccount_AccountId(Long accountId);

    boolean existsByEmail(String email);

    boolean existsByMobile(String mobile);

    boolean existsByIdentityCard(String identityCard);

    boolean existsByEmailAndCustomerIdNot(String email, Long customerId);

    boolean existsByMobileAndCustomerIdNot(String mobile, Long customerId);

    boolean existsByIdentityCardAndCustomerIdNot(String identityCard, Long customerId);

    // [B] issue #7 thêm Q1 search(...) và findWithAccountById(...) ở dưới đây
}
```
📄 **`src/main/java/com/fu/cinema/repository/GenreRepository.java`**

```java
package com.fu.cinema.repository;

import com.fu.cinema.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GenreRepository extends JpaRepository<Genre, Long> {

    boolean existsByGenreNameIgnoreCase(String genreName);

    boolean existsByGenreNameIgnoreCaseAndGenreIdNot(String genreName, Long genreId);

    List<Genre> findAllByOrderByGenreNameAsc();
}
```
📄 **`src/main/java/com/fu/cinema/repository/MovieRepository.java`**

```java
package com.fu.cinema.repository;

import com.fu.cinema.entity.Movie;
import com.fu.cinema.enums.MovieStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    // ===== Derived query (mục 9.1) =====
    boolean existsByGenre_GenreId(Long genreId);

    long countByStatus(MovieStatus status);

    List<Movie> findByStatusInOrderByReleaseDateDesc(Collection<MovieStatus> statuses);

    // [C] issue #9 thêm Q2 search(...), findWithGenreById(...), findByStatusNotOrderByTitleAsc(...) ở dưới đây
}
```
📄 **`src/main/java/com/fu/cinema/repository/RoomRepository.java`**

```java
package com.fu.cinema.repository;

import com.fu.cinema.entity.Room;
import com.fu.cinema.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByStatus(RoomStatus status);

    boolean existsByRoomNameIgnoreCase(String roomName);

    boolean existsByRoomNameIgnoreCaseAndRoomIdNot(String roomName, Long roomId);
}
```
📄 **`src/main/java/com/fu/cinema/repository/ShowtimeRepository.java`**

```java
package com.fu.cinema.repository;

import com.fu.cinema.entity.Showtime;
import com.fu.cinema.enums.ShowtimeStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    // ===== Derived query (mục 9.1) =====
    boolean existsByMovie_MovieId(Long movieId);

    boolean existsByRoom_RoomId(Long roomId);

    @EntityGraph(attributePaths = "room")               // nạp luôn Room → tránh LazyInitializationException ở view
    List<Showtime> findByMovie_MovieIdAndStatusAndStartTimeAfterOrderByStartTimeAsc(
            Long movieId, ShowtimeStatus status, LocalDateTime after);

    // [D] issue #11 thêm search(...), findDetailById(...), Q3 findOverlapping(...), Q11 countTodayShowtimesByRoom()
    // [D] issue #14 thêm findByIdForUpdate(...)
}
```
📄 **`src/main/java/com/fu/cinema/repository/TicketRepository.java`**

```java
package com.fu.cinema.repository;

import com.fu.cinema.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // [D] issue #14 thêm Q4 findSoldSeatCodes(...)
}
```
📄 **`src/main/java/com/fu/cinema/repository/BookingRepository.java`**

```java
package com.fu.cinema.repository;

import com.fu.cinema.entity.Booking;
import com.fu.cinema.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ===== Derived query (mục 9.1) =====
    boolean existsByCustomer_CustomerId(Long customerId);

    boolean existsByShowtime_ShowtimeId(Long showtimeId);

    long countByStatus(BookingStatus status);

    @EntityGraph(attributePaths = {"showtime", "showtime.movie", "showtime.room"})
    Page<Booking> findByCustomer_CustomerId(Long customerId, Pageable pageable);

    @EntityGraph(attributePaths = {"showtime", "showtime.movie", "showtime.room"})
    Page<Booking> findByCustomer_CustomerIdAndStatus(Long customerId, BookingStatus status, Pageable pageable);

    // ===== Custom query: mỗi người thêm method của mình ở CUỐI file, mỗi method một commit =====
    // [B] #12: Q5 findDetailById, Q6 search   · [D] #11: Q9 cancelAllByShowtime
    // [D] #17: Q7 revenueByMovie, Q8 findConfirmedInPeriod   · [C] #18: Q12 countWatched
}
```
📄 **`src/main/java/com/fu/cinema/repository/ReviewRepository.java`**

```java
package com.fu.cinema.repository;

import com.fu.cinema.entity.Review;
import com.fu.cinema.entity.ReviewId;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, ReviewId> {

    // ===== Derived query (mục 9.1) =====
    @EntityGraph(attributePaths = "customer")
    List<Review> findByMovie_MovieIdOrderByReviewDateDesc(Long movieId);

    // [C] issue #13 thêm Q10 summarize(...)
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/repository/AccountRepository.java \
        src/main/java/com/fu/cinema/repository/CustomerRepository.java \
        src/main/java/com/fu/cinema/repository/GenreRepository.java \
        src/main/java/com/fu/cinema/repository/MovieRepository.java \
        src/main/java/com/fu/cinema/repository/RoomRepository.java \
        src/main/java/com/fu/cinema/repository/ShowtimeRepository.java \
        src/main/java/com/fu/cinema/repository/TicketRepository.java \
        src/main/java/com/fu/cinema/repository/BookingRepository.java \
        src/main/java/com/fu/cinema/repository/ReviewRepository.java
git commit -m "feat(repository): add jpa repositories with derived queries" -m "Refs #3"
```

#### #3.3 — [B] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] `mvn clean verify` pass, app khởi động không lỗi `PropertyReferenceException`
- [ ] SSMS: đủ 9 bảng `accounts, customers, genres, movies, rooms, showtimes, bookings, tickets, reviews`
- [ ] Bảng `reviews` có PK kép (`customer_id`, `movie_id`); cột chuỗi là `nvarchar`

#### #3.4 — [B] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/3-entities-repositories
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/3-entities-repositories`**.

- **Title:** `feat(entity): add domain entities and repositories`
- **Reviewers:** A + C + D (C, D review phần entity của module mình)  ·  **Assignees:** B  ·  **Labels:** `type: feature`, `module: infra`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 0 — Foundation`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
8 enum, 10 entity (Account, Customer, Genre, Movie, Room, Showtime, Booking, Ticket, Review, ReviewId) và 9 repository với derived query mục 9.1.

Các file chính: `Role.java`, `AccountStatus.java`, `AgeRating.java`, `MovieStatus.java`, `Account.java`, `Customer.java`, `Genre.java`, `Movie.java`, `Room.java`, `Showtime.java`, `Booking.java`, `Ticket.java`, `ReviewId.java`, `Review.java`, `AccountRepository.java`, `CustomerRepository.java`, `GenreRepository.java`, `MovieRepository.java`

Closes #3

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. `mvn clean verify` pass, app khởi động không lỗi `PropertyReferenceException`
2. SSMS: đủ 9 bảng `accounts, customers, genres, movies, rooms, showtimes, bookings, tickets, reviews`
3. Bảng `reviews` có PK kép (`customer_id`, `movie_id`); cột chuỗi là `nvarchar`

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#3** sang **In review**. Nhắn reviewer link PR.

#### #3.5 — [A + C + D] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/3-entities-repositories
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] FK/unique/nullable đúng
- [ ] `FetchType.LAZY` cho mọi `@ManyToOne`, `mappedBy` đúng phía
- [ ] Không dùng `@Data`; enum `STRING`; `BigDecimal` cho tiền
- [ ] Review dùng `@EmbeddedId` + `@MapsId`

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": `mvn clean verify` pass, app khởi động không lỗi `PropertyReferenceException`; SSMS: đủ 9 bảng `accounts, customers, genres, movies, rooms, showtimes, bookings, tickets, reviews` — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: B sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #3"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #3.6 — [B] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(entity): add domain entities and repositories (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #3` → **Confirm squash and merge**.
4. Kiểm tra: issue #3 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/3-entities-repositories
git fetch --prune
```

> 📢 Sau khi merge: báo cả nhóm **"entity đã merge — bắt đầu Sprint 1"**. Từ đây đổi entity phải qua issue riêng label `module: infra`.

✅ **Xong #3:** [ ] code đủ tiêu chí · [ ] 7 commit đúng chuẩn có `Refs #3` · [ ] PR có `Closes #3`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

### #4 — Seed data (TODO 8) (D)

| | |
|---|---|
| 👤 Người làm | **D** |
| 👀 Reviewer | **B** |
| Nhánh | `feature/4-seed-data` |
| Milestone | `Sprint 0 — Foundation` |
| Cần merge trước | #3 |
| Tiêu đề PR | `feat(seed): seed sample data on startup` |

#### #4.1 — [D] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#4** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/4-seed-data
```

#### #4.2 — [D] Code & commit

**Commit 1/2 — `feat(seed): add password encoder bean`**

📄 **`src/main/java/com/fu/cinema/config/PasswordConfig.java`**

```java
package com.fu.cinema.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/config/PasswordConfig.java
git commit -m "feat(seed): add password encoder bean" -m "Refs #4"
```

**Commit 2/2 — `feat(seed): seed accounts, customers, movies, rooms, showtimes and bookings`**

📄 **`src/main/java/com/fu/cinema/config/DataSeeder.java`**

```java
package com.fu.cinema.config;

import com.fu.cinema.entity.*;
import com.fu.cinema.enums.*;
import com.fu.cinema.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final GenreRepository genreRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final ShowtimeRepository showtimeRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (accountRepository.count() > 0) {
            return;                                                          // chỉ seed khi DB rỗng
        }
        log.info(">>> Seeding sample data...");

        // ---- Accounts & Customers ----
        accountRepository.save(new Account("admin@fucinema.vn", passwordEncoder.encode("Admin@123"),
                Role.ADMIN, AccountStatus.ACTIVE));
        Customer an = customer("Nguyen Van An", "an.nv@gmail.com", "0901234567", LocalDate.of(2000, 5, 12), "079200001234");
        Customer binh = customer("Tran Thi Binh", "binh.tt@gmail.com", "0912345678", LocalDate.now().minusYears(15), "079209005678");

        // ---- Genres ----
        Genre action = genreRepository.save(new Genre("Hành động", "Phim hành động, kịch tính"));
        Genre anime = genreRepository.save(new Genre("Hoạt hình", "Phim hoạt hình cho mọi lứa tuổi"));
        Genre horror = genreRepository.save(new Genre("Kinh dị", "Phim kinh dị, giật gân"));
        Genre romance = genreRepository.save(new Genre("Tình cảm", "Phim tình cảm, lãng mạn"));
        genreRepository.save(new Genre("Khoa học viễn tưởng", "Phim khoa học viễn tưởng"));

        // ---- Movies ----
        Movie m1 = movie("Biệt Đội Siêu Tốc", "Lê Minh", 120, AgeRating.T13, action, MovieStatus.SHOWING, -10);
        Movie m2 = movie("Chú Mèo Phiêu Lưu", "Trần Hà", 95, AgeRating.P, anime, MovieStatus.SHOWING, -20);
        Movie m3 = movie("Ngôi Nhà Bí Ẩn", "Phạm Quân", 105, AgeRating.T18, horror, MovieStatus.SHOWING, -5);
        movie("Mùa Hè Năm Ấy", "Đỗ Lan", 110, AgeRating.T16, romance, MovieStatus.COMING_SOON, 14);
        movie("Vũ Trụ Song Song", "Ngô Tùng", 140, AgeRating.T13, action, MovieStatus.COMING_SOON, 30);
        Movie m6 = movie("Huyền Thoại Cũ", "Vũ Bình", 100, AgeRating.P, anime, MovieStatus.STOPPED, -120);

        // ---- Rooms ----
        Room r1 = roomRepository.save(new Room("Room 01", RoomType.TWO_D, 8, 12, RoomStatus.ACTIVE));
        Room r2 = roomRepository.save(new Room("Room 02", RoomType.THREE_D, 10, 14, RoomStatus.ACTIVE));
        roomRepository.save(new Room("Room 03", RoomType.IMAX, 12, 16, RoomStatus.MAINTENANCE));

        // ---- Showtimes ----
        LocalDate today = LocalDate.now();
        Showtime past = showtime(m6, r1, today.minusDays(3).atTime(19, 0), 70000, ShowtimeStatus.OPEN);
        Showtime pastAction = showtime(m1, r2, today.minusDays(2).atTime(20, 0), 90000, ShowtimeStatus.OPEN);
        Showtime s1 = showtime(m1, r1, today.plusDays(1).atTime(9, 0), 80000, ShowtimeStatus.OPEN);
        Showtime s2 = showtime(m2, r1, today.plusDays(1).atTime(14, 0), 70000, ShowtimeStatus.OPEN);
        Showtime s3 = showtime(m3, r2, today.plusDays(1).atTime(21, 0), 95000, ShowtimeStatus.OPEN);
        showtime(m1, r2, today.plusDays(2).atTime(18, 30), 90000, ShowtimeStatus.OPEN);
        showtime(m2, r2, today.plusDays(3).atTime(10, 0), 70000, ShowtimeStatus.OPEN);
        showtime(m3, r1, today.plusDays(3).atTime(20, 0), 85000, ShowtimeStatus.CANCELLED);

        // ---- Bookings (đủ 3 trạng thái, trải nhiều ngày) ----
        booking(an, past, today.minusDays(5), BookingStatus.CONFIRMED, "C5", "C6");
        booking(an, pastAction, today.minusDays(4), BookingStatus.CONFIRMED, "D7");
        booking(binh, s2, today.minusDays(1), BookingStatus.CONFIRMED, "A1", "A2", "A3");
        booking(an, s1, today, BookingStatus.PENDING, "E5", "E6");
        booking(binh, s1, today, BookingStatus.CANCELLED, "F1");
        booking(an, s3, today, BookingStatus.PENDING, "B4");

        log.info(">>> Seed completed");
    }

    private Customer customer(String name, String email, String mobile, LocalDate birthday, String cccd) {
        Account acc = accountRepository.save(new Account(email, passwordEncoder.encode("Customer@123"),
                Role.CUSTOMER, AccountStatus.ACTIVE));
        Customer c = new Customer();
        c.setFullName(name);
        c.setEmail(email);
        c.setMobile(mobile);
        c.setBirthday(birthday);
        c.setIdentityCard(cccd);
        c.setAccount(acc);
        return customerRepository.save(c);
    }

    private Movie movie(String title, String director, int duration, AgeRating rating, Genre genre,
                        MovieStatus status, int releaseOffsetDays) {
        Movie m = new Movie();
        m.setTitle(title);
        m.setDirector(director);
        m.setDuration(duration);
        m.setAgeRating(rating);
        m.setGenre(genre);
        m.setStatus(status);
        m.setReleaseDate(LocalDate.now().plusDays(releaseOffsetDays));
        m.setDescription("Nội dung phim " + title + ".");
        m.setPosterUrl("https://placehold.co/300x450?text=" + title.replace(' ', '+'));
        return movieRepository.save(m);
    }

    private Showtime showtime(Movie movie, Room room, LocalDateTime start, long price, ShowtimeStatus status) {
        Showtime s = new Showtime();
        s.setMovie(movie);
        s.setRoom(room);
        s.setStartTime(start);
        s.setEndTime(start.plusMinutes(movie.getDuration() + 15));
        s.setTicketPrice(BigDecimal.valueOf(price));
        s.setStatus(status);
        return showtimeRepository.save(s);
    }

    private void booking(Customer customer, Showtime showtime, LocalDate date, BookingStatus status, String... seats) {
        Booking b = new Booking();
        b.setCustomer(customer);
        b.setShowtime(showtime);
        b.setBookingDate(date.atTime(LocalTime.of(10, 30)));
        b.setStatus(status);
        b.setTotalAmount(showtime.getTicketPrice().multiply(BigDecimal.valueOf(seats.length)));
        List.of(seats).forEach(seat -> b.addTicket(new Ticket(showtime, seat, showtime.getTicketPrice())));
        bookingRepository.save(b);
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/config/DataSeeder.java
git commit -m "feat(seed): seed accounts, customers, movies, rooms, showtimes and bookings" -m "Refs #4"
```

#### #4.3 — [D] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] Xoá & tạo lại DB → chạy app → log `>>> Seed completed`
- [ ] `SELECT * FROM accounts` → 3 dòng, password dạng `$2a$10$...`
- [ ] Tên thể loại hiện đúng tiếng Việt; chạy lại app không nhân đôi dữ liệu

#### #4.4 — [D] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/4-seed-data
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/4-seed-data`**.

- **Title:** `feat(seed): seed sample data on startup`
- **Reviewers:** B  ·  **Assignees:** D  ·  **Labels:** `type: feature`, `module: infra`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 0 — Foundation`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
Seed dữ liệu mẫu khi khởi động (chỉ khi bảng rỗng), mật khẩu BCrypt.

Các file chính: `PasswordConfig.java`, `DataSeeder.java`

Closes #4

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. Xoá & tạo lại DB → chạy app → log `>>> Seed completed`
2. `SELECT * FROM accounts` → 3 dòng, password dạng `$2a$10$...`
3. Tên thể loại hiện đúng tiếng Việt; chạy lại app không nhân đôi dữ liệu

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#4** sang **In review**. Nhắn reviewer link PR.

#### #4.5 — [B] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/4-seed-data
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] Chỉ seed khi DB rỗng
- [ ] Đủ dữ liệu mục 7 (khách < 16 tuổi, phim STOPPED, Room 03 MAINTENANCE, suất đã qua, suất CANCELLED, đơn đủ 3 trạng thái)
- [ ] Mật khẩu mã hoá BCrypt

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": Xoá & tạo lại DB; `SELECT * FROM accounts` — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: D sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #4"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #4.6 — [D] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(seed): seed sample data on startup (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #4` → **Confirm squash and merge**.
4. Kiểm tra: issue #4 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/4-seed-data
git fetch --prune
```

✅ **Xong #4:** [ ] code đủ tiêu chí · [ ] 2 commit đúng chuẩn có `Refs #4` · [ ] PR có `Closes #4`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

### #5 — Global exception handling & error pages (TODO 12) (C)

| | |
|---|---|
| 👤 Người làm | **C** |
| 👀 Reviewer | **D** |
| Nhánh | `feature/5-error-handling` |
| Milestone | `Sprint 0 — Foundation` |
| Cần merge trước | #2 |
| Tiêu đề PR | `feat(error): global exception handling and error pages` |

#### #5.1 — [C] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#5** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/5-error-handling
```

#### #5.2 — [C] Code & commit

**Commit 1/3 — `feat(error): add business and not-found exceptions`**

📄 **`src/main/java/com/fu/cinema/exception/BusinessException.java`**

```java
package com.fu.cinema.exception;

// Vi phạm quy tắc nghiệp vụ (BR-xx) — thông báo hiển thị trực tiếp cho người dùng
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
```
📄 **`src/main/java/com/fu/cinema/exception/ResourceNotFoundException.java`**

```java
package com.fu.cinema.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, Object id) {
        super(resource + " không tồn tại (id = " + id + ")");
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/exception/BusinessException.java \
        src/main/java/com/fu/cinema/exception/ResourceNotFoundException.java
git commit -m "feat(error): add business and not-found exceptions" -m "Refs #5"
```

**Commit 2/3 — `feat(error): add global exception handler`**

📄 **`src/main/java/com/fu/cinema/exception/GlobalExceptionHandler.java`**

```java
package com.fu.cinema.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.servlet.support.RequestContextUtils;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({ResourceNotFoundException.class, NoResourceFoundException.class,
            MethodArgumentTypeMismatchException.class})
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleNotFound(Exception ex) {
        log.debug("Not found: {}", ex.getMessage());
        return "error/404";
    }

    /** Lỗi nghiệp vụ không được controller bắt → quay lại trang trước kèm flash message. */
    @ExceptionHandler(BusinessException.class)
    public String handleBusiness(BusinessException ex, HttpServletRequest request) {
        RequestContextUtils.getOutputFlashMap(request).put("error", ex.getMessage());
        String referer = request.getHeader("Referer");
        String appRoot = ServletUriComponentsBuilder.fromCurrentContextPath().toUriString();
        String current = request.getRequestURL().toString();
        // Chỉ quay lại trang trong cùng website và KHÁC trang đang lỗi (tránh redirect vòng lặp)
        boolean usable = referer != null
                && referer.startsWith(appRoot)
                && !referer.split("\\?")[0].equals(current);
        return "redirect:" + (usable ? referer : "/");
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public String handleOther(Exception ex) {
        log.error("Unexpected error", ex);                                   // log chi tiết, KHÔNG hiển thị stack trace
        return "error/500";
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/exception/GlobalExceptionHandler.java
git commit -m "feat(error): add global exception handler" -m "Refs #5"
```

**Commit 3/3 — `feat(error): add 403, 404 and 500 error pages`**

📄 **`src/main/resources/templates/error/403.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Lỗi 403')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-5 text-center">
    <h1 class="display-3">403</h1>
    <p class="lead">Bạn không có quyền truy cập trang này.</p>
    <a class="btn btn-primary" th:href="@{/}">Về trang chủ</a>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
📄 **`src/main/resources/templates/error/404.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Lỗi 404')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-5 text-center">
    <h1 class="display-3">404</h1>
    <p class="lead">Trang hoặc dữ liệu bạn tìm không tồn tại.</p>
    <a class="btn btn-primary" th:href="@{/}">Về trang chủ</a>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
📄 **`src/main/resources/templates/error/500.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Lỗi 500')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-5 text-center">
    <h1 class="display-3">500</h1>
    <p class="lead">Đã có lỗi xảy ra. Vui lòng thử lại sau.</p>
    <a class="btn btn-primary" th:href="@{/}">Về trang chủ</a>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
📄 **`src/main/resources/templates/error.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Lỗi 500')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-5 text-center">
    <h1 class="display-3">500</h1>
    <p class="lead">Đã có lỗi xảy ra. Vui lòng thử lại sau.</p>
    <a class="btn btn-primary" th:href="@{/}">Về trang chủ</a>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/resources/templates/error/403.html \
        src/main/resources/templates/error/404.html \
        src/main/resources/templates/error/500.html \
        src/main/resources/templates/error.html
git commit -m "feat(error): add 403, 404 and 500 error pages" -m "Refs #5"
```

#### #5.3 — [C] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] `/khong-ton-tai` → trang 404 tuỳ biến
- [ ] Không thấy stack trace trên trình duyệt

#### #5.4 — [C] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/5-error-handling
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/5-error-handling`**.

- **Title:** `feat(error): global exception handling and error pages`
- **Reviewers:** D  ·  **Assignees:** C  ·  **Labels:** `type: feature`, `module: infra`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 0 — Foundation`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
BusinessException, ResourceNotFoundException, GlobalExceptionHandler (@ControllerAdvice), trang lỗi 403/404/500, flash message.

Các file chính: `BusinessException.java`, `ResourceNotFoundException.java`, `GlobalExceptionHandler.java`, `403.html`, `404.html`, `500.html`, `error.html`

Closes #5

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. `/khong-ton-tai` → trang 404 tuỳ biến
2. Không thấy stack trace trên trình duyệt

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#5** sang **In review**. Nhắn reviewer link PR.

#### #5.5 — [D] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/5-error-handling
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] Không lộ stack trace
- [ ] `BusinessException` → flash message; `ResourceNotFoundException` → 404
- [ ] Redirect chỉ về trang trong cùng site

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": `/khong-ton-tai`; Không thấy stack trace trên trình duyệt — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: C sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #5"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #5.6 — [C] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(error): global exception handling and error pages (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #5` → **Confirm squash and merge**.
4. Kiểm tra: issue #5 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/5-error-handling
git fetch --prune
```

✅ **Xong #5:** [ ] code đủ tiêu chí · [ ] 3 commit đúng chuẩn có `Refs #5` · [ ] PR có `Closes #5`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

## Sprint: Sprint 1 — Admin core

### #6 — Login / logout / register / interceptor (TODO 13–15) (A)

| | |
|---|---|
| 👤 Người làm | **A (Leader)** |
| 👀 Reviewer | **D** |
| Nhánh | `feature/6-auth` |
| Milestone | `Sprint 1 — Admin core` |
| Cần merge trước | #3, #4, #5 |
| Tiêu đề PR | `feat(auth): authentication, registration and role-based authorization` |

#### #6.1 — [A] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#6** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/6-auth
```

#### #6.2 — [A] Code & commit

**Commit 1/3 — `feat(auth): add auth service with bcrypt login and registration`**

📄 **`src/main/java/com/fu/cinema/dto/LoginForm.java`**

```java
package com.fu.cinema.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginForm {

    @NotBlank(message = "Vui lòng nhập tên đăng nhập")
    private String username;

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    private String password;
}
```
📄 **`src/main/java/com/fu/cinema/dto/RegisterForm.java`**

```java
package com.fu.cinema.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class RegisterForm {

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Size(max = 100)
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0")
    private String mobile;

    @NotNull(message = "Ngày sinh không được để trống")
    @Past(message = "Ngày sinh phải ở quá khứ")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate birthday;

    @NotBlank(message = "CCCD không được để trống")
    @Pattern(regexp = "^\\d{12}$", message = "CCCD gồm đúng 12 chữ số")
    private String identityCard;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
             message = "Mật khẩu ≥ 8 ký tự, có chữ hoa, chữ thường và chữ số")
    private String password;

    @NotBlank(message = "Vui lòng nhập lại mật khẩu")
    private String confirmPassword;
}
```
📄 **`src/main/java/com/fu/cinema/service/AuthService.java`**

```java
package com.fu.cinema.service;

import com.fu.cinema.dto.RegisterForm;
import com.fu.cinema.dto.SessionUser;

public interface AuthService {

    SessionUser login(String username, String password);

    SessionUser register(RegisterForm form);
}
```
📄 **`src/main/java/com/fu/cinema/service/impl/AuthServiceImpl.java`**

```java
package com.fu.cinema.service.impl;

import com.fu.cinema.dto.RegisterForm;
import com.fu.cinema.dto.SessionUser;
import com.fu.cinema.entity.Account;
import com.fu.cinema.entity.Customer;
import com.fu.cinema.enums.AccountStatus;
import com.fu.cinema.enums.Role;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.repository.AccountRepository;
import com.fu.cinema.repository.CustomerRepository;
import com.fu.cinema.service.AuthService;
import com.fu.cinema.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private static final int MIN_REGISTER_AGE = 13;

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public SessionUser login(String username, String password) {
        Account account = accountRepository.findByUsername(username.trim().toLowerCase())
                .filter(a -> passwordEncoder.matches(password, a.getPassword()))
                .orElseThrow(() -> new BusinessException("Tên đăng nhập hoặc mật khẩu không đúng"));

        if (account.getStatus() == AccountStatus.LOCKED) {                       // BR-03
            throw new BusinessException("Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên");
        }

        if (account.getRole() == Role.ADMIN) {
            return new SessionUser(account.getAccountId(), null, "Administrator", Role.ADMIN);
        }
        Customer customer = customerRepository.findByAccount_AccountId(account.getAccountId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy hồ sơ khách hàng"));
        return new SessionUser(account.getAccountId(), customer.getCustomerId(), customer.getFullName(), Role.CUSTOMER);
    }

    @Override
    @Transactional                                                                // Account + Customer cùng 1 transaction
    public SessionUser register(RegisterForm form) {
        String email = form.getEmail().trim().toLowerCase();

        if (!form.getPassword().equals(form.getConfirmPassword())) {
            throw new BusinessException("Mật khẩu nhập lại không khớp");
        }
        if (ValidationUtils.age(form.getBirthday()) < MIN_REGISTER_AGE) {            // BR-02
            throw new BusinessException("Bạn phải từ đủ " + MIN_REGISTER_AGE + " tuổi để đăng ký");
        }
        if (accountRepository.existsByUsername(email) || customerRepository.existsByEmail(email)) {   // BR-01
            throw new BusinessException("Email đã được sử dụng");
        }
        if (customerRepository.existsByMobile(form.getMobile())) {
            throw new BusinessException("Số điện thoại đã được sử dụng");
        }
        if (customerRepository.existsByIdentityCard(form.getIdentityCard())) {
            throw new BusinessException("Số CCCD đã được sử dụng");
        }

        Account account = accountRepository.save(new Account(
                email, passwordEncoder.encode(form.getPassword()), Role.CUSTOMER, AccountStatus.ACTIVE));

        Customer customer = new Customer();
        customer.setFullName(form.getFullName().trim());
        customer.setEmail(email);
        customer.setMobile(form.getMobile());
        customer.setBirthday(form.getBirthday());
        customer.setIdentityCard(form.getIdentityCard());
        customer.setAccount(account);
        customerRepository.save(customer);

        return new SessionUser(account.getAccountId(), customer.getCustomerId(), customer.getFullName(), Role.CUSTOMER);
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/dto/LoginForm.java \
        src/main/java/com/fu/cinema/dto/RegisterForm.java \
        src/main/java/com/fu/cinema/service/AuthService.java \
        src/main/java/com/fu/cinema/service/impl/AuthServiceImpl.java
git commit -m "feat(auth): add auth service with bcrypt login and registration" -m "Refs #6"
```

**Commit 2/3 — `feat(auth): add login, logout and register pages`**

📄 **`src/main/java/com/fu/cinema/controller/AuthController.java`**

```java
package com.fu.cinema.controller;

import com.fu.cinema.dto.LoginForm;
import com.fu.cinema.dto.RegisterForm;
import com.fu.cinema.dto.SessionUser;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.service.AuthService;
import com.fu.cinema.util.SessionUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping("/login")
    public String loginPage(Model model) {
        model.addAttribute("form", new LoginForm());
        return "auth/login";
    }

    @PostMapping("/login")
    public String login(@Valid @ModelAttribute("form") LoginForm form, BindingResult br,
                        HttpServletRequest request, Model model) {
        if (br.hasErrors()) {
            return "auth/login";
        }
        try {
            SessionUser user = authService.login(form.getUsername(), form.getPassword());
            startSession(request, user);
            return user.isAdmin() ? "redirect:/admin" : "redirect:/";
        } catch (BusinessException e) {
            model.addAttribute("error", e.getMessage());
            return "auth/login";
        }
    }

    @GetMapping("/register")
    public String registerPage(Model model) {
        model.addAttribute("form", new RegisterForm());
        return "auth/register";
    }

    @PostMapping("/register")
    public String register(@Valid @ModelAttribute("form") RegisterForm form, BindingResult br,
                           HttpServletRequest request, Model model, RedirectAttributes ra) {
        if (br.hasErrors()) {
            return "auth/register";                                   // giữ lại dữ liệu đã nhập
        }
        try {
            startSession(request, authService.register(form));
            ra.addFlashAttribute("success", "Đăng ký thành công. Chào mừng bạn đến FU Cinema!");
            return "redirect:/";
        } catch (BusinessException e) {
            model.addAttribute("error", e.getMessage());
            return "auth/register";
        }
    }

    @PostMapping("/logout")
    public String logout(HttpSession session, RedirectAttributes ra) {
        session.invalidate();
        ra.addFlashAttribute("success", "Đã đăng xuất");
        return "redirect:/login";
    }

    private void startSession(HttpServletRequest request, SessionUser user) {
        HttpSession old = request.getSession(false);
        if (old != null) {
            old.invalidate();                                         // chống session fixation
        }
        request.getSession(true).setAttribute(SessionUtils.CURRENT_USER, user);
    }
}
```
📄 **`src/main/resources/templates/auth/login.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Đăng nhập')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-5" style="max-width: 420px">
    <h3 class="mb-4">Đăng nhập</h3>
    <div th:replace="~{fragments/layout :: flash}"></div>
    <form th:action="@{/login}" th:object="${form}" method="post" novalidate>
        <div class="mb-3">
            <label class="form-label">Email</label>
            <input class="form-control" th:field="*{username}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{username}"></div>
        </div>
        <div class="mb-3">
            <label class="form-label">Mật khẩu</label>
            <input type="password" class="form-control" th:field="*{password}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{password}"></div>
        </div>
        <button class="btn btn-primary w-100">Đăng nhập</button>
    </form>
    <p class="mt-3 text-center">Chưa có tài khoản? <a th:href="@{/register}">Đăng ký</a></p>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
📄 **`src/main/resources/templates/auth/register.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Đăng ký')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-5" style="max-width: 640px">
    <h3 class="mb-4">Đăng ký tài khoản</h3>
    <div th:replace="~{fragments/layout :: flash}"></div>
    <form th:action="@{/register}" th:object="${form}" method="post" novalidate class="row g-3">
        <div class="col-12">
            <label class="form-label">Họ tên</label>
            <input class="form-control" th:field="*{fullName}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{fullName}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Email (dùng để đăng nhập)</label>
            <input type="email" class="form-control" th:field="*{email}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{email}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Số điện thoại</label>
            <input class="form-control" th:field="*{mobile}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{mobile}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Ngày sinh</label>
            <input type="date" class="form-control" th:field="*{birthday}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{birthday}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">CCCD</label>
            <input class="form-control" th:field="*{identityCard}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{identityCard}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Mật khẩu</label>
            <input type="password" class="form-control" th:field="*{password}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{password}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Nhập lại mật khẩu</label>
            <input type="password" class="form-control" th:field="*{confirmPassword}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{confirmPassword}"></div>
        </div>
        <div class="col-12"><button class="btn btn-warning w-100">Đăng ký</button></div>
    </form>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
📄 **`src/main/java/com/fu/cinema/controller/admin/AdminDashboardController.java`**

```java
package com.fu.cinema.controller.admin;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

// Bản TẠM để Admin đăng nhập xong có trang đích. Hoàn thiện số liệu ở issue #20 (Sprint 3).
@Controller
@RequestMapping("/admin")
public class AdminDashboardController {

    @GetMapping
    public String dashboard() {
        return "admin/dashboard";
    }
}
```
📄 **`src/main/resources/templates/admin/dashboard.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Dashboard')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4">
    <div th:replace="~{fragments/layout :: flash}"></div>
    <h3>Dashboard</h3>
    <p class="text-muted">Xin chào quản trị viên. Số liệu thống kê sẽ được bổ sung ở issue #20.</p>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/controller/AuthController.java \
        src/main/resources/templates/auth/login.html \
        src/main/resources/templates/auth/register.html \
        src/main/java/com/fu/cinema/controller/admin/AdminDashboardController.java \
        src/main/resources/templates/admin/dashboard.html
git commit -m "feat(auth): add login, logout and register pages" -m "Refs #6"
```

**Commit 3/3 — `feat(auth): add role-based interceptor for admin and customer paths`**

📄 **`src/main/java/com/fu/cinema/config/AuthInterceptor.java`**

```java
package com.fu.cinema.config;

import com.fu.cinema.dto.SessionUser;
import com.fu.cinema.enums.Role;
import com.fu.cinema.util.SessionUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        SessionUser user = SessionUtils.getCurrentUser(request.getSession(false));
        String path = request.getRequestURI().substring(request.getContextPath().length());

        if (user == null) {                                                  // chưa đăng nhập
            response.sendRedirect(request.getContextPath() + "/login");
            return false;
        }
        boolean forbidden = (path.startsWith("/admin") && user.getRole() != Role.ADMIN)
                || (path.startsWith("/customer") && user.getRole() != Role.CUSTOMER);
        if (forbidden) {                                                     // sai vai trò → 403
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return false;
        }
        return true;
    }
}
```
📄 **`src/main/java/com/fu/cinema/config/WebConfig.java`**

```java
package com.fu.cinema.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/admin/**", "/customer/**");
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/config/AuthInterceptor.java \
        src/main/java/com/fu/cinema/config/WebConfig.java
git commit -m "feat(auth): add role-based interceptor for admin and customer paths" -m "Refs #6"
```

#### #6.3 — [A] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] admin@fucinema.vn / Admin@123 → về `/admin`, menu Admin
- [ ] an.nv@gmail.com / Customer@123 → về `/`, menu Customer
- [ ] Sai mật khẩu → "Tên đăng nhập hoặc mật khẩu không đúng"; tài khoản LOCKED → báo bị khoá
- [ ] Đăng ký trùng email / SĐT 9 số / mật khẩu yếu / 10 tuổi → báo lỗi, dữ liệu giữ nguyên; đăng ký hợp lệ → tự đăng nhập
- [ ] Customer gõ `/admin` → 403; chưa đăng nhập gõ `/customer/bookings` → `/login`

#### #6.4 — [A] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/6-auth
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/6-auth`**.

- **Title:** `feat(auth): authentication, registration and role-based authorization`
- **Reviewers:** D  ·  **Assignees:** A (Leader)  ·  **Labels:** `type: feature`, `module: auth`, `priority: high`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 1 — Admin core`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
Đăng nhập/đăng xuất bằng HttpSession, đăng ký khách hàng, phân quyền bằng HandlerInterceptor.

Các file chính: `LoginForm.java`, `RegisterForm.java`, `AuthService.java`, `AuthServiceImpl.java`, `AuthController.java`, `login.html`, `register.html`, `AdminDashboardController.java`, `AuthInterceptor.java`, `WebConfig.java`

Closes #6

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. admin@fucinema.vn / Admin@123 → về `/admin`, menu Admin
2. an.nv@gmail.com / Customer@123 → về `/`, menu Customer
3. Sai mật khẩu → "Tên đăng nhập hoặc mật khẩu không đúng"; tài khoản LOCKED → báo bị khoá
4. Đăng ký trùng email / SĐT 9 số / mật khẩu yếu / 10 tuổi → báo lỗi, dữ liệu giữ nguyên; đăng ký hợp lệ → tự đăng nhập
5. Customer gõ `/admin` → 403; chưa đăng nhập gõ `/customer/bookings` → `/login`

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#6** sang **In review**. Nhắn reviewer link PR.

#### #6.5 — [D] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/6-auth
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] So mật khẩu bằng `passwordEncoder.matches`, không lưu mật khẩu vào session
- [ ] Đăng ký Account + Customer trong 1 transaction
- [ ] Interceptor chỉ chặn `/admin/**`, `/customer/**`; logout dùng POST

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": admin@fucinema.vn / Admin@123; an.nv@gmail.com / Customer@123 — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: A (Leader) sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #6"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #6.6 — [A] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(auth): authentication, registration and role-based authorization (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #6` → **Confirm squash and merge**.
4. Kiểm tra: issue #6 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/6-auth
git fetch --prune
```

> 📢 **Merge sớm nhất có thể** — các chức năng Customer phụ thuộc. Báo nhóm dùng `SessionUtils.getCurrentCustomerId(session)` để lấy khách đang đăng nhập.

✅ **Xong #6:** [ ] code đủ tiêu chí · [ ] 3 commit đúng chuẩn có `Refs #6` · [ ] PR có `Closes #6`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

### #7 — Admin customer management (TODO 16–17) (B)

| | |
|---|---|
| 👤 Người làm | **B** |
| 👀 Reviewer | **C** |
| Nhánh | `feature/7-customer-admin` |
| Milestone | `Sprint 1 — Admin core` |
| Cần merge trước | #3, #5 (đăng nhập #6 chưa xong vẫn test được bằng URL) |
| Tiêu đề PR | `feat(customer): admin customer management` |

#### #7.1 — [B] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#7** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/7-customer-admin
```

#### #7.2 — [B] Code & commit

**Commit 1/3 — `feat(customer): add customer search query with pagination`**

📄 **`src/main/java/com/fu/cinema/repository/CustomerRepository.java`**

```java
package com.fu.cinema.repository;

import com.fu.cinema.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // ===== Derived query =====
    Optional<Customer> findByAccount_AccountId(Long accountId);

    boolean existsByEmail(String email);

    boolean existsByMobile(String mobile);

    boolean existsByIdentityCard(String identityCard);

    boolean existsByEmailAndCustomerIdNot(String email, Long customerId);

    boolean existsByMobileAndCustomerIdNot(String mobile, Long customerId);

    boolean existsByIdentityCardAndCustomerIdNot(String identityCard, Long customerId);

    // ===== Q1: tìm theo tên / email / SĐT + phân trang (JOIN FETCH account để hiện trạng thái) =====
    @Query(value = """
            SELECT c FROM Customer c JOIN FETCH c.account a
            WHERE :kw IS NULL
               OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :kw, '%'))
               OR LOWER(c.email)    LIKE LOWER(CONCAT('%', :kw, '%'))
               OR c.mobile          LIKE CONCAT('%', :kw, '%')
            """,
            countQuery = """
            SELECT COUNT(c) FROM Customer c
            WHERE :kw IS NULL
               OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :kw, '%'))
               OR LOWER(c.email)    LIKE LOWER(CONCAT('%', :kw, '%'))
               OR c.mobile          LIKE CONCAT('%', :kw, '%')
            """)
    Page<Customer> search(@Param("kw") String keyword, Pageable pageable);

    @Query("SELECT c FROM Customer c JOIN FETCH c.account WHERE c.customerId = :id")
    Optional<Customer> findWithAccountById(@Param("id") Long id);
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/repository/CustomerRepository.java
git commit -m "feat(customer): add customer search query with pagination" -m "Refs #7"
```

**Commit 2/3 — `feat(customer): add customer form and service`**

📄 **`src/main/java/com/fu/cinema/dto/CustomerForm.java`**

```java
package com.fu.cinema.dto;

import com.fu.cinema.enums.AccountStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

// Form Admin thêm/sửa khách hàng. Mật khẩu bắt buộc khi thêm, để trống khi sửa = giữ nguyên
@Data
public class CustomerForm {

    private Long customerId;

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100)
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0")
    private String mobile;

    @NotNull(message = "Ngày sinh không được để trống")
    @Past(message = "Ngày sinh phải ở quá khứ")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate birthday;

    @NotBlank(message = "CCCD không được để trống")
    @Pattern(regexp = "^\\d{12}$", message = "CCCD gồm đúng 12 chữ số")
    private String identityCard;

    @Pattern(regexp = "^$|^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
             message = "Mật khẩu ≥ 8 ký tự, có chữ hoa, chữ thường và chữ số")
    private String password;

    @NotNull
    private AccountStatus status = AccountStatus.ACTIVE;
}
```
📄 **`src/main/java/com/fu/cinema/service/CustomerService.java`**

```java
package com.fu.cinema.service;

import com.fu.cinema.dto.CustomerForm;
import com.fu.cinema.entity.Customer;
import org.springframework.data.domain.Page;

public interface CustomerService {

    // ===== Admin =====
    Page<Customer> search(String keyword, int page, int size);

    CustomerForm getForm(Long customerId);

    void create(CustomerForm form);

    void update(Long customerId, CustomerForm form);

    /** @return true nếu đã xoá hẳn, false nếu chỉ khoá tài khoản (BR-04) */
    boolean delete(Long customerId);

    void toggleLock(Long customerId);

    long count();

    // [B] issue #16 thêm getProfile, updateProfile, changePassword
}
```
📄 **`src/main/java/com/fu/cinema/service/impl/CustomerServiceImpl.java`**

```java
package com.fu.cinema.service.impl;

import com.fu.cinema.dto.CustomerForm;
import com.fu.cinema.entity.Account;
import com.fu.cinema.entity.Customer;
import com.fu.cinema.enums.AccountStatus;
import com.fu.cinema.enums.Role;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.exception.ResourceNotFoundException;
import com.fu.cinema.repository.AccountRepository;
import com.fu.cinema.repository.BookingRepository;
import com.fu.cinema.repository.CustomerRepository;
import com.fu.cinema.service.CustomerService;
import com.fu.cinema.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    // ================= Admin =================

    @Override
    public Page<Customer> search(String keyword, int page, int size) {
        return customerRepository.search(ValidationUtils.blankToNull(keyword),
                PageRequest.of(Math.max(page, 0), size, Sort.by("fullName")));
    }

    @Override
    public CustomerForm getForm(Long customerId) {
        Customer c = findWithAccount(customerId);
        CustomerForm form = new CustomerForm();
        form.setCustomerId(c.getCustomerId());
        form.setFullName(c.getFullName());
        form.setEmail(c.getEmail());
        form.setMobile(c.getMobile());
        form.setBirthday(c.getBirthday());
        form.setIdentityCard(c.getIdentityCard());
        form.setStatus(c.getAccount().getStatus());
        return form;
    }

    @Override
    @Transactional
    public void create(CustomerForm form) {
        if (form.getPassword() == null || form.getPassword().isBlank()) {
            throw new BusinessException("Mật khẩu không được để trống khi tạo khách hàng");
        }
        String email = form.getEmail().trim().toLowerCase();
        checkDuplicates(email, form.getMobile(), form.getIdentityCard(), null, null);
        checkAge(form);

        Account account = accountRepository.save(new Account(
                email, passwordEncoder.encode(form.getPassword()), Role.CUSTOMER, form.getStatus()));
        Customer customer = new Customer();
        customer.setAccount(account);
        copy(form, customer, email);
        customerRepository.save(customer);
    }

    @Override
    @Transactional
    public void update(Long customerId, CustomerForm form) {
        Customer customer = findWithAccount(customerId);
        Account account = customer.getAccount();
        String email = form.getEmail().trim().toLowerCase();
        checkDuplicates(email, form.getMobile(), form.getIdentityCard(), customerId, account.getAccountId());
        checkAge(form);

        copy(form, customer, email);
        account.setUsername(email);                          // username = email
        account.setStatus(form.getStatus());
        if (form.getPassword() != null && !form.getPassword().isBlank()) {
            account.setPassword(passwordEncoder.encode(form.getPassword()));
        }
        // dirty checking tự sinh UPDATE khi commit
    }

    @Override
    @Transactional
    public boolean delete(Long customerId) {
        Customer customer = findWithAccount(customerId);
        if (bookingRepository.existsByCustomer_CustomerId(customerId)) {          // BR-04
            customer.getAccount().setStatus(AccountStatus.LOCKED);
            return false;
        }
        Account account = customer.getAccount();
        customerRepository.delete(customer);                 // xoá bảng con (giữ FK) trước
        accountRepository.delete(account);
        return true;
    }

    @Override
    @Transactional
    public void toggleLock(Long customerId) {
        Account account = findWithAccount(customerId).getAccount();
        account.setStatus(account.getStatus() == AccountStatus.ACTIVE ? AccountStatus.LOCKED : AccountStatus.ACTIVE);
    }

    @Override
    public long count() {
        return customerRepository.count();
    }

    // ================= helpers =================

    private Customer findWithAccount(Long customerId) {
        return customerRepository.findWithAccountById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", customerId));
    }

    private void checkDuplicates(String email, String mobile, String identityCard, Long customerId, Long accountId) {
        boolean isNew = customerId == null;
        boolean emailUsed = isNew
                ? customerRepository.existsByEmail(email) || accountRepository.existsByUsername(email)
                : customerRepository.existsByEmailAndCustomerIdNot(email, customerId)
                  || accountRepository.existsByUsernameAndAccountIdNot(email, accountId);
        if (emailUsed) {
            throw new BusinessException("Email đã được sử dụng");
        }
        if (isNew ? customerRepository.existsByMobile(mobile)
                  : customerRepository.existsByMobileAndCustomerIdNot(mobile, customerId)) {
            throw new BusinessException("Số điện thoại đã được sử dụng");
        }
        if (isNew ? customerRepository.existsByIdentityCard(identityCard)
                  : customerRepository.existsByIdentityCardAndCustomerIdNot(identityCard, customerId)) {
            throw new BusinessException("Số CCCD đã được sử dụng");
        }
    }

    private void checkAge(CustomerForm form) {
        if (ValidationUtils.age(form.getBirthday()) < 13) {
            throw new BusinessException("Khách hàng phải từ đủ 13 tuổi");
        }
    }

    private void copy(CustomerForm form, Customer customer, String email) {
        customer.setFullName(form.getFullName().trim());
        customer.setEmail(email);
        customer.setMobile(form.getMobile());
        customer.setBirthday(form.getBirthday());
        customer.setIdentityCard(form.getIdentityCard());
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/dto/CustomerForm.java \
        src/main/java/com/fu/cinema/service/CustomerService.java \
        src/main/java/com/fu/cinema/service/impl/CustomerServiceImpl.java
git commit -m "feat(customer): add customer form and service" -m "Refs #7"
```

**Commit 3/3 — `feat(customer): add admin customer list, form, lock and delete`**

📄 **`src/main/java/com/fu/cinema/controller/admin/AdminCustomerController.java`**

```java
package com.fu.cinema.controller.admin;

import com.fu.cinema.dto.CustomerForm;
import com.fu.cinema.enums.AccountStatus;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.service.CustomerService;
import com.fu.cinema.util.PageUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {

    private static final String FORM_VIEW = "admin/customers/form";

    private final CustomerService customerService;

    @GetMapping
    public String list(@RequestParam(required = false) String kw,
                       @RequestParam(defaultValue = "0") int page, Model model) {
        model.addAttribute("customers", customerService.search(kw, page, PageUtils.DEFAULT_SIZE));
        model.addAttribute("kw", kw);
        model.addAttribute("pageUrl", PageUtils.currentUrlWithoutPage());
        return "admin/customers/list";
    }

    @GetMapping("/new")
    public String createForm(Model model) {
        model.addAttribute("form", new CustomerForm());
        model.addAttribute("statuses", AccountStatus.values());
        return FORM_VIEW;
    }

    @PostMapping("/new")
    public String create(@Valid @ModelAttribute("form") CustomerForm form, BindingResult br,
                         Model model, RedirectAttributes ra) {
        model.addAttribute("statuses", AccountStatus.values());
        if (br.hasErrors()) {
            return FORM_VIEW;
        }
        try {
            customerService.create(form);
        } catch (BusinessException e) {
            model.addAttribute("error", e.getMessage());
            return FORM_VIEW;
        }
        ra.addFlashAttribute("success", "Đã thêm khách hàng " + form.getFullName());
        return "redirect:/admin/customers";
    }

    @GetMapping("/{id}/edit")
    public String editForm(@PathVariable Long id, Model model) {
        model.addAttribute("form", customerService.getForm(id));
        model.addAttribute("statuses", AccountStatus.values());
        return FORM_VIEW;
    }

    @PostMapping("/{id}/edit")
    public String update(@PathVariable Long id, @Valid @ModelAttribute("form") CustomerForm form, BindingResult br,
                         Model model, RedirectAttributes ra) {
        form.setCustomerId(id);
        model.addAttribute("statuses", AccountStatus.values());
        if (br.hasErrors()) {
            return FORM_VIEW;
        }
        try {
            customerService.update(id, form);
        } catch (BusinessException e) {
            model.addAttribute("error", e.getMessage());
            return FORM_VIEW;
        }
        ra.addFlashAttribute("success", "Đã cập nhật khách hàng " + form.getFullName());
        return "redirect:/admin/customers";
    }

    @PostMapping("/{id}/lock")
    public String toggleLock(@PathVariable Long id, RedirectAttributes ra) {
        customerService.toggleLock(id);
        ra.addFlashAttribute("success", "Đã cập nhật trạng thái tài khoản");
        return "redirect:/admin/customers";
    }

    @PostMapping("/{id}/delete")
    public String delete(@PathVariable Long id, RedirectAttributes ra) {
        boolean deleted = customerService.delete(id);
        ra.addFlashAttribute("success", deleted
                ? "Đã xoá khách hàng"
                : "Khách hàng đã có đơn đặt vé nên chỉ khoá tài khoản");
        return "redirect:/admin/customers";
    }
}
```
📄 **`src/main/resources/templates/admin/customers/list.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Khách hàng')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4">
    <div th:replace="~{fragments/layout :: flash}"></div>
    <div class="d-flex justify-content-between mb-3">
        <h3>Khách hàng</h3>
        <a class="btn btn-primary" th:href="@{/admin/customers/new}">+ Thêm khách hàng</a>
    </div>
    <form class="row g-2 mb-3" method="get" th:action="@{/admin/customers}">
        <div class="col-md-10"><input class="form-control" name="kw" th:value="${kw}" placeholder="Tên, email hoặc số điện thoại"></div>
        <div class="col-md-2 d-grid"><button class="btn btn-outline-primary">Tìm</button></div>
    </form>
    <table class="table table-hover align-middle">
        <thead class="table-light"><tr><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Ngày sinh</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>
        <tr th:if="${customers.empty}"><td colspan="6" class="text-center text-muted">Không có dữ liệu</td></tr>
        <tr th:each="c : ${customers.content}">
            <td th:text="${c.fullName}"></td>
            <td th:text="${c.email}"></td>
            <td th:text="${c.mobile}"></td>
            <td th:text="${#temporals.format(c.birthday, 'dd/MM/yyyy')}"></td>
            <td><span class="badge" th:classappend="${c.account.status.name() == 'ACTIVE'} ? 'bg-success' : 'bg-secondary'"
                      th:text="${c.account.status}"></span></td>
            <td class="text-end text-nowrap">
                <a class="btn btn-sm btn-outline-secondary" th:href="@{/admin/customers/{id}/edit(id=${c.customerId})}">Sửa</a>
                <form class="d-inline" method="post" th:action="@{/admin/customers/{id}/lock(id=${c.customerId})}">
                    <button class="btn btn-sm btn-outline-warning"
                            th:text="${c.account.status.name() == 'ACTIVE'} ? 'Khoá' : 'Mở khoá'"></button>
                </form>
                <form class="d-inline" method="post" th:action="@{/admin/customers/{id}/delete(id=${c.customerId})}"
                      onsubmit="return confirm('Xoá khách hàng này? Nếu đã có đơn đặt vé, tài khoản sẽ bị khoá.');">
                    <button class="btn btn-sm btn-outline-danger">Xoá</button>
                </form>
            </td>
        </tr>
        </tbody>
    </table>
    <div th:replace="~{fragments/layout :: pagination(${customers}, ${pageUrl})}"></div>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
📄 **`src/main/resources/templates/admin/customers/form.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Khách hàng')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4" style="max-width: 720px">
    <h3 th:text="${form.customerId == null} ? 'Thêm khách hàng' : 'Sửa khách hàng'"></h3>
    <div th:replace="~{fragments/layout :: flash}"></div>
    <form method="post" th:object="${form}" novalidate class="row g-3"
          th:action="${form.customerId == null} ? @{/admin/customers/new} : @{/admin/customers/{id}/edit(id=${form.customerId})}">
        <div class="col-12">
            <label class="form-label">Họ tên</label>
            <input class="form-control" th:field="*{fullName}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{fullName}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Email (tên đăng nhập)</label>
            <input type="email" class="form-control" th:field="*{email}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{email}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Số điện thoại</label>
            <input class="form-control" th:field="*{mobile}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{mobile}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Ngày sinh</label>
            <input type="date" class="form-control" th:field="*{birthday}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{birthday}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">CCCD</label>
            <input class="form-control" th:field="*{identityCard}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{identityCard}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label" th:text="${form.customerId == null} ? 'Mật khẩu' : 'Mật khẩu mới (để trống nếu không đổi)'"></label>
            <input type="password" class="form-control" th:field="*{password}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{password}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Trạng thái tài khoản</label>
            <select class="form-select" th:field="*{status}">
                <option th:each="s : ${statuses}" th:value="${s}" th:text="${s}"></option>
            </select>
        </div>
        <div class="col-12">
            <button class="btn btn-primary">Lưu</button>
            <a class="btn btn-secondary" th:href="@{/admin/customers}">Huỷ</a>
        </div>
    </form>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
Trong `src/main/resources/templates/fragments/layout.html` thay **đúng dòng comment** `<!-- [..] menu Khách hàng ... -->` bằng:

```html
                    <li class="nav-item"><a class="nav-link" th:href="@{/admin/customers}">Khách hàng</a></li>
```

```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/controller/admin/AdminCustomerController.java \
        src/main/resources/templates/admin/customers/list.html \
        src/main/resources/templates/admin/customers/form.html \
        src/main/resources/templates/fragments/layout.html
git commit -m "feat(customer): add admin customer list, form, lock and delete" -m "Refs #7"
```

#### #7.3 — [B] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] Tìm `AN`, `0901`, `gmail` → không phân biệt hoa thường; sang trang 2 vẫn giữ từ khoá
- [ ] Thêm khách trùng email/SĐT/CCCD → báo lỗi, giữ dữ liệu; sửa giữ nguyên email → lưu được
- [ ] Khoá binh.tt → không đăng nhập được → mở khoá lại
- [ ] Xoá khách mới thêm (chưa có đơn) → mất hẳn; xoá an.nv (có đơn) → chuyển LOCKED

#### #7.4 — [B] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/7-customer-admin
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/7-customer-admin`**.

- **Title:** `feat(customer): admin customer management`
- **Reviewers:** C  ·  **Assignees:** B  ·  **Labels:** `type: feature`, `module: customer`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 1 — Admin core`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
Admin quản lý khách hàng: danh sách, tìm kiếm, thêm/sửa, khoá/mở khoá, xoá.

Các file chính: `CustomerRepository.java`, `CustomerForm.java`, `CustomerService.java`, `CustomerServiceImpl.java`, `AdminCustomerController.java`, `list.html`, `form.html`

Closes #7

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. Tìm `AN`, `0901`, `gmail` → không phân biệt hoa thường; sang trang 2 vẫn giữ từ khoá
2. Thêm khách trùng email/SĐT/CCCD → báo lỗi, giữ dữ liệu; sửa giữ nguyên email → lưu được
3. Khoá binh.tt → không đăng nhập được → mở khoá lại
4. Xoá khách mới thêm (chưa có đơn) → mất hẳn; xoá an.nv (có đơn) → chuyển LOCKED

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#7** sang **In review**. Nhắn reviewer link PR.

#### #7.5 — [C] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/7-customer-admin
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] Q1 tham số hoá, có `countQuery`
- [ ] Kiểm tra trùng khi sửa loại trừ chính bản ghi (BR-01)
- [ ] Xoá theo BR-04, dùng POST + hộp xác nhận
- [ ] Controller không gọi repository

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": Tìm `AN`, `0901`, `gmail`; Thêm khách trùng email/SĐT/CCCD — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: B sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #7"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #7.6 — [B] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(customer): admin customer management (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #7` → **Confirm squash and merge**.
4. Kiểm tra: issue #7 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/7-customer-admin
git fetch --prune
```

✅ **Xong #7:** [ ] code đủ tiêu chí · [ ] 3 commit đúng chuẩn có `Refs #7` · [ ] PR có `Closes #7`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

### #8 — Genre CRUD (TODO 18) (C)

| | |
|---|---|
| 👤 Người làm | **C** |
| 👀 Reviewer | **A** |
| Nhánh | `feature/8-genre-crud` |
| Milestone | `Sprint 1 — Admin core` |
| Cần merge trước | #3, #5 |
| Tiêu đề PR | `feat(genre): genre management` |

#### #8.1 — [C] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#8** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/8-genre-crud
```

#### #8.2 — [C] Code & commit

**Commit 1/2 — `feat(genre): add genre form and service`**

📄 **`src/main/java/com/fu/cinema/dto/GenreForm.java`**

```java
package com.fu.cinema.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GenreForm {

    private Long genreId;

    @NotBlank(message = "Tên thể loại không được để trống")
    @Size(max = 50, message = "Tên thể loại tối đa 50 ký tự")
    private String genreName;

    @NotBlank(message = "Mô tả không được để trống")
    @Size(max = 500)
    private String description;
}
```
📄 **`src/main/java/com/fu/cinema/service/GenreService.java`**

```java
package com.fu.cinema.service;

import com.fu.cinema.dto.GenreForm;
import com.fu.cinema.entity.Genre;

import java.util.List;

public interface GenreService {

    List<Genre> findAll();

    GenreForm getForm(Long genreId);

    void create(GenreForm form);

    void update(Long genreId, GenreForm form);

    void delete(Long genreId);
}
```
📄 **`src/main/java/com/fu/cinema/service/impl/GenreServiceImpl.java`**

```java
package com.fu.cinema.service.impl;

import com.fu.cinema.dto.GenreForm;
import com.fu.cinema.entity.Genre;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.exception.ResourceNotFoundException;
import com.fu.cinema.repository.GenreRepository;
import com.fu.cinema.repository.MovieRepository;
import com.fu.cinema.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GenreServiceImpl implements GenreService {

    private final GenreRepository genreRepository;
    private final MovieRepository movieRepository;

    @Override
    public List<Genre> findAll() {
        return genreRepository.findAllByOrderByGenreNameAsc();
    }

    @Override
    public GenreForm getForm(Long genreId) {
        Genre g = find(genreId);
        GenreForm form = new GenreForm();
        form.setGenreId(g.getGenreId());
        form.setGenreName(g.getGenreName());
        form.setDescription(g.getDescription());
        return form;
    }

    @Override
    @Transactional
    public void create(GenreForm form) {
        if (genreRepository.existsByGenreNameIgnoreCase(form.getGenreName().trim())) {
            throw new BusinessException("Tên thể loại đã tồn tại");
        }
        genreRepository.save(new Genre(form.getGenreName().trim(), form.getDescription().trim()));
    }

    @Override
    @Transactional
    public void update(Long genreId, GenreForm form) {
        Genre genre = find(genreId);
        if (genreRepository.existsByGenreNameIgnoreCaseAndGenreIdNot(form.getGenreName().trim(), genreId)) {
            throw new BusinessException("Tên thể loại đã tồn tại");
        }
        genre.setGenreName(form.getGenreName().trim());
        genre.setDescription(form.getDescription().trim());
    }

    @Override
    @Transactional
    public void delete(Long genreId) {
        Genre genre = find(genreId);
        if (movieRepository.existsByGenre_GenreId(genreId)) {                     // BR-05
            throw new BusinessException("Không thể xoá: vẫn còn phim thuộc thể loại \"" + genre.getGenreName() + "\"");
        }
        genreRepository.delete(genre);
    }

    private Genre find(Long id) {
        return genreRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Thể loại", id));
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/dto/GenreForm.java \
        src/main/java/com/fu/cinema/service/GenreService.java \
        src/main/java/com/fu/cinema/service/impl/GenreServiceImpl.java
git commit -m "feat(genre): add genre form and service" -m "Refs #8"
```

**Commit 2/2 — `feat(genre): add admin genre list and form pages`**

📄 **`src/main/java/com/fu/cinema/controller/admin/AdminGenreController.java`**

```java
package com.fu.cinema.controller.admin;

import com.fu.cinema.dto.GenreForm;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.service.GenreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/admin/genres")
@RequiredArgsConstructor
public class AdminGenreController {

    private static final String FORM_VIEW = "admin/genres/form";

    private final GenreService genreService;

    @GetMapping
    public String list(Model model) {
        model.addAttribute("genres", genreService.findAll());
        return "admin/genres/list";
    }

    @GetMapping("/new")
    public String createForm(Model model) {
        model.addAttribute("form", new GenreForm());
        return FORM_VIEW;
    }

    @PostMapping("/new")
    public String create(@Valid @ModelAttribute("form") GenreForm form, BindingResult br,
                         Model model, RedirectAttributes ra) {
        if (br.hasErrors()) {
            return FORM_VIEW;
        }
        try {
            genreService.create(form);
        } catch (BusinessException e) {
            model.addAttribute("error", e.getMessage());
            return FORM_VIEW;
        }
        ra.addFlashAttribute("success", "Đã thêm thể loại " + form.getGenreName());
        return "redirect:/admin/genres";
    }

    @GetMapping("/{id}/edit")
    public String editForm(@PathVariable Long id, Model model) {
        model.addAttribute("form", genreService.getForm(id));
        return FORM_VIEW;
    }

    @PostMapping("/{id}/edit")
    public String update(@PathVariable Long id, @Valid @ModelAttribute("form") GenreForm form, BindingResult br,
                         Model model, RedirectAttributes ra) {
        form.setGenreId(id);
        if (br.hasErrors()) {
            return FORM_VIEW;
        }
        try {
            genreService.update(id, form);
        } catch (BusinessException e) {
            model.addAttribute("error", e.getMessage());
            return FORM_VIEW;
        }
        ra.addFlashAttribute("success", "Đã cập nhật thể loại");
        return "redirect:/admin/genres";
    }

    @PostMapping("/{id}/delete")
    public String delete(@PathVariable Long id, RedirectAttributes ra) {
        genreService.delete(id);                         // BusinessException → GlobalExceptionHandler (flash error)
        ra.addFlashAttribute("success", "Đã xoá thể loại");
        return "redirect:/admin/genres";
    }
}
```
📄 **`src/main/resources/templates/admin/genres/list.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Thể loại')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4">
    <div th:replace="~{fragments/layout :: flash}"></div>
    <div class="d-flex justify-content-between mb-3">
        <h3>Thể loại phim</h3>
        <a class="btn btn-primary" th:href="@{/admin/genres/new}">+ Thêm thể loại</a>
    </div>
    <table class="table table-hover">
        <thead class="table-light"><tr><th>Tên thể loại</th><th>Mô tả</th><th></th></tr></thead>
        <tbody>
        <tr th:each="g : ${genres}">
            <td th:text="${g.genreName}"></td>
            <td th:text="${g.description}"></td>
            <td class="text-end text-nowrap">
                <a class="btn btn-sm btn-outline-secondary" th:href="@{/admin/genres/{id}/edit(id=${g.genreId})}">Sửa</a>
                <form class="d-inline" method="post" th:action="@{/admin/genres/{id}/delete(id=${g.genreId})}"
                      onsubmit="return confirm('Xoá thể loại này?');">
                    <button class="btn btn-sm btn-outline-danger">Xoá</button>
                </form>
            </td>
        </tr>
        </tbody>
    </table>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
📄 **`src/main/resources/templates/admin/genres/form.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Thể loại')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4" style="max-width: 640px">
    <h3 th:text="${form.genreId == null} ? 'Thêm thể loại' : 'Sửa thể loại'"></h3>
    <div th:replace="~{fragments/layout :: flash}"></div>
    <form method="post" th:object="${form}" novalidate
          th:action="${form.genreId == null} ? @{/admin/genres/new} : @{/admin/genres/{id}/edit(id=${form.genreId})}">
        <div class="mb-3">
            <label class="form-label">Tên thể loại</label>
            <input class="form-control" th:field="*{genreName}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{genreName}"></div>
        </div>
        <div class="mb-3">
            <label class="form-label">Mô tả</label>
            <textarea class="form-control" rows="3" th:field="*{description}" th:errorclass="is-invalid"></textarea>
            <div class="invalid-feedback" th:errors="*{description}"></div>
        </div>
        <button class="btn btn-primary">Lưu</button>
        <a class="btn btn-secondary" th:href="@{/admin/genres}">Huỷ</a>
    </form>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
Trong `src/main/resources/templates/fragments/layout.html` thay **đúng dòng comment** `<!-- [..] menu Thể loại ... -->` bằng:

```html
                    <li class="nav-item"><a class="nav-link" th:href="@{/admin/genres}">Thể loại</a></li>
```

```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/controller/admin/AdminGenreController.java \
        src/main/resources/templates/admin/genres/list.html \
        src/main/resources/templates/admin/genres/form.html \
        src/main/resources/templates/fragments/layout.html
git commit -m "feat(genre): add admin genre list and form pages" -m "Refs #8"
```

#### #8.3 — [C] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] Thêm "Hài" → thêm "HÀI" → báo trùng
- [ ] Xoá "Hành động" (còn phim) → báo lỗi, không xoá
- [ ] Xoá "Khoa học viễn tưởng" (không có phim) → xoá được

#### #8.4 — [C] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/8-genre-crud
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/8-genre-crud`**.

- **Title:** `feat(genre): genre management`
- **Reviewers:** A  ·  **Assignees:** C  ·  **Labels:** `type: feature`, `module: movie`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 1 — Admin core`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
CRUD thể loại phim cho Admin.

Các file chính: `GenreForm.java`, `GenreService.java`, `GenreServiceImpl.java`, `AdminGenreController.java`, `list.html`, `form.html`

Closes #8

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. Thêm "Hài" → thêm "HÀI" → báo trùng
2. Xoá "Hành động" (còn phim) → báo lỗi, không xoá
3. Xoá "Khoa học viễn tưởng" (không có phim) → xoá được

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#8** sang **In review**. Nhắn reviewer link PR.

#### #8.5 — [A] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/8-genre-crud
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] BR-05 nằm trong service
- [ ] Tên duy nhất không phân biệt hoa thường, khi sửa loại trừ chính nó

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": Thêm "Hài"; Xoá "Hành động" (còn phim) — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: C sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #8"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #8.6 — [C] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(genre): genre management (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #8` → **Confirm squash and merge**.
4. Kiểm tra: issue #8 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/8-genre-crud
git fetch --prune
```

✅ **Xong #8:** [ ] code đủ tiêu chí · [ ] 2 commit đúng chuẩn có `Refs #8` · [ ] PR có `Closes #8`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

### #10 — Room CRUD (TODO 22) (D)

| | |
|---|---|
| 👤 Người làm | **D** |
| 👀 Reviewer | **A** |
| Nhánh | `feature/10-room-crud` |
| Milestone | `Sprint 1 — Admin core` |
| Cần merge trước | #3, #5 |
| Tiêu đề PR | `feat(room): room management` |

#### #10.1 — [D] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#10** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/10-room-crud
```

#### #10.2 — [D] Code & commit

**Commit 1/2 — `feat(room): add room form and service`**

📄 **`src/main/java/com/fu/cinema/dto/RoomForm.java`**

```java
package com.fu.cinema.dto;

import com.fu.cinema.enums.RoomStatus;
import com.fu.cinema.enums.RoomType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RoomForm {

    private Long roomId;

    @NotBlank(message = "Tên phòng không được để trống")
    @Size(max = 50)
    private String roomName;

    @NotNull(message = "Vui lòng chọn loại phòng")
    private RoomType roomType;

    @NotNull(message = "Số hàng không được để trống")
    @Min(value = 1, message = "Số hàng từ 1 đến 26")
    @Max(value = 26, message = "Số hàng từ 1 đến 26")
    private Integer totalRows;

    @NotNull(message = "Số ghế mỗi hàng không được để trống")
    @Min(value = 1, message = "Số ghế mỗi hàng từ 1 đến 30")
    @Max(value = 30, message = "Số ghế mỗi hàng từ 1 đến 30")
    private Integer seatsPerRow;

    @NotNull(message = "Vui lòng chọn trạng thái")
    private RoomStatus status;
}
```
📄 **`src/main/java/com/fu/cinema/service/RoomService.java`**

```java
package com.fu.cinema.service;

import com.fu.cinema.dto.RoomForm;
import com.fu.cinema.entity.Room;

import java.util.List;

public interface RoomService {

    List<Room> findAll();

    List<Room> findActive();

    RoomForm getForm(Long roomId);

    void create(RoomForm form);

    void update(Long roomId, RoomForm form);

    /** @return true nếu đã xoá hẳn, false nếu chỉ chuyển MAINTENANCE */
    boolean delete(Long roomId);
}
```
📄 **`src/main/java/com/fu/cinema/service/impl/RoomServiceImpl.java`**

```java
package com.fu.cinema.service.impl;

import com.fu.cinema.dto.RoomForm;
import com.fu.cinema.entity.Room;
import com.fu.cinema.enums.RoomStatus;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.exception.ResourceNotFoundException;
import com.fu.cinema.repository.RoomRepository;
import com.fu.cinema.repository.ShowtimeRepository;
import com.fu.cinema.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final ShowtimeRepository showtimeRepository;

    @Override
    public List<Room> findAll() {
        return roomRepository.findAll(Sort.by("roomName"));
    }

    @Override
    public List<Room> findActive() {
        return roomRepository.findByStatus(RoomStatus.ACTIVE);
    }

    @Override
    public RoomForm getForm(Long roomId) {
        Room r = find(roomId);
        RoomForm f = new RoomForm();
        f.setRoomId(r.getRoomId());
        f.setRoomName(r.getRoomName());
        f.setRoomType(r.getRoomType());
        f.setTotalRows(r.getTotalRows());
        f.setSeatsPerRow(r.getSeatsPerRow());
        f.setStatus(r.getStatus());
        return f;
    }

    @Override
    @Transactional
    public void create(RoomForm form) {
        if (roomRepository.existsByRoomNameIgnoreCase(form.getRoomName().trim())) {
            throw new BusinessException("Tên phòng đã tồn tại");
        }
        roomRepository.save(new Room(form.getRoomName().trim(), form.getRoomType(),
                form.getTotalRows(), form.getSeatsPerRow(), form.getStatus()));
    }

    @Override
    @Transactional
    public void update(Long roomId, RoomForm form) {
        Room room = find(roomId);
        if (roomRepository.existsByRoomNameIgnoreCaseAndRoomIdNot(form.getRoomName().trim(), roomId)) {
            throw new BusinessException("Tên phòng đã tồn tại");
        }
        boolean layoutChanged = !room.getTotalRows().equals(form.getTotalRows())
                || !room.getSeatsPerRow().equals(form.getSeatsPerRow());
        if (layoutChanged && showtimeRepository.existsByRoom_RoomId(roomId)) {
            throw new BusinessException("Không thể đổi sơ đồ ghế của phòng đã có suất chiếu");
        }
        room.setRoomName(form.getRoomName().trim());
        room.setRoomType(form.getRoomType());
        room.setTotalRows(form.getTotalRows());
        room.setSeatsPerRow(form.getSeatsPerRow());
        room.setStatus(form.getStatus());
    }

    @Override
    @Transactional
    public boolean delete(Long roomId) {
        Room room = find(roomId);
        if (showtimeRepository.existsByRoom_RoomId(roomId)) {
            room.setStatus(RoomStatus.MAINTENANCE);
            return false;
        }
        roomRepository.delete(room);
        return true;
    }

    private Room find(Long id) {
        return roomRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Phòng chiếu", id));
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/dto/RoomForm.java \
        src/main/java/com/fu/cinema/service/RoomService.java \
        src/main/java/com/fu/cinema/service/impl/RoomServiceImpl.java
git commit -m "feat(room): add room form and service" -m "Refs #10"
```

**Commit 2/2 — `feat(room): add admin room list and form pages`**

📄 **`src/main/java/com/fu/cinema/controller/admin/AdminRoomController.java`**

```java
package com.fu.cinema.controller.admin;

import com.fu.cinema.dto.RoomForm;
import com.fu.cinema.enums.RoomStatus;
import com.fu.cinema.enums.RoomType;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/admin/rooms")
@RequiredArgsConstructor
public class AdminRoomController {

    private static final String FORM_VIEW = "admin/rooms/form";

    private final RoomService roomService;

    @GetMapping
    public String list(Model model) {
        model.addAttribute("rooms", roomService.findAll());
        return "admin/rooms/list";
    }

    @GetMapping("/new")
    public String createForm(Model model) {
        RoomForm form = new RoomForm();
        form.setStatus(RoomStatus.ACTIVE);
        return showForm(form, model);
    }

    @PostMapping("/new")
    public String create(@Valid @ModelAttribute("form") RoomForm form, BindingResult br,
                         Model model, RedirectAttributes ra) {
        if (br.hasErrors()) {
            return showForm(form, model);
        }
        try {
            roomService.create(form);
        } catch (BusinessException e) {
            model.addAttribute("error", e.getMessage());
            return showForm(form, model);
        }
        ra.addFlashAttribute("success", "Đã thêm phòng " + form.getRoomName());
        return "redirect:/admin/rooms";
    }

    @GetMapping("/{id}/edit")
    public String editForm(@PathVariable Long id, Model model) {
        return showForm(roomService.getForm(id), model);
    }

    @PostMapping("/{id}/edit")
    public String update(@PathVariable Long id, @Valid @ModelAttribute("form") RoomForm form, BindingResult br,
                         Model model, RedirectAttributes ra) {
        form.setRoomId(id);
        if (br.hasErrors()) {
            return showForm(form, model);
        }
        try {
            roomService.update(id, form);
        } catch (BusinessException e) {
            model.addAttribute("error", e.getMessage());
            return showForm(form, model);
        }
        ra.addFlashAttribute("success", "Đã cập nhật phòng " + form.getRoomName());
        return "redirect:/admin/rooms";
    }

    @PostMapping("/{id}/delete")
    public String delete(@PathVariable Long id, RedirectAttributes ra) {
        boolean deleted = roomService.delete(id);
        ra.addFlashAttribute("success", deleted
                ? "Đã xoá phòng"
                : "Phòng đã có suất chiếu nên được chuyển sang trạng thái MAINTENANCE");
        return "redirect:/admin/rooms";
    }

    private String showForm(RoomForm form, Model model) {
        model.addAttribute("form", form);
        model.addAttribute("roomTypes", RoomType.values());
        model.addAttribute("statuses", RoomStatus.values());
        return FORM_VIEW;
    }
}
```
📄 **`src/main/resources/templates/admin/rooms/list.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Phòng chiếu')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4">
    <div th:replace="~{fragments/layout :: flash}"></div>
    <div class="d-flex justify-content-between mb-3">
        <h3>Phòng chiếu</h3>
        <a class="btn btn-primary" th:href="@{/admin/rooms/new}">+ Thêm phòng</a>
    </div>
    <table class="table table-hover align-middle">
        <thead class="table-light"><tr><th>Tên phòng</th><th>Loại</th><th>Sơ đồ</th><th>Sức chứa</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>
        <tr th:each="r : ${rooms}">
            <td th:text="${r.roomName}"></td>
            <td th:text="${r.roomType.label}"></td>
            <td th:text="|${r.totalRows} hàng × ${r.seatsPerRow} ghế|"></td>
            <td th:text="${r.capacity}"></td>
            <td th:text="${r.status}"></td>
            <td class="text-end text-nowrap">
                <a class="btn btn-sm btn-outline-secondary" th:href="@{/admin/rooms/{id}/edit(id=${r.roomId})}">Sửa</a>
                <form class="d-inline" method="post" th:action="@{/admin/rooms/{id}/delete(id=${r.roomId})}"
                      onsubmit="return confirm('Xoá phòng? Nếu đã có suất chiếu, phòng sẽ chuyển sang MAINTENANCE.');">
                    <button class="btn btn-sm btn-outline-danger">Xoá</button>
                </form>
            </td>
        </tr>
        </tbody>
    </table>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
📄 **`src/main/resources/templates/admin/rooms/form.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Phòng chiếu')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4" style="max-width: 640px">
    <h3 th:text="${form.roomId == null} ? 'Thêm phòng' : 'Sửa phòng'"></h3>
    <div th:replace="~{fragments/layout :: flash}"></div>
    <form method="post" th:object="${form}" novalidate class="row g-3"
          th:action="${form.roomId == null} ? @{/admin/rooms/new} : @{/admin/rooms/{id}/edit(id=${form.roomId})}">
        <div class="col-md-6">
            <label class="form-label">Tên phòng</label>
            <input class="form-control" th:field="*{roomName}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{roomName}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Loại phòng</label>
            <select class="form-select" th:field="*{roomType}" th:errorclass="is-invalid">
                <option value="">-- Chọn --</option>
                <option th:each="t : ${roomTypes}" th:value="${t}" th:text="${t.label}"></option>
            </select>
            <div class="invalid-feedback" th:errors="*{roomType}"></div>
        </div>
        <div class="col-md-4">
            <label class="form-label">Số hàng (A–Z)</label>
            <input type="number" class="form-control" th:field="*{totalRows}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{totalRows}"></div>
        </div>
        <div class="col-md-4">
            <label class="form-label">Ghế mỗi hàng</label>
            <input type="number" class="form-control" th:field="*{seatsPerRow}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{seatsPerRow}"></div>
        </div>
        <div class="col-md-4">
            <label class="form-label">Trạng thái</label>
            <select class="form-select" th:field="*{status}">
                <option th:each="s : ${statuses}" th:value="${s}" th:text="${s}"></option>
            </select>
        </div>
        <div class="col-12">
            <button class="btn btn-primary">Lưu</button>
            <a class="btn btn-secondary" th:href="@{/admin/rooms}">Huỷ</a>
        </div>
    </form>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
Trong `src/main/resources/templates/fragments/layout.html` thay **đúng dòng comment** `<!-- [..] menu Phòng chiếu ... -->` bằng:

```html
                    <li class="nav-item"><a class="nav-link" th:href="@{/admin/rooms}">Phòng chiếu</a></li>
```

```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/controller/admin/AdminRoomController.java \
        src/main/resources/templates/admin/rooms/list.html \
        src/main/resources/templates/admin/rooms/form.html \
        src/main/resources/templates/fragments/layout.html
git commit -m "feat(room): add admin room list and form pages" -m "Refs #10"
```

#### #10.3 — [D] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] Thêm phòng 27 hàng → lỗi; tên trùng → lỗi
- [ ] Danh sách hiện sức chứa = hàng × ghế
- [ ] Xoá Room 01 (có suất) → chuyển MAINTENANCE; xoá phòng mới → mất hẳn

#### #10.4 — [D] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/10-room-crud
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/10-room-crud`**.

- **Title:** `feat(room): room management`
- **Reviewers:** A  ·  **Assignees:** D  ·  **Labels:** `type: feature`, `module: showtime`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 1 — Admin core`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
CRUD phòng chiếu cho Admin.

Các file chính: `RoomForm.java`, `RoomService.java`, `RoomServiceImpl.java`, `AdminRoomController.java`, `list.html`, `form.html`

Closes #10

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. Thêm phòng 27 hàng → lỗi; tên trùng → lỗi
2. Danh sách hiện sức chứa = hàng × ghế
3. Xoá Room 01 (có suất) → chuyển MAINTENANCE; xoá phòng mới → mất hẳn

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#10** sang **In review**. Nhắn reviewer link PR.

#### #10.5 — [A] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/10-room-crud
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] Giới hạn hàng [1,26], ghế [1,30]
- [ ] Phòng có suất chiếu không xoá, không đổi sơ đồ ghế

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": Thêm phòng 27 hàng; Danh sách hiện sức chứa = hàng × ghế — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: D sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #10"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #10.6 — [D] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(room): room management (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #10` → **Confirm squash and merge**.
4. Kiểm tra: issue #10 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/10-room-crud
git fetch --prune
```

✅ **Xong #10:** [ ] code đủ tiêu chí · [ ] 2 commit đúng chuẩn có `Refs #10` · [ ] PR có `Closes #10`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

### #12 — Admin booking management (TODO 24–25) (B)

| | |
|---|---|
| 👤 Người làm | **B** |
| 👀 Reviewer | **D** |
| Nhánh | `feature/12-booking-admin` |
| Milestone | `Sprint 1 — Admin core` |
| Cần merge trước | #3, #4 (dùng đơn trong seed) |
| Tiêu đề PR | `feat(booking): admin booking management` |

#### #12.1 — [B] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#12** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/12-booking-admin
```

#### #12.2 — [B] Code & commit

**Commit 1/3 — `feat(booking): add booking detail and admin filter queries`**

```java
// Import cần có (thêm nếu file chưa có):
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;
// import java.time.LocalDateTime;
// import java.util.Optional;

// Thêm vào CUỐI interface BookingRepository (trước dấu } cuối):

    // ===== Q5: chi tiết đơn kèm khách, suất chiếu, phim, phòng, vé =====
    @Query("""
            SELECT DISTINCT b FROM Booking b
            JOIN FETCH b.customer c
            JOIN FETCH b.showtime s
            JOIN FETCH s.movie
            JOIN FETCH s.room
            LEFT JOIN FETCH b.tickets
            WHERE b.bookingId = :id
            """)
    Optional<Booking> findDetailById(@Param("id") Long id);

    // ===== Q6: lọc đơn cho Admin (trạng thái, khoảng ngày, từ khoá khách hàng) =====
    @Query(value = """
            SELECT b FROM Booking b
            JOIN FETCH b.customer c
            JOIN FETCH b.showtime s
            JOIN FETCH s.movie m
            WHERE (:status IS NULL OR b.status = :status)
              AND (:from IS NULL OR b.bookingDate >= :from)
              AND (:to IS NULL OR b.bookingDate < :to)
              AND (:kw IS NULL
                   OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :kw, '%'))
                   OR LOWER(c.email)    LIKE LOWER(CONCAT('%', :kw, '%'))
                   OR c.mobile          LIKE CONCAT('%', :kw, '%'))
            """,
            countQuery = """
            SELECT COUNT(b) FROM Booking b JOIN b.customer c
            WHERE (:status IS NULL OR b.status = :status)
              AND (:from IS NULL OR b.bookingDate >= :from)
              AND (:to IS NULL OR b.bookingDate < :to)
              AND (:kw IS NULL
                   OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :kw, '%'))
                   OR LOWER(c.email)    LIKE LOWER(CONCAT('%', :kw, '%'))
                   OR c.mobile          LIKE CONCAT('%', :kw, '%'))
            """)
    Page<Booking> search(@Param("status") BookingStatus status,
                         @Param("from") LocalDateTime from,
                         @Param("to") LocalDateTime to,
                         @Param("kw") String keyword,
                         Pageable pageable);
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/repository/BookingRepository.java
git commit -m "feat(booking): add booking detail and admin filter queries" -m "Refs #12"
```

**Commit 2/3 — `feat(booking): add booking service for admin`**

📄 **`src/main/java/com/fu/cinema/service/BookingService.java`**

```java
package com.fu.cinema.service;

import com.fu.cinema.entity.Booking;
import com.fu.cinema.enums.BookingStatus;
import org.springframework.data.domain.Page;

import java.time.LocalDate;

public interface BookingService {

    // ===== Admin =====
    Page<Booking> search(BookingStatus status, LocalDate fromDate, LocalDate toDate, String keyword, int page, int size);

    Booking getDetail(Long bookingId);

    void confirm(Long bookingId);

    void cancelByAdmin(Long bookingId);

    long countPending();

    // [D] issue #14 thêm create(...)
    // [B] issue #15 thêm findByCustomer(...), getDetailForCustomer(...), cancelByCustomer(...)
}
```
📄 **`src/main/java/com/fu/cinema/service/impl/BookingServiceImpl.java`**

```java
package com.fu.cinema.service.impl;

import com.fu.cinema.entity.Booking;
import com.fu.cinema.enums.BookingStatus;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.exception.ResourceNotFoundException;
import com.fu.cinema.repository.BookingRepository;
import com.fu.cinema.service.BookingService;
import com.fu.cinema.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    // ================= Admin =================

    @Override
    public Page<Booking> search(BookingStatus status, LocalDate fromDate, LocalDate toDate, String keyword, int page, int size) {
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new BusinessException("Từ ngày phải trước hoặc bằng đến ngày");
        }
        return bookingRepository.search(status,
                fromDate == null ? null : fromDate.atStartOfDay(),
                toDate == null ? null : toDate.plusDays(1).atStartOfDay(),
                ValidationUtils.blankToNull(keyword),
                PageRequest.of(Math.max(page, 0), size, Sort.by("bookingDate").descending()));
    }

    @Override
    public Booking getDetail(Long bookingId) {
        return bookingRepository.findDetailById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn đặt vé", bookingId));
    }

    @Override
    @Transactional
    public void confirm(Long bookingId) {
        Booking booking = getDetail(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {                               // BR-13
            throw new BusinessException("Chỉ xác nhận được đơn đang ở trạng thái PENDING");
        }
        booking.setStatus(BookingStatus.CONFIRMED);
    }

    @Override
    @Transactional
    public void cancelByAdmin(Long bookingId) {
        Booking booking = getDetail(bookingId);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException("Đơn đã được huỷ trước đó");
        }
        booking.setStatus(BookingStatus.CANCELLED);
    }

    @Override
    public long countPending() {
        return bookingRepository.countByStatus(BookingStatus.PENDING);
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/service/BookingService.java \
        src/main/java/com/fu/cinema/service/impl/BookingServiceImpl.java
git commit -m "feat(booking): add booking service for admin" -m "Refs #12"
```

**Commit 3/3 — `feat(booking): add admin booking list, detail, confirm and cancel`**

📄 **`src/main/java/com/fu/cinema/controller/admin/AdminBookingController.java`**

```java
package com.fu.cinema.controller.admin;

import com.fu.cinema.enums.BookingStatus;
import com.fu.cinema.service.BookingService;
import com.fu.cinema.util.PageUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;

@Controller
@RequestMapping("/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingService bookingService;

    @GetMapping
    public String list(@RequestParam(required = false) BookingStatus status,
                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                       @RequestParam(required = false) String kw,
                       @RequestParam(defaultValue = "0") int page, Model model) {
        model.addAttribute("bookings", bookingService.search(status, from, to, kw, page, PageUtils.DEFAULT_SIZE));
        model.addAttribute("statuses", BookingStatus.values());
        model.addAttribute("status", status);
        model.addAttribute("from", from);
        model.addAttribute("to", to);
        model.addAttribute("kw", kw);
        model.addAttribute("pageUrl", PageUtils.currentUrlWithoutPage());
        return "admin/bookings/list";
    }

    @GetMapping("/{id}")
    public String detail(@PathVariable Long id, Model model) {
        model.addAttribute("booking", bookingService.getDetail(id));
        return "admin/bookings/detail";
    }

    @PostMapping("/{id}/confirm")
    public String confirm(@PathVariable Long id, RedirectAttributes ra) {
        bookingService.confirm(id);
        ra.addFlashAttribute("success", "Đã xác nhận đơn #" + id);
        return "redirect:/admin/bookings/" + id;
    }

    @PostMapping("/{id}/cancel")
    public String cancel(@PathVariable Long id, RedirectAttributes ra) {
        bookingService.cancelByAdmin(id);
        ra.addFlashAttribute("success", "Đã huỷ đơn #" + id);
        return "redirect:/admin/bookings/" + id;
    }
}
```
📄 **`src/main/resources/templates/admin/bookings/list.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Đơn đặt vé')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4">
    <div th:replace="~{fragments/layout :: flash}"></div>
    <h3 class="mb-3">Đơn đặt vé</h3>
    <form class="row g-2 mb-3" method="get" th:action="@{/admin/bookings}">
        <div class="col-md-2">
            <select class="form-select" name="status">
                <option value="">Trạng thái</option>
                <option th:each="s : ${statuses}" th:value="${s}" th:text="${s}" th:selected="${s == status}"></option>
            </select>
        </div>
        <div class="col-md-2"><input type="date" class="form-control" name="from" th:value="${from}" title="Từ ngày"></div>
        <div class="col-md-2"><input type="date" class="form-control" name="to" th:value="${to}" title="Đến ngày"></div>
        <div class="col-md-4"><input class="form-control" name="kw" th:value="${kw}" placeholder="Tên, email, SĐT khách hàng"></div>
        <div class="col-md-2 d-grid"><button class="btn btn-outline-primary">Lọc</button></div>
    </form>
    <table class="table table-hover align-middle">
        <thead class="table-light"><tr><th>#</th><th>Ngày đặt</th><th>Khách hàng</th><th>Phim</th><th>Suất chiếu</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>
        <tr th:if="${bookings.empty}"><td colspan="8" class="text-center text-muted">Không có dữ liệu</td></tr>
        <tr th:each="b : ${bookings.content}">
            <td th:text="${b.bookingId}"></td>
            <td th:text="${#temporals.format(b.bookingDate, 'dd/MM/yyyy HH:mm')}"></td>
            <td th:text="${b.customer.fullName}"></td>
            <td th:text="${b.showtime.movie.title}"></td>
            <td th:text="${#temporals.format(b.showtime.startTime, 'dd/MM HH:mm')}"></td>
            <td th:text="${#numbers.formatDecimal(b.totalAmount, 0, 'COMMA', 0, 'POINT')} + 'đ'"></td>
            <td><span class="badge" th:text="${b.status}"
                      th:classappend="${b.status.name() == 'CONFIRMED'} ? 'bg-success' : (${b.status.name() == 'PENDING'} ? 'bg-warning text-dark' : 'bg-secondary')"></span></td>
            <td><a class="btn btn-sm btn-outline-primary" th:href="@{/admin/bookings/{id}(id=${b.bookingId})}">Chi tiết</a></td>
        </tr>
        </tbody>
    </table>
    <div th:replace="~{fragments/layout :: pagination(${bookings}, ${pageUrl})}"></div>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
📄 **`src/main/resources/templates/admin/bookings/detail.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Chi tiết đơn')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4" style="max-width: 820px">
    <div th:replace="~{fragments/layout :: flash}"></div>
    <h3 th:text="|Đơn đặt vé #${booking.bookingId}|"></h3>
    <table class="table">
        <tr><th>Trạng thái</th><td th:text="${booking.status}"></td></tr>
        <tr><th>Ngày đặt</th><td th:text="${#temporals.format(booking.bookingDate, 'dd/MM/yyyy HH:mm')}"></td></tr>
        <tr><th>Khách hàng</th><td th:text="|${booking.customer.fullName} · ${booking.customer.email} · ${booking.customer.mobile}|"></td></tr>
        <tr><th>Phim</th><td th:text="${booking.showtime.movie.title}"></td></tr>
        <tr><th>Suất chiếu</th><td th:text="|${#temporals.format(booking.showtime.startTime, 'dd/MM/yyyy HH:mm')} · ${booking.showtime.room.roomName}|"></td></tr>
        <tr><th>Ghế</th><td><span class="badge bg-dark me-1" th:each="t : ${booking.tickets}" th:text="${t.seatCode}"></span></td></tr>
        <tr><th>Tổng tiền</th><td class="fw-bold" th:text="${#numbers.formatDecimal(booking.totalAmount, 0, 'COMMA', 0, 'POINT')} + 'đ'"></td></tr>
    </table>
    <div class="d-flex gap-2">
        <form th:if="${booking.status.name() == 'PENDING'}" method="post" th:action="@{/admin/bookings/{id}/confirm(id=${booking.bookingId})}">
            <button class="btn btn-success">Xác nhận</button>
        </form>
        <form th:if="${booking.status.name() != 'CANCELLED'}" method="post" th:action="@{/admin/bookings/{id}/cancel(id=${booking.bookingId})}"
              onsubmit="return confirm('Huỷ đơn này?');">
            <button class="btn btn-outline-danger">Huỷ đơn</button>
        </form>
        <a class="btn btn-secondary" th:href="@{/admin/bookings}">Quay lại</a>
    </div>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
Trong `src/main/resources/templates/fragments/layout.html` thay **đúng dòng comment** `<!-- [..] menu Đơn đặt vé ... -->` bằng:

```html
                    <li class="nav-item"><a class="nav-link" th:href="@{/admin/bookings}">Đơn đặt vé</a></li>
```

```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/controller/admin/AdminBookingController.java \
        src/main/resources/templates/admin/bookings/list.html \
        src/main/resources/templates/admin/bookings/detail.html \
        src/main/resources/templates/fragments/layout.html
git commit -m "feat(booking): add admin booking list, detail, confirm and cancel" -m "Refs #12"
```

#### #12.3 — [B] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] Lọc PENDING + khoảng ngày + từ khoá "an" → kết hợp đúng, mới nhất trước
- [ ] Chi tiết đơn: đủ khách, phim, suất, ghế, tổng tiền (không lỗi lazy)
- [ ] Xác nhận đơn PENDING → CONFIRMED; xác nhận lại / huỷ đơn đã huỷ → báo lỗi

#### #12.4 — [B] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/12-booking-admin
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/12-booking-admin`**.

- **Title:** `feat(booking): admin booking management`
- **Reviewers:** D  ·  **Assignees:** B  ·  **Labels:** `type: feature`, `module: booking`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 1 — Admin core`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
Admin xem/lọc đơn đặt vé, xem chi tiết, xác nhận hoặc huỷ đơn.

Các file chính: `BookingService.java`, `BookingServiceImpl.java`, `AdminBookingController.java`, `list.html`, `detail.html`

Closes #12

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. Lọc PENDING + khoảng ngày + từ khoá "an" → kết hợp đúng, mới nhất trước
2. Chi tiết đơn: đủ khách, phim, suất, ghế, tổng tiền (không lỗi lazy)
3. Xác nhận đơn PENDING → CONFIRMED; xác nhận lại / huỷ đơn đã huỷ → báo lỗi

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#12** sang **In review**. Nhắn reviewer link PR.

#### #12.5 — [D] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/12-booking-admin
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] Q5 `JOIN FETCH`, Q6 tham số tuỳ chọn + `countQuery`
- [ ] Luồng trạng thái BR-13 nằm trong service

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": Lọc PENDING + khoảng ngày + từ khoá "an"; Chi tiết đơn: đủ khách, phim, suất, ghế, tổng tiền (không lỗi lazy) — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: B sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #12"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #12.6 — [B] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(booking): admin booking management (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #12` → **Confirm squash and merge**.
4. Kiểm tra: issue #12 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/12-booking-admin
git fetch --prune
```

✅ **Xong #12:** [ ] code đủ tiêu chí · [ ] 3 commit đúng chuẩn có `Refs #12` · [ ] PR có `Closes #12`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

### #9 — Movie CRUD + soft delete (TODO 19–21) (C)

| | |
|---|---|
| 👤 Người làm | **C** |
| 👀 Reviewer | **D** |
| Nhánh | `feature/9-movie-crud` |
| Milestone | `Sprint 1 — Admin core` |
| Cần merge trước | #8 |
| Tiêu đề PR | `feat(movie): movie management with filters and soft delete` |

#### #9.1 — [C] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#9** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/9-movie-crud
```

#### #9.2 — [C] Code & commit

**Commit 1/3 — `feat(movie): add movie search with genre and status filters`**

📄 **`src/main/java/com/fu/cinema/repository/MovieRepository.java`**

```java
package com.fu.cinema.repository;

import com.fu.cinema.entity.Movie;
import com.fu.cinema.enums.MovieStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    // ===== Derived query =====
    boolean existsByGenre_GenreId(Long genreId);

    long countByStatus(MovieStatus status);

    List<Movie> findByStatusInOrderByReleaseDateDesc(Collection<MovieStatus> statuses);

    List<Movie> findByStatusNotOrderByTitleAsc(MovieStatus status);      // dropdown tạo suất chiếu

    // ===== Q2: tìm theo tên + thể loại + danh sách trạng thái (tham số tuỳ chọn), phân trang =====
    @Query(value = """
            SELECT m FROM Movie m JOIN FETCH m.genre g
            WHERE (:kw IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :kw, '%')))
              AND (:genreId IS NULL OR g.genreId = :genreId)
              AND m.status IN :statuses
            """,
            countQuery = """
            SELECT COUNT(m) FROM Movie m
            WHERE (:kw IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :kw, '%')))
              AND (:genreId IS NULL OR m.genre.genreId = :genreId)
              AND m.status IN :statuses
            """)
    Page<Movie> search(@Param("kw") String keyword,
                       @Param("genreId") Long genreId,
                       @Param("statuses") Collection<MovieStatus> statuses,
                       Pageable pageable);

    @Query("SELECT m FROM Movie m JOIN FETCH m.genre WHERE m.movieId = :id")
    Optional<Movie> findWithGenreById(@Param("id") Long id);
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/repository/MovieRepository.java
git commit -m "feat(movie): add movie search with genre and status filters" -m "Refs #9"
```

**Commit 2/3 — `feat(movie): add movie form and service`**

📄 **`src/main/java/com/fu/cinema/dto/MovieForm.java`**

```java
package com.fu.cinema.dto;

import com.fu.cinema.enums.AgeRating;
import com.fu.cinema.enums.MovieStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class MovieForm {

    private Long movieId;

    @NotBlank(message = "Tên phim không được để trống")
    @Size(max = 200)
    private String title;

    @NotBlank(message = "Đạo diễn không được để trống")
    @Size(max = 100)
    private String director;

    @NotNull(message = "Thời lượng không được để trống")
    @Min(value = 30, message = "Thời lượng tối thiểu 30 phút")
    @Max(value = 300, message = "Thời lượng tối đa 300 phút")
    private Integer duration;

    @NotNull(message = "Ngày khởi chiếu không được để trống")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate releaseDate;

    @NotNull(message = "Vui lòng chọn độ tuổi")
    private AgeRating ageRating;

    @NotBlank(message = "Mô tả không được để trống")
    @Size(max = 2000)
    private String description;

    @NotBlank(message = "Poster URL không được để trống")
    @Size(max = 500)
    private String posterUrl;

    @NotNull(message = "Vui lòng chọn thể loại")
    private Long genreId;

    @NotNull(message = "Vui lòng chọn trạng thái")
    private MovieStatus status;
}
```
📄 **`src/main/java/com/fu/cinema/service/MovieService.java`**

```java
package com.fu.cinema.service;

import com.fu.cinema.dto.MovieForm;
import com.fu.cinema.entity.Movie;
import com.fu.cinema.enums.MovieStatus;
import org.springframework.data.domain.Page;

import java.util.List;

public interface MovieService {

    Page<Movie> searchForAdmin(String keyword, Long genreId, MovieStatus status, int page, int size, String sort);

    Movie getById(Long movieId);

    MovieForm getForm(Long movieId);

    void create(MovieForm form);

    void update(Long movieId, MovieForm form);

    /** @return true nếu đã xoá hẳn, false nếu chỉ chuyển STOPPED (BR-06) */
    boolean delete(Long movieId);

    List<Movie> findSchedulable();

    long countShowing();
}
```
📄 **`src/main/java/com/fu/cinema/service/impl/MovieServiceImpl.java`**

```java
package com.fu.cinema.service.impl;

import com.fu.cinema.dto.MovieForm;
import com.fu.cinema.entity.Genre;
import com.fu.cinema.entity.Movie;
import com.fu.cinema.enums.MovieStatus;
import com.fu.cinema.exception.ResourceNotFoundException;
import com.fu.cinema.repository.GenreRepository;
import com.fu.cinema.repository.MovieRepository;
import com.fu.cinema.repository.ShowtimeRepository;
import com.fu.cinema.service.MovieService;
import com.fu.cinema.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MovieServiceImpl implements MovieService {

    private static final Set<String> SORTABLE = Set.of("title", "releaseDate", "duration");

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final ShowtimeRepository showtimeRepository;

    @Override
    public Page<Movie> searchForAdmin(String keyword, Long genreId, MovieStatus status, int page, int size, String sort) {
        String field = SORTABLE.contains(sort) ? sort : "releaseDate";
        Sort order = "title".equals(field) ? Sort.by(field).ascending() : Sort.by(field).descending();
        Set<MovieStatus> statuses = status == null ? EnumSet.allOf(MovieStatus.class) : EnumSet.of(status);
        return movieRepository.search(ValidationUtils.blankToNull(keyword), genreId, statuses,
                PageRequest.of(Math.max(page, 0), size, order));
    }

    @Override
    public Movie getById(Long movieId) {
        return movieRepository.findWithGenreById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Phim", movieId));
    }

    @Override
    public MovieForm getForm(Long movieId) {
        Movie m = getById(movieId);
        MovieForm f = new MovieForm();
        f.setMovieId(m.getMovieId());
        f.setTitle(m.getTitle());
        f.setDirector(m.getDirector());
        f.setDuration(m.getDuration());
        f.setReleaseDate(m.getReleaseDate());
        f.setAgeRating(m.getAgeRating());
        f.setDescription(m.getDescription());
        f.setPosterUrl(m.getPosterUrl());
        f.setGenreId(m.getGenre().getGenreId());
        f.setStatus(m.getStatus());
        return f;
    }

    @Override
    @Transactional
    public void create(MovieForm form) {
        Movie movie = new Movie();
        copy(form, movie);
        movieRepository.save(movie);
    }

    @Override
    @Transactional
    public void update(Long movieId, MovieForm form) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Phim", movieId));
        copy(form, movie);
    }

    @Override
    @Transactional
    public boolean delete(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Phim", movieId));
        if (showtimeRepository.existsByMovie_MovieId(movieId)) {                   // BR-06: soft delete
            movie.setStatus(MovieStatus.STOPPED);
            return false;
        }
        movieRepository.delete(movie);
        return true;
    }

    @Override
    public List<Movie> findSchedulable() {
        return movieRepository.findByStatusNotOrderByTitleAsc(MovieStatus.STOPPED);
    }

    @Override
    public long countShowing() {
        return movieRepository.countByStatus(MovieStatus.SHOWING);
    }

    private void copy(MovieForm form, Movie movie) {
        Genre genre = genreRepository.findById(form.getGenreId())
                .orElseThrow(() -> new ResourceNotFoundException("Thể loại", form.getGenreId()));
        movie.setTitle(form.getTitle().trim());
        movie.setDirector(form.getDirector().trim());
        movie.setDuration(form.getDuration());
        movie.setReleaseDate(form.getReleaseDate());
        movie.setAgeRating(form.getAgeRating());
        movie.setDescription(form.getDescription().trim());
        movie.setPosterUrl(form.getPosterUrl().trim());
        movie.setGenre(genre);
        movie.setStatus(form.getStatus());
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/dto/MovieForm.java \
        src/main/java/com/fu/cinema/service/MovieService.java \
        src/main/java/com/fu/cinema/service/impl/MovieServiceImpl.java
git commit -m "feat(movie): add movie form and service" -m "Refs #9"
```

**Commit 3/3 — `feat(movie): add admin movie list, form and soft delete`**

📄 **`src/main/java/com/fu/cinema/controller/admin/AdminMovieController.java`**

```java
package com.fu.cinema.controller.admin;

import com.fu.cinema.dto.MovieForm;
import com.fu.cinema.enums.AgeRating;
import com.fu.cinema.enums.MovieStatus;
import com.fu.cinema.service.GenreService;
import com.fu.cinema.service.MovieService;
import com.fu.cinema.util.PageUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/admin/movies")
@RequiredArgsConstructor
public class AdminMovieController {

    private static final String FORM_VIEW = "admin/movies/form";

    private final MovieService movieService;
    private final GenreService genreService;

    @GetMapping
    public String list(@RequestParam(required = false) String kw,
                       @RequestParam(required = false) Long genreId,
                       @RequestParam(required = false) MovieStatus status,
                       @RequestParam(defaultValue = "releaseDate") String sort,
                       @RequestParam(defaultValue = "0") int page, Model model) {
        model.addAttribute("movies", movieService.searchForAdmin(kw, genreId, status, page, PageUtils.DEFAULT_SIZE, sort));
        model.addAttribute("genres", genreService.findAll());
        model.addAttribute("statuses", MovieStatus.values());
        model.addAttribute("kw", kw);
        model.addAttribute("genreId", genreId);
        model.addAttribute("status", status);
        model.addAttribute("sort", sort);
        model.addAttribute("pageUrl", PageUtils.currentUrlWithoutPage());
        return "admin/movies/list";
    }

    @GetMapping("/new")
    public String createForm(Model model) {
        MovieForm form = new MovieForm();
        form.setStatus(MovieStatus.COMING_SOON);
        return showForm(form, model);
    }

    @PostMapping("/new")
    public String create(@Valid @ModelAttribute("form") MovieForm form, BindingResult br,
                         Model model, RedirectAttributes ra) {
        if (br.hasErrors()) {
            return showForm(form, model);
        }
        movieService.create(form);
        ra.addFlashAttribute("success", "Đã thêm phim " + form.getTitle());
        return "redirect:/admin/movies";
    }

    @GetMapping("/{id}/edit")
    public String editForm(@PathVariable Long id, Model model) {
        return showForm(movieService.getForm(id), model);
    }

    @PostMapping("/{id}/edit")
    public String update(@PathVariable Long id, @Valid @ModelAttribute("form") MovieForm form, BindingResult br,
                         Model model, RedirectAttributes ra) {
        form.setMovieId(id);
        if (br.hasErrors()) {
            return showForm(form, model);
        }
        movieService.update(id, form);
        ra.addFlashAttribute("success", "Đã cập nhật phim " + form.getTitle());
        return "redirect:/admin/movies";
    }

    @PostMapping("/{id}/delete")
    public String delete(@PathVariable Long id, RedirectAttributes ra) {
        boolean deleted = movieService.delete(id);
        ra.addFlashAttribute("success", deleted
                ? "Đã xoá phim"
                : "Phim đã có suất chiếu nên được chuyển sang trạng thái STOPPED");
        return "redirect:/admin/movies";
    }

    private String showForm(MovieForm form, Model model) {
        model.addAttribute("form", form);
        model.addAttribute("genres", genreService.findAll());
        model.addAttribute("ageRatings", AgeRating.values());
        model.addAttribute("statuses", MovieStatus.values());
        return FORM_VIEW;
    }
}
```
📄 **`src/main/resources/templates/admin/movies/list.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Quản lý phim')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4">
    <div th:replace="~{fragments/layout :: flash}"></div>
    <div class="d-flex justify-content-between mb-3">
        <h3>Quản lý phim</h3>
        <a class="btn btn-primary" th:href="@{/admin/movies/new}">+ Thêm phim</a>
    </div>
    <form class="row g-2 mb-3" method="get" th:action="@{/admin/movies}">
        <div class="col-md-4"><input class="form-control" name="kw" th:value="${kw}" placeholder="Tên phim"></div>
        <div class="col-md-2">
            <select class="form-select" name="genreId">
                <option value="">Thể loại</option>
                <option th:each="g : ${genres}" th:value="${g.genreId}" th:text="${g.genreName}" th:selected="${g.genreId == genreId}"></option>
            </select>
        </div>
        <div class="col-md-2">
            <select class="form-select" name="status">
                <option value="">Trạng thái</option>
                <option th:each="s : ${statuses}" th:value="${s}" th:text="${s}" th:selected="${s == status}"></option>
            </select>
        </div>
        <div class="col-md-2">
            <select class="form-select" name="sort">
                <option value="releaseDate" th:selected="${sort == 'releaseDate'}">Mới khởi chiếu</option>
                <option value="title" th:selected="${sort == 'title'}">Tên A→Z</option>
                <option value="duration" th:selected="${sort == 'duration'}">Thời lượng</option>
            </select>
        </div>
        <div class="col-md-2 d-grid"><button class="btn btn-outline-primary">Lọc</button></div>
    </form>
    <table class="table table-hover align-middle">
        <thead class="table-light"><tr><th>Tên phim</th><th>Thể loại</th><th>Thời lượng</th><th>Khởi chiếu</th><th>Độ tuổi</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>
        <tr th:if="${movies.empty}"><td colspan="7" class="text-center text-muted">Không có dữ liệu</td></tr>
        <tr th:each="m : ${movies.content}">
            <td th:text="${m.title}"></td>
            <td th:text="${m.genre.genreName}"></td>
            <td th:text="|${m.duration} phút|"></td>
            <td th:text="${#temporals.format(m.releaseDate, 'dd/MM/yyyy')}"></td>
            <td th:text="${m.ageRating}"></td>
            <td th:text="${m.status}"></td>
            <td class="text-end text-nowrap">
                <a class="btn btn-sm btn-outline-secondary" th:href="@{/admin/movies/{id}/edit(id=${m.movieId})}">Sửa</a>
                <form class="d-inline" method="post" th:action="@{/admin/movies/{id}/delete(id=${m.movieId})}"
                      onsubmit="return confirm('Xoá phim? Nếu đã có suất chiếu, phim sẽ chuyển sang STOPPED.');">
                    <button class="btn btn-sm btn-outline-danger">Xoá</button>
                </form>
            </td>
        </tr>
        </tbody>
    </table>
    <div th:replace="~{fragments/layout :: pagination(${movies}, ${pageUrl})}"></div>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
📄 **`src/main/resources/templates/admin/movies/form.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Phim')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4" style="max-width: 820px">
    <h3 th:text="${form.movieId == null} ? 'Thêm phim' : 'Sửa phim'"></h3>
    <div th:replace="~{fragments/layout :: flash}"></div>
    <form method="post" th:object="${form}" novalidate class="row g-3"
          th:action="${form.movieId == null} ? @{/admin/movies/new} : @{/admin/movies/{id}/edit(id=${form.movieId})}">
        <div class="col-md-8">
            <label class="form-label">Tên phim</label>
            <input class="form-control" th:field="*{title}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{title}"></div>
        </div>
        <div class="col-md-4">
            <label class="form-label">Thể loại</label>
            <select class="form-select" th:field="*{genreId}" th:errorclass="is-invalid">
                <option value="">-- Chọn --</option>
                <option th:each="g : ${genres}" th:value="${g.genreId}" th:text="${g.genreName}"></option>
            </select>
            <div class="invalid-feedback" th:errors="*{genreId}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Đạo diễn</label>
            <input class="form-control" th:field="*{director}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{director}"></div>
        </div>
        <div class="col-md-3">
            <label class="form-label">Thời lượng (phút)</label>
            <input type="number" class="form-control" th:field="*{duration}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{duration}"></div>
        </div>
        <div class="col-md-3">
            <label class="form-label">Khởi chiếu</label>
            <input type="date" class="form-control" th:field="*{releaseDate}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{releaseDate}"></div>
        </div>
        <div class="col-md-3">
            <label class="form-label">Độ tuổi</label>
            <select class="form-select" th:field="*{ageRating}" th:errorclass="is-invalid">
                <option value="">-- Chọn --</option>
                <option th:each="a : ${ageRatings}" th:value="${a}" th:text="${a}"></option>
            </select>
            <div class="invalid-feedback" th:errors="*{ageRating}"></div>
        </div>
        <div class="col-md-3">
            <label class="form-label">Trạng thái</label>
            <select class="form-select" th:field="*{status}">
                <option th:each="s : ${statuses}" th:value="${s}" th:text="${s}"></option>
            </select>
        </div>
        <div class="col-md-6">
            <label class="form-label">Poster URL</label>
            <input class="form-control" th:field="*{posterUrl}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{posterUrl}"></div>
        </div>
        <div class="col-12">
            <label class="form-label">Mô tả</label>
            <textarea class="form-control" rows="4" th:field="*{description}" th:errorclass="is-invalid"></textarea>
            <div class="invalid-feedback" th:errors="*{description}"></div>
        </div>
        <div class="col-12">
            <button class="btn btn-primary">Lưu</button>
            <a class="btn btn-secondary" th:href="@{/admin/movies}">Huỷ</a>
        </div>
    </form>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
Trong `src/main/resources/templates/fragments/layout.html` thay **đúng dòng comment** `<!-- [..] menu Quản lý phim ... -->` bằng:

```html
                    <li class="nav-item"><a class="nav-link" th:href="@{/admin/movies}">Quản lý phim</a></li>
```

```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/controller/admin/AdminMovieController.java \
        src/main/resources/templates/admin/movies/list.html \
        src/main/resources/templates/admin/movies/form.html \
        src/main/resources/templates/fragments/layout.html
git commit -m "feat(movie): add admin movie list, form and soft delete" -m "Refs #9"
```

#### #9.3 — [C] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] Lọc tên + thể loại + trạng thái kết hợp; chuyển trang giữ bộ lọc; sắp xếp theo tên
- [ ] Thêm phim thời lượng 20 → lỗi cạnh ô
- [ ] Xoá phim có suất → STOPPED (test xong sửa lại SHOWING); xoá phim mới thêm → mất hẳn

#### #9.4 — [C] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/9-movie-crud
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/9-movie-crud`**.

- **Title:** `feat(movie): movie management with filters and soft delete`
- **Reviewers:** D  ·  **Assignees:** C  ·  **Labels:** `type: feature`, `module: movie`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 1 — Admin core`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
Admin quản lý phim: danh sách có tìm/lọc/phân trang/sắp xếp, thêm/sửa phim, xoá phim (xoá mềm khi đã có suất chiếu).

Các file chính: `MovieRepository.java`, `MovieForm.java`, `MovieService.java`, `MovieServiceImpl.java`, `AdminMovieController.java`, `list.html`, `form.html`

Closes #9

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. Lọc tên + thể loại + trạng thái kết hợp; chuyển trang giữ bộ lọc; sắp xếp theo tên
2. Thêm phim thời lượng 20 → lỗi cạnh ô
3. Xoá phim có suất → STOPPED (test xong sửa lại SHOWING); xoá phim mới thêm → mất hẳn

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#9** sang **In review**. Nhắn reviewer link PR.

#### #9.5 — [D] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/9-movie-crud
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] Q2 tham số tuỳ chọn, có `countQuery`
- [ ] Tham số `sort` có whitelist
- [ ] BR-06 soft delete
- [ ] `findSchedulable()` loại phim STOPPED (D cần cho #11)

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": Lọc tên + thể loại + trạng thái kết hợp; chuyển trang giữ bộ lọc; sắp xếp theo tên; Thêm phim thời lượng 20 — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: C sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #9"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #9.6 — [C] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(movie): movie management with filters and soft delete (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #9` → **Confirm squash and merge**.
4. Kiểm tra: issue #9 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/9-movie-crud
git fetch --prune
```

✅ **Xong #9:** [ ] code đủ tiêu chí · [ ] 3 commit đúng chuẩn có `Refs #9` · [ ] PR có `Closes #9`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

### #11 — Showtime CRUD + overlap check (TODO 23) (D)

| | |
|---|---|
| 👤 Người làm | **D** |
| 👀 Reviewer | **B** |
| Nhánh | `feature/11-showtime-crud` |
| Milestone | `Sprint 1 — Admin core` |
| Cần merge trước | #9, #10 |
| Tiêu đề PR | `feat(showtime): showtime scheduling with overlap validation` |

#### #11.1 — [D] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#11** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/11-showtime-crud
```

#### #11.2 — [D] Code & commit

**Commit 1/4 — `feat(showtime): add overlap check and today statistics queries`**

📄 **`src/main/java/com/fu/cinema/repository/ShowtimeRepository.java`**

```java
package com.fu.cinema.repository;

import com.fu.cinema.dto.RoomShowtimeCount;
import com.fu.cinema.entity.Showtime;
import com.fu.cinema.enums.ShowtimeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    // ===== Derived query =====
    boolean existsByMovie_MovieId(Long movieId);

    boolean existsByRoom_RoomId(Long roomId);

    @EntityGraph(attributePaths = "room")
    List<Showtime> findByMovie_MovieIdAndStatusAndStartTimeAfterOrderByStartTimeAsc(
            Long movieId, ShowtimeStatus status, LocalDateTime after);

    // ===== Danh sách suất chiếu cho Admin (lọc tuỳ chọn) =====
    @Query(value = """
            SELECT s FROM Showtime s JOIN FETCH s.movie m JOIN FETCH s.room r
            WHERE (:movieId IS NULL OR m.movieId = :movieId)
              AND (:roomId IS NULL OR r.roomId = :roomId)
              AND (:from IS NULL OR s.startTime >= :from)
              AND (:to IS NULL OR s.startTime < :to)
            """,
            countQuery = """
            SELECT COUNT(s) FROM Showtime s
            WHERE (:movieId IS NULL OR s.movie.movieId = :movieId)
              AND (:roomId IS NULL OR s.room.roomId = :roomId)
              AND (:from IS NULL OR s.startTime >= :from)
              AND (:to IS NULL OR s.startTime < :to)
            """)
    Page<Showtime> search(@Param("movieId") Long movieId,
                          @Param("roomId") Long roomId,
                          @Param("from") LocalDateTime from,
                          @Param("to") LocalDateTime to,
                          Pageable pageable);

    @Query("SELECT s FROM Showtime s JOIN FETCH s.movie JOIN FETCH s.room WHERE s.showtimeId = :id")
    Optional<Showtime> findDetailById(@Param("id") Long id);

    // ===== Q3: suất chiếu chồng giờ trong cùng phòng (BR-08) =====
    @Query("""
            SELECT s FROM Showtime s JOIN FETCH s.movie
            WHERE s.room.roomId = :roomId
              AND s.status <> com.fu.cinema.enums.ShowtimeStatus.CANCELLED
              AND s.startTime < :end
              AND s.endTime > :start
              AND (:excludeId IS NULL OR s.showtimeId <> :excludeId)
            """)
    List<Showtime> findOverlapping(@Param("roomId") Long roomId,
                                   @Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end,
                                   @Param("excludeId") Long excludeId);

    // ===== Q11: native SQL Server — số suất chiếu hôm nay theo phòng (dashboard) =====
    @Query(value = """
            SELECT r.room_name AS roomName, COUNT(s.showtime_id) AS showtimeCount
            FROM rooms r
            LEFT JOIN showtimes s
                   ON s.room_id = r.room_id
                  AND s.status = 'OPEN'
                  AND CAST(s.start_time AS DATE) = CAST(GETDATE() AS DATE)
            GROUP BY r.room_name
            ORDER BY r.room_name
            """, nativeQuery = true)
    List<RoomShowtimeCount> countTodayShowtimesByRoom();
}
```
📄 **`src/main/java/com/fu/cinema/dto/RoomShowtimeCount.java`**

```java
package com.fu.cinema.dto;

// Interface projection cho native query: tên getter khớp alias trong SQL
public interface RoomShowtimeCount {
    String getRoomName();

    Long getShowtimeCount();
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/repository/ShowtimeRepository.java \
        src/main/java/com/fu/cinema/dto/RoomShowtimeCount.java
git commit -m "feat(showtime): add overlap check and today statistics queries" -m "Refs #11"
```

**Commit 2/4 — `feat(booking): add bulk cancel bookings of a showtime`**

Q9 nằm trong `BookingRepository` (file của B) → **nhắn B trước**, thêm ở cuối file:

```java
// Import cần có (thêm nếu file chưa có):
// import org.springframework.data.jpa.repository.Modifying;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;

// Thêm vào CUỐI interface BookingRepository (trước dấu } cuối):

    // ===== Q9: huỷ hàng loạt đơn của một suất chiếu (BR-09) =====
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Booking b SET b.status = com.fu.cinema.enums.BookingStatus.CANCELLED
            WHERE b.showtime.showtimeId = :showtimeId
              AND b.status <> com.fu.cinema.enums.BookingStatus.CANCELLED
            """)
    int cancelAllByShowtime(@Param("showtimeId") Long showtimeId);
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/repository/BookingRepository.java
git commit -m "feat(booking): add bulk cancel bookings of a showtime" -m "Refs #11"
```

**Commit 3/4 — `feat(showtime): add showtime service with schedule validation`**

📄 **`src/main/java/com/fu/cinema/dto/ShowtimeForm.java`**

```java
package com.fu.cinema.dto;

import com.fu.cinema.enums.ShowtimeStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ShowtimeForm {

    private Long showtimeId;

    @NotNull(message = "Vui lòng chọn phim")
    private Long movieId;

    @NotNull(message = "Vui lòng chọn phòng")
    private Long roomId;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")          // khớp định dạng của <input type="datetime-local">
    private LocalDateTime startTime;

    // Để trống → hệ thống tự tính = StartTime + Duration + 15 phút dọn phòng
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime endTime;

    @NotNull(message = "Giá vé không được để trống")
    @DecimalMin(value = "1000", message = "Giá vé tối thiểu 1.000đ")
    private BigDecimal ticketPrice;

    @NotNull
    private ShowtimeStatus status = ShowtimeStatus.OPEN;
}
```
📄 **`src/main/java/com/fu/cinema/service/ShowtimeService.java`**

```java
package com.fu.cinema.service;

import com.fu.cinema.dto.RoomShowtimeCount;
import com.fu.cinema.dto.ShowtimeForm;
import com.fu.cinema.entity.Showtime;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;

public interface ShowtimeService {

    Page<Showtime> search(Long movieId, Long roomId, LocalDate date, int page, int size);

    ShowtimeForm getForm(Long showtimeId);

    void create(ShowtimeForm form);

    void update(Long showtimeId, ShowtimeForm form);

    /** @return true nếu đã xoá hẳn, false nếu chỉ huỷ suất chiếu (BR-09) */
    boolean delete(Long showtimeId);

    List<Showtime> findUpcomingByMovie(Long movieId);

    List<RoomShowtimeCount> countTodayByRoom();

    // [D] issue #14 thêm SeatMap getSeatMap(Long showtimeId);
}
```
📄 **`src/main/java/com/fu/cinema/service/impl/ShowtimeServiceImpl.java`**

```java
package com.fu.cinema.service.impl;

import com.fu.cinema.dto.RoomShowtimeCount;
import com.fu.cinema.dto.ShowtimeForm;
import com.fu.cinema.entity.Movie;
import com.fu.cinema.entity.Room;
import com.fu.cinema.entity.Showtime;
import com.fu.cinema.enums.MovieStatus;
import com.fu.cinema.enums.RoomStatus;
import com.fu.cinema.enums.ShowtimeStatus;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.exception.ResourceNotFoundException;
import com.fu.cinema.repository.*;
import com.fu.cinema.service.ShowtimeService;
import com.fu.cinema.util.DateUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShowtimeServiceImpl implements ShowtimeService {

    static final int CLEANING_MINUTES = 15;

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    @Override
    public Page<Showtime> search(Long movieId, Long roomId, LocalDate date, int page, int size) {
        LocalDateTime from = date == null ? null : date.atStartOfDay();
        LocalDateTime to = date == null ? null : date.plusDays(1).atStartOfDay();
        return showtimeRepository.search(movieId, roomId, from, to,
                PageRequest.of(Math.max(page, 0), size, Sort.by("startTime").descending()));
    }

    @Override
    public ShowtimeForm getForm(Long showtimeId) {
        Showtime s = findDetail(showtimeId);
        ShowtimeForm f = new ShowtimeForm();
        f.setShowtimeId(s.getShowtimeId());
        f.setMovieId(s.getMovie().getMovieId());
        f.setRoomId(s.getRoom().getRoomId());
        f.setStartTime(s.getStartTime());
        f.setEndTime(s.getEndTime());
        f.setTicketPrice(s.getTicketPrice());
        f.setStatus(s.getStatus());
        return f;
    }

    @Override
    @Transactional
    public void create(ShowtimeForm form) {
        Showtime showtime = new Showtime();
        apply(form, showtime, null);
        showtimeRepository.save(showtime);
    }

    @Override
    @Transactional
    public void update(Long showtimeId, ShowtimeForm form) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Suất chiếu", showtimeId));
        boolean hasBookings = bookingRepository.existsByShowtime_ShowtimeId(showtimeId);
        if (hasBookings && (!showtime.getMovie().getMovieId().equals(form.getMovieId())
                || !showtime.getRoom().getRoomId().equals(form.getRoomId()))) {
            throw new BusinessException("Suất chiếu đã có người đặt vé: không được đổi phim hoặc phòng");
        }
        apply(form, showtime, showtimeId);
    }

    @Override
    @Transactional
    public boolean delete(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Suất chiếu", showtimeId));
        if (bookingRepository.existsByShowtime_ShowtimeId(showtimeId)) {           // BR-09
            showtime.setStatus(ShowtimeStatus.CANCELLED);
            bookingRepository.cancelAllByShowtime(showtimeId);                      // Q9 — @Modifying
            return false;
        }
        showtimeRepository.delete(showtime);
        return true;
    }

    @Override
    public List<Showtime> findUpcomingByMovie(Long movieId) {
        return showtimeRepository.findByMovie_MovieIdAndStatusAndStartTimeAfterOrderByStartTimeAsc(
                movieId, ShowtimeStatus.OPEN, LocalDateTime.now());
    }

    @Override
    public List<RoomShowtimeCount> countTodayByRoom() {
        return showtimeRepository.countTodayShowtimesByRoom();
    }

    // ================= helpers =================

    private Showtime findDetail(Long id) {
        return showtimeRepository.findDetailById(id).orElseThrow(() -> new ResourceNotFoundException("Suất chiếu", id));
    }

    /** Kiểm tra BR-07, BR-08 rồi gán dữ liệu từ form vào entity. */
    private void apply(ShowtimeForm form, Showtime showtime, Long excludeId) {
        Movie movie = movieRepository.findById(form.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Phim", form.getMovieId()));
        Room room = roomRepository.findById(form.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Phòng chiếu", form.getRoomId()));

        if (movie.getStatus() == MovieStatus.STOPPED) {
            throw new BusinessException("Phim \"" + movie.getTitle() + "\" đã ngừng chiếu");
        }
        if (room.getStatus() != RoomStatus.ACTIVE) {
            throw new BusinessException("Phòng \"" + room.getRoomName() + "\" đang bảo trì");
        }

        LocalDateTime start = form.getStartTime();
        LocalDateTime end = form.getEndTime() != null
                ? form.getEndTime()
                : start.plusMinutes(movie.getDuration() + CLEANING_MINUTES);   // gợi ý EndTime
        if (!start.isBefore(end)) {
            throw new BusinessException("Giờ bắt đầu phải trước giờ kết thúc");
        }
        if (end.isBefore(start.plusMinutes(movie.getDuration()))) {
            throw new BusinessException("Giờ kết thúc phải sau giờ bắt đầu ít nhất " + movie.getDuration() + " phút (thời lượng phim)");
        }

        if (form.getStatus() != ShowtimeStatus.CANCELLED) {
            List<Showtime> overlaps = showtimeRepository.findOverlapping(room.getRoomId(), start, end, excludeId);
            if (!overlaps.isEmpty()) {                                                 // BR-08
                Showtime o = overlaps.get(0);
                throw new BusinessException("Trùng lịch với suất \"" + o.getMovie().getTitle() + "\" ("
                        + DateUtils.format(o.getStartTime()) + " – " + DateUtils.format(o.getEndTime())
                        + ") tại " + room.getRoomName());
            }
        }

        showtime.setMovie(movie);
        showtime.setRoom(room);
        showtime.setStartTime(start);
        showtime.setEndTime(end);
        showtime.setTicketPrice(form.getTicketPrice());
        showtime.setStatus(form.getStatus());
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/dto/ShowtimeForm.java \
        src/main/java/com/fu/cinema/service/ShowtimeService.java \
        src/main/java/com/fu/cinema/service/impl/ShowtimeServiceImpl.java
git commit -m "feat(showtime): add showtime service with schedule validation" -m "Refs #11"
```

**Commit 4/4 — `feat(showtime): add admin showtime list and form pages`**

📄 **`src/main/java/com/fu/cinema/controller/admin/AdminShowtimeController.java`**

```java
package com.fu.cinema.controller.admin;

import com.fu.cinema.dto.ShowtimeForm;
import com.fu.cinema.enums.ShowtimeStatus;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.service.MovieService;
import com.fu.cinema.service.RoomService;
import com.fu.cinema.service.ShowtimeService;
import com.fu.cinema.util.PageUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;

@Controller
@RequestMapping("/admin/showtimes")
@RequiredArgsConstructor
public class AdminShowtimeController {

    private static final String FORM_VIEW = "admin/showtimes/form";

    private final ShowtimeService showtimeService;
    private final MovieService movieService;
    private final RoomService roomService;

    @GetMapping
    public String list(@RequestParam(required = false) Long movieId,
                       @RequestParam(required = false) Long roomId,
                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                       @RequestParam(defaultValue = "0") int page, Model model) {
        model.addAttribute("showtimes", showtimeService.search(movieId, roomId, date, page, PageUtils.DEFAULT_SIZE));
        model.addAttribute("movies", movieService.findSchedulable());
        model.addAttribute("rooms", roomService.findAll());
        model.addAttribute("movieId", movieId);
        model.addAttribute("roomId", roomId);
        model.addAttribute("date", date);
        model.addAttribute("pageUrl", PageUtils.currentUrlWithoutPage());
        return "admin/showtimes/list";
    }

    @GetMapping("/new")
    public String createForm(Model model) {
        return showForm(new ShowtimeForm(), model);
    }

    @PostMapping("/new")
    public String create(@Valid @ModelAttribute("form") ShowtimeForm form, BindingResult br,
                         Model model, RedirectAttributes ra) {
        if (br.hasErrors()) {
            return showForm(form, model);
        }
        try {
            showtimeService.create(form);
        } catch (BusinessException e) {
            model.addAttribute("error", e.getMessage());
            return showForm(form, model);
        }
        ra.addFlashAttribute("success", "Đã thêm suất chiếu");
        return "redirect:/admin/showtimes";
    }

    @GetMapping("/{id}/edit")
    public String editForm(@PathVariable Long id, Model model) {
        return showForm(showtimeService.getForm(id), model);
    }

    @PostMapping("/{id}/edit")
    public String update(@PathVariable Long id, @Valid @ModelAttribute("form") ShowtimeForm form, BindingResult br,
                         Model model, RedirectAttributes ra) {
        form.setShowtimeId(id);
        if (br.hasErrors()) {
            return showForm(form, model);
        }
        try {
            showtimeService.update(id, form);
        } catch (BusinessException e) {
            model.addAttribute("error", e.getMessage());
            return showForm(form, model);
        }
        ra.addFlashAttribute("success", "Đã cập nhật suất chiếu");
        return "redirect:/admin/showtimes";
    }

    @PostMapping("/{id}/delete")
    public String delete(@PathVariable Long id, RedirectAttributes ra) {
        boolean deleted = showtimeService.delete(id);
        ra.addFlashAttribute("success", deleted
                ? "Đã xoá suất chiếu"
                : "Suất chiếu đã có đơn đặt vé: đã huỷ suất chiếu và toàn bộ đơn liên quan");
        return "redirect:/admin/showtimes";
    }

    private String showForm(ShowtimeForm form, Model model) {
        model.addAttribute("form", form);
        model.addAttribute("movies", movieService.findSchedulable());
        model.addAttribute("rooms", roomService.findActive());
        model.addAttribute("statuses", ShowtimeStatus.values());
        return FORM_VIEW;
    }
}
```
📄 **`src/main/resources/templates/admin/showtimes/list.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Suất chiếu')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4">
    <div th:replace="~{fragments/layout :: flash}"></div>
    <div class="d-flex justify-content-between mb-3">
        <h3>Suất chiếu</h3>
        <a class="btn btn-primary" th:href="@{/admin/showtimes/new}">+ Thêm suất chiếu</a>
    </div>
    <form class="row g-2 mb-3" method="get" th:action="@{/admin/showtimes}">
        <div class="col-md-3"><input type="date" class="form-control" name="date" th:value="${date}"></div>
        <div class="col-md-4">
            <select class="form-select" name="movieId">
                <option value="">Tất cả phim</option>
                <option th:each="m : ${movies}" th:value="${m.movieId}" th:text="${m.title}" th:selected="${m.movieId == movieId}"></option>
            </select>
        </div>
        <div class="col-md-3">
            <select class="form-select" name="roomId">
                <option value="">Tất cả phòng</option>
                <option th:each="r : ${rooms}" th:value="${r.roomId}" th:text="${r.roomName}" th:selected="${r.roomId == roomId}"></option>
            </select>
        </div>
        <div class="col-md-2 d-grid"><button class="btn btn-outline-primary">Lọc</button></div>
    </form>
    <table class="table table-hover align-middle">
        <thead class="table-light"><tr><th>Phim</th><th>Phòng</th><th>Bắt đầu</th><th>Kết thúc</th><th>Giá vé</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>
        <tr th:if="${showtimes.empty}"><td colspan="7" class="text-center text-muted">Không có dữ liệu</td></tr>
        <tr th:each="s : ${showtimes.content}">
            <td th:text="${s.movie.title}"></td>
            <td th:text="${s.room.roomName}"></td>
            <td th:text="${#temporals.format(s.startTime, 'dd/MM/yyyy HH:mm')}"></td>
            <td th:text="${#temporals.format(s.endTime, 'HH:mm')}"></td>
            <td th:text="${#numbers.formatDecimal(s.ticketPrice, 0, 'COMMA', 0, 'POINT')} + 'đ'"></td>
            <td th:text="${s.status}"></td>
            <td class="text-end text-nowrap">
                <a class="btn btn-sm btn-outline-secondary" th:href="@{/admin/showtimes/{id}/edit(id=${s.showtimeId})}">Sửa</a>
                <form class="d-inline" method="post" th:action="@{/admin/showtimes/{id}/delete(id=${s.showtimeId})}"
                      onsubmit="return confirm('Xoá suất chiếu? Nếu đã có đơn, suất chiếu và các đơn sẽ bị huỷ.');">
                    <button class="btn btn-sm btn-outline-danger">Xoá</button>
                </form>
            </td>
        </tr>
        </tbody>
    </table>
    <div th:replace="~{fragments/layout :: pagination(${showtimes}, ${pageUrl})}"></div>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
📄 **`src/main/resources/templates/admin/showtimes/form.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Suất chiếu')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4" style="max-width: 720px">
    <h3 th:text="${form.showtimeId == null} ? 'Thêm suất chiếu' : 'Sửa suất chiếu'"></h3>
    <div th:replace="~{fragments/layout :: flash}"></div>
    <form method="post" th:object="${form}" novalidate class="row g-3"
          th:action="${form.showtimeId == null} ? @{/admin/showtimes/new} : @{/admin/showtimes/{id}/edit(id=${form.showtimeId})}">
        <div class="col-md-6">
            <label class="form-label">Phim</label>
            <select class="form-select" th:field="*{movieId}" th:errorclass="is-invalid">
                <option value="">-- Chọn --</option>
                <option th:each="m : ${movies}" th:value="${m.movieId}" th:text="|${m.title} (${m.duration}')|"></option>
            </select>
            <div class="invalid-feedback" th:errors="*{movieId}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Phòng (đang hoạt động)</label>
            <select class="form-select" th:field="*{roomId}" th:errorclass="is-invalid">
                <option value="">-- Chọn --</option>
                <option th:each="r : ${rooms}" th:value="${r.roomId}" th:text="|${r.roomName} (${r.roomType.label})|"></option>
            </select>
            <div class="invalid-feedback" th:errors="*{roomId}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Bắt đầu</label>
            <input type="datetime-local" class="form-control" th:field="*{startTime}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{startTime}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Kết thúc <small class="text-muted">(để trống = thời lượng + 15 phút)</small></label>
            <input type="datetime-local" class="form-control" th:field="*{endTime}">
        </div>
        <div class="col-md-6">
            <label class="form-label">Giá vé (đ)</label>
            <input type="number" class="form-control" th:field="*{ticketPrice}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{ticketPrice}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Trạng thái</label>
            <select class="form-select" th:field="*{status}">
                <option th:each="s : ${statuses}" th:value="${s}" th:text="${s}"></option>
            </select>
        </div>
        <div class="col-12">
            <button class="btn btn-primary">Lưu</button>
            <a class="btn btn-secondary" th:href="@{/admin/showtimes}">Huỷ</a>
        </div>
    </form>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
Trong `src/main/resources/templates/fragments/layout.html` thay **đúng dòng comment** `<!-- [..] menu Suất chiếu ... -->` bằng:

```html
                    <li class="nav-item"><a class="nav-link" th:href="@{/admin/showtimes}">Suất chiếu</a></li>
```

```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/controller/admin/AdminShowtimeController.java \
        src/main/resources/templates/admin/showtimes/list.html \
        src/main/resources/templates/admin/showtimes/form.html \
        src/main/resources/templates/fragments/layout.html
git commit -m "feat(showtime): add admin showtime list and form pages" -m "Refs #11"
```

#### #11.3 — [D] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] Thêm "Chú Mèo Phiêu Lưu", Room 01, ngày mai 17:00, bỏ trống kết thúc → kết thúc 18:50
- [ ] Thêm suất Room 01 ngày mai 09:30 → lỗi trùng với "Biệt Đội Siêu Tốc" 09:00–11:15
- [ ] Kết thúc trước bắt đầu / ngắn hơn thời lượng phim → lỗi; Room 03 không có trong dropdown
- [ ] Xoá suất có đơn → suất và các đơn chuyển CANCELLED; xoá suất mới → mất hẳn

#### #11.4 — [D] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/11-showtime-crud
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/11-showtime-crud`**.

- **Title:** `feat(showtime): showtime scheduling with overlap validation`
- **Reviewers:** B  ·  **Assignees:** D  ·  **Labels:** `type: feature`, `module: showtime`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 1 — Admin core`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
CRUD suất chiếu, chống trùng giờ trong cùng phòng, xoá/huỷ suất kèm huỷ đơn.

Các file chính: `ShowtimeRepository.java`, `RoomShowtimeCount.java`, `ShowtimeForm.java`, `ShowtimeService.java`, `ShowtimeServiceImpl.java`, `AdminShowtimeController.java`, `list.html`, `form.html`

Closes #11

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. Thêm "Chú Mèo Phiêu Lưu", Room 01, ngày mai 17:00, bỏ trống kết thúc → kết thúc 18:50
2. Thêm suất Room 01 ngày mai 09:30 → lỗi trùng với "Biệt Đội Siêu Tốc" 09:00–11:15
3. Kết thúc trước bắt đầu / ngắn hơn thời lượng phim → lỗi; Room 03 không có trong dropdown
4. Xoá suất có đơn → suất và các đơn chuyển CANCELLED; xoá suất mới → mất hẳn

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#11** sang **In review**. Nhắn reviewer link PR.

#### #11.5 — [B] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/11-showtime-crud
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] Điều kiện chồng giờ `start < otherEnd AND end > otherStart`, loại trừ suất đang sửa và suất CANCELLED
- [ ] Huỷ suất + huỷ đơn trong 1 transaction (`@Modifying`)
- [ ] BR-07 đủ 4 điều kiện

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": Thêm "Chú Mèo Phiêu Lưu", Room 01, ngày mai 17:00, bỏ trống kết thúc; Thêm suất Room 01 ngày mai 09:30 — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: D sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #11"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #11.6 — [D] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(showtime): showtime scheduling with overlap validation (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #11` → **Confirm squash and merge**.
4. Kiểm tra: issue #11 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/11-showtime-crud
git fetch --prune
```

✅ **Xong #11:** [ ] code đủ tiêu chí · [ ] 4 commit đúng chuẩn có `Refs #11` · [ ] PR có `Closes #11`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

## Sprint: Sprint 2 — Customer flow

### #13 — Home & movie detail (TODO 27) (C)

| | |
|---|---|
| 👤 Người làm | **C** |
| 👀 Reviewer | **D** |
| Nhánh | `feature/13-home-movie-detail` |
| Milestone | `Sprint 2 — Customer flow` |
| Cần merge trước | #8, #9, #11 |
| Tiêu đề PR | `feat(movie): home page and movie detail` |

#### #13.1 — [C] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#13** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/13-home-movie-detail
```

#### #13.2 — [C] Code & commit

**Commit 1/3 — `feat(movie): add customer movie search`**

📄 **`src/main/java/com/fu/cinema/service/MovieService.java`**

```java
package com.fu.cinema.service;

import com.fu.cinema.dto.MovieForm;
import com.fu.cinema.entity.Movie;
import com.fu.cinema.enums.MovieStatus;
import org.springframework.data.domain.Page;

import java.util.List;

public interface MovieService {

    Page<Movie> searchForAdmin(String keyword, Long genreId, MovieStatus status, int page, int size, String sort);

    Page<Movie> searchForCustomer(String keyword, Long genreId, int page, int size);

    Movie getById(Long movieId);

    /** Dành cho khách: phim STOPPED coi như không tồn tại (BR-06) */
    Movie getForCustomer(Long movieId);

    MovieForm getForm(Long movieId);

    void create(MovieForm form);

    void update(Long movieId, MovieForm form);

    /** @return true nếu đã xoá hẳn, false nếu chỉ chuyển STOPPED (BR-06) */
    boolean delete(Long movieId);

    List<Movie> findSchedulable();

    long countShowing();
}
```
📄 **`src/main/java/com/fu/cinema/service/impl/MovieServiceImpl.java`**

```java
package com.fu.cinema.service.impl;

import com.fu.cinema.dto.MovieForm;
import com.fu.cinema.entity.Genre;
import com.fu.cinema.entity.Movie;
import com.fu.cinema.enums.MovieStatus;
import com.fu.cinema.exception.ResourceNotFoundException;
import com.fu.cinema.repository.GenreRepository;
import com.fu.cinema.repository.MovieRepository;
import com.fu.cinema.repository.ShowtimeRepository;
import com.fu.cinema.service.MovieService;
import com.fu.cinema.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MovieServiceImpl implements MovieService {

    private static final Set<String> SORTABLE = Set.of("title", "releaseDate", "duration");

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final ShowtimeRepository showtimeRepository;

    @Override
    public Page<Movie> searchForAdmin(String keyword, Long genreId, MovieStatus status, int page, int size, String sort) {
        String field = SORTABLE.contains(sort) ? sort : "releaseDate";
        Sort order = "title".equals(field) ? Sort.by(field).ascending() : Sort.by(field).descending();
        Set<MovieStatus> statuses = status == null ? EnumSet.allOf(MovieStatus.class) : EnumSet.of(status);
        return movieRepository.search(ValidationUtils.blankToNull(keyword), genreId, statuses,
                PageRequest.of(Math.max(page, 0), size, order));
    }

    @Override
    public Page<Movie> searchForCustomer(String keyword, Long genreId, int page, int size) {
        // Khách hàng không thấy phim STOPPED (BR-06)
        return movieRepository.search(ValidationUtils.blankToNull(keyword), genreId,
                EnumSet.of(MovieStatus.SHOWING, MovieStatus.COMING_SOON),
                PageRequest.of(Math.max(page, 0), size, Sort.by("releaseDate").descending()));
    }

    @Override
    public Movie getById(Long movieId) {
        return movieRepository.findWithGenreById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Phim", movieId));
    }

    @Override
    public Movie getForCustomer(Long movieId) {
        Movie movie = getById(movieId);
        if (movie.getStatus() == MovieStatus.STOPPED) {                             // BR-06
            throw new ResourceNotFoundException("Phim", movieId);
        }
        return movie;
    }

    @Override
    public MovieForm getForm(Long movieId) {
        Movie m = getById(movieId);
        MovieForm f = new MovieForm();
        f.setMovieId(m.getMovieId());
        f.setTitle(m.getTitle());
        f.setDirector(m.getDirector());
        f.setDuration(m.getDuration());
        f.setReleaseDate(m.getReleaseDate());
        f.setAgeRating(m.getAgeRating());
        f.setDescription(m.getDescription());
        f.setPosterUrl(m.getPosterUrl());
        f.setGenreId(m.getGenre().getGenreId());
        f.setStatus(m.getStatus());
        return f;
    }

    @Override
    @Transactional
    public void create(MovieForm form) {
        Movie movie = new Movie();
        copy(form, movie);
        movieRepository.save(movie);
    }

    @Override
    @Transactional
    public void update(Long movieId, MovieForm form) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Phim", movieId));
        copy(form, movie);
    }

    @Override
    @Transactional
    public boolean delete(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Phim", movieId));
        if (showtimeRepository.existsByMovie_MovieId(movieId)) {                   // BR-06: soft delete
            movie.setStatus(MovieStatus.STOPPED);
            return false;
        }
        movieRepository.delete(movie);
        return true;
    }

    @Override
    public List<Movie> findSchedulable() {
        return movieRepository.findByStatusNotOrderByTitleAsc(MovieStatus.STOPPED);
    }

    @Override
    public long countShowing() {
        return movieRepository.countByStatus(MovieStatus.SHOWING);
    }

    private void copy(MovieForm form, Movie movie) {
        Genre genre = genreRepository.findById(form.getGenreId())
                .orElseThrow(() -> new ResourceNotFoundException("Thể loại", form.getGenreId()));
        movie.setTitle(form.getTitle().trim());
        movie.setDirector(form.getDirector().trim());
        movie.setDuration(form.getDuration());
        movie.setReleaseDate(form.getReleaseDate());
        movie.setAgeRating(form.getAgeRating());
        movie.setDescription(form.getDescription().trim());
        movie.setPosterUrl(form.getPosterUrl().trim());
        movie.setGenre(genre);
        movie.setStatus(form.getStatus());
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/service/MovieService.java \
        src/main/java/com/fu/cinema/service/impl/MovieServiceImpl.java
git commit -m "feat(movie): add customer movie search" -m "Refs #13"
```

**Commit 2/3 — `feat(review): add rating summary query`**

📄 **`src/main/java/com/fu/cinema/repository/ReviewRepository.java`**

```java
package com.fu.cinema.repository;

import com.fu.cinema.dto.RatingSummary;
import com.fu.cinema.entity.Review;
import com.fu.cinema.entity.ReviewId;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, ReviewId> {

    @EntityGraph(attributePaths = "customer")
    List<Review> findByMovie_MovieIdOrderByReviewDateDesc(Long movieId);

    // ===== Q10: điểm trung bình & số lượt đánh giá (interface projection) =====
    @Query("""
            SELECT AVG(r.rating) AS average, COUNT(r) AS total
            FROM Review r WHERE r.movie.movieId = :movieId
            """)
    RatingSummary summarize(@Param("movieId") Long movieId);
}
```
📄 **`src/main/java/com/fu/cinema/dto/RatingSummary.java`**

```java
package com.fu.cinema.dto;

public interface RatingSummary {
    Double getAverage();

    Long getTotal();
}
```
📄 **`src/main/java/com/fu/cinema/service/ReviewService.java`**

```java
package com.fu.cinema.service;

import com.fu.cinema.dto.RatingSummary;
import com.fu.cinema.entity.Review;

import java.util.List;

public interface ReviewService {

    List<Review> findByMovie(Long movieId);

    RatingSummary summarize(Long movieId);

    // [C] issue #18 (bonus) thêm canReview, getForm, save
}
```
📄 **`src/main/java/com/fu/cinema/service/impl/ReviewServiceImpl.java`**

```java
package com.fu.cinema.service.impl;

import com.fu.cinema.dto.RatingSummary;
import com.fu.cinema.entity.Review;
import com.fu.cinema.repository.ReviewRepository;
import com.fu.cinema.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;

    @Override
    public List<Review> findByMovie(Long movieId) {
        return reviewRepository.findByMovie_MovieIdOrderByReviewDateDesc(movieId);
    }

    @Override
    public RatingSummary summarize(Long movieId) {
        return reviewRepository.summarize(movieId);
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/repository/ReviewRepository.java \
        src/main/java/com/fu/cinema/dto/RatingSummary.java \
        src/main/java/com/fu/cinema/service/ReviewService.java \
        src/main/java/com/fu/cinema/service/impl/ReviewServiceImpl.java
git commit -m "feat(review): add rating summary query" -m "Refs #13"
```

**Commit 3/3 — `feat(movie): add home page and movie detail with upcoming showtimes`**

📄 **`src/main/java/com/fu/cinema/controller/HomeController.java`**

```java
package com.fu.cinema.controller;

import com.fu.cinema.entity.Movie;
import com.fu.cinema.entity.Showtime;
import com.fu.cinema.service.GenreService;
import com.fu.cinema.service.MovieService;
import com.fu.cinema.service.ReviewService;
import com.fu.cinema.service.ShowtimeService;
import com.fu.cinema.util.PageUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class HomeController {

    private final MovieService movieService;
    private final GenreService genreService;
    private final ShowtimeService showtimeService;
    private final ReviewService reviewService;

    @GetMapping({"/", "/movies"})
    public String home(@RequestParam(required = false) String kw,
                       @RequestParam(required = false) Long genreId,
                       @RequestParam(defaultValue = "0") int page,
                       Model model) {
        Page<Movie> movies = movieService.searchForCustomer(kw, genreId, page, 12);
        model.addAttribute("movies", movies);
        model.addAttribute("genres", genreService.findAll());
        model.addAttribute("kw", kw);
        model.addAttribute("genreId", genreId);
        model.addAttribute("pageUrl", PageUtils.currentUrlWithoutPage());
        return "index";
    }

    @GetMapping("/movies/{id}")
    public String movieDetail(@PathVariable Long id, Model model) {
        model.addAttribute("movie", movieService.getForCustomer(id));

        // Suất chiếu sắp tới, nhóm theo ngày (giữ thứ tự thời gian)
        Map<LocalDate, List<Showtime>> byDate = showtimeService.findUpcomingByMovie(id).stream()
                .collect(Collectors.groupingBy(s -> s.getStartTime().toLocalDate(), LinkedHashMap::new, Collectors.toList()));
        model.addAttribute("showtimesByDate", byDate);

        model.addAttribute("rating", reviewService.summarize(id));
        model.addAttribute("reviews", reviewService.findByMovie(id));
        // [C] issue #18 (bonus): thêm canReview + reviewForm
        return "movie-detail";
    }
}
```
📄 **`src/main/resources/templates/index.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Phim')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4">
    <div th:replace="~{fragments/layout :: flash}"></div>

    <form class="row g-2 mb-4" th:action="@{/movies}" method="get">
        <div class="col-md-6">
            <input class="form-control" name="kw" th:value="${kw}" placeholder="Tìm tên phim...">
        </div>
        <div class="col-md-4">
            <select class="form-select" name="genreId">
                <option value="">-- Tất cả thể loại --</option>
                <option th:each="g : ${genres}" th:value="${g.genreId}" th:text="${g.genreName}"
                        th:selected="${g.genreId == genreId}"></option>
            </select>
        </div>
        <div class="col-md-2 d-grid"><button class="btn btn-primary">Tìm</button></div>
    </form>

    <p th:if="${movies.empty}" class="text-muted">Không tìm thấy phim phù hợp.</p>

    <div class="row row-cols-2 row-cols-md-4 g-4">
        <div class="col" th:each="m : ${movies.content}">
            <div class="card h-100">
                <img class="card-img-top poster" th:src="${m.posterUrl}" th:alt="${m.title}">
                <div class="card-body">
                    <span class="badge"
                          th:classappend="${m.status.name() == 'SHOWING'} ? 'bg-success' : 'bg-secondary'"
                          th:text="${m.status.name() == 'SHOWING'} ? 'Đang chiếu' : 'Sắp chiếu'"></span>
                    <span class="badge bg-danger" th:text="${m.ageRating}"></span>
                    <h6 class="card-title mt-2" th:text="${m.title}"></h6>
                    <p class="small text-muted mb-0" th:text="|${m.genre.genreName} · ${m.duration} phút|"></p>
                </div>
                <div class="card-footer bg-white border-0">
                    <a class="btn btn-outline-primary btn-sm w-100" th:href="@{/movies/{id}(id=${m.movieId})}">Chi tiết & đặt vé</a>
                </div>
            </div>
        </div>
    </div>

    <div class="mt-4" th:replace="~{fragments/layout :: pagination(${movies}, ${pageUrl})}"></div>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
📄 **`src/main/resources/templates/movie-detail.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head(${movie.title})}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4">
    <div th:replace="~{fragments/layout :: flash}"></div>

    <div class="row g-4">
        <div class="col-md-3"><img class="poster rounded" th:src="${movie.posterUrl}" th:alt="${movie.title}"></div>
        <div class="col-md-9">
            <h2 th:text="${movie.title}"></h2>
            <p>
                <span class="badge bg-danger" th:text="${movie.ageRating}"></span>
                <span class="badge bg-info text-dark" th:text="${movie.genre.genreName}"></span>
                <span class="text-muted" th:text="|${movie.duration} phút · Khởi chiếu ${#temporals.format(movie.releaseDate, 'dd/MM/yyyy')}|"></span>
            </p>
            <p><strong>Đạo diễn:</strong> <span th:text="${movie.director}"></span></p>
            <p th:text="${movie.description}"></p>
            <p>
                <strong>Đánh giá:</strong>
                <span th:if="${rating.total > 0}"
                      th:text="|${#numbers.formatDecimal(rating.average, 1, 1)}/5 ⭐ (${rating.total} lượt)|"></span>
                <span th:if="${rating.total == 0}" class="text-muted">Chưa có đánh giá</span>
            </p>
        </div>
    </div>

    <h4 class="mt-4">Lịch chiếu</h4>
    <p th:if="${showtimesByDate.isEmpty()}" class="text-muted">Chưa có suất chiếu.</p>
    <div th:each="entry : ${showtimesByDate}" class="mb-3">
        <h6 th:text="${#temporals.format(entry.key, 'EEEE, dd/MM/yyyy')}"></h6>
        <a th:each="s : ${entry.value}" class="btn btn-outline-success me-2 mb-2"
           th:href="@{/customer/showtimes/{id}/seats(id=${s.showtimeId})}"
           th:text="|${#temporals.format(s.startTime, 'HH:mm')} · ${s.room.roomName}|"></a>
    </div>

    <h4 class="mt-4">Đánh giá của khán giả</h4>
    <!-- [C] issue #18 (bonus): form đánh giá đặt ở đây -->
    <div th:each="r : ${reviews}" class="border-bottom py-2">
        <strong th:text="${r.customer.fullName}"></strong>
        <span th:text="|${r.rating} ⭐|"></span>
        <small class="text-muted" th:text="${#temporals.format(r.reviewDate, 'dd/MM/yyyy')}"></small>
        <div th:text="${r.comment}"></div>
    </div>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/controller/HomeController.java \
        src/main/resources/templates/index.html \
        src/main/resources/templates/movie-detail.html
git commit -m "feat(movie): add home page and movie detail with upcoming showtimes" -m "Refs #13"
```

#### #13.3 — [C] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] Đăng xuất → trang chủ thấy 5 phim, không thấy phim STOPPED; tìm "mèo", lọc thể loại
- [ ] Chi tiết phim: suất chiếu nhóm theo ngày, điểm đánh giá
- [ ] `/movies/<id phim STOPPED>` → 404; bấm giờ chiếu khi chưa đăng nhập → `/login`

#### #13.4 — [C] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/13-home-movie-detail
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/13-home-movie-detail`**.

- **Title:** `feat(movie): home page and movie detail`
- **Reviewers:** D  ·  **Assignees:** C  ·  **Labels:** `type: feature`, `module: movie`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 2 — Customer flow`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
Trang chủ phim đang chiếu/sắp chiếu và trang chi tiết phim cho khách.

Các file chính: `MovieService.java`, `MovieServiceImpl.java`, `ReviewRepository.java`, `RatingSummary.java`, `ReviewService.java`, `ReviewServiceImpl.java`, `HomeController.java`, `index.html`, `movie-detail.html`

Closes #13

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. Đăng xuất → trang chủ thấy 5 phim, không thấy phim STOPPED; tìm "mèo", lọc thể loại
2. Chi tiết phim: suất chiếu nhóm theo ngày, điểm đánh giá
3. `/movies/<id phim STOPPED>` → 404; bấm giờ chiếu khi chưa đăng nhập → `/login`

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#13** sang **In review**. Nhắn reviewer link PR.

#### #13.5 — [D] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/13-home-movie-detail
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] Ẩn phim STOPPED cả ở danh sách và chi tiết
- [ ] Suất `OPEN` + chưa chiếu, nhóm theo ngày đúng thứ tự
- [ ] Khách chưa đăng nhập xem được

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": Đăng xuất; Chi tiết phim: suất chiếu nhóm theo ngày, điểm đánh giá — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: C sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #13"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #13.6 — [C] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(movie): home page and movie detail (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #13` → **Confirm squash and merge**.
4. Kiểm tra: issue #13 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/13-home-movie-detail
git fetch --prune
```

✅ **Xong #13:** [ ] code đủ tiêu chí · [ ] 3 commit đúng chuẩn có `Refs #13` · [ ] PR có `Closes #13`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

### #14 — Seat selection & booking (TODO 28) (D)

| | |
|---|---|
| 👤 Người làm | **D** |
| 👀 Reviewer | **A + B** |
| Nhánh | `feature/14-seat-booking` |
| Milestone | `Sprint 2 — Customer flow` |
| Cần merge trước | #6, #11, #12 |
| Tiêu đề PR | `feat(booking): online seat selection and booking` |

#### #14.1 — [D] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#14** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/14-seat-booking
```

#### #14.2 — [D] Code & commit

**Commit 1/5 — `feat(booking): add sold seats and row lock queries`**

📄 **`src/main/java/com/fu/cinema/repository/TicketRepository.java`**

```java
package com.fu.cinema.repository;

import com.fu.cinema.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // ===== Q4: ghế đã bán của một suất chiếu (không tính đơn đã huỷ) =====
    @Query("""
            SELECT t.seatCode FROM Ticket t
            WHERE t.showtime.showtimeId = :showtimeId
              AND t.booking.status <> com.fu.cinema.enums.BookingStatus.CANCELLED
            """)
    List<String> findSoldSeatCodes(@Param("showtimeId") Long showtimeId);
}
```
📄 **`src/main/java/com/fu/cinema/repository/ShowtimeRepository.java`**

```java
package com.fu.cinema.repository;

import com.fu.cinema.dto.RoomShowtimeCount;
import com.fu.cinema.entity.Showtime;
import com.fu.cinema.enums.ShowtimeStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    // ===== Derived query =====
    boolean existsByMovie_MovieId(Long movieId);

    boolean existsByRoom_RoomId(Long roomId);

    @EntityGraph(attributePaths = "room")
    List<Showtime> findByMovie_MovieIdAndStatusAndStartTimeAfterOrderByStartTimeAsc(
            Long movieId, ShowtimeStatus status, LocalDateTime after);

    // ===== Danh sách suất chiếu cho Admin (lọc tuỳ chọn) =====
    @Query(value = """
            SELECT s FROM Showtime s JOIN FETCH s.movie m JOIN FETCH s.room r
            WHERE (:movieId IS NULL OR m.movieId = :movieId)
              AND (:roomId IS NULL OR r.roomId = :roomId)
              AND (:from IS NULL OR s.startTime >= :from)
              AND (:to IS NULL OR s.startTime < :to)
            """,
            countQuery = """
            SELECT COUNT(s) FROM Showtime s
            WHERE (:movieId IS NULL OR s.movie.movieId = :movieId)
              AND (:roomId IS NULL OR s.room.roomId = :roomId)
              AND (:from IS NULL OR s.startTime >= :from)
              AND (:to IS NULL OR s.startTime < :to)
            """)
    Page<Showtime> search(@Param("movieId") Long movieId,
                          @Param("roomId") Long roomId,
                          @Param("from") LocalDateTime from,
                          @Param("to") LocalDateTime to,
                          Pageable pageable);

    @Query("SELECT s FROM Showtime s JOIN FETCH s.movie JOIN FETCH s.room WHERE s.showtimeId = :id")
    Optional<Showtime> findDetailById(@Param("id") Long id);

    // ===== Q3: suất chiếu chồng giờ trong cùng phòng (BR-08) =====
    @Query("""
            SELECT s FROM Showtime s JOIN FETCH s.movie
            WHERE s.room.roomId = :roomId
              AND s.status <> com.fu.cinema.enums.ShowtimeStatus.CANCELLED
              AND s.startTime < :end
              AND s.endTime > :start
              AND (:excludeId IS NULL OR s.showtimeId <> :excludeId)
            """)
    List<Showtime> findOverlapping(@Param("roomId") Long roomId,
                                   @Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end,
                                   @Param("excludeId") Long excludeId);

    // Khoá dòng suất chiếu khi đặt vé → 2 người đặt cùng lúc sẽ được xử lý tuần tự
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Showtime s WHERE s.showtimeId = :id")
    Optional<Showtime> findByIdForUpdate(@Param("id") Long id);

    // ===== Q11: native SQL Server — số suất chiếu hôm nay theo phòng (dashboard) =====
    @Query(value = """
            SELECT r.room_name AS roomName, COUNT(s.showtime_id) AS showtimeCount
            FROM rooms r
            LEFT JOIN showtimes s
                   ON s.room_id = r.room_id
                  AND s.status = 'OPEN'
                  AND CAST(s.start_time AS DATE) = CAST(GETDATE() AS DATE)
            GROUP BY r.room_name
            ORDER BY r.room_name
            """, nativeQuery = true)
    List<RoomShowtimeCount> countTodayShowtimesByRoom();
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/repository/TicketRepository.java \
        src/main/java/com/fu/cinema/repository/ShowtimeRepository.java
git commit -m "feat(booking): add sold seats and row lock queries" -m "Refs #14"
```

**Commit 2/5 — `feat(booking): add seat map for showtime`**

📄 **`src/main/java/com/fu/cinema/dto/SeatMap.java`**

```java
package com.fu.cinema.dto;

import com.fu.cinema.entity.Showtime;
import lombok.Value;

import java.util.List;
import java.util.Set;

// Dữ liệu cho màn hình chọn ghế
@Value
public class SeatMap {

    Showtime showtime;
    List<String> rowLabels;   // A, B, C...
    int seatsPerRow;
    Set<String> soldSeats;

    public boolean isSold(String seatCode) {
        return soldSeats.contains(seatCode);
    }
}
```
📄 **`src/main/java/com/fu/cinema/service/ShowtimeService.java`**

```java
package com.fu.cinema.service;

import com.fu.cinema.dto.RoomShowtimeCount;
import com.fu.cinema.dto.SeatMap;
import com.fu.cinema.dto.ShowtimeForm;
import com.fu.cinema.entity.Showtime;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;

public interface ShowtimeService {

    Page<Showtime> search(Long movieId, Long roomId, LocalDate date, int page, int size);

    ShowtimeForm getForm(Long showtimeId);

    void create(ShowtimeForm form);

    void update(Long showtimeId, ShowtimeForm form);

    /** @return true nếu đã xoá hẳn, false nếu chỉ huỷ suất chiếu (BR-09) */
    boolean delete(Long showtimeId);

    List<Showtime> findUpcomingByMovie(Long movieId);

    SeatMap getSeatMap(Long showtimeId);

    List<RoomShowtimeCount> countTodayByRoom();
}
```
📄 **`src/main/java/com/fu/cinema/service/impl/ShowtimeServiceImpl.java`**

```java
package com.fu.cinema.service.impl;

import com.fu.cinema.dto.RoomShowtimeCount;
import com.fu.cinema.dto.SeatMap;
import com.fu.cinema.dto.ShowtimeForm;
import com.fu.cinema.entity.Movie;
import com.fu.cinema.entity.Room;
import com.fu.cinema.entity.Showtime;
import com.fu.cinema.enums.MovieStatus;
import com.fu.cinema.enums.RoomStatus;
import com.fu.cinema.enums.ShowtimeStatus;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.exception.ResourceNotFoundException;
import com.fu.cinema.repository.*;
import com.fu.cinema.service.ShowtimeService;
import com.fu.cinema.util.DateUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShowtimeServiceImpl implements ShowtimeService {

    static final int CLEANING_MINUTES = 15;

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;

    @Override
    public Page<Showtime> search(Long movieId, Long roomId, LocalDate date, int page, int size) {
        LocalDateTime from = date == null ? null : date.atStartOfDay();
        LocalDateTime to = date == null ? null : date.plusDays(1).atStartOfDay();
        return showtimeRepository.search(movieId, roomId, from, to,
                PageRequest.of(Math.max(page, 0), size, Sort.by("startTime").descending()));
    }

    @Override
    public ShowtimeForm getForm(Long showtimeId) {
        Showtime s = findDetail(showtimeId);
        ShowtimeForm f = new ShowtimeForm();
        f.setShowtimeId(s.getShowtimeId());
        f.setMovieId(s.getMovie().getMovieId());
        f.setRoomId(s.getRoom().getRoomId());
        f.setStartTime(s.getStartTime());
        f.setEndTime(s.getEndTime());
        f.setTicketPrice(s.getTicketPrice());
        f.setStatus(s.getStatus());
        return f;
    }

    @Override
    @Transactional
    public void create(ShowtimeForm form) {
        Showtime showtime = new Showtime();
        apply(form, showtime, null);
        showtimeRepository.save(showtime);
    }

    @Override
    @Transactional
    public void update(Long showtimeId, ShowtimeForm form) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Suất chiếu", showtimeId));
        boolean hasBookings = bookingRepository.existsByShowtime_ShowtimeId(showtimeId);
        if (hasBookings && (!showtime.getMovie().getMovieId().equals(form.getMovieId())
                || !showtime.getRoom().getRoomId().equals(form.getRoomId()))) {
            throw new BusinessException("Suất chiếu đã có người đặt vé: không được đổi phim hoặc phòng");
        }
        apply(form, showtime, showtimeId);
    }

    @Override
    @Transactional
    public boolean delete(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Suất chiếu", showtimeId));
        if (bookingRepository.existsByShowtime_ShowtimeId(showtimeId)) {           // BR-09
            showtime.setStatus(ShowtimeStatus.CANCELLED);
            bookingRepository.cancelAllByShowtime(showtimeId);                      // Q9 — @Modifying
            return false;
        }
        showtimeRepository.delete(showtime);
        return true;
    }

    @Override
    public List<Showtime> findUpcomingByMovie(Long movieId) {
        return showtimeRepository.findByMovie_MovieIdAndStatusAndStartTimeAfterOrderByStartTimeAsc(
                movieId, ShowtimeStatus.OPEN, LocalDateTime.now());
    }

    @Override
    public SeatMap getSeatMap(Long showtimeId) {
        Showtime s = findDetail(showtimeId);
        if (s.getStatus() != ShowtimeStatus.OPEN || !s.getStartTime().isAfter(LocalDateTime.now())) {
            throw new BusinessException("Suất chiếu không còn mở bán");                // BR-10
        }
        List<String> rows = IntStream.range(0, s.getRoom().getTotalRows())
                .mapToObj(i -> String.valueOf((char) ('A' + i)))
                .toList();
        return new SeatMap(s, rows, s.getRoom().getSeatsPerRow(),
                new HashSet<>(ticketRepository.findSoldSeatCodes(showtimeId)));
    }

    @Override
    public List<RoomShowtimeCount> countTodayByRoom() {
        return showtimeRepository.countTodayShowtimesByRoom();
    }

    // ================= helpers =================

    private Showtime findDetail(Long id) {
        return showtimeRepository.findDetailById(id).orElseThrow(() -> new ResourceNotFoundException("Suất chiếu", id));
    }

    /** Kiểm tra BR-07, BR-08 rồi gán dữ liệu từ form vào entity. */
    private void apply(ShowtimeForm form, Showtime showtime, Long excludeId) {
        Movie movie = movieRepository.findById(form.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Phim", form.getMovieId()));
        Room room = roomRepository.findById(form.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Phòng chiếu", form.getRoomId()));

        if (movie.getStatus() == MovieStatus.STOPPED) {
            throw new BusinessException("Phim \"" + movie.getTitle() + "\" đã ngừng chiếu");
        }
        if (room.getStatus() != RoomStatus.ACTIVE) {
            throw new BusinessException("Phòng \"" + room.getRoomName() + "\" đang bảo trì");
        }

        LocalDateTime start = form.getStartTime();
        LocalDateTime end = form.getEndTime() != null
                ? form.getEndTime()
                : start.plusMinutes(movie.getDuration() + CLEANING_MINUTES);   // gợi ý EndTime
        if (!start.isBefore(end)) {
            throw new BusinessException("Giờ bắt đầu phải trước giờ kết thúc");
        }
        if (end.isBefore(start.plusMinutes(movie.getDuration()))) {
            throw new BusinessException("Giờ kết thúc phải sau giờ bắt đầu ít nhất " + movie.getDuration() + " phút (thời lượng phim)");
        }

        if (form.getStatus() != ShowtimeStatus.CANCELLED) {
            List<Showtime> overlaps = showtimeRepository.findOverlapping(room.getRoomId(), start, end, excludeId);
            if (!overlaps.isEmpty()) {                                                 // BR-08
                Showtime o = overlaps.get(0);
                throw new BusinessException("Trùng lịch với suất \"" + o.getMovie().getTitle() + "\" ("
                        + DateUtils.format(o.getStartTime()) + " – " + DateUtils.format(o.getEndTime())
                        + ") tại " + room.getRoomName());
            }
        }

        showtime.setMovie(movie);
        showtime.setRoom(room);
        showtime.setStartTime(start);
        showtime.setEndTime(end);
        showtime.setTicketPrice(form.getTicketPrice());
        showtime.setStatus(form.getStatus());
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/dto/SeatMap.java \
        src/main/java/com/fu/cinema/service/ShowtimeService.java \
        src/main/java/com/fu/cinema/service/impl/ShowtimeServiceImpl.java
git commit -m "feat(booking): add seat map for showtime" -m "Refs #14"
```

**Commit 3/5 — `feat(booking): create booking with multiple tickets in one transaction`**

📄 **`src/main/java/com/fu/cinema/dto/BookingRequest.java`**

```java
package com.fu.cinema.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class BookingRequest {

    @NotNull
    private Long showtimeId;

    @NotEmpty(message = "Vui lòng chọn ít nhất 1 ghế")
    @Size(max = 8, message = "Mỗi đơn tối đa 8 ghế")
    private List<String> seatCodes = new ArrayList<>();
}
```
```java
// BookingService.java — thêm import:
import com.fu.cinema.dto.BookingRequest;

// Thêm method vào interface (thay dòng comment "// [D] issue #14 thêm create(...)"):
    // ===== Customer =====
    Booking create(Long customerId, BookingRequest request);
```
Thêm vào `BookingServiceImpl` (file do B tạo ở #12):

```java
// ===== 1) Thêm các import còn thiếu (IntelliJ: Alt+Enter) =====
import com.fu.cinema.dto.BookingRequest;
import com.fu.cinema.entity.Customer;
import com.fu.cinema.entity.Showtime;
import com.fu.cinema.entity.Ticket;
import com.fu.cinema.enums.ShowtimeStatus;
import com.fu.cinema.repository.CustomerRepository;
import com.fu.cinema.repository.ShowtimeRepository;
import com.fu.cinema.repository.TicketRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// ===== 2) Thêm hằng số + field (ngay dưới dòng "public class BookingServiceImpl ...") =====
    static final int MAX_SEATS_PER_BOOKING = 8;
    private static final Pattern SEAT_PATTERN = Pattern.compile("^([A-Z])([1-9]\\d?)$");

    private final ShowtimeRepository showtimeRepository;
    private final CustomerRepository customerRepository;
    private final TicketRepository ticketRepository;

// ===== 3) Thêm method create (đặt trong khối "// ================= Customer =================") =====
    @Override
    @Transactional                                               // BR-12: Booking + Ticket trong 1 transaction
    public Booking create(Long customerId, BookingRequest request) {
        // 1. Chuẩn hoá & kiểm tra danh sách ghế
        List<String> seats = request.getSeatCodes().stream()
                .filter(Objects::nonNull)
                .map(s -> s.trim().toUpperCase())
                .distinct()
                .sorted()
                .toList();
        if (seats.isEmpty()) {
            throw new BusinessException("Vui lòng chọn ít nhất 1 ghế");
        }
        if (seats.size() > MAX_SEATS_PER_BOOKING) {
            throw new BusinessException("Mỗi đơn tối đa " + MAX_SEATS_PER_BOOKING + " ghế");
        }

        // 2. Khoá suất chiếu (PESSIMISTIC_WRITE) → các yêu cầu đặt vé cùng suất được xử lý tuần tự
        Showtime showtime = showtimeRepository.findByIdForUpdate(request.getShowtimeId())
                .orElseThrow(() -> new ResourceNotFoundException("Suất chiếu", request.getShowtimeId()));
        if (showtime.getStatus() != ShowtimeStatus.OPEN || !showtime.getStartTime().isAfter(LocalDateTime.now())) {
            throw new BusinessException("Suất chiếu không còn mở bán");                       // BR-10
        }

        // 3. Ghế phải tồn tại trong phòng
        int rows = showtime.getRoom().getTotalRows();
        int perRow = showtime.getRoom().getSeatsPerRow();
        for (String seat : seats) {
            Matcher m = SEAT_PATTERN.matcher(seat);
            if (!m.matches() || m.group(1).charAt(0) - 'A' >= rows || Integer.parseInt(m.group(2)) > perRow) {
                throw new BusinessException("Ghế " + seat + " không tồn tại trong phòng " + showtime.getRoom().getRoomName());
            }
        }

        // 4. Ghế chưa được bán (kiểm tra lại TRONG transaction, không tin dữ liệu từ form)
        Set<String> sold = new HashSet<>(ticketRepository.findSoldSeatCodes(showtime.getShowtimeId()));
        List<String> taken = seats.stream().filter(sold::contains).toList();
        if (!taken.isEmpty()) {
            throw new BusinessException("Ghế đã có người đặt: " + String.join(", ", taken));
        }

        // 5. Độ tuổi (BR-11)
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", customerId));
        int minAge = showtime.getMovie().getAgeRating().getMinAge();
        int ageAtShow = Period.between(customer.getBirthday(), showtime.getStartTime().toLocalDate()).getYears();
        if (ageAtShow < minAge) {
            throw new BusinessException("Phim \"" + showtime.getMovie().getTitle() + "\" chỉ dành cho khán giả từ "
                    + minAge + " tuổi trở lên");
        }

        // 6. Tạo đơn + vé (cascade ALL → lưu Booking là lưu luôn Ticket)
        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setShowtime(showtime);
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalAmount(showtime.getTicketPrice().multiply(BigDecimal.valueOf(seats.size())));
        seats.forEach(seat -> booking.addTicket(new Ticket(showtime, seat, showtime.getTicketPrice())));
        return bookingRepository.save(booking);
    }
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/dto/BookingRequest.java \
        src/main/java/com/fu/cinema/service/BookingService.java \
        src/main/java/com/fu/cinema/service/impl/BookingServiceImpl.java
git commit -m "feat(booking): create booking with multiple tickets in one transaction" -m "Refs #14"
```

**Commit 4/5 — `feat(booking): add seat selection page`**

📄 **`src/main/java/com/fu/cinema/controller/customer/CustomerBookingController.java`**

```java
package com.fu.cinema.controller.customer;

import com.fu.cinema.dto.BookingRequest;
import com.fu.cinema.entity.Booking;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.service.BookingService;
import com.fu.cinema.service.ShowtimeService;
import com.fu.cinema.util.SessionUtils;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CustomerBookingController {

    private final ShowtimeService showtimeService;
    private final BookingService bookingService;

    @GetMapping("/showtimes/{id}/seats")
    public String seats(@PathVariable Long id, Model model) {
        model.addAttribute("seatMap", showtimeService.getSeatMap(id));
        return "customer/seats";
    }

    @PostMapping("/bookings")
    public String book(@Valid @ModelAttribute BookingRequest request, BindingResult br,
                       HttpSession session, RedirectAttributes ra) {
        String back = "redirect:/customer/showtimes/" + request.getShowtimeId() + "/seats";
        if (br.hasErrors()) {
            ra.addFlashAttribute("error", br.getAllErrors().get(0).getDefaultMessage());
            return back;
        }
        try {
            Booking booking = bookingService.create(SessionUtils.getCurrentCustomerId(session), request);
            ra.addFlashAttribute("success", "Đặt vé thành công! Mã đơn #" + booking.getBookingId());
            return "redirect:/customer/bookings/" + booking.getBookingId();   // trang chi tiết do B làm ở #15
        } catch (BusinessException e) {
            ra.addFlashAttribute("error", e.getMessage());
            return back;
        }
    }

    // [B] issue #15 thêm history(...), detail(...), cancel(...)
}
```
📄 **`src/main/resources/templates/customer/seats.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Chọn ghế')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4" th:with="s=${seatMap.showtime}">
    <div th:replace="~{fragments/layout :: flash}"></div>
    <h3 th:text="${s.movie.title}"></h3>
    <p class="text-muted"
       th:text="|${#temporals.format(s.startTime, 'dd/MM/yyyy HH:mm')} · ${s.room.roomName} (${s.room.roomType.label}) · ${#numbers.formatDecimal(s.ticketPrice, 0, 'COMMA', 0, 'POINT')}đ/vé|"></p>

    <form method="post" th:action="@{/customer/bookings}">
        <input type="hidden" name="showtimeId" th:value="${s.showtimeId}">
        <div class="screen py-1">MÀN HÌNH</div>
        <div class="seat-grid">
            <div class="seat-row" th:each="row : ${seatMap.rowLabels}">
                <span class="row-label" th:text="${row}"></span>
                <span th:each="n : ${#numbers.sequence(1, seatMap.seatsPerRow)}"
                      th:with="code=${row + n}"
                      class="seat" th:classappend="${seatMap.isSold(code)} ? 'sold'">
                    <input type="checkbox" name="seatCodes" th:id="${code}" th:value="${code}"
                           th:disabled="${seatMap.isSold(code)}">
                    <label th:for="${code}" th:text="${code}"></label>
                </span>
            </div>
        </div>
        <p class="mt-3 small text-muted">Ô xám: ghế đã bán · Tối đa 8 ghế mỗi đơn</p>
        <p>Đã chọn: <strong id="count">0</strong> ghế · Tạm tính: <strong id="total">0</strong>đ</p>
        <button class="btn btn-success">Đặt vé</button>
        <a class="btn btn-secondary" th:href="@{/movies/{id}(id=${s.movie.movieId})}">Quay lại</a>
    </form>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
<!-- Chỉ để hiển thị tạm tính; tổng tiền thật được TÍNH LẠI ở server -->
<script th:inline="javascript">
    const price = /*[[${seatMap.showtime.ticketPrice}]]*/ 0;
    document.querySelectorAll('input[name=seatCodes]').forEach(cb => cb.addEventListener('change', () => {
        const n = document.querySelectorAll('input[name=seatCodes]:checked').length;
        document.getElementById('count').textContent = n;
        document.getElementById('total').textContent = (n * price).toLocaleString('vi-VN');
    }));
</script>
</body>
</html>
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/controller/customer/CustomerBookingController.java \
        src/main/resources/templates/customer/seats.html
git commit -m "feat(booking): add seat selection page" -m "Refs #14"
```

**Commit 5/5 — `test(booking): add unit tests for booking validation`**

📄 **`src/test/java/com/fu/cinema/service/impl/BookingServiceImplTest.java`**

```java
package com.fu.cinema.service.impl;

import com.fu.cinema.dto.BookingRequest;
import com.fu.cinema.entity.Booking;
import com.fu.cinema.entity.Customer;
import com.fu.cinema.entity.Movie;
import com.fu.cinema.entity.Room;
import com.fu.cinema.entity.Showtime;
import com.fu.cinema.enums.AgeRating;
import com.fu.cinema.enums.BookingStatus;
import com.fu.cinema.enums.RoomStatus;
import com.fu.cinema.enums.RoomType;
import com.fu.cinema.enums.ShowtimeStatus;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.repository.BookingRepository;
import com.fu.cinema.repository.CustomerRepository;
import com.fu.cinema.repository.ShowtimeRepository;
import com.fu.cinema.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** Unit test (không cần database): kiểm tra BR-10, BR-11, BR-12 của BookingServiceImpl.create */
@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private ShowtimeRepository showtimeRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private Showtime showtime;
    private Customer customer;

    @BeforeEach
    void setUp() {
        Room room = new Room("Room 01", RoomType.TWO_D, 8, 12, RoomStatus.ACTIVE);   // hàng A..H, ghế 1..12

        Movie movie = new Movie();
        movie.setTitle("Phim test");
        movie.setDuration(120);
        movie.setAgeRating(AgeRating.T18);

        showtime = new Showtime();
        showtime.setShowtimeId(1L);
        showtime.setMovie(movie);
        showtime.setRoom(room);
        showtime.setStartTime(LocalDateTime.now().plusDays(1));
        showtime.setEndTime(showtime.getStartTime().plusMinutes(135));
        showtime.setTicketPrice(BigDecimal.valueOf(80000));
        showtime.setStatus(ShowtimeStatus.OPEN);

        customer = new Customer();
        customer.setCustomerId(10L);
        customer.setBirthday(LocalDate.now().minusYears(25));
    }

    private BookingRequest request(String... seats) {
        BookingRequest r = new BookingRequest();
        r.setShowtimeId(1L);
        r.setSeatCodes(List.of(seats));
        return r;
    }

    @Test
    void create_success_totalIsCalculatedOnServer() {
        when(showtimeRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(showtime));
        when(ticketRepository.findSoldSeatCodes(1L)).thenReturn(List.of("A1"));
        when(customerRepository.findById(10L)).thenReturn(Optional.of(customer));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        Booking booking = bookingService.create(10L, request("b2", "B3"));

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.PENDING);
        assertThat(booking.getTickets()).hasSize(2);
        assertThat(booking.getTickets().get(0).getSeatCode()).isEqualTo("B2");
        assertThat(booking.getTotalAmount()).isEqualByComparingTo(BigDecimal.valueOf(160000));
    }

    @Test
    void create_moreThan8Seats_throws() {
        assertThatThrownBy(() -> bookingService.create(10L,
                request("A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("tối đa");
        verifyNoInteractions(bookingRepository);
    }

    @Test
    void create_showtimeNotOpen_throws() {
        showtime.setStatus(ShowtimeStatus.CANCELLED);
        when(showtimeRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(showtime));

        assertThatThrownBy(() -> bookingService.create(10L, request("A1")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("không còn mở bán");
    }

    @Test
    void create_seatOutsideRoom_throws() {
        when(showtimeRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(showtime));

        assertThatThrownBy(() -> bookingService.create(10L, request("A13")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("không tồn tại");
    }

    @Test
    void create_seatAlreadySold_throws() {
        when(showtimeRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(showtime));
        when(ticketRepository.findSoldSeatCodes(1L)).thenReturn(List.of("A1"));

        assertThatThrownBy(() -> bookingService.create(10L, request("A1", "A2")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("A1");
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void create_customerTooYoungForT18_throws() {
        customer.setBirthday(LocalDate.now().minusYears(15));
        when(showtimeRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(showtime));
        when(customerRepository.findById(10L)).thenReturn(Optional.of(customer));

        assertThatThrownBy(() -> bookingService.create(10L, request("C5")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("18 tuổi");
        verify(bookingRepository, never()).save(any());
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/test/java/com/fu/cinema/service/impl/BookingServiceImplTest.java
git commit -m "test(booking): add unit tests for booking validation" -m "Refs #14"
```

#### #14.3 — [D] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] an.nv → "Chú Mèo Phiêu Lưu" suất ngày mai 14:00 → A1–A3 xám (đã bán)
- [ ] Chọn B5, B6 → đơn PENDING, tổng 140.000đ
- [ ] Chọn 9 ghế → lỗi; F12 sửa value thành Z99 → "Ghế không tồn tại"
- [ ] 2 trình duyệt (2 tài khoản) cùng đặt C1 → một người được, người kia "Ghế đã có người đặt"
- [ ] binh.tt đặt phim T18 → lỗi độ tuổi
- [ ] `mvn test` → 6 test pass

#### #14.4 — [D] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/14-seat-booking
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/14-seat-booking`**.

- **Title:** `feat(booking): online seat selection and booking`
- **Reviewers:** A + B  ·  **Assignees:** D  ·  **Labels:** `type: feature`, `module: booking`, `priority: high`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 2 — Customer flow`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
Khách chọn một hoặc nhiều ghế trên sơ đồ ghế và đặt vé.

Các file chính: `TicketRepository.java`, `ShowtimeRepository.java`, `SeatMap.java`, `ShowtimeService.java`, `ShowtimeServiceImpl.java`, `BookingRequest.java`, `CustomerBookingController.java`, `seats.html`, `BookingServiceImplTest.java`

Closes #14

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [x] test

## Cách kiểm thử
1. an.nv → "Chú Mèo Phiêu Lưu" suất ngày mai 14:00 → A1–A3 xám (đã bán)
2. Chọn B5, B6 → đơn PENDING, tổng 140.000đ
3. Chọn 9 ghế → lỗi; F12 sửa value thành Z99 → "Ghế không tồn tại"
4. 2 trình duyệt (2 tài khoản) cùng đặt C1 → một người được, người kia "Ghế đã có người đặt"
5. binh.tt đặt phim T18 → lỗi độ tuổi
6. `mvn test` → 6 test pass

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#14** sang **In review**. Nhắn reviewer link PR.

#### #14.5 — [A + B] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/14-seat-booking
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] BR-10 → BR-12 kiểm tra trong service, kiểm lại ghế trong transaction
- [ ] Tổng tiền tính ở server
- [ ] Khoá `PESSIMISTIC_WRITE` chống đặt trùng ghế
- [ ] `customerId` lấy từ session

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": an.nv; Chọn B5, B6 — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: D sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #14"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #14.6 — [D] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(booking): online seat selection and booking (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #14` → **Confirm squash and merge**.
4. Kiểm tra: issue #14 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/14-seat-booking
git fetch --prune
```

> 📢 Trang chi tiết đơn (redirect sau khi đặt) do B làm ở #15 — trước khi #15 merge, redirect sẽ ra 404, là bình thường.

✅ **Xong #14:** [ ] code đủ tiêu chí · [ ] 5 commit đúng chuẩn có `Refs #14` · [ ] PR có `Closes #14`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

### #16 — Customer profile & change password (TODO 30) (B)

| | |
|---|---|
| 👤 Người làm | **B** |
| 👀 Reviewer | **A** |
| Nhánh | `feature/16-profile` |
| Milestone | `Sprint 2 — Customer flow` |
| Cần merge trước | #6, #7 |
| Tiêu đề PR | `feat(profile): customer profile and change password` |

#### #16.1 — [B] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#16** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/16-profile
```

#### #16.2 — [B] Code & commit

**Commit 1/2 — `feat(profile): add profile and password service`**

📄 **`src/main/java/com/fu/cinema/dto/ProfileForm.java`**

```java
package com.fu.cinema.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class ProfileForm {

    private String username;                 // chỉ hiển thị, không cho sửa

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100)
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0")
    private String mobile;

    @NotNull(message = "Ngày sinh không được để trống")
    @Past(message = "Ngày sinh phải ở quá khứ")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate birthday;

    @NotBlank(message = "CCCD không được để trống")
    @Pattern(regexp = "^\\d{12}$", message = "CCCD gồm đúng 12 chữ số")
    private String identityCard;
}
```
📄 **`src/main/java/com/fu/cinema/dto/ChangePasswordForm.java`**

```java
package com.fu.cinema.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ChangePasswordForm {

    @NotBlank(message = "Vui lòng nhập mật khẩu hiện tại")
    private String currentPassword;

    @NotBlank(message = "Vui lòng nhập mật khẩu mới")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
             message = "Mật khẩu ≥ 8 ký tự, có chữ hoa, chữ thường và chữ số")
    private String newPassword;

    @NotBlank(message = "Vui lòng nhập lại mật khẩu mới")
    private String confirmPassword;
}
```
📄 **`src/main/java/com/fu/cinema/service/CustomerService.java`**

```java
package com.fu.cinema.service;

import com.fu.cinema.dto.ChangePasswordForm;
import com.fu.cinema.dto.CustomerForm;
import com.fu.cinema.dto.ProfileForm;
import com.fu.cinema.entity.Customer;
import org.springframework.data.domain.Page;

public interface CustomerService {

    // ===== Admin =====
    Page<Customer> search(String keyword, int page, int size);

    CustomerForm getForm(Long customerId);

    void create(CustomerForm form);

    void update(Long customerId, CustomerForm form);

    /** @return true nếu đã xoá hẳn, false nếu chỉ khoá tài khoản (BR-04) */
    boolean delete(Long customerId);

    void toggleLock(Long customerId);

    long count();

    // ===== Customer =====
    ProfileForm getProfile(Long customerId);

    void updateProfile(Long customerId, ProfileForm form);

    void changePassword(Long accountId, ChangePasswordForm form);
}
```
📄 **`src/main/java/com/fu/cinema/service/impl/CustomerServiceImpl.java`**

```java
package com.fu.cinema.service.impl;

import com.fu.cinema.dto.ChangePasswordForm;
import com.fu.cinema.dto.CustomerForm;
import com.fu.cinema.dto.ProfileForm;
import com.fu.cinema.entity.Account;
import com.fu.cinema.entity.Customer;
import com.fu.cinema.enums.AccountStatus;
import com.fu.cinema.enums.Role;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.exception.ResourceNotFoundException;
import com.fu.cinema.repository.AccountRepository;
import com.fu.cinema.repository.BookingRepository;
import com.fu.cinema.repository.CustomerRepository;
import com.fu.cinema.service.CustomerService;
import com.fu.cinema.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    // ================= Admin =================

    @Override
    public Page<Customer> search(String keyword, int page, int size) {
        return customerRepository.search(ValidationUtils.blankToNull(keyword),
                PageRequest.of(Math.max(page, 0), size, Sort.by("fullName")));
    }

    @Override
    public CustomerForm getForm(Long customerId) {
        Customer c = findWithAccount(customerId);
        CustomerForm form = new CustomerForm();
        form.setCustomerId(c.getCustomerId());
        form.setFullName(c.getFullName());
        form.setEmail(c.getEmail());
        form.setMobile(c.getMobile());
        form.setBirthday(c.getBirthday());
        form.setIdentityCard(c.getIdentityCard());
        form.setStatus(c.getAccount().getStatus());
        return form;
    }

    @Override
    @Transactional
    public void create(CustomerForm form) {
        if (form.getPassword() == null || form.getPassword().isBlank()) {
            throw new BusinessException("Mật khẩu không được để trống khi tạo khách hàng");
        }
        String email = form.getEmail().trim().toLowerCase();
        checkDuplicates(email, form.getMobile(), form.getIdentityCard(), null, null);
        checkAge(form);

        Account account = accountRepository.save(new Account(
                email, passwordEncoder.encode(form.getPassword()), Role.CUSTOMER, form.getStatus()));
        Customer customer = new Customer();
        customer.setAccount(account);
        copy(form, customer, email);
        customerRepository.save(customer);
    }

    @Override
    @Transactional
    public void update(Long customerId, CustomerForm form) {
        Customer customer = findWithAccount(customerId);
        Account account = customer.getAccount();
        String email = form.getEmail().trim().toLowerCase();
        checkDuplicates(email, form.getMobile(), form.getIdentityCard(), customerId, account.getAccountId());
        checkAge(form);

        copy(form, customer, email);
        account.setUsername(email);                          // username = email
        account.setStatus(form.getStatus());
        if (form.getPassword() != null && !form.getPassword().isBlank()) {
            account.setPassword(passwordEncoder.encode(form.getPassword()));
        }
        // dirty checking tự sinh UPDATE khi commit
    }

    @Override
    @Transactional
    public boolean delete(Long customerId) {
        Customer customer = findWithAccount(customerId);
        if (bookingRepository.existsByCustomer_CustomerId(customerId)) {          // BR-04
            customer.getAccount().setStatus(AccountStatus.LOCKED);
            return false;
        }
        Account account = customer.getAccount();
        customerRepository.delete(customer);                 // xoá bảng con (giữ FK) trước
        accountRepository.delete(account);
        return true;
    }

    @Override
    @Transactional
    public void toggleLock(Long customerId) {
        Account account = findWithAccount(customerId).getAccount();
        account.setStatus(account.getStatus() == AccountStatus.ACTIVE ? AccountStatus.LOCKED : AccountStatus.ACTIVE);
    }

    @Override
    public long count() {
        return customerRepository.count();
    }

    // ================= Customer =================

    @Override
    public ProfileForm getProfile(Long customerId) {
        Customer c = findWithAccount(customerId);
        ProfileForm form = new ProfileForm();
        form.setUsername(c.getAccount().getUsername());
        form.setFullName(c.getFullName());
        form.setEmail(c.getEmail());
        form.setMobile(c.getMobile());
        form.setBirthday(c.getBirthday());
        form.setIdentityCard(c.getIdentityCard());
        return form;
    }

    @Override
    @Transactional
    public void updateProfile(Long customerId, ProfileForm form) {
        Customer customer = findWithAccount(customerId);
        String email = form.getEmail().trim().toLowerCase();
        checkDuplicates(email, form.getMobile(), form.getIdentityCard(), customerId, customer.getAccount().getAccountId());
        if (ValidationUtils.age(form.getBirthday()) < 13) {
            throw new BusinessException("Khách hàng phải từ đủ 13 tuổi");
        }
        customer.setFullName(form.getFullName().trim());
        customer.setEmail(email);                            // username đăng nhập KHÔNG đổi
        customer.setMobile(form.getMobile());
        customer.setBirthday(form.getBirthday());
        customer.setIdentityCard(form.getIdentityCard());
    }

    @Override
    @Transactional
    public void changePassword(Long accountId, ChangePasswordForm form) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản", accountId));
        if (!passwordEncoder.matches(form.getCurrentPassword(), account.getPassword())) {
            throw new BusinessException("Mật khẩu hiện tại không đúng");
        }
        if (!form.getNewPassword().equals(form.getConfirmPassword())) {
            throw new BusinessException("Mật khẩu nhập lại không khớp");
        }
        account.setPassword(passwordEncoder.encode(form.getNewPassword()));
    }

    // ================= helpers =================

    private Customer findWithAccount(Long customerId) {
        return customerRepository.findWithAccountById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", customerId));
    }

    private void checkDuplicates(String email, String mobile, String identityCard, Long customerId, Long accountId) {
        boolean isNew = customerId == null;
        boolean emailUsed = isNew
                ? customerRepository.existsByEmail(email) || accountRepository.existsByUsername(email)
                : customerRepository.existsByEmailAndCustomerIdNot(email, customerId)
                  || accountRepository.existsByUsernameAndAccountIdNot(email, accountId);
        if (emailUsed) {
            throw new BusinessException("Email đã được sử dụng");
        }
        if (isNew ? customerRepository.existsByMobile(mobile)
                  : customerRepository.existsByMobileAndCustomerIdNot(mobile, customerId)) {
            throw new BusinessException("Số điện thoại đã được sử dụng");
        }
        if (isNew ? customerRepository.existsByIdentityCard(identityCard)
                  : customerRepository.existsByIdentityCardAndCustomerIdNot(identityCard, customerId)) {
            throw new BusinessException("Số CCCD đã được sử dụng");
        }
    }

    private void checkAge(CustomerForm form) {
        if (ValidationUtils.age(form.getBirthday()) < 13) {
            throw new BusinessException("Khách hàng phải từ đủ 13 tuổi");
        }
    }

    private void copy(CustomerForm form, Customer customer, String email) {
        customer.setFullName(form.getFullName().trim());
        customer.setEmail(email);
        customer.setMobile(form.getMobile());
        customer.setBirthday(form.getBirthday());
        customer.setIdentityCard(form.getIdentityCard());
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/dto/ProfileForm.java \
        src/main/java/com/fu/cinema/dto/ChangePasswordForm.java \
        src/main/java/com/fu/cinema/service/CustomerService.java \
        src/main/java/com/fu/cinema/service/impl/CustomerServiceImpl.java
git commit -m "feat(profile): add profile and password service" -m "Refs #16"
```

**Commit 2/2 — `feat(profile): add profile and change password pages`**

📄 **`src/main/java/com/fu/cinema/controller/customer/CustomerProfileController.java`**

```java
package com.fu.cinema.controller.customer;

import com.fu.cinema.dto.ChangePasswordForm;
import com.fu.cinema.dto.ProfileForm;
import com.fu.cinema.dto.SessionUser;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.service.CustomerService;
import com.fu.cinema.util.SessionUtils;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CustomerProfileController {

    private final CustomerService customerService;

    @GetMapping("/profile")
    public String profile(HttpSession session, Model model) {
        model.addAttribute("form", customerService.getProfile(SessionUtils.getCurrentCustomerId(session)));
        return "customer/profile";
    }

    @PostMapping("/profile")
    public String updateProfile(@Valid @ModelAttribute("form") ProfileForm form, BindingResult br,
                                HttpSession session, Model model, RedirectAttributes ra) {
        SessionUser user = SessionUtils.getCurrentUser(session);
        form.setUsername(customerService.getProfile(user.getCustomerId()).getUsername());
        if (br.hasErrors()) {
            return "customer/profile";
        }
        try {
            customerService.updateProfile(user.getCustomerId(), form);
        } catch (BusinessException e) {
            model.addAttribute("error", e.getMessage());
            return "customer/profile";
        }
        // cập nhật tên hiển thị trên menu
        session.setAttribute(SessionUtils.CURRENT_USER,
                new SessionUser(user.getAccountId(), user.getCustomerId(), form.getFullName().trim(), user.getRole()));
        ra.addFlashAttribute("success", "Đã cập nhật hồ sơ");
        return "redirect:/customer/profile";
    }

    @GetMapping("/password")
    public String passwordForm(Model model) {
        model.addAttribute("form", new ChangePasswordForm());
        return "customer/password";
    }

    @PostMapping("/password")
    public String changePassword(@Valid @ModelAttribute("form") ChangePasswordForm form, BindingResult br,
                                 HttpSession session, Model model, RedirectAttributes ra) {
        if (br.hasErrors()) {
            return "customer/password";
        }
        try {
            customerService.changePassword(SessionUtils.getCurrentUser(session).getAccountId(), form);
        } catch (BusinessException e) {
            model.addAttribute("error", e.getMessage());
            return "customer/password";
        }
        ra.addFlashAttribute("success", "Đã đổi mật khẩu");
        return "redirect:/customer/profile";
    }
}
```
📄 **`src/main/resources/templates/customer/profile.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Hồ sơ')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4" style="max-width: 720px">
    <div class="d-flex justify-content-between">
        <h3>Hồ sơ cá nhân</h3>
        <a class="btn btn-outline-secondary" th:href="@{/customer/password}">Đổi mật khẩu</a>
    </div>
    <div th:replace="~{fragments/layout :: flash}"></div>
    <form method="post" th:action="@{/customer/profile}" th:object="${form}" novalidate class="row g-3 mt-1">
        <div class="col-12">
            <label class="form-label">Tên đăng nhập</label>
            <input class="form-control" th:value="*{username}" disabled>
        </div>
        <div class="col-12">
            <label class="form-label">Họ tên</label>
            <input class="form-control" th:field="*{fullName}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{fullName}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Email liên hệ</label>
            <input type="email" class="form-control" th:field="*{email}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{email}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Số điện thoại</label>
            <input class="form-control" th:field="*{mobile}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{mobile}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Ngày sinh</label>
            <input type="date" class="form-control" th:field="*{birthday}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{birthday}"></div>
        </div>
        <div class="col-md-6">
            <label class="form-label">CCCD</label>
            <input class="form-control" th:field="*{identityCard}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{identityCard}"></div>
        </div>
        <div class="col-12"><button class="btn btn-primary">Lưu thay đổi</button></div>
    </form>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
📄 **`src/main/resources/templates/customer/password.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Đổi mật khẩu')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4" style="max-width: 480px">
    <h3>Đổi mật khẩu</h3>
    <div th:replace="~{fragments/layout :: flash}"></div>
    <form method="post" th:action="@{/customer/password}" th:object="${form}" novalidate>
        <div class="mb-3">
            <label class="form-label">Mật khẩu hiện tại</label>
            <input type="password" class="form-control" th:field="*{currentPassword}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{currentPassword}"></div>
        </div>
        <div class="mb-3">
            <label class="form-label">Mật khẩu mới</label>
            <input type="password" class="form-control" th:field="*{newPassword}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{newPassword}"></div>
        </div>
        <div class="mb-3">
            <label class="form-label">Nhập lại mật khẩu mới</label>
            <input type="password" class="form-control" th:field="*{confirmPassword}" th:errorclass="is-invalid">
            <div class="invalid-feedback" th:errors="*{confirmPassword}"></div>
        </div>
        <button class="btn btn-primary">Đổi mật khẩu</button>
        <a class="btn btn-secondary" th:href="@{/customer/profile}">Huỷ</a>
    </form>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
Trong `src/main/resources/templates/fragments/layout.html` thay **đúng dòng comment** `<!-- [..] menu Hồ sơ ... -->` bằng:

```html
                    <li class="nav-item"><a class="nav-link" th:href="@{/customer/profile}">Hồ sơ</a></li>
```

```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/controller/customer/CustomerProfileController.java \
        src/main/resources/templates/customer/profile.html \
        src/main/resources/templates/customer/password.html \
        src/main/resources/templates/fragments/layout.html
git commit -m "feat(profile): add profile and change password pages" -m "Refs #16"
```

#### #16.3 — [B] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] an.nv → Hồ sơ → đổi SĐT trùng binh.tt → lỗi; đổi tên → menu đổi tên
- [ ] Đổi mật khẩu với mật khẩu cũ sai → lỗi; đúng → đăng nhập lại bằng mật khẩu mới
- [ ] Admin vào `/customer/profile` → 403

#### #16.4 — [B] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/16-profile
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/16-profile`**.

- **Title:** `feat(profile): customer profile and change password`
- **Reviewers:** A  ·  **Assignees:** B  ·  **Labels:** `type: feature`, `module: customer`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 2 — Customer flow`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
Khách xem/cập nhật hồ sơ cá nhân và đổi mật khẩu.

Các file chính: `ProfileForm.java`, `ChangePasswordForm.java`, `CustomerService.java`, `CustomerServiceImpl.java`, `CustomerProfileController.java`, `profile.html`, `password.html`

Closes #16

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. an.nv → Hồ sơ → đổi SĐT trùng binh.tt → lỗi; đổi tên → menu đổi tên
2. Đổi mật khẩu với mật khẩu cũ sai → lỗi; đúng → đăng nhập lại bằng mật khẩu mới
3. Admin vào `/customer/profile` → 403

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#16** sang **In review**. Nhắn reviewer link PR.

#### #16.5 — [A] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/16-profile
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] Không đổi username
- [ ] Kiểm tra trùng với người khác
- [ ] Mật khẩu mới BCrypt, kiểm tra mật khẩu cũ

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": an.nv; Đổi mật khẩu với mật khẩu cũ sai — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: B sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #16"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #16.6 — [B] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(profile): customer profile and change password (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #16` → **Confirm squash and merge**.
4. Kiểm tra: issue #16 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/16-profile
git fetch --prune
```

✅ **Xong #16:** [ ] code đủ tiêu chí · [ ] 2 commit đúng chuẩn có `Refs #16` · [ ] PR có `Closes #16`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

### #15 — Booking history & cancel (TODO 29) (B)

| | |
|---|---|
| 👤 Người làm | **B** |
| 👀 Reviewer | **C** |
| Nhánh | `feature/15-booking-history` |
| Milestone | `Sprint 2 — Customer flow` |
| Cần merge trước | #6, #12; rebase sau khi #14 merge |
| Tiêu đề PR | `feat(booking): customer booking history and cancellation` |

#### #15.1 — [B] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#15** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/15-booking-history
```

#### #15.2 — [B] Code & commit

**Commit 1/2 — `feat(booking): add customer booking history and cancel rules`**

```java
// BookingService.java — thêm vào interface (thay dòng comment "// [B] issue #15 thêm ..."):
    Page<Booking> findByCustomer(Long customerId, BookingStatus status, int page, int size);

    Booking getDetailForCustomer(Long bookingId, Long customerId);

    void cancelByCustomer(Long bookingId, Long customerId);
```
Thêm vào `BookingServiceImpl`:

```java
// Thêm vào khối "// ================= Customer =================" (dưới method create của D)
// Import cần có: org.springframework.data.domain.Pageable, java.time.LocalDateTime
// Thêm hằng số ngay dưới MAX_SEATS_PER_BOOKING:
    static final int CANCEL_BEFORE_HOURS = 2;

    @Override
    public Page<Booking> findByCustomer(Long customerId, BookingStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), size, Sort.by("bookingDate").descending());
        return status == null
                ? bookingRepository.findByCustomer_CustomerId(customerId, pageable)
                : bookingRepository.findByCustomer_CustomerIdAndStatus(customerId, status, pageable);
    }

    @Override
    public Booking getDetailForCustomer(Long bookingId, Long customerId) {
        Booking booking = getDetail(bookingId);
        if (!booking.getCustomer().getCustomerId().equals(customerId)) {
            // Không tiết lộ đơn của người khác có tồn tại hay không → trả 404
            throw new ResourceNotFoundException("Đơn đặt vé", bookingId);
        }
        return booking;
    }

    @Override
    @Transactional
    public void cancelByCustomer(Long bookingId, Long customerId) {
        Booking booking = getDetailForCustomer(bookingId, customerId);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException("Đơn đã được huỷ trước đó");
        }
        if (LocalDateTime.now().isAfter(booking.getShowtime().getStartTime().minusHours(CANCEL_BEFORE_HOURS))) {
            throw new BusinessException("Chỉ được huỷ đơn trước giờ chiếu ít nhất " + CANCEL_BEFORE_HOURS + " giờ"); // BR-14
        }
        booking.setStatus(BookingStatus.CANCELLED);
    }
```
File hoàn chỉnh sau khi cả #14 và #15 merge (đối chiếu khi gặp xung đột):

📄 **`src/main/java/com/fu/cinema/service/BookingService.java`**

```java
package com.fu.cinema.service;

import com.fu.cinema.dto.BookingRequest;
import com.fu.cinema.entity.Booking;
import com.fu.cinema.enums.BookingStatus;
import org.springframework.data.domain.Page;

import java.time.LocalDate;

public interface BookingService {

    // ===== Customer =====
    Booking create(Long customerId, BookingRequest request);

    Page<Booking> findByCustomer(Long customerId, BookingStatus status, int page, int size);

    Booking getDetailForCustomer(Long bookingId, Long customerId);

    void cancelByCustomer(Long bookingId, Long customerId);

    // ===== Admin =====
    Page<Booking> search(BookingStatus status, LocalDate fromDate, LocalDate toDate, String keyword, int page, int size);

    Booking getDetail(Long bookingId);

    void confirm(Long bookingId);

    void cancelByAdmin(Long bookingId);

    long countPending();
}
```
📄 **`src/main/java/com/fu/cinema/service/impl/BookingServiceImpl.java`**

```java
package com.fu.cinema.service.impl;

import com.fu.cinema.dto.BookingRequest;
import com.fu.cinema.entity.Booking;
import com.fu.cinema.entity.Customer;
import com.fu.cinema.entity.Showtime;
import com.fu.cinema.entity.Ticket;
import com.fu.cinema.enums.BookingStatus;
import com.fu.cinema.enums.ShowtimeStatus;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.exception.ResourceNotFoundException;
import com.fu.cinema.repository.BookingRepository;
import com.fu.cinema.repository.CustomerRepository;
import com.fu.cinema.repository.ShowtimeRepository;
import com.fu.cinema.repository.TicketRepository;
import com.fu.cinema.service.BookingService;
import com.fu.cinema.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingServiceImpl implements BookingService {

    static final int MAX_SEATS_PER_BOOKING = 8;
    static final int CANCEL_BEFORE_HOURS = 2;
    private static final Pattern SEAT_PATTERN = Pattern.compile("^([A-Z])([1-9]\\d?)$");

    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;
    private final CustomerRepository customerRepository;
    private final TicketRepository ticketRepository;

    // ================= Customer =================

    @Override
    @Transactional                                               // BR-12: Booking + Ticket trong 1 transaction
    public Booking create(Long customerId, BookingRequest request) {
        // 1. Chuẩn hoá & kiểm tra danh sách ghế
        List<String> seats = request.getSeatCodes().stream()
                .filter(Objects::nonNull)
                .map(s -> s.trim().toUpperCase())
                .distinct()
                .sorted()
                .toList();
        if (seats.isEmpty()) {
            throw new BusinessException("Vui lòng chọn ít nhất 1 ghế");
        }
        if (seats.size() > MAX_SEATS_PER_BOOKING) {
            throw new BusinessException("Mỗi đơn tối đa " + MAX_SEATS_PER_BOOKING + " ghế");
        }

        // 2. Khoá suất chiếu (PESSIMISTIC_WRITE) → các yêu cầu đặt vé cùng suất được xử lý tuần tự
        Showtime showtime = showtimeRepository.findByIdForUpdate(request.getShowtimeId())
                .orElseThrow(() -> new ResourceNotFoundException("Suất chiếu", request.getShowtimeId()));
        if (showtime.getStatus() != ShowtimeStatus.OPEN || !showtime.getStartTime().isAfter(LocalDateTime.now())) {
            throw new BusinessException("Suất chiếu không còn mở bán");                       // BR-10
        }

        // 3. Ghế phải tồn tại trong phòng
        int rows = showtime.getRoom().getTotalRows();
        int perRow = showtime.getRoom().getSeatsPerRow();
        for (String seat : seats) {
            Matcher m = SEAT_PATTERN.matcher(seat);
            if (!m.matches() || m.group(1).charAt(0) - 'A' >= rows || Integer.parseInt(m.group(2)) > perRow) {
                throw new BusinessException("Ghế " + seat + " không tồn tại trong phòng " + showtime.getRoom().getRoomName());
            }
        }

        // 4. Ghế chưa được bán (kiểm tra lại TRONG transaction, không tin dữ liệu từ form)
        Set<String> sold = new HashSet<>(ticketRepository.findSoldSeatCodes(showtime.getShowtimeId()));
        List<String> taken = seats.stream().filter(sold::contains).toList();
        if (!taken.isEmpty()) {
            throw new BusinessException("Ghế đã có người đặt: " + String.join(", ", taken));
        }

        // 5. Độ tuổi (BR-11)
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", customerId));
        int minAge = showtime.getMovie().getAgeRating().getMinAge();
        int ageAtShow = Period.between(customer.getBirthday(), showtime.getStartTime().toLocalDate()).getYears();
        if (ageAtShow < minAge) {
            throw new BusinessException("Phim \"" + showtime.getMovie().getTitle() + "\" chỉ dành cho khán giả từ "
                    + minAge + " tuổi trở lên");
        }

        // 6. Tạo đơn + vé (cascade ALL → lưu Booking là lưu luôn Ticket)
        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setShowtime(showtime);
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalAmount(showtime.getTicketPrice().multiply(BigDecimal.valueOf(seats.size())));
        seats.forEach(seat -> booking.addTicket(new Ticket(showtime, seat, showtime.getTicketPrice())));
        return bookingRepository.save(booking);
    }

    @Override
    public Page<Booking> findByCustomer(Long customerId, BookingStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), size, Sort.by("bookingDate").descending());
        return status == null
                ? bookingRepository.findByCustomer_CustomerId(customerId, pageable)
                : bookingRepository.findByCustomer_CustomerIdAndStatus(customerId, status, pageable);
    }

    @Override
    public Booking getDetailForCustomer(Long bookingId, Long customerId) {
        Booking booking = getDetail(bookingId);
        if (!booking.getCustomer().getCustomerId().equals(customerId)) {
            // Không tiết lộ đơn của người khác có tồn tại hay không → trả 404
            throw new ResourceNotFoundException("Đơn đặt vé", bookingId);
        }
        return booking;
    }

    @Override
    @Transactional
    public void cancelByCustomer(Long bookingId, Long customerId) {
        Booking booking = getDetailForCustomer(bookingId, customerId);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException("Đơn đã được huỷ trước đó");
        }
        if (LocalDateTime.now().isAfter(booking.getShowtime().getStartTime().minusHours(CANCEL_BEFORE_HOURS))) {
            throw new BusinessException("Chỉ được huỷ đơn trước giờ chiếu ít nhất " + CANCEL_BEFORE_HOURS + " giờ"); // BR-14
        }
        booking.setStatus(BookingStatus.CANCELLED);
    }

    // ================= Admin =================

    @Override
    public Page<Booking> search(BookingStatus status, LocalDate fromDate, LocalDate toDate, String keyword, int page, int size) {
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new BusinessException("Từ ngày phải trước hoặc bằng đến ngày");
        }
        return bookingRepository.search(status,
                fromDate == null ? null : fromDate.atStartOfDay(),
                toDate == null ? null : toDate.plusDays(1).atStartOfDay(),
                ValidationUtils.blankToNull(keyword),
                PageRequest.of(Math.max(page, 0), size, Sort.by("bookingDate").descending()));
    }

    @Override
    public Booking getDetail(Long bookingId) {
        return bookingRepository.findDetailById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn đặt vé", bookingId));
    }

    @Override
    @Transactional
    public void confirm(Long bookingId) {
        Booking booking = getDetail(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {                               // BR-13
            throw new BusinessException("Chỉ xác nhận được đơn đang ở trạng thái PENDING");
        }
        booking.setStatus(BookingStatus.CONFIRMED);
    }

    @Override
    @Transactional
    public void cancelByAdmin(Long bookingId) {
        Booking booking = getDetail(bookingId);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException("Đơn đã được huỷ trước đó");
        }
        booking.setStatus(BookingStatus.CANCELLED);
    }

    @Override
    public long countPending() {
        return bookingRepository.countByStatus(BookingStatus.PENDING);
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/service/BookingService.java \
        src/main/java/com/fu/cinema/service/impl/BookingServiceImpl.java
git commit -m "feat(booking): add customer booking history and cancel rules" -m "Refs #15"
```

**Commit 2/2 — `feat(booking): add booking history and detail pages`**

📄 **`src/main/java/com/fu/cinema/controller/customer/CustomerBookingController.java`**

```java
package com.fu.cinema.controller.customer;

import com.fu.cinema.dto.BookingRequest;
import com.fu.cinema.entity.Booking;
import com.fu.cinema.enums.BookingStatus;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.service.BookingService;
import com.fu.cinema.service.ShowtimeService;
import com.fu.cinema.util.PageUtils;
import com.fu.cinema.util.SessionUtils;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CustomerBookingController {

    private final ShowtimeService showtimeService;
    private final BookingService bookingService;

    @GetMapping("/showtimes/{id}/seats")
    public String seats(@PathVariable Long id, Model model) {
        model.addAttribute("seatMap", showtimeService.getSeatMap(id));
        return "customer/seats";
    }

    @PostMapping("/bookings")
    public String book(@Valid @ModelAttribute BookingRequest request, BindingResult br,
                       HttpSession session, RedirectAttributes ra) {
        String back = "redirect:/customer/showtimes/" + request.getShowtimeId() + "/seats";
        if (br.hasErrors()) {
            ra.addFlashAttribute("error", br.getAllErrors().get(0).getDefaultMessage());
            return back;
        }
        try {
            Booking booking = bookingService.create(SessionUtils.getCurrentCustomerId(session), request);
            ra.addFlashAttribute("success", "Đặt vé thành công! Mã đơn #" + booking.getBookingId());
            return "redirect:/customer/bookings/" + booking.getBookingId();
        } catch (BusinessException e) {
            ra.addFlashAttribute("error", e.getMessage());
            return back;
        }
    }

    @GetMapping("/bookings")
    public String history(@RequestParam(required = false) BookingStatus status,
                          @RequestParam(defaultValue = "0") int page,
                          HttpSession session, Model model) {
        model.addAttribute("bookings", bookingService.findByCustomer(
                SessionUtils.getCurrentCustomerId(session), status, page, PageUtils.DEFAULT_SIZE));
        model.addAttribute("statuses", BookingStatus.values());
        model.addAttribute("status", status);
        model.addAttribute("pageUrl", PageUtils.currentUrlWithoutPage());
        return "customer/bookings";
    }

    @GetMapping("/bookings/{id}")
    public String detail(@PathVariable Long id, HttpSession session, Model model) {
        model.addAttribute("booking", bookingService.getDetailForCustomer(id, SessionUtils.getCurrentCustomerId(session)));
        return "customer/booking-detail";
    }

    @PostMapping("/bookings/{id}/cancel")
    public String cancel(@PathVariable Long id, HttpSession session, RedirectAttributes ra) {
        try {
            bookingService.cancelByCustomer(id, SessionUtils.getCurrentCustomerId(session));
            ra.addFlashAttribute("success", "Đã huỷ đơn #" + id);
        } catch (BusinessException e) {
            ra.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/customer/bookings/" + id;
    }
}
```
📄 **`src/main/resources/templates/customer/bookings.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Vé của tôi')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4">
    <div th:replace="~{fragments/layout :: flash}"></div>
    <h3 class="mb-3">Lịch sử đặt vé</h3>
    <form class="row g-2 mb-3" method="get" th:action="@{/customer/bookings}">
        <div class="col-md-3">
            <select class="form-select" name="status" onchange="this.form.submit()">
                <option value="">Tất cả trạng thái</option>
                <option th:each="st : ${statuses}" th:value="${st}" th:text="${st}" th:selected="${st == status}"></option>
            </select>
        </div>
    </form>
    <table class="table table-hover align-middle">
        <thead class="table-light"><tr><th>#</th><th>Ngày đặt</th><th>Phim</th><th>Suất chiếu</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>
        <tr th:if="${bookings.empty}"><td colspan="7" class="text-center text-muted">Bạn chưa có đơn đặt vé nào</td></tr>
        <tr th:each="b : ${bookings.content}">
            <td th:text="${b.bookingId}"></td>
            <td th:text="${#temporals.format(b.bookingDate, 'dd/MM/yyyy HH:mm')}"></td>
            <td th:text="${b.showtime.movie.title}"></td>
            <td th:text="|${#temporals.format(b.showtime.startTime, 'dd/MM/yyyy HH:mm')} · ${b.showtime.room.roomName}|"></td>
            <td th:text="${#numbers.formatDecimal(b.totalAmount, 0, 'COMMA', 0, 'POINT')} + 'đ'"></td>
            <td th:text="${b.status}"></td>
            <td><a class="btn btn-sm btn-outline-primary" th:href="@{/customer/bookings/{id}(id=${b.bookingId})}">Chi tiết</a></td>
        </tr>
        </tbody>
    </table>
    <div th:replace="~{fragments/layout :: pagination(${bookings}, ${pageUrl})}"></div>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
📄 **`src/main/resources/templates/customer/booking-detail.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Chi tiết vé')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4" style="max-width: 720px">
    <div th:replace="~{fragments/layout :: flash}"></div>
    <h3 th:text="|Đơn #${booking.bookingId}|"></h3>
    <table class="table">
        <tr><th>Trạng thái</th><td th:text="${booking.status}"></td></tr>
        <tr><th>Phim</th><td th:text="${booking.showtime.movie.title}"></td></tr>
        <tr><th>Suất chiếu</th><td th:text="|${#temporals.format(booking.showtime.startTime, 'dd/MM/yyyy HH:mm')} · ${booking.showtime.room.roomName}|"></td></tr>
        <tr><th>Ghế</th><td><span class="badge bg-dark me-1" th:each="t : ${booking.tickets}" th:text="${t.seatCode}"></span></td></tr>
        <tr><th>Tổng tiền</th><td class="fw-bold" th:text="${#numbers.formatDecimal(booking.totalAmount, 0, 'COMMA', 0, 'POINT')} + 'đ'"></td></tr>
        <tr><th>Ngày đặt</th><td th:text="${#temporals.format(booking.bookingDate, 'dd/MM/yyyy HH:mm')}"></td></tr>
    </table>
    <form th:if="${booking.status.name() != 'CANCELLED'}" method="post"
          th:action="@{/customer/bookings/{id}/cancel(id=${booking.bookingId})}"
          onsubmit="return confirm('Bạn chắc chắn muốn huỷ đơn này?');" class="d-inline">
        <button class="btn btn-outline-danger">Huỷ đơn</button>
    </form>
    <a class="btn btn-secondary" th:href="@{/customer/bookings}">Quay lại</a>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
Trong `src/main/resources/templates/fragments/layout.html` thay **đúng dòng comment** `<!-- [..] menu Vé của tôi ... -->` bằng:

```html
                    <li class="nav-item"><a class="nav-link" th:href="@{/customer/bookings}">Vé của tôi</a></li>
```

```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/controller/customer/CustomerBookingController.java \
        src/main/resources/templates/customer/bookings.html \
        src/main/resources/templates/customer/booking-detail.html \
        src/main/resources/templates/fragments/layout.html
git commit -m "feat(booking): add booking history and detail pages" -m "Refs #15"
```

#### #15.3 — [B] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] an.nv → Vé của tôi: 4 đơn, lọc PENDING, mới nhất trước
- [ ] Đổi ID trên URL sang đơn của binh.tt → 404
- [ ] Huỷ đơn suất ngày mai → thành công; huỷ đơn suất đã qua → báo lỗi 2 giờ

#### #15.4 — [B] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/15-booking-history
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/15-booking-history`**.

- **Title:** `feat(booking): customer booking history and cancellation`
- **Reviewers:** C  ·  **Assignees:** B  ·  **Labels:** `type: feature`, `module: booking`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 2 — Customer flow`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
Khách xem lịch sử đơn của mình, xem chi tiết, huỷ đơn hợp lệ.

Các file chính: `BookingService.java`, `BookingServiceImpl.java`, `CustomerBookingController.java`, `bookings.html`, `booking-detail.html`

Closes #15

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. an.nv → Vé của tôi: 4 đơn, lọc PENDING, mới nhất trước
2. Đổi ID trên URL sang đơn của binh.tt → 404
3. Huỷ đơn suất ngày mai → thành công; huỷ đơn suất đã qua → báo lỗi 2 giờ

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#15** sang **In review**. Nhắn reviewer link PR.

#### #15.5 — [C] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/15-booking-history
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] `customerId` luôn từ session
- [ ] Đơn người khác → 404
- [ ] BR-14 (trước giờ chiếu ≥ 2 giờ)

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": an.nv; Đổi ID trên URL sang đơn của binh.tt — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: B sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #15"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #15.6 — [B] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(booking): customer booking history and cancellation (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #15` → **Confirm squash and merge**.
4. Kiểm tra: issue #15 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/15-booking-history
git fetch --prune
```

✅ **Xong #15:** [ ] code đủ tiêu chí · [ ] 2 commit đúng chuẩn có `Refs #15` · [ ] PR có `Closes #15`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

## Sprint: Sprint 3 — Report & Release

### #17 — Revenue report (TODO 26) (D)

| | |
|---|---|
| 👤 Người làm | **D** |
| 👀 Reviewer | **C + B** |
| Nhánh | `feature/17-revenue-report` |
| Milestone | `Sprint 3 — Report & Release v1.0.0` |
| Cần merge trước | #12 |
| Tiêu đề PR | `feat(report): revenue report by date range` |

#### #17.1 — [D] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#17** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/17-revenue-report
```

#### #17.2 — [D] Code & commit

**Commit 1/3 — `feat(report): add revenue by movie and confirmed bookings queries`**

📄 **`src/main/java/com/fu/cinema/dto/MovieRevenueDTO.java`**

```java
package com.fu.cinema.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

// Dùng trong constructor expression của JPQL: kiểu tham số khớp kết quả (COUNT → Long, SUM(BigDecimal) → BigDecimal)
@Getter
@AllArgsConstructor
public class MovieRevenueDTO {

    private final String title;
    private final Long ticketCount;
    private final BigDecimal revenue;
}
```
```java
// Import cần có (thêm nếu file chưa có):
// import com.fu.cinema.dto.MovieRevenueDTO;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;
// import java.time.LocalDateTime;
// import java.util.List;

// Thêm vào CUỐI interface BookingRepository (trước dấu } cuối):

    // ===== Q7: doanh thu theo phim trong kỳ, giảm dần (constructor expression → DTO) =====
    @Query("""
            SELECT new com.fu.cinema.dto.MovieRevenueDTO(m.title, COUNT(t), SUM(t.price))
            FROM Ticket t
            JOIN t.booking b
            JOIN t.showtime s
            JOIN s.movie m
            WHERE b.status = com.fu.cinema.enums.BookingStatus.CONFIRMED
              AND b.bookingDate >= :from AND b.bookingDate < :to
            GROUP BY m.movieId, m.title
            ORDER BY SUM(t.price) DESC
            """)
    List<MovieRevenueDTO> revenueByMovie(@Param("from") LocalDateTime from,
                                         @Param("to") LocalDateTime to);

    // ===== Q8: đơn CONFIRMED trong kỳ, mới nhất trước =====
    @Query("""
            SELECT b FROM Booking b
            JOIN FETCH b.customer
            JOIN FETCH b.showtime s
            JOIN FETCH s.movie
            WHERE b.status = com.fu.cinema.enums.BookingStatus.CONFIRMED
              AND b.bookingDate >= :from AND b.bookingDate < :to
            ORDER BY b.bookingDate DESC
            """)
    List<Booking> findConfirmedInPeriod(@Param("from") LocalDateTime from,
                                        @Param("to") LocalDateTime to);
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/dto/MovieRevenueDTO.java \
        src/main/java/com/fu/cinema/repository/BookingRepository.java
git commit -m "feat(report): add revenue by movie and confirmed bookings queries" -m "Refs #17"
```

**Commit 2/3 — `feat(report): add report service with totals`**

📄 **`src/main/java/com/fu/cinema/dto/ReportResult.java`**

```java
package com.fu.cinema.dto;

import com.fu.cinema.entity.Booking;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Value
public class ReportResult {

    LocalDate startDate;
    LocalDate endDate;
    List<MovieRevenueDTO> revenueByMovie;
    List<Booking> bookings;
    long totalBookings;
    long totalTickets;
    BigDecimal totalRevenue;

    public boolean isEmpty() {
        return bookings.isEmpty();
    }
}
```
📄 **`src/main/java/com/fu/cinema/service/ReportService.java`**

```java
package com.fu.cinema.service;

import com.fu.cinema.dto.ReportResult;

import java.time.LocalDate;

public interface ReportService {

    ReportResult generate(LocalDate startDate, LocalDate endDate);
}
```
📄 **`src/main/java/com/fu/cinema/service/impl/ReportServiceImpl.java`**

```java
package com.fu.cinema.service.impl;

import com.fu.cinema.dto.MovieRevenueDTO;
import com.fu.cinema.dto.ReportResult;
import com.fu.cinema.entity.Booking;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.repository.BookingRepository;
import com.fu.cinema.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final BookingRepository bookingRepository;

    @Override
    public ReportResult generate(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new BusinessException("Vui lòng chọn đầy đủ từ ngày và đến ngày");
        }
        if (startDate.isAfter(endDate)) {                                                 // BR-15
            throw new BusinessException("Từ ngày phải trước hoặc bằng đến ngày");
        }
        // [startDate 00:00, endDate + 1 ngày 00:00) → bao gồm trọn ngày cuối
        LocalDateTime from = startDate.atStartOfDay();
        LocalDateTime to = endDate.plusDays(1).atStartOfDay();

        List<MovieRevenueDTO> byMovie = bookingRepository.revenueByMovie(from, to);        // giảm dần doanh thu
        List<Booking> bookings = bookingRepository.findConfirmedInPeriod(from, to);       // giảm dần ngày đặt

        long totalTickets = byMovie.stream().mapToLong(MovieRevenueDTO::getTicketCount).sum();
        BigDecimal totalRevenue = byMovie.stream().map(MovieRevenueDTO::getRevenue).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new ReportResult(startDate, endDate, byMovie, bookings, bookings.size(), totalTickets, totalRevenue);
    }
}
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/dto/ReportResult.java \
        src/main/java/com/fu/cinema/service/ReportService.java \
        src/main/java/com/fu/cinema/service/impl/ReportServiceImpl.java
git commit -m "feat(report): add report service with totals" -m "Refs #17"
```

**Commit 3/3 — `feat(report): add report page with date range filter`**

📄 **`src/main/java/com/fu/cinema/controller/admin/AdminReportController.java`**

```java
package com.fu.cinema.controller.admin;

import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;

@Controller
@RequestMapping("/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final ReportService reportService;

    @GetMapping
    public String report(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                         @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                         Model model) {
        // Mặc định: từ đầu tháng đến hôm nay
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        model.addAttribute("startDate", start);
        model.addAttribute("endDate", end);
        try {
            model.addAttribute("report", reportService.generate(start, end));
        } catch (BusinessException e) {
            model.addAttribute("error", e.getMessage());
        }
        return "admin/report";
    }
}
```
📄 **`src/main/resources/templates/admin/report.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Báo cáo')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4">
    <h3 class="mb-3">Báo cáo doanh thu bán vé</h3>
    <div th:replace="~{fragments/layout :: flash}"></div>
    <form class="row g-2 mb-4" method="get" th:action="@{/admin/reports}">
        <div class="col-md-4"><label class="form-label">Từ ngày</label>
            <input type="date" class="form-control" name="startDate" th:value="${startDate}"></div>
        <div class="col-md-4"><label class="form-label">Đến ngày</label>
            <input type="date" class="form-control" name="endDate" th:value="${endDate}"></div>
        <div class="col-md-4 d-grid align-self-end"><button class="btn btn-primary">Xem báo cáo</button></div>
    </form>

    <th:block th:if="${report != null}">
        <p th:if="${report.empty}" class="text-muted">Không có dữ liệu trong khoảng thời gian đã chọn.</p>
        <th:block th:unless="${report.empty}">
            <div class="row g-3 mb-4">
                <div class="col-md-4"><div class="card card-body"><div class="text-muted">Tổng số đơn</div>
                    <div class="fs-3 fw-bold" th:text="${report.totalBookings}"></div></div></div>
                <div class="col-md-4"><div class="card card-body"><div class="text-muted">Tổng số vé</div>
                    <div class="fs-3 fw-bold" th:text="${report.totalTickets}"></div></div></div>
                <div class="col-md-4"><div class="card card-body"><div class="text-muted">Tổng doanh thu</div>
                    <div class="fs-3 fw-bold" th:text="${#numbers.formatDecimal(report.totalRevenue, 0, 'COMMA', 0, 'POINT')} + 'đ'"></div></div></div>
            </div>

            <h5>(a) Doanh thu theo phim (giảm dần)</h5>
            <table class="table table-sm">
                <thead class="table-light"><tr><th>#</th><th>Phim</th><th>Số vé</th><th>Doanh thu</th></tr></thead>
                <tbody><tr th:each="r, st : ${report.revenueByMovie}">
                    <td th:text="${st.count}"></td>
                    <td th:text="${r.title}"></td>
                    <td th:text="${r.ticketCount}"></td>
                    <td th:text="${#numbers.formatDecimal(r.revenue, 0, 'COMMA', 0, 'POINT')} + 'đ'"></td>
                </tr></tbody>
            </table>

            <h5 class="mt-4">(b) Đơn đã xác nhận trong kỳ (mới nhất trước)</h5>
            <table class="table table-sm">
                <thead class="table-light"><tr><th>#</th><th>Ngày đặt</th><th>Khách hàng</th><th>Phim</th><th>Tổng tiền</th></tr></thead>
                <tbody><tr th:each="b : ${report.bookings}">
                    <td><a th:href="@{/admin/bookings/{id}(id=${b.bookingId})}" th:text="${b.bookingId}"></a></td>
                    <td th:text="${#temporals.format(b.bookingDate, 'dd/MM/yyyy HH:mm')}"></td>
                    <td th:text="${b.customer.fullName}"></td>
                    <td th:text="${b.showtime.movie.title}"></td>
                    <td th:text="${#numbers.formatDecimal(b.totalAmount, 0, 'COMMA', 0, 'POINT')} + 'đ'"></td>
                </tr></tbody>
            </table>
        </th:block>
    </th:block>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
Trong `src/main/resources/templates/fragments/layout.html` thay **đúng dòng comment** `<!-- [..] menu Báo cáo ... -->` bằng:

```html
                    <li class="nav-item"><a class="nav-link" th:href="@{/admin/reports}">Báo cáo</a></li>
```

```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/controller/admin/AdminReportController.java \
        src/main/resources/templates/admin/report.html \
        src/main/resources/templates/fragments/layout.html
git commit -m "feat(report): add report page with date range filter" -m "Refs #17"
```

#### #17.3 — [D] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] Mặc định (đầu tháng → hôm nay) thấy các đơn CONFIRMED trong seed
- [ ] Khoảng 1 ngày đúng ngày có đơn → vẫn thấy (bao ngày cuối)
- [ ] Start > End → lỗi; khoảng năm ngoái → "Không có dữ liệu"

#### #17.4 — [D] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/17-revenue-report
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/17-revenue-report`**.

- **Title:** `feat(report): revenue report by date range`
- **Reviewers:** C + B  ·  **Assignees:** D  ·  **Labels:** `type: feature`, `module: report`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 3 — Report & Release v1.0.0`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
Báo cáo thống kê giao dịch bán vé theo khoảng StartDate → EndDate.

Các file chính: `MovieRevenueDTO.java`, `ReportResult.java`, `ReportService.java`, `ReportServiceImpl.java`, `AdminReportController.java`, `report.html`

Closes #17

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. Mặc định (đầu tháng → hôm nay) thấy các đơn CONFIRMED trong seed
2. Khoảng 1 ngày đúng ngày có đơn → vẫn thấy (bao ngày cuối)
3. Start > End → lỗi; khoảng năm ngoái → "Không có dữ liệu"

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#17** sang **In review**. Nhắn reviewer link PR.

#### #17.5 — [C + B] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/17-revenue-report
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] Chỉ tính CONFIRMED, bao trọn ngày cuối
- [ ] Q7 DTO giảm dần doanh thu, Q8 giảm dần ngày
- [ ] Validate StartDate ≤ EndDate ở service

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": Mặc định (đầu tháng; Khoảng 1 ngày đúng ngày có đơn — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: D sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #17"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #17.6 — [D] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(report): revenue report by date range (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #17` → **Confirm squash and merge**.
4. Kiểm tra: issue #17 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/17-revenue-report
git fetch --prune
```

✅ **Xong #17:** [ ] code đủ tiêu chí · [ ] 3 commit đúng chuẩn có `Refs #17` · [ ] PR có `Closes #17`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

### #18 — Movie review (TODO 31) (C)

| | |
|---|---|
| 👤 Người làm | **C** |
| 👀 Reviewer | **B** |
| Nhánh | `feature/18-movie-review` |
| Milestone | `Sprint 3 — Report & Release v1.0.0` |
| Cần merge trước | #13 |
| Tiêu đề PR | `feat(review): movie reviews for customers who watched` |

#### #18.1 — [C] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#18** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/18-movie-review
```

#### #18.2 — [C] Code & commit

**Commit 1/2 — `feat(review): add watched movie check query`**

```java
// Import cần có (thêm nếu file chưa có):
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;
// import java.time.LocalDateTime;

// Thêm vào CUỐI interface BookingRepository (trước dấu } cuối):

    // ===== Q12: khách đã xem phim chưa (BR-16) =====
    @Query("""
            SELECT COUNT(b) FROM Booking b
            WHERE b.customer.customerId = :customerId
              AND b.showtime.movie.movieId = :movieId
              AND b.status = com.fu.cinema.enums.BookingStatus.CONFIRMED
              AND b.showtime.endTime < :now
            """)
    long countWatched(@Param("customerId") Long customerId,
                       @Param("movieId") Long movieId,
                       @Param("now") LocalDateTime now);
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/repository/BookingRepository.java
git commit -m "feat(review): add watched movie check query" -m "Refs #18"
```

**Commit 2/2 — `feat(review): allow customers who watched to review movie`**

📄 **`src/main/java/com/fu/cinema/dto/ReviewForm.java`**

```java
package com.fu.cinema.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewForm {

    @NotNull(message = "Vui lòng chọn số sao")
    @Min(1)
    @Max(5)
    private Integer rating;

    @NotBlank(message = "Vui lòng nhập nhận xét")
    @Size(max = 1000)
    private String comment;
}
```
📄 **`src/main/java/com/fu/cinema/service/ReviewService.java`**

```java
package com.fu.cinema.service;

import com.fu.cinema.dto.RatingSummary;
import com.fu.cinema.dto.ReviewForm;
import com.fu.cinema.entity.Review;

import java.util.List;

public interface ReviewService {

    List<Review> findByMovie(Long movieId);

    RatingSummary summarize(Long movieId);

    boolean canReview(Long customerId, Long movieId);

    ReviewForm getForm(Long customerId, Long movieId);

    void save(Long customerId, Long movieId, ReviewForm form);
}
```
📄 **`src/main/java/com/fu/cinema/service/impl/ReviewServiceImpl.java`**

```java
package com.fu.cinema.service.impl;

import com.fu.cinema.dto.RatingSummary;
import com.fu.cinema.dto.ReviewForm;
import com.fu.cinema.entity.Review;
import com.fu.cinema.entity.ReviewId;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.repository.BookingRepository;
import com.fu.cinema.repository.CustomerRepository;
import com.fu.cinema.repository.MovieRepository;
import com.fu.cinema.repository.ReviewRepository;
import com.fu.cinema.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final MovieRepository movieRepository;

    @Override
    public List<Review> findByMovie(Long movieId) {
        return reviewRepository.findByMovie_MovieIdOrderByReviewDateDesc(movieId);
    }

    @Override
    public RatingSummary summarize(Long movieId) {
        return reviewRepository.summarize(movieId);
    }

    @Override
    public boolean canReview(Long customerId, Long movieId) {
        return customerId != null && bookingRepository.countWatched(customerId, movieId, LocalDateTime.now()) > 0;
    }

    @Override
    public ReviewForm getForm(Long customerId, Long movieId) {
        ReviewForm form = new ReviewForm();
        reviewRepository.findById(new ReviewId(customerId, movieId)).ifPresent(r -> {
            form.setRating(r.getRating());
            form.setComment(r.getComment());
        });
        return form;
    }

    @Override
    @Transactional
    public void save(Long customerId, Long movieId, ReviewForm form) {
        if (!canReview(customerId, movieId)) {                                            // BR-16
            throw new BusinessException("Bạn chỉ có thể đánh giá phim đã xem");
        }
        ReviewId id = new ReviewId(customerId, movieId);
        Review review = reviewRepository.findById(id).orElseGet(() -> {                  // khoá kép → thêm mới hoặc sửa
            Review r = new Review();
            r.setId(id);
            r.setCustomer(customerRepository.getReferenceById(customerId));
            r.setMovie(movieRepository.getReferenceById(movieId));
            return r;
        });
        review.setRating(form.getRating());
        review.setComment(form.getComment().trim());
        review.setReviewDate(LocalDateTime.now());
        reviewRepository.save(review);
    }
}
```
📄 **`src/main/java/com/fu/cinema/controller/customer/CustomerReviewController.java`**

```java
package com.fu.cinema.controller.customer;

import com.fu.cinema.dto.ReviewForm;
import com.fu.cinema.exception.BusinessException;
import com.fu.cinema.service.ReviewService;
import com.fu.cinema.util.SessionUtils;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/customer/movies")
@RequiredArgsConstructor
public class CustomerReviewController {

    private final ReviewService reviewService;

    @PostMapping("/{movieId}/review")
    public String review(@PathVariable Long movieId, @Valid @ModelAttribute("reviewForm") ReviewForm form,
                         BindingResult br, HttpSession session, RedirectAttributes ra) {
        if (br.hasErrors()) {
            ra.addFlashAttribute("error", br.getAllErrors().get(0).getDefaultMessage());
        } else {
            try {
                reviewService.save(SessionUtils.getCurrentCustomerId(session), movieId, form);
                ra.addFlashAttribute("success", "Cảm ơn bạn đã đánh giá!");
            } catch (BusinessException e) {
                ra.addFlashAttribute("error", e.getMessage());
            }
        }
        return "redirect:/movies/" + movieId;
    }
}
```
📄 **`src/main/java/com/fu/cinema/controller/HomeController.java`**

```java
package com.fu.cinema.controller;

import com.fu.cinema.dto.SessionUser;
import com.fu.cinema.entity.Movie;
import com.fu.cinema.entity.Showtime;
import com.fu.cinema.service.GenreService;
import com.fu.cinema.service.MovieService;
import com.fu.cinema.service.ReviewService;
import com.fu.cinema.service.ShowtimeService;
import com.fu.cinema.util.PageUtils;
import com.fu.cinema.util.SessionUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class HomeController {

    private final MovieService movieService;
    private final GenreService genreService;
    private final ShowtimeService showtimeService;
    private final ReviewService reviewService;

    @GetMapping({"/", "/movies"})
    public String home(@RequestParam(required = false) String kw,
                       @RequestParam(required = false) Long genreId,
                       @RequestParam(defaultValue = "0") int page,
                       Model model) {
        Page<Movie> movies = movieService.searchForCustomer(kw, genreId, page, 12);
        model.addAttribute("movies", movies);
        model.addAttribute("genres", genreService.findAll());
        model.addAttribute("kw", kw);
        model.addAttribute("genreId", genreId);
        model.addAttribute("pageUrl", PageUtils.currentUrlWithoutPage());
        return "index";
    }

    @GetMapping("/movies/{id}")
    public String movieDetail(@PathVariable Long id,
                              HttpServletRequest request,
                              Model model) {
        model.addAttribute("movie", movieService.getForCustomer(id));

        // Suất chiếu sắp tới, nhóm theo ngày (giữ thứ tự thời gian)
        Map<LocalDate, List<Showtime>> byDate = showtimeService.findUpcomingByMovie(id).stream()
                .collect(Collectors.groupingBy(s -> s.getStartTime().toLocalDate(), LinkedHashMap::new, Collectors.toList()));
        model.addAttribute("showtimesByDate", byDate);

        model.addAttribute("rating", reviewService.summarize(id));
        model.addAttribute("reviews", reviewService.findByMovie(id));
        SessionUser user = SessionUtils.getCurrentUser(request.getSession(false));
        Long customerId = user == null ? null : user.getCustomerId();
        boolean canReview = reviewService.canReview(customerId, id);
        model.addAttribute("canReview", canReview);
        if (canReview) {
            model.addAttribute("reviewForm", reviewService.getForm(customerId, id));
        }
        return "movie-detail";
    }
}
```
📄 **`src/main/resources/templates/movie-detail.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head(${movie.title})}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4">
    <div th:replace="~{fragments/layout :: flash}"></div>

    <div class="row g-4">
        <div class="col-md-3"><img class="poster rounded" th:src="${movie.posterUrl}" th:alt="${movie.title}"></div>
        <div class="col-md-9">
            <h2 th:text="${movie.title}"></h2>
            <p>
                <span class="badge bg-danger" th:text="${movie.ageRating}"></span>
                <span class="badge bg-info text-dark" th:text="${movie.genre.genreName}"></span>
                <span class="text-muted" th:text="|${movie.duration} phút · Khởi chiếu ${#temporals.format(movie.releaseDate, 'dd/MM/yyyy')}|"></span>
            </p>
            <p><strong>Đạo diễn:</strong> <span th:text="${movie.director}"></span></p>
            <p th:text="${movie.description}"></p>
            <p>
                <strong>Đánh giá:</strong>
                <span th:if="${rating.total > 0}"
                      th:text="|${#numbers.formatDecimal(rating.average, 1, 1)}/5 ⭐ (${rating.total} lượt)|"></span>
                <span th:if="${rating.total == 0}" class="text-muted">Chưa có đánh giá</span>
            </p>
        </div>
    </div>

    <h4 class="mt-4">Lịch chiếu</h4>
    <p th:if="${showtimesByDate.isEmpty()}" class="text-muted">Chưa có suất chiếu.</p>
    <div th:each="entry : ${showtimesByDate}" class="mb-3">
        <h6 th:text="${#temporals.format(entry.key, 'EEEE, dd/MM/yyyy')}"></h6>
        <a th:each="s : ${entry.value}" class="btn btn-outline-success me-2 mb-2"
           th:href="@{/customer/showtimes/{id}/seats(id=${s.showtimeId})}"
           th:text="|${#temporals.format(s.startTime, 'HH:mm')} · ${s.room.roomName}|"></a>
    </div>

    <h4 class="mt-4">Đánh giá của khán giả</h4>
    <form th:if="${canReview}" th:action="@{/customer/movies/{id}/review(id=${movie.movieId})}"
          th:object="${reviewForm}" method="post" class="card card-body mb-3">
        <div class="row g-2">
            <div class="col-md-2">
                <select class="form-select" th:field="*{rating}">
                    <option th:each="i : ${#numbers.sequence(5, 1, -1)}" th:value="${i}" th:text="|${i} ⭐|"></option>
                </select>
            </div>
            <div class="col-md-8"><input class="form-control" th:field="*{comment}" placeholder="Nhận xét của bạn..."></div>
            <div class="col-md-2 d-grid"><button class="btn btn-primary">Gửi đánh giá</button></div>
        </div>
    </form>
    <div th:each="r : ${reviews}" class="border-bottom py-2">
        <strong th:text="${r.customer.fullName}"></strong>
        <span th:text="|${r.rating} ⭐|"></span>
        <small class="text-muted" th:text="${#temporals.format(r.reviewDate, 'dd/MM/yyyy')}"></small>
        <div th:text="${r.comment}"></div>
    </div>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/dto/ReviewForm.java \
        src/main/java/com/fu/cinema/service/ReviewService.java \
        src/main/java/com/fu/cinema/service/impl/ReviewServiceImpl.java \
        src/main/java/com/fu/cinema/controller/customer/CustomerReviewController.java \
        src/main/java/com/fu/cinema/controller/HomeController.java \
        src/main/resources/templates/movie-detail.html
git commit -m "feat(review): allow customers who watched to review movie" -m "Refs #18"
```

#### #18.3 — [C] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] an.nv → chi tiết "Biệt Đội Siêu Tốc" có form → gửi 4⭐ → gửi lại 5⭐ (sửa, không nhân bản)
- [ ] Điểm trung bình cập nhật
- [ ] binh.tt → không thấy form

#### #18.4 — [C] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/18-movie-review
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/18-movie-review`**.

- **Title:** `feat(review): movie reviews for customers who watched`
- **Reviewers:** B  ·  **Assignees:** C  ·  **Labels:** `type: feature`, `module: movie`, `bonus`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 3 — Report & Release v1.0.0`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
(Bonus) Khách đã xem phim được đánh giá; hiển thị đánh giá và điểm trung bình.

Các file chính: `ReviewForm.java`, `ReviewService.java`, `ReviewServiceImpl.java`, `CustomerReviewController.java`

Closes #18

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. an.nv → chi tiết "Biệt Đội Siêu Tốc" có form → gửi 4⭐ → gửi lại 5⭐ (sửa, không nhân bản)
2. Điểm trung bình cập nhật
3. binh.tt → không thấy form

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#18** sang **In review**. Nhắn reviewer link PR.

#### #18.5 — [B] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/18-movie-review
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] BR-16 kiểm tra trong service
- [ ] Khoá kép: có thì sửa, chưa có thì thêm

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": an.nv; Điểm trung bình cập nhật — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: C sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #18"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #18.6 — [C] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(review): movie reviews for customers who watched (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #18` → **Confirm squash and merge**.
4. Kiểm tra: issue #18 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/18-movie-review
git fetch --prune
```

✅ **Xong #18:** [ ] code đủ tiêu chí · [ ] 2 commit đúng chuẩn có `Refs #18` · [ ] PR có `Closes #18`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

### #20 — Admin dashboard statistics (D)

| | |
|---|---|
| 👤 Người làm | **D** |
| 👀 Reviewer | **A** |
| Nhánh | `feature/20-admin-dashboard` |
| Milestone | `Sprint 3 — Report & Release v1.0.0` |
| Cần merge trước | #7, #9, #11, #12 |
| Tiêu đề PR | `feat(dashboard): admin dashboard statistics` |

#### #20.1 — [D] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#20** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c feature/20-admin-dashboard
```

#### #20.2 — [D] Code & commit

**Commit 1/1 — `feat(dashboard): show key statistics and today showtimes by room`**

📄 **`src/main/java/com/fu/cinema/dto/DashboardStats.java`**

```java
package com.fu.cinema.dto;

import lombok.Value;

import java.util.List;

@Value
public class DashboardStats {

    long showingMovies;
    long customers;
    long pendingBookings;
    List<RoomShowtimeCount> todayShowtimesByRoom;
}
```
📄 **`src/main/java/com/fu/cinema/controller/admin/AdminDashboardController.java`**

```java
package com.fu.cinema.controller.admin;

import com.fu.cinema.dto.DashboardStats;
import com.fu.cinema.service.BookingService;
import com.fu.cinema.service.CustomerService;
import com.fu.cinema.service.MovieService;
import com.fu.cinema.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final MovieService movieService;
    private final CustomerService customerService;
    private final BookingService bookingService;
    private final ShowtimeService showtimeService;

    @GetMapping
    public String dashboard(Model model) {
        model.addAttribute("stats", new DashboardStats(
                movieService.countShowing(),
                customerService.count(),
                bookingService.countPending(),
                showtimeService.countTodayByRoom()));
        return "admin/dashboard";
    }
}
```
📄 **`src/main/resources/templates/admin/dashboard.html`**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head th:replace="~{fragments/layout :: head('Dashboard')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<main class="container py-4">
    <div th:replace="~{fragments/layout :: flash}"></div>
    <h3 class="mb-4">Dashboard</h3>
    <div class="row g-3 mb-4">
        <div class="col-md-4"><div class="card card-body"><div class="text-muted">Phim đang chiếu</div>
            <div class="fs-2 fw-bold" th:text="${stats.showingMovies}"></div></div></div>
        <div class="col-md-4"><div class="card card-body"><div class="text-muted">Khách hàng</div>
            <div class="fs-2 fw-bold" th:text="${stats.customers}"></div></div></div>
        <div class="col-md-4"><div class="card card-body"><div class="text-muted">Đơn chờ xác nhận</div>
            <div class="fs-2 fw-bold" th:text="${stats.pendingBookings}"></div>
            <a th:href="@{/admin/bookings(status='PENDING')}">Xem đơn →</a></div></div>
    </div>
    <h5>Suất chiếu hôm nay theo phòng</h5>
    <table class="table table-sm w-auto">
        <thead><tr><th>Phòng</th><th>Số suất</th></tr></thead>
        <tbody><tr th:each="r : ${stats.todayShowtimesByRoom}">
            <td th:text="${r.roomName}"></td><td th:text="${r.showtimeCount}"></td></tr></tbody>
    </table>
</main>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add src/main/java/com/fu/cinema/dto/DashboardStats.java \
        src/main/java/com/fu/cinema/controller/admin/AdminDashboardController.java \
        src/main/resources/templates/admin/dashboard.html
git commit -m "feat(dashboard): show key statistics and today showtimes by room" -m "Refs #20"
```

#### #20.3 — [D] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] 3 thẻ số liệu khớp dữ liệu
- [ ] Bảng suất hôm nay theo phòng (phòng không có suất hiện 0)
- [ ] Link "Xem đơn" mở danh sách lọc sẵn PENDING

#### #20.4 — [D] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin feature/20-admin-dashboard
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `feature/20-admin-dashboard`**.

- **Title:** `feat(dashboard): admin dashboard statistics`
- **Reviewers:** A  ·  **Assignees:** D  ·  **Labels:** `type: feature`, `module: infra`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 3 — Report & Release v1.0.0`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
Trang `/admin`: số phim đang chiếu, số khách hàng, số đơn PENDING, số suất chiếu hôm nay theo phòng.

Các file chính: `DashboardStats.java`, `AdminDashboardController.java`, `dashboard.html`

Closes #20

## Loại thay đổi
- [x] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. 3 thẻ số liệu khớp dữ liệu
2. Bảng suất hôm nay theo phòng (phòng không có suất hiện 0)
3. Link "Xem đơn" mở danh sách lọc sẵn PENDING

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#20** sang **In review**. Nhắn reviewer link PR.

#### #20.5 — [A] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch feature/20-admin-dashboard
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] Controller chỉ gọi service
- [ ] Q11 native + projection

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": 3 thẻ số liệu khớp dữ liệu; Bảng suất hôm nay theo phòng (phòng không có suất hiện 0) — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: D sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #20"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #20.6 — [D] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `feat(dashboard): admin dashboard statistics (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #20` → **Confirm squash and merge**.
4. Kiểm tra: issue #20 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D feature/20-admin-dashboard
git fetch --prune
```

✅ **Xong #20:** [ ] code đủ tiêu chí · [ ] 1 commit đúng chuẩn có `Refs #20` · [ ] PR có `Closes #20`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

### #19 — README & release v1.0.0 (TODO 32) (A)

| | |
|---|---|
| 👤 Người làm | **A (Leader)** |
| 👀 Reviewer | **C** |
| Nhánh | `docs/19-readme` |
| Milestone | `Sprint 3 — Report & Release v1.0.0` |
| Cần merge trước | Mọi chức năng đã merge |
| Tiêu đề PR | `docs(readme): complete project readme` |

#### #19.1 — [A] Nhận việc & tạo nhánh

1. Board → kéo thẻ **#19** sang **In progress**. Đọc lại tiêu chí chấp nhận trong issue.
2. Tạo nhánh từ `develop` mới nhất:

```bash
git switch develop
git pull origin develop
git switch -c docs/19-readme
```

#### #19.2 — [A] Code & commit

**Commit 1/1 — `docs(readme): add setup guide, accounts, team and screenshots`**

Chụp màn hình các trang chính, lưu vào `docs/screenshots/*.png`, rồi thay `README.md`:

📄 **`README.md`**

````markdown
# FU Cinema Ticket System

Website quản lý & bán vé xem phim — Assignment 01 môn **HSF302**.

## Công nghệ
- Java 21 · Spring Boot 4.1 · Spring Data JPA (Hibernate 7) · Thymeleaf · Bean Validation
- SQL Server (database `FUCinemaTicketDB`, bảng tạo bằng `ddl-auto=update`)
- Kiến trúc 3-Layer: `controller` → `service` (interface + impl) → `repository` → `entity`
- Đăng nhập bằng HttpSession, phân quyền bằng `HandlerInterceptor`, mật khẩu BCrypt (`spring-security-crypto`)
- Bootstrap 5 (CDN)

## Cài đặt & chạy
Yêu cầu: JDK 21+, Maven 3.9+, SQL Server 2019+ (bật TCP/IP cổng 1433, có login SQL).

```bash
git clone https://github.com/<org>/fu-cinema-ticket-system.git
cd fu-cinema-ticket-system
```

1. Tạo database trong SSMS:
   ```sql
   CREATE DATABASE FUCinemaTicketDB;
   ```
2. Tạo file cấu hình cá nhân (đã nằm trong `.gitignore`, **không commit**):
   ```bash
   cp src/main/resources/application-local.properties.example src/main/resources/application-local.properties
   ```
   Sửa `spring.datasource.username` / `spring.datasource.password` theo SQL Server của máy bạn.
3. Chạy:
   ```bash
   mvn spring-boot:run
   ```
   Mở http://localhost:8080. Lần chạy đầu tiên, `DataSeeder` tự tạo bảng và dữ liệu mẫu.
4. Kiểm tra build + test (dùng H2, không cần SQL Server):
   ```bash
   mvn clean verify
   ```

## Tài khoản mẫu
| Vai trò | Tên đăng nhập | Mật khẩu | Ghi chú |
|---|---|---|---|
| ADMIN | `admin@fucinema.vn` | `Admin@123` | |
| CUSTOMER | `an.nv@gmail.com` | `Customer@123` | Người lớn |
| CUSTOMER | `binh.tt@gmail.com` | `Customer@123` | 15 tuổi — dùng để test BR-11 (phim T16/T18) |

## Chức năng chính
- **Khách:** xem phim đang chiếu / sắp chiếu, tìm & lọc theo thể loại, xem chi tiết + lịch chiếu, đăng ký, đăng nhập.
- **Customer:** đặt vé nhiều ghế trên sơ đồ ghế, lịch sử & huỷ đơn, hồ sơ cá nhân, đổi mật khẩu, đánh giá phim (bonus).
- **Admin:** dashboard, quản lý khách hàng, thể loại, phim, phòng chiếu, suất chiếu (chống trùng giờ), đơn đặt vé, báo cáo doanh thu theo khoảng ngày.

## Thành viên & phân công
| Thành viên | MSSV | Vai trò | Module | TODO |
|---|---|---|---|---|
| A — Nguyễn Văn A | SE18xxxx | Leader | Khởi tạo project, đăng nhập/đăng ký/phân quyền, README, release | 1–3, 13–15, 32 |
| B — ... | ... | Developer | Entity & repository, khách hàng (Admin), đơn đặt vé (Admin), lịch sử đơn, hồ sơ | 4–7, 9, 16, 17, 24, 25, 29, 30 |
| C — ... | ... | Developer | Xử lý lỗi, thể loại, phim, trang chủ, đánh giá (bonus) | 11, 12, 18–21, 27, 31 |
| D — ... | ... | Developer | Seed data, phòng, suất chiếu, đặt vé chọn ghế, báo cáo, dashboard | 8, 22, 23, 26, 28 |

## Ảnh chụp màn hình
| Màn hình | Ảnh |
|---|---|
| Trang chủ | ![home](docs/screenshots/home.png) |
| Chọn ghế | ![seats](docs/screenshots/seats.png) |
| Quản lý suất chiếu | ![showtimes](docs/screenshots/admin-showtimes.png) |
| Báo cáo doanh thu | ![report](docs/screenshots/report.png) |

## Quy trình làm việc nhóm
Git Flow rút gọn (`main` ← `release/*` ← `develop` ← `feature/*`), Conventional Commits, mọi thay đổi qua Pull Request có review (reviewer xoay vòng giữa các thành viên).
Chi tiết: `Assignment1_teamwork.md`.
````
```bash
mvn -q compile                 # build được mới commit
git status                     # xem kỹ danh sách file
git add README.md
git commit -m "docs(readme): add setup guide, accounts, team and screenshots" -m "Refs #19"
```

#### #19.3 — [A] Tự kiểm thử

```bash
mvn -B -ntp clean verify       # bắt buộc BUILD SUCCESS
mvn spring-boot:run
```

- [ ] Một thành viên **clone mới vào thư mục khác**, làm đúng theo README (không hỏi ai) → chạy được
- [ ] Ảnh hiển thị đúng trên GitHub

#### #19.4 — [A] Push & mở Pull Request

```bash
git fetch origin
git rebase origin/develop      # cập nhật develop mới nhất (có xung đột → mục 7)
git push -u origin docs/19-readme
```

Trên GitHub: **Compare & pull request** → kiểm tra **base: `develop`** ← **compare: `docs/19-readme`**.

- **Title:** `docs(readme): complete project readme`
- **Reviewers:** C  ·  **Assignees:** A (Leader)  ·  **Labels:** `type: docs`  ·  **Projects:** `FUCinema Board`  ·  **Milestone:** `Sprint 3 — Report & Release v1.0.0`
- **Description** (dán, rồi đính kèm ảnh chụp màn hình bằng cách kéo thả vào ô):

```markdown
## Mô tả
Hoàn thiện README và phát hành v1.0.0.

Các file chính: `README.md`

Closes #19

## Loại thay đổi
- [ ] feat  - [ ] fix  - [ ] refactor  - [x] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. Một thành viên **clone mới vào thư mục khác**, làm đúng theo README (không hỏi ai) → chạy được
2. Ảnh hiển thị đúng trên GitHub

Kết quả `mvn clean verify`: BUILD SUCCESS

## Ảnh chụp màn hình
<!-- kéo thả ảnh vào đây -->

## Checklist
- [x] Tiêu đề PR theo Conventional Commits
- [x] Đã rebase develop mới nhất
- [x] `mvn verify` → `BUILD SUCCESS` trên máy mình
- [x] Đã tự test các trường hợp chính và trường hợp lỗi
- [x] Controller không gọi repository; nghiệp vụ nằm ở service
- [x] Không chứa mật khẩu/thông tin nhạy cảm
- [ ] Đã cập nhật README (nếu cần)
```

Bấm **Create pull request** (hoặc *Create draft pull request* nếu còn làm dở). Board: kéo thẻ issue **#19** sang **In review**. Nhắn reviewer link PR.

#### #19.5 — [C] Review

> Thao tác review trên web (tìm PR, Files changed, góp ý trên dòng, Review changes, Re-request review): xem chi tiết từng bước ở [#1.5](#15--b-review).

```bash
gh pr checkout <số-PR>         # hoặc: git fetch origin && git switch docs/19-readme
mvn -B -ntp clean verify
mvn spring-boot:run            # làm lại các bước trong mục "Cách kiểm thử" của PR
```

Tab **Files changed** → đọc từng file, góp ý trên dòng (`blocker:` / `suggestion:` / `nit:` / `question:`). Cần soi kỹ:

- [ ] Đủ: mô tả, công nghệ, cài đặt & chạy, tài khoản mẫu, phân công (có MSSV), ảnh chụp

**Review changes** → chọn **Approve** (đạt) hoặc **Request changes** (có `blocker:`) → **Submit review**. Comment mẫu khi approve:

```markdown
Đã checkout và chạy `mvn clean verify` → BUILD SUCCESS.
Đã test lại theo mục "Cách kiểm thử": Một thành viên **clone mới vào thư mục khác**, làm đúng theo README (không hỏi ai); Ảnh hiển thị đúng trên GitHub — đạt.
Kiến trúc: controller → service → repository, BR nằm ở service. LGTM 👍
```

Nếu bị **Request changes**: A (Leader) sửa bằng **commit mới** (`git commit -m "fix(...): ..." -m "Refs #19"` → `git push`), trả lời từng comment, bấm **Resolve conversation**, nhờ reviewer **Re-request review**.

#### #19.6 — [A] Merge & dọn dẹp

1. Trước khi merge: `git fetch origin && git rebase origin/develop && mvn clean verify && git push --force-with-lease`.
2. Điều kiện: ≥ 1 **Approve**, mọi conversation đã resolve, build pass.
3. Mũi tên cạnh nút merge → **Squash and merge** → tiêu đề: `docs(readme): complete project readme (#<số-PR>)` → phần mô tả xoá danh sách commit con, chỉ giữ dòng `Closes #19` → **Confirm squash and merge**.
4. Kiểm tra: issue #19 tự **Closed**, thẻ trên board sang **Done**, nhánh trên GitHub đã tự xoá.
5. Dọn local:

```bash
git switch develop
git pull
git branch -D docs/19-readme
git fetch --prune
```

✅ **Xong #19:** [ ] code đủ tiêu chí · [ ] 1 commit đúng chuẩn có `Refs #19` · [ ] PR có `Closes #19`, đủ label/milestone/board · [ ] reviewer approve · [ ] squash merge · [ ] issue đóng, nhánh đã xoá

---

## 5. Tester cuối sprint

Luân phiên: Sprint 1 — **A**, Sprint 2 — **C**, Sprint 3 (trên nhánh release) — **A + B**. Cuối sprint, trên `develop` mới nhất: xoá & tạo lại DB, chạy app, đi lại toàn bộ mục "Tự kiểm thử" của các issue đã merge trong sprint + checklist mục 11 `Assignment1_ReadMe.md`.

Gặp lỗi → **tạo issue bug thủ công**:
1. **Issues → New issue → Bug report → Get started**.
2. *Title*: `[BUG] <mô tả ngắn>`.
3. Điền *Các bước tái hiện*, *Kết quả mong đợi*, *Kết quả thực tế* (kèm ảnh chụp).
4. Cột phải:
   - **Assignees** = chủ module.
   - **Labels** = `type: bug` + `module: ...`.
   - **Projects** = `FUCinema Board`.
   - **Milestone** = sprint hiện tại.

Chủ module sửa lỗi theo đúng vòng đời ở mục 4:
- Nhánh: `fix/<số>-<mo-ta>`, tạo từ `develop`.
- Commit: `fix(<scope>): ...`, kèm `Refs #<số>`.
- PR: ghi `Closes #<số>`, có review, rồi **Squash and merge**.

Cuối sprint: demo 30 phút, rồi **Milestones → Close** milestone của sprint.

---

## 6. Release v1.0.0 & quy trình merge vào main

> Điều kiện: mọi issue #1–#20 đã đóng. Bonus không làm thì đóng bằng **Close as not planned**.

**6.1 [A] Tạo nhánh release & đổi version**

```bash
git switch develop && git pull
git switch -c release/1.0.0
# pom.xml: <version>1.0.0-SNAPSHOT</version> → <version>1.0.0</version>
git add pom.xml
git commit -m "chore(release): bump version to 1.0.0"
git push -u origin release/1.0.0
```

**6.2 [Tester A + B] Kiểm thử trên `release/1.0.0`.** Lỗi → issue bug → nhánh `fix/<n>-...` **tạo từ `release/1.0.0`** → PR với **base `release/1.0.0`** → review → Squash and merge.

**6.3 [A] Mở PR `release/1.0.0 → main`**
- *base* **`main`** ← *compare* `release/1.0.0` · *Title* `release: v1.0.0` · *Reviewers* **C, D** (cần **2 approvals**) · *Labels* `type: chore` · *Milestone* Sprint 3.
- *Description*:

```markdown
## Release v1.0.0 — FU Cinema Ticket System

### Chức năng
- Khách: xem phim đang chiếu/sắp chiếu, tìm & lọc, chi tiết phim, đăng ký, đăng nhập
- Customer: đặt vé nhiều ghế, lịch sử & huỷ đơn, hồ sơ, đổi mật khẩu, đánh giá phim (bonus)
- Admin: dashboard, khách hàng, thể loại, phim, phòng, suất chiếu, đơn đặt vé, báo cáo doanh thu

### Kiểm thử
- Tester A + B đã chạy toàn bộ checklist mục 11 Assignment1_ReadMe.md trên release/1.0.0
- `mvn clean verify` → BUILD SUCCESS
```

**6.4 [C] và [D] review:** checkout `release/1.0.0`, chạy `mvn clean verify` + `mvn spring-boot:run`, đi nhanh các chức năng chính, rồi **Approve**.

**6.5 [A] Merge:** chọn **Create a merge commit** (KHÔNG squash, để giữ lịch sử release) → **Confirm merge**. Nếu *Automatically delete head branches* xoá mất `release/1.0.0` thì cũng không sao, vì đã merge.

**6.6 [A] Gắn tag & tạo GitHub Release**

```bash
git switch main && git pull
git tag -a v1.0.0 -m "FUCinemaTicketSystem v1.0.0"
git push origin v1.0.0
```

Trên GitHub:
1. **Releases → Draft a new release**.
2. *Choose a tag*: `v1.0.0`.
3. *Target*: `main`.
4. *Release title*: `v1.0.0`.
5. Bấm **Generate release notes** (tự liệt kê các PR).
6. **Publish release**.

**6.7 [A] Back-merge `main → develop`, [B] review**
1. **New pull request**: *base* **`develop`**, *compare* **`main`**.
2. *Title*: `chore(release): back-merge v1.0.0 into develop`.
3. Mời B review. B **Approve**.
4. Merge bằng **Create a merge commit**.
5. Đóng milestone Sprint 3.

**6.8 [A] Nộp bài:**
- Link repo, giảng viên quyền Read; `main` có tag `v1.0.0`.
- README.
- Cách tạo DB.
- File Word theo template:
  - Mục lục và đánh số tiêu đề tự động.
  - Ảnh chụp từng chức năng.
  - Ảnh chụp GitHub: board, một PR có review, *Insights → Network*, *Insights → Contributors*, trang Release.

---

## 7. Xử lý xung đột & lỡ tay

**Xung đột khi rebase** (hay gặp ở `BookingRepository`, `BookingServiceImpl`, `layout.html`):

```bash
git fetch origin
git rebase origin/develop
git status                          # file "both modified"
# Mở file trong IntelliJ: Git → Resolve Conflicts… → Merge → giữ CẢ HAI phần (của mình + của người khác)
# hoặc sửa tay: xoá các dòng <<<<<<< ======= >>>>>>> và giữ nội dung đúng
git add <file>
git rebase --continue               # muốn huỷ: git rebase --abort
mvn -q compile
git push --force-with-lease
```

Xung đột trong code của người khác thì **gọi người đó cùng xử lý**.

| Lỡ tay | Cách cứu |
|---|---|
| Commit nhầm lên `develop` local (chưa push) | `git switch -c feature/<n>-...` → `git switch develop` → `git reset --hard origin/develop` |
| Lỡ add `application-local.properties` (chưa push) | `git rm --cached src/main/resources/application-local.properties` → `git commit --amend` |
| Đã push mật khẩu | Đổi mật khẩu ngay, xoá bằng commit mới, báo Leader |
| Merge nhầm PR | Trang PR đã merge → **Revert** → PR revert → review → merge |
| Sai message commit cuối (chưa push) | `git commit --amend -m "..."` |
| Đang code dở phải đổi nhánh | `git stash` → … → `git stash pop` |
| Push bị hook chặn (`Build/test FAILED`) | Sửa lỗi build/test rồi push lại; không lạm dụng `--no-verify` |

---

## 8. Checklist cuối cùng theo người

Review **xoay vòng**: mỗi người review 6–7 PR của các module khác.

**A (Leader)**
- [ ] Bước 1–5: repo, cấu hình, labels, milestones, board, 20 issue đúng số
- [ ] Code: #1 (templates), #2 (TODO 1–3), #6 (TODO 13–15), #19 (TODO 32) đã merge qua PR có review
- [ ] Đã review #3, #8, #10, #14, #16, #20
- [ ] Tester Sprint 1, Sprint 3; release `release/1.0.0` → `main`, tag `v1.0.0`, GitHub Release, back-merge `develop`
- [ ] Cuối mỗi sprint rà `git log --first-parent develop` (mọi commit đều qua PR)

**B**
- [ ] Code: #3 (TODO 4–7, 9), #7 (16–17), #12 (24–25), #15 (29), #16 (30) đã merge
- [ ] Đã review #1, #4, #11, #14, #17, #18 (gồm các PR thêm code vào `BookingRepository`/`BookingService` của mình) + back-merge
- [ ] Tester Sprint 3

**C**
- [ ] Code: #5 (TODO 11–12), #8 (18), #9 (19–21), #13 (27), #18 (31 — bonus) đã merge
- [ ] Đã review #2, #3 (Genre/Movie/Review), #7, #15, #17, #19 + approve release
- [ ] Tester Sprint 2

**D**
- [ ] Code: #4 (TODO 8), #10 (22), #11 (23), #14 (28), #17 (26), #20 (dashboard) đã merge
- [ ] Đã review #3 (Room/Showtime), #5, #6, #9, #12, #13 + approve release

**Cả nhóm — kiểm tra trước khi nộp (tránh bị trừ điểm)**

| Kiểm tra | Cách xem |
|---|---|
| Mọi người đều có commit | **Insights → Contributors** đủ 4 người |
| Mọi thay đổi đi qua PR | `git log --first-parent --oneline develop` → mỗi dòng có `(#số PR)` |
| Mọi PR có review | Tab **Pull requests → Closed** → mỗi PR có ✔ Approved |
| Không lộ mật khẩu | `git log -p -S "password=" -- '*.properties'` chỉ thấy `CHANGE_ME` |
| Controller không gọi repository | `grep -rn "Repository" src/main/java/com/fu/cinema/controller` → không có kết quả |
| Issue đều đóng, board sạch | Board: mọi thẻ ở **Done** |
