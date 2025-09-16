# 🚀 Quick Email Setup (5 minutes)

## Step 1: Get Gmail App Password

1. **Go to Google Account Settings:**
   - Visit: https://myaccount.google.com/security
   - Or search "Google Account Security" in Google

2. **Enable 2-Step Verification** (if not already enabled):
   - Click "2-Step Verification" → Follow setup

3. **Create App Password:**
   - Go back to Security page
   - Click "App passwords" (you might need to sign in again)
   - Select "Mail" for app type
   - Select "Other" for device type
   - Name it "ITSO ID Tracker"
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

## Step 2: Update Server Configuration

Edit `itso-id-tracker/server/.env` file:

```env
# Replace these lines:
EMAIL_USER=junpyonk14@gmail.com
EMAIL_PASS=your-16-character-app-password-here
```

**Example:**
```env
EMAIL_USER=junpyonk14@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

## Step 3: Restart Server

1. Stop the server (Ctrl+C in server terminal)
2. Start it again: `npm run dev`

## Step 4: Test!

1. Go to login page
2. Click "Forgot Password"
3. Enter your email: `junpyonk14@gmail.com`
4. Check your Gmail inbox for the reset email!

---

## 🔧 Alternative: Test Without Email Setup

If you want to test the UI flow without setting up email:

1. Try forgot password with any email
2. Check the server console for the reset link
3. Copy and paste the link in your browser
4. Test the "Set New Password" page

The link will look like:
```
http://localhost:5176/reset-password?token=abc123...
```

---

## ✅ What You'll Get:

- **Professional HTML email** with ITSO branding
- **Secure reset links** (1-hour expiration)
- **Beautiful "Set New Password" page**
- **Complete password reset flow**

**Total setup time: ~5 minutes** ⏱️
