const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

function escapeXml(unsafe) {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const tempDir = path.join(os.tmpdir(), `smarttrip_docx_${Date.now()}`);
fs.mkdirSync(path.join(tempDir, '_rels'), { recursive: true });
fs.mkdirSync(path.join(tempDir, 'word', '_rels'), { recursive: true });

// [Content_Types].xml
const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;
fs.writeFileSync(path.join(tempDir, '[Content_Types].xml'), contentTypesXml, 'utf8');

// _rels/.rels
const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
fs.writeFileSync(path.join(tempDir, '_rels', '.rels'), rootRelsXml, 'utf8');

// word/_rels/document.xml.rels
const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
fs.writeFileSync(path.join(tempDir, 'word', '_rels', 'document.xml.rels'), docRelsXml, 'utf8');

// word/styles.xml
const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Segoe UI"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:color w:val="1E293B"/>
        <w:lang w:val="vi-VN"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:line="276" w:lineRule="auto" w:after="140"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>

  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="360" w:after="140"/>
      <w:pBdr>
        <w:bottom w:val="single" w:sz="16" w:space="4" w:color="0284C7"/>
      </w:pBdr>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Segoe UI Semibold" w:hAnsi="Segoe UI Semibold"/>
      <w:b/>
      <w:sz w:val="30"/>
      <w:szCs w:val="30"/>
      <w:color w:val="0F172A"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="240" w:after="80"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Segoe UI Semibold" w:hAnsi="Segoe UI Semibold"/>
      <w:b/>
      <w:sz w:val="24"/>
      <w:szCs w:val="24"/>
      <w:color w:val="0369A1"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="160" w:after="60"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="22"/>
      <w:szCs w:val="22"/>
      <w:color w:val="0F766E"/>
    </w:rPr>
  </w:style>
</w:styles>`;
fs.writeFileSync(path.join(tempDir, 'word', 'styles.xml'), stylesXml, 'utf8');

// Helper functions for Document Body
let bodyXml = '';

function addTitleBanner(title, subtitle, metaList) {
  bodyXml += `
  <w:p>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:before="200" w:after="100"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI"/>
        <w:b/>
        <w:sz w:val="26"/>
        <w:color w:val="0369A1"/>
      </w:rPr>
      <w:t>ĐẠI HỌC FPT - FPT DA NANG CAMPUS</w:t>
    </w:r>
  </w:p>
  <w:p>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:before="60" w:after="160"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:b/>
        <w:sz w:val="36"/>
        <w:color w:val="0F172A"/>
      </w:rPr>
      <w:t>${escapeXml(title)}</w:t>
    </w:r>
  </w:p>
  <w:p>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:before="0" w:after="240"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:i/>
        <w:sz w:val="24"/>
        <w:color w:val="475569"/>
      </w:rPr>
      <w:t>${escapeXml(subtitle)}</w:t>
    </w:r>
  </w:p>`;

  if (metaList && metaList.length) {
    bodyXml += `
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9600" w:type="dxa"/>
        <w:jc w:val="center"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="8" w:space="0" w:color="CBD5E1"/>
          <w:left w:val="none"/>
          <w:bottom w:val="single" w:sz="8" w:space="0" w:color="CBD5E1"/>
          <w:right w:val="none"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
          <w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="3000"/>
        <w:gridCol w:w="6600"/>
      </w:tblGrid>`;
    for (const [k, v] of metaList) {
      bodyXml += `
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="3000" w:type="dxa"/>
            <w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/>
            <w:tcMar><w:top w:w="80"/><w:bottom w:w="80"/><w:left w:w="120"/><w:right w:w="120"/></w:tcMar>
          </w:tcPr>
          <w:p><w:r><w:rPr><w:b/><w:color w:val="334155"/></w:rPr><w:t>${escapeXml(k)}</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="6600" w:type="dxa"/>
            <w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/>
            <w:tcMar><w:top w:w="80"/><w:bottom w:w="80"/><w:left w:w="120"/><w:right w:w="120"/></w:tcMar>
          </w:tcPr>
          <w:p><w:r><w:rPr><w:color w:val="0F172A"/></w:rPr><w:t>${escapeXml(v)}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>`;
    }
    bodyXml += `</w:tbl><w:p><w:spacing w:after="240"/></w:p>`;
  }
}

function addHeading1(text) {
  bodyXml += `
  <w:p>
    <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
    <w:r><w:t>${escapeXml(text)}</w:t></w:r>
  </w:p>`;
}

function addHeading2(text) {
  bodyXml += `
  <w:p>
    <w:pPr><w:pStyle w:val="Heading2"/></w:pPr>
    <w:r><w:t>${escapeXml(text)}</w:t></w:r>
  </w:p>`;
}

function addHeading3(text) {
  bodyXml += `
  <w:p>
    <w:pPr><w:pStyle w:val="Heading3"/></w:pPr>
    <w:r><w:t>${escapeXml(text)}</w:t></w:r>
  </w:p>`;
}

function addParagraph(text, isBold = false, isItalic = false, color = "1E293B") {
  bodyXml += `
  <w:p>
    <w:r>
      <w:rPr>
        ${isBold ? '<w:b/>' : ''}
        ${isItalic ? '<w:i/>' : ''}
        <w:color w:val="${color}"/>
      </w:rPr>
      <w:t>${escapeXml(text)}</w:t>
    </w:r>
  </w:p>`;
}

function addBullet(label, text) {
  bodyXml += `
  <w:p>
    <w:pPr>
      <w:ind w:left="360" w:hanging="240"/>
      <w:spacing w:after="80"/>
    </w:pPr>
    <w:r>
      <w:rPr><w:b/><w:color w:val="0369A1"/></w:rPr>
      <w:t>• ${escapeXml(label)}: </w:t>
    </w:r>
    <w:r>
      <w:rPr><w:color w:val="334155"/></w:rPr>
      <w:t>${escapeXml(text)}</w:t>
    </w:r>
  </w:p>`;
}

function addScreenshotCallout(owner, title, details) {
  let borderColor = "0284C7";
  let bgColor = "F0F9FF";
  let titleColor = "0369A1";

  if (owner.includes("VINH")) {
    borderColor = "059669";
    bgColor = "F0FDF4";
    titleColor = "047857";
  } else if (owner.includes("CHUNG") || owner.includes("&")) {
    borderColor = "7C3AED";
    bgColor = "F5F3FF";
    titleColor = "6D28D9";
  }

  bodyXml += `
  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="9400" w:type="dxa"/>
      <w:jc w:val="center"/>
      <w:tblBorders>
        <w:top w:val="none"/>
        <w:left w:val="single" w:sz="24" w:space="0" w:color="${borderColor}"/>
        <w:bottom w:val="none"/>
        <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:insideH w:val="none"/>
        <w:insideV w:val="none"/>
      </w:tblBorders>
    </w:tblPr>
    <w:tblGrid>
      <w:gridCol w:w="9400"/>
    </w:tblGrid>
    <w:tr>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="9400" w:type="dxa"/>
          <w:shd w:val="clear" w:color="auto" w:fill="${bgColor}"/>
          <w:tcMar>
            <w:top w:w="120"/>
            <w:bottom w:w="120"/>
            <w:left w:w="180"/>
            <w:right w:w="180"/>
          </w:tcMar>
        </w:tcPr>
        <w:p>
          <w:pPr><w:spacing w:after="60"/></w:pPr>
          <w:r>
            <w:rPr><w:b/><w:color w:val="${titleColor}"/></w:rPr>
            <w:t>[CHỤP MÀN HÌNH - ${escapeXml(owner)}]: ${escapeXml(title)}</w:t>
          </w:r>
        </w:p>
        <w:p>
          <w:pPr><w:spacing w:after="0"/></w:pPr>
          <w:r>
            <w:rPr><w:color w:val="334155"/><w:sz w:val="20"/></w:rPr>
            <w:t>${escapeXml(details)}</w:t>
          </w:r>
        </w:p>
      </w:tc>
    </w:tr>
  </w:tbl>
  <w:p><w:spacing w:after="120"/></w:p>`;
}

function addTable(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  bodyXml += `
  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="${totalW}" w:type="dxa"/>
      <w:jc w:val="center"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="8" w:space="0" w:color="0284C7"/>
        <w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:bottom w:val="single" w:sz="8" w:space="0" w:color="0284C7"/>
        <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
      </w:tblBorders>
    </w:tblPr>
    <w:tblGrid>`;
  for (const w of colWidths) {
    bodyXml += `<w:gridCol w:w="${w}"/>`;
  }
  bodyXml += `</w:tblGrid>
    <w:tr>
      <w:trPr><w:tblHeader/></w:trPr>`;
  for (let i = 0; i < headers.length; i++) {
    bodyXml += `
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="${colWidths[i]}" w:type="dxa"/>
          <w:shd w:val="clear" w:color="auto" w:fill="0F172A"/>
          <w:tcMar><w:top w:w="120"/><w:bottom w:w="120"/><w:left w:w="120"/><w:right w:w="120"/></w:tcMar>
        </w:tcPr>
        <w:p>
          <w:pPr><w:jc w:val="center"/><w:spacing w:after="0"/></w:pPr>
          <w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/></w:rPr><w:t>${escapeXml(headers[i])}</w:t></w:r>
        </w:p>
      </w:tc>`;
  }
  bodyXml += `</w:tr>`;

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const bg = (r % 2 === 1) ? 'F8FAFC' : 'FFFFFF';
    bodyXml += `<w:tr>`;
    for (let c = 0; c < row.length; c++) {
      bodyXml += `
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="${colWidths[c]}" w:type="dxa"/>
          <w:shd w:val="clear" w:color="auto" w:fill="${bg}"/>
          <w:tcMar><w:top w:w="100"/><w:bottom w:w="100"/><w:left w:w="120"/><w:right w:w="120"/></w:tcMar>
        </w:tcPr>
        <w:p>
          <w:pPr><w:spacing w:after="0"/></w:pPr>
          <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="334155"/></w:rPr><w:t>${escapeXml(row[c])}</w:t></w:r>
        </w:p>
      </w:tc>`;
    }
    bodyXml += `</w:tr>`;
  }
  bodyXml += `</w:tbl><w:p><w:spacing w:after="200"/></w:p>`;
}

// ==========================================
// BUILD DOCUMENT CONTENT
// ==========================================

addTitleBanner(
  "MỤC LỤC DỰ ÁN & KẾ HOẠCH MINH CHỨNG CHỤP MÀN HÌNH",
  "Nền tảng đặt tour du lịch phân tán SmartTrip (MSS301 - FA26)",
  [
    ["Học phần", "MSS301 - Microservices with Spring Boot (FA26)"],
    ["Đề tài", "SmartTrip - Distributed Smart Travel Booking Platform"],
    ["Kiến trúc", "Microservices (7 Services), Database-per-Service, Saga Orchestration, RabbitMQ, Outbox, React SPA"],
    ["Thành viên 1", "BẠN (Nhóm trưởng / Service Owner: User, Tour, Gateway, Web Portal)"],
    ["Thành viên 2", "VINH (Thành viên chính / Service Owner: Hotel, Payment, Booking Saga, Outbox, Admin)"],
    ["Môi trường", "Java 21, Spring Boot 3.3.x, MySQL 8.4 (5 DBs), RabbitMQ 3.13, Vite React"]
  ]
);

addHeading1("PHẦN I: MA TRẬN PHÂN CÔNG CHỤP MÀN HÌNH MINH CHỨNG (AUDIT CHECKLIST)");
addParagraph("Bảng phân công chi tiết công việc chụp màn hình giữa hai thành viên theo đúng phân định Bounded Context và quyền sở hữu Microservices:");

addTable(
  ["Thành viên", "Trách nhiệm phân công", "Hạng mục chụp màn hình cần thực hiện", "SL ảnh dự kiến"],
  [
    [
      "BẠN\n(Thành viên 1)",
      "• Discovery Service (Eureka)\n• API Gateway & Routing\n• User Service & JWT Security\n• Tour Service & Available Seats\n• Frontend: Tour Browse, Auth & Operator Portal\n• Concurrency Stress Test",
      "1. Cây thư mục Git & Network Graph PRs\n2. Eureka Dashboard (Port 8761 - 6 instances UP)\n3. Terminal API Gateway (Port 8080)\n4. Postman Login 200 OK & Get Me (/api/v1/users/me)\n5. Postman Token Pre-check (401 Unauthorized / 403 Forbidden)\n6. Postman Tour Listing & Departures Available Seats\n7. Terminal chạy 'mvn test' xanh lá (User & Tour Service)\n8. Web Customer: Trang chủ, Bộ lọc, Chi tiết tour, Tracking đơn\n9. Web Tour Operator: CRUD Tour & Thêm lịch khởi hành\n10. Terminal chạy k6 / node kiểm thử đồng thời (50 users tranh ghế)",
      "10 - 12 ảnh"
    ],
    [
      "VINH\n(Thành viên 2)",
      "• Docker Compose (MySQL & RabbitMQ)\n• Hotel Service & Room Inventory\n• Payment Service & Mock Wallet\n• Booking Service (Saga Orchestrator)\n• Transactional Outbox & Idempotency\n• Frontend: Booking Checkout, Wallet & Saga Visualizer\n• Postman Collection Runner E2E",
      "1. Docker Desktop / 'docker compose ps' (MySQL & RabbitMQ Healthy)\n2. DBeaver/Navicat hiển thị 5 Database độc lập\n3. Postman Hotel & Room Inventory theo ngày\n4. Postman Wallet (Nạp tiền topup & Tra cứu số dư)\n5. RabbitMQ Management (Dashboard Exchanges & Queues, DLQ)\n6. Postman Booking Saga Happy Path (PENDING -> CONFIRMED)\n7. DBeaver: Bảng outbox_messages & processed_messages\n8. Postman Saga Compensation (Rollback khi ví thiếu tiền)\n9. Postman Cancellation Saga (Huỷ đơn & Hoàn tiền)\n10. Web Checkout Modal & Trang Ví điện tử\n11. Web Saga Visualizer Dashboard (Timeline đồ họa các bước)\n12. Postman Collection Runner Full Pass xanh lá (100% tests)",
      "11 - 13 ảnh"
    ]
  ],
  [1600, 2600, 4400, 1000]
);

addHeading1("PHẦN II: BẢNG ÁNH XẠ GITHUB ISSUES, PR & CÁC MICROSERVICES");
addParagraph("Bảng đối chiếu toàn diện 21 Issue GitHub thực tế trong repository với các module chức năng và commit tương ứng:");

addTable(
  ["Issue / PR", "Nhánh Git (Branch)", "Module / Service", "Nội dung kỹ thuật đã hoàn thành"],
  [
    ["Init fa28df3", "main / develop", "Project Root", "Khởi tạo Monorepo skeleton, tài liệu SRS, .gitignore, README.md"],
    ["Issue #1", "feature/1-eureka-setup", "discovery-service", "Setup Netflix Eureka Server port 8761, heartbeat, eviction"],
    ["Issue #2", "feature/2-docker-mysql-mq", "infrastructure", "Docker compose MySQL 8.4 (5 databases) & RabbitMQ 3.13 Management"],
    ["Issue #3", "feature/3-api-gateway", "api-gateway", "Spring Cloud Gateway port 8080, Eureka Dynamic Routing lb://"],
    ["Issue #4", "feature/4-services-skeleton", "backend aggregator", "Aggregator POM, khởi tạo 5 service skeletons & Flyway migration"],
    ["Issue #5 / PR #27", "feature/5-user-service", "user-service (8081)", "User registration, Profile management, Password hashing"],
    ["Issue #6", "feature/6-hotel-service", "hotel-service (8083)", "Hotel, RoomType, DailyRoomInventory, chống overbooking"],
    ["Issue #7 / PR #28", "feature/7-tour-service", "tour-service (8082)", "Tour & Departure management, seats inventory tracking"],
    ["Issue #8", "feature/8-payment-service", "payment-service (8084)", "Mock Wallet, Double-entry Ledger, 2 pha Authorize / Capture"],
    ["Issue #9", "feature/9-booking-foundation", "booking-service (8085)", "Booking Aggregate, Booking Items, Price Snapshot, Saga State entity"],
    ["Issue #10 / PR #32", "feature/10-openfeign-clients", "booking & core", "OpenFeign clients giữa các services, JUnit 5 & Mockito unit tests"],
    ["Issue #11 / PR #33", "feature/11-security-jwt", "gateway & user", "Spring Security + JWT, HMAC-SHA256, Gateway pre-check filter, RBAC"],
    ["Issue #12", "feature/12-rabbitmq-contracts", "common-messaging", "RabbitMQ Topic Exchanges, Queues, DLQ, MessageEnvelope<T>"],
    ["Issue #13", "feature/13-saga-happy-path", "booking-service (8085)", "Booking Saga Orchestrator Happy Path (4 bước hoàn tất đơn hàng)"],
    ["Issue #15 / PR #36", "feature/15-outbox-idempotency", "core services", "Transactional Outbox Pattern & Idempotent Consumer (processed_messages)"],
    ["Issue #14 / PR #37", "feature/14-saga-compensation", "booking-service (8085)", "Saga Compensation (Rollback LIFO: Void Payment -> Release Hotel -> Tour)"],
    ["Issue #16 / PR #38", "feature/16-cancellation-saga", "booking-service (8085)", "Cancellation Saga, Refund Policy hoàn tiền vào ví mô phỏng"],
    ["Issue #17", "feature/17-web-customer-browse", "web frontend", "Web Customer: Danh sách tour, Tìm kiếm, Bộ lọc đa tiêu chí, Modal chi tiết"],
    ["Issue #18 / PR #40", "feature/18-web-booking-wallet", "web frontend", "Web Customer: Checkout modal, Chọn phòng KS, Ví điện tử top-up"],
    ["Issue #41 / PR #42", "feature/41-web-auth-operator-portal", "web frontend", "Web Customer Auth, Tour Operator Management Portal"],
    ["Issue #19 / PR #43", "feature/19-admin-saga-dashboard", "web frontend", "Management Dashboard & Saga Visualizer UI (Timeline các bước)"],
    ["Issue #21 / PR #44", "feature/21-concurrency-postman", "tests & postman", "Kịch bản kiểm thử tải đồng thời k6/JMeter & Postman Collection E2E"]
  ],
  [1300, 2400, 2200, 3700]
);

addHeading1("PHẦN III: MỤC LỤC CHI TIẾT (TABLE OF CONTENTS) & HƯỚNG DẪN CHỤP MÀN HÌNH");

// BƯỚC 0
addHeading2("1. BƯỚC 0 - HẠ TẦNG DỰ ÁN, REPOSITORY VÀ QUY CHUẨN GITHUB WORKFLOW");
addHeading3("1.1. TODO 0.1: Khởi tạo Git Monorepo & Khung dự án SmartTrip");
addBullet("Git Information", "Commit fa28df3 | chore(init): initialize smarttrip project skeleton and documentation");
addBullet("Mã nguồn / Files", "Root project, .gitignore, .env.example, README.md, HuongDan.md, SMARTTRIP_PROJECT_DOCUMENTATION.md");
addScreenshotCallout("BẠN", "Cây thư mục Monorepo trên IDE", "Chụp toàn bộ thanh Explorer cây thư mục của dự án trên VS Code hoặc IntelliJ IDEA, hiển thị rõ các thư mục backend, web, infrastructure, tests, docs.");

addHeading3("1.2. TODO 0.2: Cấu hình quy chuẩn Conventional Commits & Chiến lược phân nhánh Git Flow");
addBullet("Quy chuẩn", "Mô hình nhánh: main (Production) <- develop (Integration) <- feature/<issue-id>-<name>. Quy tắc PR review chéo và liên kết Issue (Closes #n, Refs #n)");
addScreenshotCallout("BẠN", "Mạng lưới phân nhánh GitHub Network Graph", "Chụp biểu đồ mạng lưới nhánh trên GitHub (Insights -> Network) hoặc danh sách các Pull Requests đã Merge thành công từ các nhánh feature/* vào develop.");

addHeading3("1.3. TODO 0.3: Hạ tầng Docker Compose đa dịch vụ (MySQL 8.4 & RabbitMQ 3.13)");
addBullet("Git Information", "Issue #2 | Branch: feature/2-docker-mysql-mq | Commit 557d4d2");
addBullet("Mã nguồn / Files", "docker-compose.yml: cấu hình smarttrip-mysql (port 3306) và smarttrip-rabbitmq (ports 5672, 15672) kèm healthcheck");
addScreenshotCallout("VINH", "Container Docker chạy Healthy", "Chụp giao diện Docker Desktop hoặc cửa sổ terminal chạy lệnh 'docker compose ps' hiển thị cả 2 container MySQL và RabbitMQ đều ở trạng thái 'Up (healthy)'.");

// BƯỚC 1
addHeading2("2. BƯỚC 1 - NỀN TẢNG HẠ TẦNG BACKEND (SERVICE DISCOVERY & API GATEWAY)");
addHeading3("2.1. TODO 1.1: Khởi tạo Discovery Service với Netflix Eureka Server (Port 8761)");
addBullet("Git Information", "Issue #1 | Branch: feature/1-eureka-setup | Commit 49c14a3");
addBullet("Mã nguồn / Files", "backend/discovery-service: DiscoveryServiceApplication.java (@EnableEurekaServer), application.yml cấu hình heartbeat");
addScreenshotCallout("BẠN", "Trang quản trị Eureka Dashboard", "Mở trình duyệt truy cập http://localhost:8761, chụp toàn màn hình Eureka Dashboard hiển thị danh sách đầy đủ các Microservices đã đăng ký: API-GATEWAY, USER-SERVICE, TOUR-SERVICE, HOTEL-SERVICE, PAYMENT-SERVICE, BOOKING-SERVICE.");

addHeading3("2.2. TODO 1.2: Khởi tạo API Gateway với Spring Cloud Gateway (Port 8080)");
addBullet("Git Information", "Issue #3 | Branch: feature/3-api-gateway | Commit 6bda0e4");
addBullet("Mã nguồn / Files", "backend/api-gateway: ApiGatewayApplication.java, application.yml cấu hình Dynamic Routing qua Eureka (lb://...)");
addScreenshotCallout("BẠN", "Khởi động API Gateway thành công", "Chụp màn hình terminal khi API Gateway khởi động trên cổng 8080, hiển thị các route định tuyến động qua Service Discovery.");

addHeading3("2.3. TODO 1.3: Cấu hình Maven Multi-Module Aggregator POM & Dependencies chung");
addBullet("Git Information", "Issue #4 | Commit 5aacb7b, 75e525a");
addBullet("Mã nguồn / Files", "backend/pom.xml: Quản lý tập trung các dependencies Spring Cloud 2023, OpenFeign, Resilience4j, SpringDoc OpenAPI");

// BƯỚC 2
addHeading2("3. BƯỚC 2 - THIẾT KẾ DATABASE-PER-SERVICE & CẤU TRÚC 5 MICROSERVICES CORE");
addHeading3("3.1. TODO 2.1: Khởi tạo 5 Database độc lập trên MySQL");
addBullet("Git Information", "Issue #2 & Issue #4");
addBullet("Mã nguồn / Files", "infrastructure/mysql/init/01-databases.sql: Khởi tạo 5 database độc lập: smarttrip_user_db, smarttrip_tour_db, smarttrip_hotel_db, smarttrip_payment_db, smarttrip_booking_db");
addScreenshotCallout("VINH", "5 Database Độc Lập trên Database Client", "Chụp cây kết nối cơ sở dữ liệu trên DBeaver / Navicat / MySQL Workbench chứng minh rõ ràng mô hình Database-per-service với 5 schema riêng biệt.");

addHeading3("3.2. TODO 2.2: Khởi tạo khung 5 Microservices nghiệp vụ & Flyway Migration");
addBullet("Git Information", "Issue #4 | Branch: feature/4-services-skeleton | Commit 75e525a");
addBullet("Mã nguồn / Files", "Khởi tạo 5 Maven modules, cấu hình Datasource, JPA Hibernate Naming Strategy, script Flyway migration V1__init_schema.sql trong từng service");

// BƯỚC 3
addHeading2("4. BƯỚC 3 - USER SERVICE: AUTHENTICATION, BCRYPT VÀ PHÂN QUYỀN JWT");
addHeading3("4.1. TODO 3.1: Entity User, Role Enum & Seeding tài khoản mẫu");
addBullet("Git Information", "Issue #5 | Branch: feature/5-user-service | PR #27 | Commit fc703a0");
addBullet("Mã nguồn / Files", "com.smarttrip.user.entity.User, enum UserRole (CUSTOMER, TOUR_OPERATOR, HOTEL_MANAGER, ADMIN), UserRepository.java");

addHeading3("4.2. TODO 3.2: Triển khai JwtService & Mã hóa mật khẩu BCrypt");
addBullet("Git Information", "Issue #11 | Branch: feature/11-security-jwt | PR #33 | Commit 5a56d8a");
addBullet("Mã nguồn / Files", "com.smarttrip.user.security.JwtService: Thuật toán HMAC-SHA256, sinh Access Token mang Claims userId, roles");

addHeading3("4.3. TODO 3.3: Triển khai AuthService & Controller Auth / Profile (Port 8081)");
addBullet("Git Information", "Issue #5 & Issue #11");
addBullet("Mã nguồn / Files", "AuthController (/api/v1/auth/login, /register), UserController (/api/v1/users/me)");
addScreenshotCallout("BẠN", "Postman Đăng nhập và Tra cứu hồ sơ JWT", "1. Gửi POST http://localhost:8080/api/v1/auth/login -> Trả về 200 OK kèm accessToken.\n2. Gửi GET http://localhost:8080/api/v1/users/me kèm Bearer Token -> Trả về 200 OK thông tin User.");

addHeading3("4.4. TODO 3.4: Tích hợp API Gateway Token Pre-check & Header Forwarding");
addBullet("Git Information", "Issue #11 | PR #33");
addBullet("Mã nguồn / Files", "backend/api-gateway: JwtAuthenticationFilter kiểm tra token tại Gateway, trích xuất Claims gắn Header X-User-Id, X-User-Roles");
addScreenshotCallout("BẠN", "Postman Kiểm tra Phân quyền RBAC tại Gateway", "1. Gọi API bảo vệ không kèm Token -> Nhận phản hồi 401 Unauthorized từ Gateway.\n2. Dùng Token role CUSTOMER gọi API quản trị Operator -> Nhận 403 Forbidden.");

// BƯỚC 4
addHeading2("5. BƯỚC 4 - TOUR SERVICE & HOTEL SERVICE (CORE INVENTORY PARTICIPANTS)");
addHeading3("5.1. TODO 4.1: Tour Service (Port 8082) - Quản lý Tour & Lịch khởi hành (Departures)");
addBullet("Git Information", "Issue #7 | Branch: feature/7-tour-service | PR #28 | Commit cb2ba1a");
addBullet("Mã nguồn / Files", "Entities: Tour, TourDeparture, TourCategory, TourLocation. TourRepository, TourDepartureRepository");
addScreenshotCallout("BẠN", "Postman Lấy danh sách Tour du lịch", "Gửi GET http://localhost:8080/api/v1/tours kèm tham số lọc -> Trả về 200 OK danh sách tour dạng JSON đầy đủ.");

addHeading3("5.2. TODO 4.2: Tour Service - Quản lý tồn kho chỗ ngồi (Seats Inventory) & Transaction cục bộ");
addBullet("Git Information", "Issue #7");
addBullet("Mã nguồn / Files", "TourInventoryService: Kiểm tra availableSeats >= requestedSeats, cập nhật trừ chỗ nguyên tử chống overbooking");
addScreenshotCallout("BẠN", "Postman Chi tiết lịch khởi hành & Số chỗ còn trống", "Gửi GET http://localhost:8080/api/v1/tours/{id}/departures -> Xem các trường totalSeats và availableSeats.");

addHeading3("5.3. TODO 4.3: Hotel Service (Port 8083) - Quản lý Khách sạn & Loại phòng (Room Types)");
addBullet("Git Information", "Issue #6 | Branch: feature/6-hotel-service | Commit 0a7e655");
addBullet("Mã nguồn / Files", "Entities: Hotel, RoomType, DailyRoomInventory, RoomReservation. HotelRepository, RoomTypeRepository");
addScreenshotCallout("VINH", "Postman Danh sách khách sạn & Loại phòng", "Gửi GET http://localhost:8080/api/v1/hotels -> Trả về 200 OK danh sách khách sạn và các loại phòng (Standard, Deluxe,...).");

addHeading3("5.4. TODO 4.4: Hotel Service - Quản lý tồn kho phòng theo ngày (Daily Room Inventory)");
addBullet("Git Information", "Issue #6");
addBullet("Mã nguồn / Files", "RoomInventoryService: Quản lý và kiểm tra số lượng phòng trống availableRooms theo từng ngày lưu trú");
addScreenshotCallout("VINH", "DBeaver Bảng tồn kho phòng theo ngày", "Chụp bảng daily_room_inventory trong cơ sở dữ liệu smarttrip_hotel_db hiển thị số phòng available_rooms theo từng ngày.");

// BƯỚC 5
addHeading2("6. BƯỚC 5 - PAYMENT SERVICE: MOCK WALLET VÀ IMMUTABLE LEDGER");
addHeading3("6.1. TODO 5.1: Payment Service (Port 8084) - Entity Wallet & Double-Entry Ledger");
addBullet("Git Information", "Issue #8 | Branch: feature/8-payment-service | Commit 8eec979");
addBullet("Mã nguồn / Files", "Entities: Wallet, WalletTransaction, PaymentHold, LedgerEntry (Sổ cái kế toán bất biến, không xóa sửa)");

addHeading3("6.2. TODO 5.2: Triển khai cơ chế 2 pha Authorize (Tạm giữ) và Capture (Khấu trừ thực tế)");
addBullet("Git Information", "Issue #8");
addBullet("Mã nguồn / Files", "PaymentService: holdBalance() (trừ availableBalance, cộng heldBalance), capturePayment() (hoàn tất giao dịch), voidHold() (giải phóng giữ tiền)");

addHeading3("6.3. TODO 5.3: API Nạp tiền, Tra cứu số dư ví & Lịch sử giao dịch");
addBullet("Git Information", "Issue #8");
addBullet("Mã nguồn / Files", "WalletController (/api/v1/wallet/balance, /api/v1/wallet/topup), PaymentController (/api/v1/payments/history)");
addScreenshotCallout("VINH", "Postman Nạp tiền Ví và Kiểm tra số dư", "1. Gửi POST http://localhost:8080/api/v1/wallet/topup nạp 5.000.000 VNĐ -> 200 OK.\n2. Gửi GET http://localhost:8080/api/v1/wallet/balance xem số dư khả dụng.");

// BƯỚC 6
addHeading2("7. BƯỚC 6 - GIAO TIẾP ĐỒNG BỘ OPENFEIGN & KIỂM THỬ ĐƠN VỊ (UNIT TESTS)");
addHeading3("7.1. TODO 6.1: Cấu hình OpenFeign Clients giữa các Microservices");
addBullet("Git Information", "Issue #10 | Branch: feature/10-openfeign-clients | PR #32 | Commit 8d7cb9a");
addBullet("Mã nguồn / Files", "TourServiceClient, HotelServiceClient, PaymentServiceClient tại booking-service/client/ kèm FeignErrorDecoder");

addHeading3("7.2. TODO 6.2: Triển khai Unit Tests với JUnit 5 & Mockito cho User Service và Tour Service");
addBullet("Git Information", "Issue #10 | Commit a15ef8c");
addBullet("Mã nguồn / Files", "UserServiceTest, TourServiceTest, TourInventoryServiceTest kiểm tra các ràng buộc logic nghiệp vụ");
addScreenshotCallout("BẠN", "Terminal Kết quả chạy Unit Test thành công", "Chạy lệnh 'mvn test' tại user-service hoặc tour-service, chụp màn hình hiển thị BUILD SUCCESS với các tests đều Pass xanh lá.");

// BƯỚC 7
addHeading2("8. BƯỚC 7 - COMMON MESSAGING: THIẾT KẾ RABBITMQ EVENT-DRIVEN CONTRACTS");
addHeading3("8.1. TODO 7.1: Module common-messaging - Cấu hình Topic Exchanges, Queues & DLQ");
addBullet("Git Information", "Issue #12 | Branch: feature/12-rabbitmq-contracts | Commit c5c712a");
addBullet("Mã nguồn / Files", "RabbitMQConfig: smarttrip.booking.exchange, smarttrip.tour.exchange, smarttrip.hotel.exchange, smarttrip.payment.exchange và các Dead Letter Queues");
addScreenshotCallout("VINH", "RabbitMQ Management Dashboard Exchanges & Queues", "Mở trình duyệt truy cập http://localhost:15672, chụp màn hình tab Exchanges và tab Queues hiển thị các hàng đợi và Dead Letter Queue đang hoạt động.");

addHeading3("8.2. TODO 7.2: Thiết kế Message Envelope, Command DTOs & Event DTOs");
addBullet("Git Information", "Issue #12");
addBullet("Mã nguồn / Files", "MessageEnvelope<T> (messageId, sagaId, correlationId, eventType, payload, timestamp). Các Commands và Events phân tán");

// BƯỚC 8
addHeading2("9. BƯỚC 8 - SAGA ORCHESTRATOR: BOOKING CREATION & HAPPY PATH");
addHeading3("9.1. TODO 8.1: Booking Service (Port 8085) - Booking Aggregate, Items & Price Snapshot");
addBullet("Git Information", "Issue #9 | Branch: feature/9-booking-foundation | Commit dd1b2c1");
addBullet("Mã nguồn / Files", "Entities: Booking, BookingItem, PriceSnapshot, SagaInstance, SagaStepLog");

addHeading3("9.2. TODO 8.2: Động cơ BookingSagaOrchestrator - Điều phối quy trình đặt tour thành công");
addBullet("Git Information", "Issue #13 | Branch: feature/13-saga-happy-path | Commit 5b60ccb");
addBullet("Mã nguồn / Files", "BookingSagaOrchestrator: Điều phối tuần tự 4 bước (Reserve Tour -> Reserve Hotel -> Authorize Payment -> Confirm & Capture)");

addHeading3("9.3. TODO 8.3: RabbitMQ Command Listeners tại Tour, Hotel và Payment Service");
addBullet("Git Information", "Issue #13");
addBullet("Mã nguồn / Files", "TourCommandListener, HotelCommandListener, PaymentCommandListener");
addScreenshotCallout("VINH", "Postman Kích hoạt Saga Happy Path Đặt tour thành công", "1. Gửi POST http://localhost:8080/api/v1/bookings -> Trả về 201 Created kèm sagaId, trạng thái ban đầu PENDING.\n2. Gửi GET http://localhost:8080/api/v1/bookings/{id} sau khi hoàn tất -> Trạng thái đổi thành CONFIRMED.");

// BƯỚC 9
addHeading2("10. BƯỚC 9 - ĐỘ TIN CẬY HỆ THỐNG: TRANSACTIONAL OUTBOX & IDEMPOTENT CONSUMER");
addHeading3("10.1. TODO 9.1: Triển khai Transactional Outbox Pattern chống mất mát Message");
addBullet("Git Information", "Issue #15 / PR #36 | Commit 468ca6a");
addBullet("Mã nguồn / Files", "Bảng outbox_messages tại Tour, Hotel, Payment, Booking. Scheduled Publisher quét bảng định kỳ đẩy vào RabbitMQ");
addScreenshotCallout("VINH", "DBeaver Bảng outbox_messages trạng thái SENT", "Mở DBeaver chụp bảng outbox_messages trong smarttrip_booking_db hiển thị các tin nhắn đã phát kèm cột status = 'SENT'.");

addHeading3("10.2. TODO 9.2: Triển khai Idempotent Consumer chống trùng lặp Message");
addBullet("Git Information", "Issue #15 / PR #36");
addBullet("Mã nguồn / Files", "Bảng processed_messages (message_id, handler_name, processed_at) và IdempotencyHandler");
addScreenshotCallout("VINH", "DBeaver Bảng deduplication processed_messages", "Chụp bảng processed_messages ghi nhận các message_id đã xử lý, chứng minh hệ thống không bị xử lý trùng lặp.");

// BƯỚC 10
addHeading2("11. BƯỚC 10 - SAGA COMPENSATION (BÙ TRỪ THẤT BẠI) & CANCELLATION SAGA");
addHeading3("11.1. TODO 10.1: Triển khai Compensating Transactions theo nguyên lý LIFO (Rollback)");
addBullet("Git Information", "Issue #14 | Branch: feature/14-saga-compensation | PR #37 | Commit 3dda053");
addBullet("Mã nguồn / Files", "Cơ chế bù trừ ngược lại: Void Payment -> Release Hotel Rooms -> Release Tour Seats khi một bước gặp sự cố");
addScreenshotCallout("VINH", "Postman Kịch bản Bù trừ Saga khi số dư ví không đủ", "Gửi POST /api/v1/bookings khi số dư ví ít hơn giá tour -> Saga nhận lỗi thiếu tiền, thực hiện rollback giải phóng chỗ tour đã giữ, trạng thái booking chuyển thành FAILED (Compensated).");

addHeading3("11.2. TODO 10.2: Triển khai Cancellation Saga & Chính sách hoàn tiền (Refund Policy)");
addBullet("Git Information", "Issue #16 | Branch: feature/16-cancellation-saga | PR #38 | Commit 82d438b");
addBullet("Mã nguồn / Files", "CancellationSagaOrchestrator: Huỷ tour theo yêu cầu khách hàng, tính toán phí huỷ và gửi RefundPaymentCommand hoàn tiền vào ví");
addScreenshotCallout("VINH", "Postman Huỷ Booking và Hoàn tiền vào ví", "Gửi POST http://localhost:8080/api/v1/bookings/{id}/cancel -> Trả về 200 OK trạng thái CANCELLED, kiểm tra lại ví thấy tiền đã được hoàn trả.");

// BƯỚC 11
addHeading2("12. BƯỚC 11 - GIAO DIỆN KHÁCH HÀNG (CUSTOMER WEB APPLICATION)");
addHeading3("12.1. TODO 11.1: Web Customer - Tìm kiếm Tour, Bộ lọc nâng cao & Modal chi tiết");
addBullet("Git Information", "Issue #17 | Branch: feature/17-web-customer-browse | Commit 7c61c40");
addBullet("Mã nguồn / Files", "web/src/pages/HomePage.jsx, TourCard.jsx, TourDetailsModal.jsx");
addScreenshotCallout("BẠN", "Giao diện Web: Trang chủ và Bộ lọc tìm kiếm Tour", "Chụp màn hình giao diện web hiển thị Hero banner, ô tìm kiếm tour theo địa điểm, thanh trượt giá, và Modal xem chi tiết lịch trình tour.");

addHeading3("12.2. TODO 11.2: Web Customer - Quy trình Checkout, Chọn phòng & Quản lý ví");
addBullet("Git Information", "Issue #18 / PR #40 | Commit d8c04a6");
addBullet("Mã nguồn / Files", "BookingCheckoutModal.jsx, WalletPage.jsx");
addScreenshotCallout("VINH", "Giao diện Web: Modal Checkout Đặt tour & Trang Ví điện tử", "1. Chụp Modal Checkout cho phép chọn số lượng người lớn/trẻ em và chọn phòng khách sạn kèm bảng tính tổng tiền.\n2. Chụp trang Quản lý ví hiển thị số dư và nút Nạp tiền.");

addHeading3("12.3. TODO 12.3: Web Customer - Đăng ký, Đăng nhập & Theo dõi đơn hàng theo thời gian thực");
addBullet("Git Information", "Issue #41 | Commit a382bf6");
addBullet("Mã nguồn / Files", "LoginPage.jsx, RegisterPage.jsx, BookingTrackingPage.jsx");
addScreenshotCallout("BẠN", "Giao diện Web: Đăng nhập & Theo dõi đơn đặt tour", "1. Chụp giao diện form Đăng nhập / Đăng ký tài khoản.\n2. Chụp trang Theo dõi đơn hàng (Booking Tracking) hiển thị trạng thái thời gian thực PENDING -> CONFIRMED.");

// BƯỚC 12
addHeading2("13. BƯỚC 12 - GIAO DIỆN QUẢN TRỊ & ĐIỀU HÀNH (OPERATOR & SAGA DASHBOARD)");
addHeading3("13.1. TODO 12.1: Web Portal Tour Operator - Quản lý Tour & Lịch khởi hành");
addBullet("Git Information", "Issue #41 / PR #42 | Branch: feature/41-web-auth-operator-portal | Commit d9402fa");
addBullet("Mã nguồn / Files", "TourOperatorDashboard.jsx: Quản lý danh sách tour, thêm mới tour và tạo lịch khởi hành");
addScreenshotCallout("BẠN", "Giao diện Web: Tour Operator Portal", "Chụp trang quản lý của nhà điều hành tour (Tour Operator Dashboard), hiển thị bảng danh sách các tour và form tạo lịch khởi hành kèm cấu hình số lượng chỗ.");

addHeading3("13.2. TODO 12.2: Web Admin - Management Dashboard & Saga Visualizer");
addBullet("Git Information", "Issue #19 / PR #43 | Commit 21f111e");
addBullet("Mã nguồn / Files", "SagaVisualizer.jsx, AdminDashboard.jsx: Trực quan hóa timeline các bước Saga");
addScreenshotCallout("VINH", "Giao diện Web: Saga Visualizer Dashboard", "(Minh chứng cực kỳ giá trị) Chụp màn hình đồ họa trực quan hóa luồng Saga: Hiển thị các khối màu xanh lá khi từng bước thành công (Reserve Tour -> Reserve Hotel -> Authorize Payment -> Confirm) hoặc màu đỏ khi có lỗi bù trừ.");

// BƯỚC 13
addHeading2("14. BƯỚC 13 - KIỂM THỬ ĐỒNG THỜI, TẢI NẶNG & BỘ TEST POSTMAN E2E");
addHeading3("14.1. TODO 13.1: Kịch bản kiểm thử đồng thời (Concurrency Tests) với k6 và JMeter");
addBullet("Git Information", "Issue #21 / PR #44 | Commit e0c924b");
addBullet("Mã nguồn / Files", "tests/concurrency/booking_concurrency_k6.js, booking_concurrency_jmeter.jmx, run_concurrency_test.js");
addScreenshotCallout("BẠN", "Terminal Kiểm thử tranh chấp chỗ ngồi (k6 Concurrency Test)", "Chạy lệnh kiểm thử tải đồng thời trong tests/concurrency/ (50 requests cùng tranh 5 chỗ cuối cùng). Chụp kết quả terminal chứng minh đúng 5 booking thành công và 45 booking bị từ chối an toàn, không có overbooking.");

addHeading3("14.2. TODO 13.2: Bộ tài liệu Postman Collection E2E & Environment hoàn chỉnh");
addBullet("Git Information", "Issue #21 / PR #44");
addBullet("Mã nguồn / Files", "smarttrip_postman_collection.json, smarttrip_postman_environment.json");
addScreenshotCallout("VINH", "Postman Collection Runner PASS 100%", "Chụp kết quả chạy Postman Collection Runner cho toàn bộ các API kiểm thử tự động, hiển thị tất cả các assertions đều PASS màu xanh lá cây.");

// BƯỚC 14
addHeading2("15. BƯỚC 14 - TỔNG KẾT, ĐÓNG GÓI TOÀN HỆ THỐNG VÀ BÁO CÁO DỰ ÁN");
addHeading3("15.1. TODO 14.1: Kiểm tra chạy đồng bộ 7 Microservices + MySQL + RabbitMQ + Web Frontend");
addBullet("Nội dung", "Khởi động và vận hành trơn tru toàn bộ hệ sinh thái Microservices");
addScreenshotCallout("BẠN & VINH", "Màn hình Vận hành Tổng thể Hệ thống", "Chụp màn hình tổng hợp các cửa sổ Terminal đang chạy đồng thời 7 backend microservices (8080, 8081, 8082, 8083, 8084, 8085, 8761), container Docker và giao diện Web Vite 5173.");

addHeading3("15.2. TODO 14.2: Hoàn thiện tài liệu kiến trúc, hướng dẫn vận hành & Slide báo cáo");
addBullet("Nội dung", "Hoàn thiện tài liệu SMARTTRIP_PROJECT_DOCUMENTATION.md, chuẩn bị slide trình chiếu và phân công kịch bản demo thuyết trình bảo vệ cuối kỳ.");

// PHẦN IV
addHeading1("PHẦN IV: HƯỚNG DẪN QUY CHUẨN ĐẶT TÊN VÀ CHÈN ẢNH VÀO BÁO CÁO");
addParagraph("Để tài liệu báo cáo đạt chuẩn học thuật và chuyên nghiệp, nhóm thống nhất quy chuẩn đặt tên file ảnh như sau:");

addTable(
  ["STT", "Quy tắc đặt tên file ảnh", "Ví dụ thực tế minh họa", "Ghi chú chất lượng ảnh"],
  [
    ["1", "IMG_[STT]_[SERVICE]_[ACTION].png", "IMG_01_INFRA_EUREKA_DASHBOARD.png", "Chụp rõ nét toàn màn hình trình duyệt"],
    ["2", "IMG_[STT]_POSTMAN_[ACTION]_[STATUS].png", "IMG_04_POSTMAN_AUTH_LOGIN_200OK.png", "Cần chụp rõ URL, Request Body, Response JSON, Status code"],
    ["3", "IMG_[STT]_DB_[TABLE_NAME].png", "IMG_09_DB_OUTBOX_MESSAGES_SENT.png", "Chụp rõ thanh bảng dữ liệu và tên schema"],
    ["4", "IMG_[STT]_WEB_[ROLE]_[FEATURE].png", "IMG_12_WEB_CUSTOMER_CHECKOUT_MODAL.png", "Chụp rõ giao diện người dùng trên trình duyệt"],
    ["5", "IMG_[STT]_TEST_[TYPE]_RESULT.png", "IMG_15_TEST_K6_CONCURRENCY_PASS.png", "Chụp rõ bảng tổng kết số request thành công/thất bại"]
  ],
  [600, 3000, 3400, 2600]
);

// Final document.xml assembly
const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

fs.writeFileSync(path.join(tempDir, 'word', 'document.xml'), documentXml, 'utf8');

const outputDocx = path.resolve('MUC_LUC_VA_KE_HOACH_CHUP_MAN_HINH_SMARTTRIP.docx');
if (fs.existsSync(outputDocx)) {
  fs.unlinkSync(outputDocx);
}

// Zip using PowerShell
const psCommand = `powershell -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.IO.Compression.FileSystem') | Out-Null; [System.IO.Compression.ZipFile]::CreateFromDirectory('${tempDir.replace(/\\/g, '\\\\')}', '${outputDocx.replace(/\\/g, '\\\\')}')"`;
execSync(psCommand);

console.log("SUCCESS! Created file at:", outputDocx);
