# Render Deployment Guide: செந்தமிழ் AI (Senthamil AI)

This guide provides step-by-step instructions to host your **AI Powered Tamil Learning and Grammar Intelligence Assistant** online on **[Render.com](https://render.com)** for free.

---

## 📋 Prerequisites Checklist
1. A **[GitHub](https://github.com/)** account.
2. A **[Render](https://render.com/)** account (free).
3. A free **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)** account (to host the cloud database).
4. (Optional) A **[Google AI Studio](https://aistudio.google.com/)** Gemini API key.

---

## Step 1: Set Up Free Cloud Database (MongoDB Atlas)

Since Render's web services run in the cloud, you need a cloud-hosted MongoDB connection string:

1. Go to **[mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)** and create a free account.
2. Click **Create a Deployment** and select the **M0 Free Tier**.
3. Under **Security / Database Access**:
   - Create a database user (e.g., username: `tamiluser`, password: `your_secure_password`).
4. Under **Security / Network Access**:
   - Click **Add IP Address** -> select **Allow Access from Anywhere (`0.0.0.0/0`)** -> Confirm.
5. Under **Database Deployments**:
   - Click **Connect** -> Choose **Drivers (Node.js)**.
   - Copy the connection string format:
     ```
     mongodb+srv://tamiluser:<password>@cluster0.xxxxx.mongodb.net/tamil_ai_assistant?retryWrites=true&w=majority
     ```
   *(Replace `<password>` with your database user password).*

---

## Step 2: Push Project Code to GitHub

Open your terminal in `Project2` and push your code to your GitHub repository:

```bash
git add .
git commit -m "Configure project for Render deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tamil-ai-grammar-assistant.git
git push -u origin main
```

---

## Step 3: Deploy on Render.com

### Method A: 1-Click Blueprint Deployment (Recommended)
1. Log in to **[dashboard.render.com](https://dashboard.render.com/)**.
2. Click the **New +** button in the top navigation and select **Blueprint**.
3. Connect your GitHub repository (`tamil-ai-grammar-assistant`).
4. Render will automatically read `render.yaml` and configure the service.
5. In the Environment Variables prompt:
   - Set **`MONGODB_URI`**: Paste your MongoDB Atlas URI string from Step 1.
   - Set **`GEMINI_API_KEY`**: (Optional) Paste your Gemini API key.
6. Click **Apply**.

---

### Method B: Manual Web Service Setup
1. Log in to **[dashboard.render.com](https://dashboard.render.com/)**.
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your repository.
4. Fill in the deployment settings:
   - **Name**: `senthamil-ai-assistant`
   - **Region**: Any (e.g. *Singapore*, *Oregon*, or *Frankfurt*)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Scroll down to **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `NODE_VERSION` | `20.18.0` |
   | `PORT` | `3000` |
   | `MONGODB_URI` | `mongodb+srv://tamiluser:password@cluster0.xxx.mongodb.net/tamil_ai_assistant?retryWrites=true&w=majority` |
   | `GEMINI_API_KEY` | *Your Gemini API Key (optional)* |
6. Click **Create Web Service**.

---

## Step 4: Verification & Live Access

1. Render will automatically build the application and launch it.
2. In the deployment logs, you will see:
   ```
   ====================================================
     செந்தமிழ் AI (Senthamil AI Assistant) Server
     Server running on http://localhost:3000
     Frontend UI: http://localhost:3000
   ====================================================
   [MongoDB] Connected successfully to: cluster0.../tamil_ai_assistant
   [Seed] Seeding completed successfully!
   ```
3. Click your live Render URL (e.g., `https://senthamil-ai-assistant.onrender.com`).
4. Everything is ready! All features (Grammar check, Tamil voice reading, AI tutor, Thirukkural, quizzes, virtual keyboard, and progress tracking) are live on the web.
