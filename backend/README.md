# TravelApp Backend API Documentation 🇻🇳

Tài liệu hướng dẫn cài đặt, kiến trúc hệ thống, phân quyền và đặc tả chi tiết toàn bộ các API của phần Backend ứng dụng TravelApp (Mekong Ơi).

---

## 📖 Mục lục
1. [Tổng quan & Công nghệ](#-tổng-quan--công-nghệ)
2. [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
3. [Hướng dẫn cài đặt & Khởi chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
4. [Cơ chế Xác thực & Phân quyền (RBAC)](#-cơ-chế-xác-thực--phân-quyền-rbac)
5. [Bảng tổng hợp nhanh API (API Quick Reference)](#-bảng-tổng-ợp-nhanh-api-api-quick-reference)
6. [Đặc tả chi tiết các API (API Details)](#-đặc-tả-chi-tiết-các-api-api-details)
   - [Authentication & Profile](#1-authentication--profile)
   - [User Management](#2-user-management)
   - [Places (Địa điểm du lịch & PostGIS)](#3-places-địa-điểm-du-lịch--postgis)
   - [Reviews & Đánh giá](#4-reviews--đánh-giá)
   - [Provinces & Categories (Tỉnh thành & Danh mục)](#5-provinces--categories-tỉnh-thành--danh-mục)
   - [Ads & Quảng cáo](#6-ads--quảng-cáo)
   - [Gamification Configs (Cấu hình điểm số)](#7-gamification-configs-cấu-hình-điểm-số)
   - [Favorites (Địa điểm yêu thích)](#8-favorites-địa-điểm-yêu-thích)
   - [Trips & Lịch trình chuyến đi](#9-trips--lịch-trình-chuyến-đi)
   - [Check-ins (Điểm danh địa điểm)](#10-check-ins-điểm-danh-địa-điểm)
   - [Loyalty Points History (Lịch sử điểm thưởng)](#11-loyalty-points-history-lịch-sử-điểm-thưởng)
   - [Districts (Quận/Huyện)](#12-districts-quận-huyện)
   - [Providers (Nhà cung cấp)](#13-providers-nhà-cung-cấp)
   - [Notifications (Thông báo in-app)](#14-notifications-thông-báo-in-app)
   - [Ad Logs (Nhật ký click/impression quảng cáo)](#15-ad-logs-nhật-ký-clickimpression-quảng-cáo)
7. [Chạy Integration Tests](#-chạy-integration-tests)

---

## 🛠 Tổng quan & Công nghệ

Hệ thống TravelApp Backend cung cấp các dịch vụ quản lý địa điểm du lịch, đánh giá, lập lịch trình cá nhân, tích điểm thưởng và điểm danh địa điểm dựa trên vị trí địa lý.

*   **Runtime**: Node.js (CommonJS)
*   **Web Framework**: Express.js
*   **ORM**: Prisma Client v7.8 (hỗ trợ tương tác PostgreSQL)
*   **Database**: PostgreSQL v15+ kết hợp với **PostGIS** extension để truy vấn không gian địa lý (Geo-spatial query)
*   **Database Adapter**: `@prisma/adapter-pg` cùng `node-postgres` Connection Pool (do Prisma 7 chạy chế độ Rust-binary-free mặc định)
*   **Xác thực**: JWT (JSON Web Tokens) & Băm mật khẩu bằng `bcryptjs`
*   **Tích hợp bên thứ ba**: Google OAuth 2.0 (`google-auth-library`)

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
> File [docker-compose.yml](file:///c:/Users/BLUE/Desktop/TravelApp/backend/docker-compose.yml) đã định cấu hình cổng kết nối `5432` mặc định và sử dụng image `postgis/postgis:15-3.3` tương thích cao.

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

### 4. Thiết lập Cơ sở dữ liệu (Push Schema & Seed Data)
Đẩy cấu trúc schema từ tệp Prisma vào PostgreSQL và chạy seed dữ liệu ban đầu:
```bash
# Đẩy schema hiện tại lên database
npx prisma db push

# Sinh mã nguồn Prisma Client
npx prisma generate

# Thực hiện chạy seed dữ liệu mẫu (Roles, Users, Places, Ads, Providers, Districts...)
npx prisma db seed
```

### 5. Chạy dự án
*   **Chế độ phát triển (Development)**:
    ```bash
    npm run dev
    ```
*   **Chế độ Production**:
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

## 📌 Bảng tổng hợp nhanh API (API Quick Reference)

Dưới đây là danh sách toàn bộ các endpoint được hỗ trợ bởi hệ thống:

| Nhóm chức năng | Phương thức | API Route | Auth Required | Vai trò được phép |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Không | Public |
| | `POST` | `/auth/login` | Không | Public |
| | `POST` | `/auth/google` | Không | Public |
| **Profile** | `GET` | `/profile` | Có | Mọi vai trò |
| | `PUT` | `/profile` | Có | Mọi vai trò |
| | `PUT` | `/profile/password` | Có | Mọi vai trò |
| **Users** | `GET` | `/users` | Có | `admin`, `staff` |
| | `POST` | `/users` | Có | `admin` |
| | `GET` | `/users/:id` | Có | `admin`, `staff` |
| | `PUT` | `/users/:id` | Có | `admin` |
| | `DELETE` | `/users/:id` | Có | `admin` |
| **Places** | `GET` | `/places` | Không | Public |
| | `POST` | `/places` | Có | `admin`, `staff` |
| | `GET` | `/places/:id` | Không | Public |
| | `PUT` | `/places/:id` | Có | `admin`, `staff` |
| | `DELETE` | `/places/:id` | Có | `admin`, `staff` |
| | `POST` | `/places/:id/view`| Không | Public |
| **Reviews** | `GET` | `/reviews` | Không | Public |
| | `POST` | `/reviews` | Có | Mọi vai trò |
| | `GET` | `/reviews/:id` | Không | Public |
| | `PUT` | `/reviews/:id` | Có | Mọi vai trò (Chủ sở hữu) |
| | `DELETE` | `/reviews/:id` | Có | `admin`, `staff`, Chủ sở hữu |
| **Provinces** | `GET` | `/provinces` | Không | Public |
| | `POST` | `/provinces` | Có | `admin`, `staff` |
| | `GET` | `/provinces/:id` | Không | Public |
| | `PUT` | `/provinces/:id` | Có | `admin`, `staff` |
| | `DELETE` | `/provinces/:id` | Có | `admin`, `staff` |
| **Categories**| `GET` | `/categories` | Không | Public |
| | `POST` | `/categories` | Có | `admin`, `staff` |
| | `GET` | `/categories/:id` | Không | Public |
| | `PUT` | `/categories/:id` | Có | `admin`, `staff` |
| | `DELETE` | `/categories/:id` | Có | `admin`, `staff` |
| **Ads** | `GET` | `/ads` | Không | Public |
| | `POST` | `/ads` | Có | `admin`, `staff` |
| | `GET` | `/ads/:id` | Không | Public |
| | `PUT` | `/ads/:id` | Có | `admin`, `staff` |
| | `DELETE` | `/ads/:id` | Có | `admin`, `staff` |
| **Gamification**| `GET` | `/gamification-configs` | Không | Public |
| | `POST` | `/gamification-configs` | Có | `admin` |
| | `GET` | `/gamification-configs/:action_key` | Không | Public |
| | `DELETE` | `/gamification-configs/:action_key` | Có | `admin` |
| **Favorites** | `GET` | `/favorites` | Có | Mọi vai trò |
| | `POST` | `/favorites` | Có | Mọi vai trò |
| | `DELETE` | `/favorites/:place_id`| Có | Mọi vai trò |
| **Trips** | `GET` | `/trips` | Có | Mọi vai trò |
| | `POST` | `/trips` | Có | Mọi vai trò |
| | `GET` | `/trips/:id` | Có | Mọi vai trò (Chủ sở hữu) |
| | `PUT` | `/trips/:id` | Có | Mọi vai trò (Chủ sở hữu) |
| | `DELETE` | `/trips/:id` | Có | Mọi vai trò (Chủ sở hữu) |
| | `POST` | `/trips/:id/places`| Có | Mọi vai trò (Chủ sở hữu) |
| | `DELETE` | `/trips/:id/places/:place_id`| Có | Mọi vai trò (Chủ sở hữu) |
| **Check-ins** | `GET` | `/checkins` | Có | Mọi vai trò |
| | `POST` | `/checkins` | Có | Mọi vai trò |
| **Loyalty Points**| `GET` | `/loyalty-points` | Có | Mọi vai trò (Lọc theo user) |
| | `POST` | `/loyalty-points` | Có | `admin`, `staff` |
| | `GET` | `/loyalty-points/:id` | Có | `admin`, `staff`, Chủ sở hữu |
| | `PUT` | `/loyalty-points/:id` | Có | `admin`, `staff` |
| | `DELETE` | `/loyalty-points/:id` | Có | `admin`, `staff` |
| **Districts** | `GET` | `/districts` | Có | Mọi vai trò |
| | `POST` | `/districts` | Có | `admin`, `staff` |
| | `GET` | `/districts/:id` | Có | Mọi vai trò |
| | `PUT` | `/districts/:id` | Có | `admin`, `staff` |
| | `DELETE` | `/districts/:id` | Có | `admin`, `staff` |
| **Providers** | `GET` | `/providers` | Có | `admin`, `staff` |
| | `POST` | `/providers` | Có | `admin`, `staff` |
| | `GET` | `/providers/:id` | Có | `admin`, `staff` |
| | `PUT` | `/providers/:id` | Có | `admin`, `staff` |
| | `DELETE` | `/providers/:id` | Có | `admin`, `staff` |
| **Notifications**| `GET` | `/notifications/my` | Có | Mọi vai trò |
| | `PUT` | `/notifications/my/:id/read` | Có | Mọi vai trò |
| | `GET` | `/notifications` | Có | `admin`, `staff` |
| | `POST` | `/notifications` | Có | `admin`, `staff` |
| | `GET` | `/notifications/:id` | Có | `admin`, `staff` |
| | `PUT` | `/notifications/:id` | Có | `admin`, `staff` |
| | `DELETE` | `/notifications/:id` | Có | `admin`, `staff` |
| **Ad Logs** | `POST` | `/ad-logs` | Không | Public / Mọi vai trò |
| | `GET` | `/ad-logs` | Có | `admin`, `staff` |
| | `GET` | `/ad-logs/:id` | Có | `admin`, `staff` |
| | `PUT` | `/ad-logs/:id` | Có | `admin`, `staff` |
| | `DELETE` | `/ad-logs/:id` | Có | `admin`, `staff` |

---

## 📌 Đặc tả chi tiết các API (API Details)

> [!IMPORTANT]
> Tất cả các API yêu cầu đăng nhập cần gửi JWT token qua HTTP Header ở định dạng:
> `Authorization: Bearer <JWT_TOKEN>`

### 1. Authentication & Profile
Các endpoint phục vụ đăng ký, đăng nhập và quản lý thông tin tài khoản hiện tại.

#### 📍 Đăng ký tài khoản mới
*   **Route**: `POST /auth/register`
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

#### 📍 Đăng nhập tài khoản bằng email/mật khẩu
*   **Route**: `POST /auth/login`
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

#### 📍 Đăng nhập bằng tài khoản Google
*   **Route**: `POST /auth/google`
*   **Request Body**:
    ```json
    {
      "idToken": "google_oauth_token_here"
    }
    ```
*   **Response (200 OK)**: Trả về JWT Token cùng thông tin tài khoản đã liên kết Google OAuth.

#### 📍 Xem Profile hiện tại
*   **Route**: `GET /profile`
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

#### 📍 Cập nhật Mật khẩu tài khoản
*   **Route**: `PUT /profile/password`
*   **Request Body**:
    ```json
    {
      "oldPassword": "password123",
      "newPassword": "newpassword456"
    }
    ```
*   **Response (200 OK)**: Trả về thông báo đổi mật khẩu thành công.

---

### 2. User Management
Các endpoint dành riêng cho Admin/Staff để quản trị danh sách người dùng.

#### 📍 Danh sách người dùng (Phân trang & Lọc)
*   **Route**: `GET /users`
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

#### 📍 Tạo mới người dùng (Tạo trực tiếp từ quản trị)
*   **Route**: `POST /users`
*   **Request Body**: Giống đăng ký tài khoản nhưng có thêm trường `"role_id"` (1: Admin, 2: User, 3: Staff).

#### 📍 Cập nhật thông tin người dùng
*   **Route**: `PUT /users/:id`

#### 📍 Xóa tài khoản người dùng
*   **Route**: `DELETE /users/:id`

---

### 3. Places (Địa điểm du lịch & PostGIS)
Các endpoint quản trị và hiển thị danh sách địa điểm du lịch (`places`). Do cấu trúc bảng chứa cột tọa độ địa lý PostGIS (`geom` - kiểu `Unsupported`), các truy vấn chèn và cập nhật được quản lý qua Raw SQL `$queryRaw` trong lớp Service để tránh xung đột với Prisma ORM.

#### 📍 Danh sách các địa điểm (Phân trang & Tìm kiếm)
*   **Route**: `GET /places`
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

#### 📍 Tăng lượt xem của địa điểm
*   **Route**: `POST /places/:id/view`
*   **Response (200 OK)**: Ghi nhận tăng chỉ số `total_views` của địa điểm lên 1 đơn vị.

#### 📍 Tạo mới địa điểm (Raw SQL PostGIS)
*   **Route**: `POST /places`
*   **Request Body**:
    ```json
    {
      "province_id": 1,
      "category_id": 2,
      "name_vi": "Hồ Hoàn Kiếm",
      "name_en": "Hoan Kiem Lake",
      "description_vi": "Địa điểm du lịch văn hoá lịch sử",
      "description_en": "Historical cultural travel destination",
      "address_vi": "Hoàn Kiếm, Hà Nội",
      "address_en": "Hoan Kiem, Hanoi",
      "latitude": 21.0285,
      "longitude": 105.8542,
      "phone": "0123456789",
      "opening_hours": "00:00 - 24:00",
      "price_range": "Miễn phí",
      "has_parking": true
    }
    ```
*   **Ghi chú kỹ thuật**: Lớp `PlaceService` thực hiện lưu toạ độ địa lý vào cột `geom` thông qua Raw SQL PostgreSQL:
    ```sql
    INSERT INTO places (..., geom) VALUES (..., ST_SetSRID(ST_MakePoint(longitude, latitude), 4326))
    ```

#### 📍 Cập nhật địa điểm
*   **Route**: `PUT /places/:id`

#### 📍 Xóa địa điểm (Xóa dây chuyền Cascade)
*   **Route**: `DELETE /places/:id`
*   > [!WARNING]
    > Hành động xóa này sẽ kích hoạt tính năng cascade delete tự động xóa sạch các Đánh giá (Reviews), Ảnh (Images), Lịch trình chuyến đi (Trip places), Lượt điểm danh (Check-ins), Lượt yêu thích (Favorites) tham chiếu tới địa điểm này trong DB.

---

### 4. Reviews & Đánh giá
API cho phép gửi đánh giá, phản hồi trải nghiệm tại các địa điểm.

#### 📍 Danh sách đánh giá
*   **Route**: `GET /reviews`

#### 📍 Chi tiết một bài đánh giá
*   **Route**: `GET /reviews/:id`

#### 📍 Gửi đánh giá mới
*   **Route**: `POST /reviews`
*   **Request Body**:
    ```json
    {
      "place_id": 1,
      "rating": 5,
      "comment": "Dịch vụ rất tốt, phong cảnh xuất sắc."
    }
    ```
*   **Response (201 Created)**: Trả về chi tiết đánh giá đã tạo và tự động tích điểm gamification cho người dùng.

#### 📍 Cập nhật đánh giá
*   **Route**: `PUT /reviews/:id`
*   **Request Body**:
    ```json
    {
      "rating": 4,
      "comment": "Mới cập nhật: Chất lượng có giảm nhẹ."
    }
    ```

#### 📍 Xóa đánh giá
*   **Route**: `DELETE /reviews/:id`
*   **Ghi chú**: Người dùng chỉ có quyền xóa đánh giá do chính mình tạo ra, còn Admin/Staff có quyền xóa mọi đánh giá.

---

### 5. Provinces & Categories (Tỉnh thành & Danh mục)

#### 📍 Lấy danh sách Tỉnh thành
*   **Route**: `GET /provinces`
*   **Query Parameters**:
    - `search` (lọc theo tên hoặc slug)
    - `is_visible` (lọc trạng thái hiển thị: `true`/`false`)

#### 📍 Chi tiết Tỉnh thành theo ID
*   **Route**: `GET /provinces/:id`

#### 📍 Thêm mới / Cập nhật / Xóa Tỉnh thành
*   **Routes**: `POST /provinces`, `PUT /provinces/:id`, `DELETE /provinces/:id`

#### 📍 Lấy danh sách Danh mục du lịch (Categories)
*   **Route**: `GET /categories`
*   **Query Parameters**: `search` (Lọc theo tên danh mục)

#### 📍 Chi tiết Danh mục theo ID
*   **Route**: `GET /categories/:id`

#### 📍 Thêm mới / Cập nhật / Xóa Danh mục du lịch
*   **Routes**: `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`

---

### 6. Ads & Quảng cáo
Các tin quảng cáo/tài trợ được hiển thị tại ứng dụng client.

#### 📍 Lấy danh sách Quảng cáo
*   **Route**: `GET /ads`
*   **Query Parameters**:
    - `is_active` (`true`/`false` - xem quảng cáo đang hoạt động)
    - `type` (loại quảng cáo: `home`, `place`, `sponsored`...)
    - `search` (tìm theo tiêu đề quảng cáo)

#### 📍 Chi tiết Quảng cáo theo ID
*   **Route**: `GET /ads/:id`

#### 📍 Thêm mới / Cập nhật / Xóa Quảng cáo
*   **Routes**: `POST /ads`, `PUT /ads/:id`, `DELETE /ads/:id`

---

### 7. Gamification Configs (Cấu hình điểm số)
Cơ chế thiết lập số lượng điểm thưởng tương ứng với mỗi hành động của người dùng.

#### 📍 Xem toàn bộ cấu hình tích điểm
*   **Route**: `GET /gamification-configs`

#### 📍 Chi tiết cấu hình theo action_key
*   **Route**: `GET /gamification-configs/:action_key`

#### 📍 Thêm mới hoặc Cập nhật cấu hình tích điểm (Upsert)
*   **Route**: `POST /gamification-configs`
*   **Request Body**:
    ```json
    {
      "action_key": "user_checkin",
      "points": 100
    }
    ```

#### 📍 Xóa cấu hình tích điểm
*   **Route**: `DELETE /gamification-configs/:action_key`

---

### 8. Favorites (Địa điểm yêu thích)

#### 📍 Xem danh sách các địa điểm đã yêu thích
*   **Route**: `GET /favorites`

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

#### 📍 Danh sách lịch trình của người dùng hiện tại
*   **Route**: `GET /trips`

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

#### 📍 Xóa kế hoạch lịch trình
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

---

### 11. Loyalty Points History (Lịch sử điểm thưởng)
Theo dõi nhật ký tích điểm thưởng của các thành viên.

#### 📍 Tra cứu lịch sử điểm thưởng (Có Filter & Phân trang)
*   **Route**: `GET /loyalty-points`
*   **Query Parameters**:
    - `limit` (Mặc định 10)
    - `page` (Mặc định 1)
    - `user_id` (Chỉ dùng được cho Admin/Staff để tra cứu thành viên cụ thể)
    - `action_type` (Lọc theo tác vụ tích điểm: `review_destination`, `checkin_bonus`...)
    - `blockchain_status` (Trạng thái đồng bộ blockchain: `none`, `pending`, `success`)

#### 📍 Tra cứu chi tiết một dòng lịch sử điểm
*   **Route**: `GET /loyalty-points/:id`

#### 📍 Tạo mới bản ghi điểm thưởng trực tiếp
*   **Route**: `POST /loyalty-points`
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

#### 📍 Xóa dòng lịch sử điểm (Tự động trừ khấu hao điểm thưởng của User tương ứng)
*   **Route**: `DELETE /loyalty-points/:id`

---

### 12. Districts (Quận/Huyện)

#### 📍 Lấy danh sách Quận/Huyện (Có phân trang & lọc)
*   **Route**: `GET /districts`
*   **Query Parameters**:
    - `province_id` (lọc theo ID tỉnh)
    - `search` (tìm theo tên quận/huyện hoặc slug)
    - `limit` (mặc định 10)
    - `page` (mặc định 1)

#### 📍 Chi tiết Quận/Huyện theo ID
*   **Route**: `GET /districts/:id`

#### 📍 Thêm mới / Cập nhật / Xóa Quận/Huyện
*   **Routes**: `POST /districts`, `PUT /districts/:id`, `DELETE /districts/:id`

---

### 13. Providers (Nhà cung cấp)

#### 📍 Danh sách Nhà cung cấp (Có lọc & Phân trang)
*   **Route**: `GET /providers`

#### 📍 Chi tiết Nhà cung cấp theo ID
*   **Route**: `GET /providers/:id`

#### 📍 Tạo mới Nhà cung cấp
*   **Route**: `POST /providers`
*   **Request Body**:
    ```json
    {
      "name": "Victoria Resort Group",
      "logo_url": "https://example.com/logo.png",
      "contact_name": "Nguyễn Văn Thành",
      "phone": "0912111222",
      "email": "contact@victoriaresorts.com",
      "website_url": "https://victoriaresorts.com",
      "status": "active"
    }
    ```

#### 📍 Cập nhật / Xóa Nhà cung cấp
*   **Routes**: `PUT /providers/:id`, `DELETE /providers/:id`

---

### 14. Notifications (Thông báo in-app)

#### 📍 Xem danh sách thông báo của tôi (Cá nhân + Hệ thống)
*   **Route**: `GET /notifications/my`

#### 📍 Đánh dấu một thông báo cá nhân là đã đọc
*   **Route**: `PUT /notifications/my/:id/read`

#### 📍 Quản trị danh sách thông báo
*   **Route**: `GET /notifications`

#### 📍 Chi tiết thông báo theo ID
*   **Route**: `GET /notifications/:id`

#### 📍 Gửi thông báo mới
*   **Route**: `POST /notifications`
*   **Request Body**:
    ```json
    {
      "user_id": "c0e95db2-486d-8a82-7d29-7d29b8fbbcd4", // Hoặc null nếu gửi toàn hệ thống
      "title_vi": "Chào mừng bạn mới!",
      "title_en": "Welcome new user!",
      "content_vi": "Chào mừng bạn đã gia nhập Mekong Ơi.",
      "content_en": "Welcome to Mekong Oi.",
      "is_read": false
    }
    ```

#### 📍 Cập nhật / Xóa thông báo
*   **Routes**: `PUT /notifications/:id`, `DELETE /notifications/:id`

---

### 15. Ad Logs (Nhật ký click/impression quảng cáo)

#### 📍 Tạo mới log sự kiện quảng cáo
*   **Route**: `POST /ad-logs`
*   **Request Body**:
    ```json
    {
      "ad_id": 1,
      "place_id": 3,
      "event_type": "click", // 'click' hoặc 'impression'
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0..."
    }
    ```

#### 📍 Danh sách log quảng cáo (Phân trang & Lọc)
*   **Route**: `GET /ad-logs`

#### 📍 Chi tiết log quảng cáo theo ID
*   **Route**: `GET /ad-logs/:id`

#### 📍 Cập nhật / Xóa bản ghi log quảng cáo
*   **Routes**: `PUT /ad-logs/:id`, `DELETE /ad-logs/:id`

---

## 🧪 Chạy Integration Tests

Bộ kiểm thử tích hợp tự động được đặt tại [verify_api.js](file:///c:/Users/BLUE/Desktop/TravelApp/backend/verify_api.js). Script này thực hiện việc giả lập toàn bộ các kịch bản chính:
1. Đăng ký tài khoản thử nghiệm.
2. Phân quyền nâng cao của tài khoản lên `ADMIN` trực tiếp trong Database để có toàn quyền thực hiện suite test.
3. Đăng nhập và trích xuất JWT Token.
4. Gọi toàn bộ chuỗi CRUD của các thực thể chính (địa điểm, đánh giá, tỉnh thành, danh mục, quảng cáo, cấu hình gamification, yêu thích, lịch trình, điểm danh, điểm thưởng, nhà cung cấp, thông báo, nhật ký tương tác).
5. Tự động dọn dẹp các bản ghi rác phát sinh trong suite test.
6. Xác thực cơ chế Cascade Delete trên địa điểm.

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
