# 📧 Email Setup Instructions for Password Reset

To enable the password reset functionality, you need to configure Gmail SMTP settings.

## 🔧 Setup Steps:

### 1. **Create a Gmail App Password**
   - Go to your Google Account settings: https://myaccount.google.com/
   - Navigate to **Security** → **2-Step Verification** (enable if not already)
   - Go to **App passwords** → **Generate new app password**
   - Select **Mail** as the app and **Other** as the device
   - Copy the 16-character app password (e.g., `abcd efgh ijkl mnop`)

### 2. **Update Server Environment Variables**
   Edit `itso-id-tracker/server/.env` and replace these values:
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

   **Example:**
   ```env
   EMAIL_USER=itso.tracker@gmail.com
   EMAIL_PASS=abcd efgh ijkl mnop
   ```

### 3. **Test the Setup**
   1. Start the server: `npm run dev` (in server directory)
   2. Start the client: `npm run dev` (in client directory)
   3. Try the "Forgot Password" flow from the login modal

## 🔒 Security Notes:
- **Never commit the actual email credentials to version control**
- Use a dedicated Gmail account for the application
- The app password is different from your regular Gmail password
- Keep the `.env` file in `.gitignore`

## 📧 Email Template Features:
- ✅ Professional HTML email template
- ✅ ITSO ID Tracker branding
- ✅ Secure reset link with 1-hour expiration
- ✅ Mobile-responsive design
- ✅ Clear call-to-action button

## 🔄 Password Reset Flow:
1. **User clicks "Forgot Password"** → Enters email
2. **System sends email** → Professional HTML email with reset link
3. **User clicks email link** → Redirects to "Set New Password" page
4. **User sets new password** → Password updated in database
5. **Success confirmation** → Redirects back to login

## 🎨 UI Components Included:
- ✅ **Email confirmation modal** (matches Figma design)
- ✅ **Set New Password page** (matches Figma design)
- ✅ **Success/Error states** with proper styling
- ✅ **Token validation** and expiration handling

## 🚀 Ready to Use:
Once you update the email credentials in `.env`, the complete password reset system will be fully functional!
