# 🚀 Deployment Guide — The Inspirational Academy Timetable Portal

Your application is fully configured and ready to be hosted live on any free server!

---

## 🌟 Method 1: Host Free 24/7 on Render.com (Recommended)

**Render** gives you a free 24/7 cloud server with automatic HTTPS/SSL and continuous deployment from GitHub.

### Step 1: Push your code to GitHub
1. Open [GitHub](https://github.com) and create a **New Repository** (e.g. `tia-timetable`).
2. Run these commands in your project terminal:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/tia-timetable.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign up / log in with your GitHub account.
2. Click **New +** > **Web Service**.
3. Select your repository `tia-timetable`.
4. Configure the settings (or Render will automatically detect `render.yaml`):
   - **Name**: `tia-timetable`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
   - In **Environment Variables**, add:
     - `NODE_VERSION` = `22.12.0`
5. Click **Create Web Service**.
6. Within 1-2 minutes, your website will be live at `https://tia-timetable.onrender.com`! 🎉

---

## ⚡ Method 2: Instant 1-Click on Glitch.com (No Git required)

If you don't want to use GitHub right now:
1. Go to [glitch.com](https://glitch.com) and create a free account.
2. Click **New Project** > **Import from GitHub** (paste your repo link) OR select **glitch-hello-node**.
3. Copy/paste or drag-and-drop the project files (`server.js`, `db.js`, `package.json`, and `public/` folder).
4. Glitch automatically installs dependencies and gives you an instant live URL (e.g. `https://tia-timetable.glitch.me`).

---

## 🌐 Method 3: Instant Live Public URL from your PC (Right Now!)

If you want to immediately show the portal to students, teachers, or friends over the internet without waiting for cloud setups:

1. Double-click the file [share-live.bat](file:///c:/Users/Hamad/Desktop/TIA%20Time%20Table/share-live.bat).
2. It starts your portal and creates a secure public HTTPS link (e.g. `https://hungry-cat-42.loca.lt`).
3. Anyone with that link can access your timetable portal from their phone, tablet, or PC anywhere in the world!
