# TravelApp Backend API Documentation 🇻🇳

Tài liệu hướng dẫn cài đặt, kiến trúc hệ thống và đặc tả chi tiết tất cả các API của phần Backend ứng dụng TravelApp.

---

## 📖 Mục lục
1. [Tổng quan & Công nghệ](#-tổng-quan--công-nghệ)
2. [Cấu trúc thư mục](#-cấu trúc-thư-mục)
3. [Hướng dẫn cài đặt & Khởi chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
4. [Cơ chế Xác thực & Phân quyền (RBAC)](#-cơ-chế-xác-thực--phân-quyền-rbac)
5. [Đặc tả chi tiết các API (API Reference)](#-đặc-tả-chi-tiết-các-api-api-reference)
   - [Authentication & Profile](#1-authentication--profile)
   - [User Management](#2-user-management)
   - [Places (Địa điểm du lịch & PostGIS)](#3-places-địa-điểm-du-lịch--postgis)
   - [Reviews & Đánh giá](#4-reviews--đánh-giá)
   - [Provinces & Categories (Tỉnh thành & Danh mục)](#5-provinces--categories-tỉnh-thành--danh-mục)
   - [Banners & Quảng cáo](#6-banners--quảng-cáo)
   - [Gamification Configs (Cấu hình điểm số)](#7-gamification-configs-cấu-hình-điểm-số)
   - [Favorites (Địa điểm yêu thích)](#8-favorites-địa-điểm-yêu-thích)
   - [Trips & Lịch trình chuyến đi](#9-trips--lịch-trình-chuyến-đi)
   - [Check-ins (Điểm danh địa điểm)](#10-check-ins-điểm-danh-địa-điểm)
   - [Loyalty Points History (Lịch sử điểm thưởng)](#11-loyalty-points-history-lịch-sử-điểm-thưởng)
6. [Chạy Integration Tests](#-chạy-integration-tests)

---

## 🛠 Tổng quan & Công nghệ

Hệ thống TravelApp Backend cung cấp các dịch vụ quản lý địa điểm du lịch, đánh giá, lập lịch trình cá nhân, tích điểm thưởng và điểm danh địa điểm dựa trên địa lý.

*   **Runtime**: Node.js (CommonJS)
*   **Web Framework**: Express.js
*   **ORM**: Prisma Client v7.8 (hỗ trợ tương tác PostgreSQL)
*   **Database**: PostgreSQL v15+ kết hợp với **PostGIS** extension để truy vấn không gian địa lý (Geo-spatial query)
*   **Database Adapter**: `@prisma/adapter-pg` cùng `node-postgres` Connection Pool (do Prisma 7 chạy chế độ Rust-binary-free mặc định)
*   **Xác thực**: JWT (JSON Web Tokens) & Băm mật khẩu bằng `bcryptjs`

---

## 📁 Cấu trúc thư mục

```text
backend/
├── db/                       # Khởi tạo DB script / Dữ liệu seeding ban đầu
├── prisma/
│   └── schema.prisma         # Định nghĩa các Model trong Database (Prisma Schema)
├── src/
│   ├── app.js                # Đăng ký middleware và tích hợp các route của Express
│   ├── config/
│   │   ├── db.js             # Khởi tạo kết nối PrismaClient kèm theo PostgreSQL adapter
│   │   └── permissions.js    # Cấu hình danh sách quyền ứng với từng vai trò (Admin, Staff, User)
│   ├── controllers/          # Nhận dữ liệu HTTP, điều phối các Service và trả về kết quả
│   ├── middlewares/
│   │   ├── auth.middleware.js        # Kiểm tra tính hợp lệ của token JWT
│   │   ├── rbac.middleware.js        # Kiểm tra phân quyền truy cập chức năng (RBAC)
│   │   ├── ownership.middleware.js   # Kiểm tra quyền sở hữu tài nguyên (vd: xóa review của chính mình)
│   │   └── protect.middleware.js     # Nhóm các middleware bảo mật tương ứng với từng tác vụ
│   ├── routes/               # Định tuyến các Endpoint HTTP
│   ├── services/             # Lớp nghiệp vụ logic (Business Logic) và tương tác trực tiếp DB
│   └── utils/
│       └── prismaSerializer.js       # Hỗ trợ chuyển đổi kiểu BigInt và Decimal của Prisma sang JSON thông thường
├── .env                      # Lưu trữ các biến môi trường
├── docker-compose.yml        # Chạy PostgreSQL / PostGIS container trong môi trường dev
├── server.js                 # File chạy chính khởi động server Express
└── verify_api.js             # Script tự động hóa kiểm thử tích hợp (Integration Test) các API
```

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Khởi động PostgreSQL & PostGIS bằng Docker
Phần backend yêu cầu cơ sở dữ liệu PostgreSQL đã được cài đặt sẵn tiện ích mở rộng PostGIS. Bạn có thể sử dụng Docker để dựng cơ sở dữ liệu nhanh chóng:

```bash
docker compose up -d
```
> [!NOTE]
> File [docker-compose.yml](file:///c:/Users/BLUE/Desktop/TravelApp/backend/docker-compose.yml) đã định cấu hình cổng kết nối `5432` mặc định và image `postgis/postgis:15-3.3` tương thích cao.

### 2. Cài đặt các gói phụ thuộc
Di chuyển vào thư mục `backend` và chạy lệnh cài đặt:
```bash
npm install
```

### 3. Cấu hình biến môi trường (`.env`)
Tạo file `.env` tại thư mục gốc của backend với nội dung mẫu sau:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/travel_db?schema=public"
JWT_SECRET="your_very_secure_jwt_secret_key"
```

### 4. Đồng bộ DB Schema & Sinh Prisma Client
Đồng bộ cấu trúc database hiện tại và tạo thư viện Prisma Client:
```bash
npx prisma db pull
npx prisma generate
```

### 5. Chạy dự án
*   **Chế độ phát triển (Development)**:
    ```bash
    npm run dev
    ```
*   **Chế độ Producton**:
    ```bash
    npm start
    ```

---

## 🔐 Cơ chế Xác thực & Phân quyền (RBAC)

Hệ thống phân chia người dùng thành 3 vai trò (Role):
1.  **admin (ID: 1)**: Có toàn quyền hệ thống (`["*"]`).
2.  **staff (ID: 3)**: Quản lý nội dung bao gồm địa điểm, danh mục, tỉnh thành, banner, xem cấu hình gamification và lịch sử điểm thưởng.
3.  **user (ID: 2)**: Người dùng cuối. Có quyền đọc thông tin, tự tạo/sửa đổi lịch trình chuyến đi (Trips), địa điểm yêu thích (Favorites), check-in điểm đến, tự quản lý thông tin cá nhân và xem lịch sử tích điểm của riêng mình.

Các quyền cụ thể được cấu hình trong [permissions.js](file:///c:/Users/BLUE/Desktop/TravelApp/backend/src/config/permissions.js):
*   `location.read` / `location.create` / `location.update` / `location.delete`
*   `review.create` / `review.read` / `review.update` / `review.delete`
*   `banner.read` / `banner.create` / `banner.update` / `banner.delete`
*   `points.read` / `points.write`
*   `favorite.read` / `favorite.write`
*   `trip.read` / `trip.write`
*   `checkin.read` / `checkin.write`

---

## 📌 Đặc tả chi tiết các API (API Reference)

> [!IMPORTANT]
> Tất cả các API yêu cầu đăng nhập cần gửi JWT token qua HTTP Header ở định dạng:
> `Authorization: Bearer <JWT_TOKEN>`

### 1. Authentication & Profile
Các endpoint phục vụ đăng ký, đăng nhập và quản lý thông tin tài khoản hiện tại.

#### 📍 Đăng ký tài khoản mới
*   **Route**: `POST /auth/register`
*   **Auth Required**: Không
*   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "password123",
      "full_name": "Nguyen Van A",
      "phone": "0987654321"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "id": "c0e95db2-486d-8a82-7d29-7d29b8fbbcd4",
      "email": "user@example.com",
      "full_name": "Nguyen Van A",
      "phone": "0987654321",
      "role_id": 2,
      "total_points": 0,
      "status": "active"
    }
    ```

#### 📍 Đăng nhập tài khoản
*   **Route**: `POST /auth/login`
*   **Auth Required**: Không
*   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "c0e95db2-486d-8a82-7d29-7d29b8fbbcd4",
        "email": "user@example.com",
        "full_name": "Nguyen Van A",
        "role": "user"
      }
    }
    ```

#### 📍 Xem Profile hiện tại
*   **Route**: `GET /profile`
*   **Auth Required**: Có (Mọi vai trò)
*   **Response (200 OK)**:
    ```json
    {
      "id": "c0e95db2-486d-8a82-7d29-7d29b8fbbcd4",
      "email": "user@example.com",
      "full_name": "Nguyen Van A",
      "phone": "0987654321",
      "avatar_url": "https://example.com/avatar.jpg",
      "home_town": "Ha Noi",
      "bio": "Yêu thích du lịch bụi",
      "total_points": 20,
      "status": "active"
    }
    ```

#### 📍 Cập nhật Profile hiện tại
*   **Route**: `PUT /profile`
*   **Auth Required**: Có (Mọi vai trò)
*   **Request Body**:
    ```json
    {
      "full_name": "Nguyen Van B",
      "avatar_url": "https://example.com/new_avatar.jpg",
      "home_town": "Da Nang",
      "bio": "Đã đổi thông tin"
    }
    ```
*   **Response (200 OK)**: Trả về Profile đã được cập nhật thành công.

---

### 2. User Management
Các endpoint dành riêng cho Admin để quản trị danh sách người dùng.

#### 📍 Danh sách người dùng (Phân trang & Lọc)
*   **Route**: `GET /users`
*   **Auth Required**: Có (Yêu cầu vai trò: `admin` hoặc `staff`)
*   **Query Parameters**:
    | Tham số | Loại | Mặc định | Mô tả |
    | :--- | :--- | :--- | :--- |
    | `limit` | number | 10 | Số lượng bản ghi tối đa trả về |
    | `page` | number | 1 | Trang hiển thị hiện tại |
    | `search` | string | | Tìm kiếm theo tên hoặc email của người dùng |
*   **Response (200 OK)**:
    ```json
    {
      "count": 12,
      "rows": [
        {
          "id": "c0e95db2-486d-8a82-7d29-7d29b8fbbcd4",
          "email": "user@example.com",
          "full_name": "Nguyen Van A",
          "role_id": 2,
          "total_points": 0,
          "status": "active"
        }
      ]
    }
    ```

#### 📍 Chi tiết người dùng theo ID
*   **Route**: `GET /users/:id`
*   **Auth Required**: Có (Yêu cầu vai trò: `admin` hoặc `staff`)

#### 📍 Tạo mới người dùng (Tạo trực tiếp từ quản trị)
*   **Route**: `POST /users`
*   **Auth Required**: Có (Yêu cầu vai trò: `admin`)
*   **Request Body**: Giống đăng ký tài khoản nhưng có thêm trường `"role_id"` (1: Admin, 2: User, 3: Staff).

#### 📍 Cập nhật thông tin người dùng
*   **Route**: `PUT /users/:id`
*   **Auth Required**: Có (Yêu cầu vai trò: `admin`)

#### 📍 Xóa tài khoản người dùng
*   **Route**: `DELETE /users/:id`
*   **Auth Required**: Có (Yêu cầu vai trò: `admin`)

---

### 3. Places (Địa điểm du lịch & PostGIS)
Các endpoint quản trị và hiển thị danh sách địa điểm du lịch (`places`). Do cấu trúc bảng chứa cột tọa độ địa lý PostGIS (`geom` - kiểu `Unsupported`), các truy vấn chèn và cập nhật được quản lý qua Raw SQL `$queryRaw` trong lớp Service để tránh xung đột với Prisma ORM.

#### 📍 Danh sách các địa điểm (Phân trang & Tìm kiếm)
*   **Route**: `GET /places`
*   **Auth Required**: Không (Public API)
*   **Query Parameters**:
    | Tham số | Loại | Mô tả |
    | :--- | :--- | :--- |
    | `limit` | number | Giới hạn số lượng bản ghi trả về |
    | `page` | number | Vị trí trang hiện tại |
    | `search` | string | Tìm kiếm địa điểm theo tên hoặc theo tên tỉnh thành |
*   **Response (200 OK)**:
    ```json
    {
      "count": 1,
      "rows": [
        {
          "id": 1,
          "name": "Hồ Hoàn Kiếm",
          "province": "Hà Nội",
          "description": "Địa điểm nổi tiếng Hà Nội",
          "image_url": "https://example.com/hồ.jpg",
          "is_sponsored": false
        }
      ]
    }
    ```

#### 📍 Chi tiết địa điểm
*   **Route**: `GET /places/:id`
*   **Auth Required**: Không (Public API)
*   **Response (200 OK)**:
    ```json
    {
      "id": 1,
      "name": "Hồ Hoàn Kiếm",
      "province": "Hà Nội",
      "description": "Địa điểm nổi tiếng Hà Nội",
      "image_url": "https://example.com/hồ.jpg",
      "reviews": [
        {
          "id": 12,
          "user_id": "c0e95db2-486d-8a82-7d29-7d29b8fbbcd4",
          "rating": 5,
          "comment": "Rất đẹp!",
          "user": {
            "id": "c0e95db2-486d-8a82-7d29-7d29b8fbbcd4",
            "full_name": "Nguyen Van A",
            "email": "user@example.com"
          }
        }
      ]
    }
    ```

#### 📍 Tạo mới địa điểm (Raw SQL PostGIS)
*   **Route**: `POST /places`
*   **Auth Required**: Có (Yêu cầu vai trò: `admin` hoặc `staff`)
*   **Request Body**:
    ```json
    {
      "name": "Hồ Hoàn Kiếm",
      "province": "Hà Nội",
      "description": "Địa điểm văn hóa",
      "image_url": "https://example.com/hồ.jpg"
    }
    ```
*   **Ghi chú kỹ thuật**: Lớp `PlaceService` sẽ kiểm tra tỉnh thành `"Hà Nội"`. Nếu chưa có, hệ thống sẽ tự động tạo bản ghi tỉnh thành mới, sau đó chèn địa điểm bằng câu lệnh Raw SQL tích hợp ST_MakePoint để tính toán hình học:
    ```sql
    INSERT INTO places (..., geom) VALUES (..., ST_SetSRID(ST_MakePoint(longitude, latitude), 4326))
    ```

#### 📍 Cập nhật địa điểm
*   **Route**: `PUT /places/:id`
*   **Auth Required**: Có (Yêu cầu vai trò: `admin` hoặc `staff`)

#### 📍 Xóa địa điểm (Xóa dây chuyền Cascade)
*   **Route**: `DELETE /places/:id`
*   **Auth Required**: Có (Yêu cầu vai trò: `admin` hoặc `staff`)
*   > [!WARNING]
    > Hành động xóa này sẽ kích hoạt tính năng cascade delete tự động xóa sạch các Đánh giá (Reviews), Ảnh (Images), Lịch trình chuyến đi (Trip places), Lượt điểm danh (Check-ins), Lượt yêu thích (Favorites) tham chiếu tới địa điểm này trong DB.

---

### 4. Reviews & Đánh giá
API cho phép gửi đánh giá, phản hồi trải nghiệm tại các địa điểm.

#### 📍 Danh sách đánh giá
*   **Route**: `GET /reviews`
*   **Auth Required**: Không (Public API)

#### 📍 Gửi đánh giá mới
*   **Route**: `POST /reviews`
*   **Auth Required**: Có (Mọi vai trò)
*   **Request Body**:
    ```json
    {
      "place_id": 1,
      "rating": 5,
      "comment": "Dịch vụ rất tốt, phong cảnh xuất sắc."
    }
    ```
*   **Response (201 Created)**: Trả về chi tiết đánh giá đã tạo.

#### 📍 Xóa đánh giá
*   **Route**: `DELETE /reviews/:id`
*   **Auth Required**: Có (Mọi vai trò. Hỗ trợ cơ chế kiểm soát sở hữu: Người dùng chỉ có quyền xóa đánh giá do chính mình tạo ra, còn Admin/Staff có quyền xóa mọi đánh giá).

---

### 5. Provinces & Categories (Tỉnh thành & Danh mục)
Quản trị các phân loại du lịch và khu vực địa giới.

#### 📍 Lấy danh sách Tỉnh thành (Có Filter)
*   **Route**: `GET /provinces`
*   **Auth Required**: Không (Public API)
*   **Query Parameters**:
    - `search` (lọc theo tên hoặc slug)
    - `is_visible` (lọc trạng thái hiển thị: `true`/`false`)
*   **Response (200 OK)**:
    ```json
    {
      "count": 1,
      "rows": [
        {
          "id": 1,
          "slug": "ha-noi",
          "name_vi": "Hà Nội",
          "name_en": "Ha Noi",
          "is_visible": true
        }
      ]
    }
    ```

#### 📍 Thêm mới / Cập nhật / Xóa Tỉnh thành
*   **Routes**: `POST /provinces`, `PUT /provinces/:id`, `DELETE /provinces/:id`
*   **Auth Required**: Có (Yêu cầu vai trò: `admin` hoặc `staff`)

#### 📍 Lấy danh sách Danh mục du lịch (Categories)
*   **Route**: `GET /categories`
*   **Auth Required**: Không (Public API)
*   **Query Parameters**: `search` (Lọc theo tên danh mục)

#### 📍 Thêm mới / Cập nhật / Xóa Danh mục du lịch
*   **Routes**: `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`
*   **Auth Required**: Có (Yêu cầu vai trò: `admin` hoặc `staff`)

---

### 6. Banners & Quảng cáo
Các banner quảng cáo được đặt tại ứng dụng client.

#### 📍 Lấy danh sách Banner quảng cáo
*   **Route**: `GET /banners`
*   **Auth Required**: Không (Public API)
*   **Query Parameters**:
    - `is_active` (`true`/`false` - xem banner đang hoạt động)
    - `type` (loại banner: `home`, `destination`,...)
    - `search` (tìm theo tiêu đề banner)

#### 📍 Thêm mới / Cập nhật / Xóa Banner
*   **Routes**: `POST /banners`, `PUT /banners/:id`, `DELETE /banners/:id`
*   **Auth Required**: Có (Yêu cầu vai trò: `admin` hoặc `staff`)

---

### 7. Gamification Configs (Cấu hình điểm số)
Cơ chế thiết lập số lượng điểm thưởng tương ứng với mỗi hành động của người dùng (ví dụ: đăng tải đánh giá, điểm danh du lịch,...).

#### 📍 Xem toàn bộ cấu hình tích điểm
*   **Route**: `GET /gamification-configs`
*   **Auth Required**: Không (Public API)

#### 📍 Thêm mới hoặc Cập nhật cấu hình tích điểm (Upsert)
*   **Route**: `POST /gamification-configs`
*   **Auth Required**: Có (Yêu cầu vai trò: `admin`)
*   **Request Body**:
    ```json
    {
      "action_key": "user_checkin",
      "points": 100
    }
    ```

#### 📍 Xóa cấu hình tích điểm
*   **Route**: `DELETE /gamification-configs/:action_key`
*   **Auth Required**: Có (Yêu cầu vai trò: `admin`)

---

### 8. Favorites (Địa điểm yêu thích)
Người dùng lưu trữ và quản lý danh sách địa điểm đã đánh dấu yêu thích.

#### 📍 Xem danh sách các địa điểm đã yêu thích
*   **Route**: `GET /favorites`
*   **Auth Required**: Có (Lấy danh sách dựa trên `req.user.id`)

#### 📍 Thêm địa điểm vào danh mục yêu thích
*   **Route**: `POST /favorites`
*   **Request Body**:
    ```json
    {
      "place_id": 1
    }
    ```

#### 📍 Bỏ yêu thích địa điểm
*   **Route**: `DELETE /favorites/:place_id`

---

### 9. Trips & Lịch trình chuyến đi
Tác vụ quản lý hành trình di chuyển và lập kế hoạch tham quan danh lam thắng cảnh.

#### 📍 Danh sách lịch trình của người dùng hiện tại
*   **Route**: `GET /trips`
*   **Response (200 OK)**: Trả về danh sách Trips kèm thông tin liên kết thứ tự các địa điểm tham quan (`trip_places`).

#### 📍 Chi tiết một lịch trình du lịch
*   **Route**: `GET /trips/:id`

#### 📍 Tạo mới kế hoạch lịch trình
*   **Route**: `POST /trips`
*   **Request Body**:
    ```json
    {
      "title": "Kế hoạch đi chơi Đà Nẵng 3 ngày"
    }
    ```

#### 📍 Cập nhật tiêu đề lịch trình
*   **Route**: `PUT /trips/:id`

#### 📍 Xóa kế hoạch lịch trình (Tự động xóa các địa điểm gắn kèm trong lịch trình)
*   **Route**: `DELETE /trips/:id`

#### 📍 Thêm địa điểm tham quan vào lịch trình du lịch
*   **Route**: `POST /trips/:id/places`
*   **Request Body**:
    ```json
    {
      "place_id": 1,
      "sort_order": 2
    }
    ```

#### 📍 Loại bỏ địa điểm ra khỏi lịch trình du lịch
*   **Route**: `DELETE /trips/:id/places/:place_id`

---

### 10. Check-ins (Điểm danh địa điểm)
Cho phép người dùng xác thực và đánh dấu đã ghé thăm các vị trí du lịch thành công.

#### 📍 Danh sách các địa điểm đã Check-in của tôi
*   **Route**: `GET /checkins`

#### 📍 Thực hiện Check-in địa điểm mới
*   **Route**: `POST /checkins`
*   **Request Body**:
    ```json
    {
      "place_id": 1
    }
    ```
*   **Response (201 Created)**: Bản ghi xác nhận check-in lưu vết thời gian.

---

### 11. Loyalty Points History (Lịch sử điểm thưởng)
Theo dõi nhật ký tích điểm thưởng của các thành viên. Khi một bản ghi điểm thưởng được thêm mới hoặc điều chỉnh qua quản trị, hệ thống sử dụng cơ chế an toàn dữ liệu ACID để tăng/giảm đồng bộ tổng điểm tích lũy (`total_points`) trong thông tin người dùng.

#### 📍 Tra cứu lịch sử điểm thưởng (Có Filter & Phân trang)
*   **Route**: `GET /loyalty-points`
*   **Auth Required**: Có (Mọi vai trò. Nếu tài khoản đăng nhập có vai trò `user`, bộ lọc sẽ tự động khóa tham số chỉ lấy dữ liệu của chính họ. Tài khoản `admin` và `staff` được phép truy vấn và lọc dữ liệu của toàn bộ thành viên).
*   **Query Parameters**:
    - `limit` (Mặc định 10)
    - `page` (Mặc định 1)
    - `user_id` (Chỉ dùng được cho Admin/Staff để tra cứu thành viên cụ thể)
    - `action_type` (Lọc theo tác vụ tích điểm: `review_destination`, `checkin_bonus`,...)
    - `blockchain_status` (Trạng thái đồng bộ blockchain: `none`, `pending`, `success`)
*   **Response (200 OK)**:
    ```json
    {
      "count": 1,
      "rows": [
        {
          "id": 1,
          "user_id": "c0e95db2-486d-8a82-7d29-7d29b8fbbcd4",
          "action_type": "review_destination",
          "points_earned": 20,
          "blockchain_status": "pending",
          "created_at": "2026-06-23T08:00:00.000Z",
          "users": {
            "id": "c0e95db2-486d-8a82-7d29-7d29b8fbbcd4",
            "full_name": "Nguyen Van A",
            "email": "user@example.com",
            "total_points": 20
          }
        }
      ]
    }
    ```

#### 📍 Tra cứu chi tiết một dòng lịch sử điểm
*   **Route**: `GET /loyalty-points/:id`

#### 📍 Tạo mới bản ghi điểm thưởng trực tiếp (Tự động cộng dồn total_points)
*   **Route**: `POST /loyalty-points`
*   **Auth Required**: Có (Yêu cầu vai trò: `admin` hoặc `staff`)
*   **Request Body**:
    ```json
    {
      "user_id": "c0e95db2-486d-8a82-7d29-7d29b8fbbcd4",
      "action_type": "manual_adjustment",
      "points_earned": 100,
      "blockchain_status": "success"
    }
    ```

#### 📍 Cập nhật bản ghi điểm thưởng (Tự động hiệu chỉnh chênh lệch total_points)
*   **Route**: `PUT /loyalty-points/:id`
*   **Auth Required**: Có (Yêu cầu vai trò: `admin` hoặc `staff`)
*   **Ghi chú**: Nếu trường `points_earned` được thay đổi từ `100` thành `120`, trường `total_points` tương ứng của User sẽ tự động được cộng thêm khoản chênh lệch `+20` điểm trong cùng một Transaction.

#### 📍 Xóa dòng lịch sử điểm (Tự động trừ khấu hao điểm thưởng của User tương ứng)
*   **Route**: `DELETE /loyalty-points/:id`
*   **Auth Required**: Có (Yêu cầu vai trò: `admin` hoặc `staff`)

---

## 🧪 Chạy Integration Tests

Bộ kiểm thử tích hợp tự động được đặt tại [verify_api.js](file:///c:/Users/BLUE/Desktop/TravelApp/backend/verify_api.js). Script này thực hiện việc giả lập luồng đăng ký, phân quyền nâng cao lên Admin, đăng nhập, gọi toàn bộ chuỗi CRUD của các thực thể chính (địa điểm, đánh giá, tỉnh thành, danh mục, banner, cấu hình game, yêu thích, lịch trình, điểm danh, điểm thưởng) và thực hiện dọn dẹp (cleanup) dữ liệu rác sau khi chạy xong.

Chạy lệnh kiểm thử sau:
```bash
node verify_api.js
```
Kết quả hiển thị mong đợi:
```text
DB connection successful!
Test server running on port 3005

--- Testing Auth Register ---
User registered: testuser_1782202991000@example.com
Elevated user to ADMIN in database.

...
--- Cleaning up new test entities ---
Deleted points history entry: 1
Deleted trip ID: dc705fc2-1de8-486d-8a82-7d29b8fbbcd4
Deleted gamification config key: checkin_bonus_1782202992082
Deleted banner ID: 1
Deleted category ID: 7
Deleted province ID: 7

--- Testing Cascade Delete Place ---
Cascade deleted place ID: 18
=========================================
✅ ALL TESTS PASSED SUCCESSFULLY!
=========================================
```
