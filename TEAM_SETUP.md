# Team Setup Instructions

## For Each Team Member:

### 1. Setup Environment Configuration
```bash
cd farumasi-frontend
cp .env.example .env
```

The `.env` file will contain:
```
REACT_APP_API_BASE_URL=http://https://farumasi.onrender.com
```

### 2. Run Backend Server
```bash
cd Backend
npm install
npm start
```
Server will run on `http://https://farumasi.onrender.com`

### 3. Create Admin User
```bash
cd Backend
node scripts/createAdmin.js
```
This creates admin with:
- **Email**: `admin@farumasi.com`
- **Password**: `admin123`

### 4. Run Frontend
```bash
cd farumasi-frontend
npm install
npm start
```
Frontend will run on `http://localhost:3000`

### 5. Login as Admin
- Open `http://localhost:3000`
- Login with: `admin@farumasi.com` / `admin123`
- ✅ **Should work now!**

## Why This Fixes the Problem:

- ✅ **Configurable API URL**: No more hardcoded localhost
- ✅ **Each developer runs their own backend**: Independent development
- ✅ **Each developer creates their own admin**: Same credentials work for everyone
- ✅ **Environment-based configuration**: Easy to customize if needed

## What Changed:

1. **AuthContext now uses `API_BASE_URL`** instead of hardcoded URLs
2. **API_BASE_URL reads from `.env` file** (defaults to https://farumasi.onrender.com)
3. **Each team member can customize their `.env`** if needed

Now your teammates should be able to login as admin! 🚀
