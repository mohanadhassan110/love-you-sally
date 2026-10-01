# Our Story • Romantic NFC Memory Gift (Full-Stack Architecture)

A romantic digital memory timeline designed to be opened via physical NFC tags or cards (smartphones tap to reveal). Built with a decoupled **PHP Laravel 12 Backend API** and a **React (Vite) + Tailwind CSS Frontend**.

---

## 📁 Project Structure

```
d:/NFC_gift/
├── backend/                       # PHP Laravel 12 REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── CoupleController.php   # Couple profile & secret PIN verification
│   │   │   ├── MemoryController.php   # Timeline CRUD, image file uploads & likes
│   │   │   └── BackupController.php   # JSON export, import, and factory reset
│   │   └── Models/
│   │       ├── Couple.php             # Couple Eloquent model
│   │       └── Memory.php             # Memory Eloquent model with URL accessors
│   ├── database/
│   │   ├── migrations/                # Database migrations for couples & memories
│   │   └── seeders/DatabaseSeeder.php # Seeds initial romantic milestones & couple profile
│   ├── routes/api.php                 # Defined API endpoints
│   ├── config/cors.php                # Configured CORS for frontend connectivity
│   └── public/storage/ -> storage/app/public  # Public storage symlink for uploaded photos
│
├── frontend/                      # React (Vite) + Tailwind CSS + Framer Motion
│   ├── src/
│   │   ├── services/
│   │   │   ├── apiService.js          # Unified HTTP client talking to Laravel API
│   │   │   └── storageService.js      # Resilient offline cache & LocalStorage fallback
│   │   ├── components/                # Timeline, Header, Lightbox, Admin Dashboard
│   │   └── App.jsx                    # Root component with live backend status indicator
│   └── package.json
│
└── run-dev.bat                    # One-click Windows runner to launch both servers
```

---

## ⚡ Quick Start

### 1. Launching Both Servers

You can double-click [`run-dev.bat`](file:///d:/NFC_gift/run-dev.bat) or run them in two terminal tabs:

**Terminal 1 (Backend - Laravel):**
```bash
cd backend
php artisan serve --port=8000
```
*API is live at `http://127.0.0.1:8000/api`*

**Terminal 2 (Frontend - React Vite):**
```bash
cd frontend
npm run dev
```
*Application is live at `http://localhost:5173`*

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/couple` | Get couple profile details & anniversary date |
| `PUT` | `/api/couple` | Update names, quote, start date, PIN, custom audio |
| `POST` | `/api/verify-pin` | Verify secret curator PIN |
| `GET` | `/api/memories` | List timeline memories (supports `?favorite=1`, `?search=...`, `?order=asc/desc`) |
| `POST` | `/api/memories` | Create memory (supports multipart photo upload or image URL) |
| `GET` | `/api/memories/{id}` | Get single memory details |
| `POST` | `/api/memories/{id}` | Update memory and optional new photo |
| `DELETE` | `/api/memories/{id}` | Delete memory and purge stored file |
| `POST` | `/api/memories/{id}/like` | Increment love/heart reaction counter |
| `GET` | `/api/backup/export` | Download full database JSON backup |
| `POST` | `/api/backup/import` | Restore database from JSON backup |
| `POST` | `/api/backup/reset` | Reset to starter romantic sample memories |

---

## 💾 Database Configuration

* **Default**: Zero-config SQLite database located at `backend/database/database.sqlite`.
* **Switch to MySQL (Optional)**: In [`backend/.env`](file:///d:/NFC_gift/backend/.env), update:
  ```env
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_DATABASE=nfc_gift
  DB_USERNAME=root
  DB_PASSWORD=
  ```
  Then run `php artisan migrate:fresh --seed` inside the `backend` folder.

---

## 📱 Programming the Physical NFC Tag
1. Install **NFC Tools** (free on iOS & Android).
2. Choose **Write** ➔ **Add a record** ➔ **URL / URI**.
3. Enter your deployed URL (or local network IP e.g. `http://192.168.1.X:5173`).
4. Tap **Write** and hold your phone to the NFC sticker or card!
5. Default Admin PIN: **`1314`**
