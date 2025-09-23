import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";
import { sendPasswordResetEmail } from "../services/emailService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Auth routes working!" });
});

router.post("/test-login", (req, res) => {
  console.log('🔍 Test login received:', req.body);
  res.json({ message: "Test login received", body: req.body });
});

const readStudentCSV = () => {
  try {
    const csvPath = path.join(__dirname, '../../../student_ids.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
    const students = [];
    
   
    for (let i = 1; i < lines.length; i++) {
      const [student_id, email, password] = lines[i].split(',');
      if (student_id && student_id.trim()) {
        students.push({
          student_id: student_id.trim(),
          email: email ? email.trim() : '',
          password: password ? password.trim() : '12345'
        });
      }
    }
    
    return students;
  } catch (error) {
    console.error('Error reading student CSV:', error);
    return [];
  }
};

const validateStudentCredentials = (student_id, password) => {
  const students = readStudentCSV();
  const student = students.find(s => s.student_id === student_id);
  
  if (!student) {
    return { valid: false, message: 'Student ID not found' };
  }
  
  if (student.password !== password) {
    return { valid: false, message: 'Invalid password' };
  }
  
  return { valid: true, student };
};

router.post("/login", async (req, res) => {
  try {
    console.log('🔍 Login attempt:', req.body);
    const { email, student_id, password } = req.body;

   
    if (!email || !email.endsWith('@nu-dasma.edu.ph')) {
      console.log('❌ Invalid email format:', email);
      return res.status(400).json({ message: "Email must be a valid @nu-dasma.edu.ph address" });
    }

   
    console.log('🔍 Validating credentials for student_id:', student_id);
    const validation = validateStudentCredentials(student_id, password);
    console.log('🔍 Validation result:', validation);
    if (!validation.valid) {
      console.log('❌ Validation failed:', validation.message);
      return res.status(400).json({ message: validation.message });
    }

   
    console.log('🔍 Looking for user with student_id:', student_id);
    let user = await User.findOne({ 
      $or: [
        { student_id: student_id },
        { personal_email: email }
      ]
    });
    console.log('🔍 Found existing user:', user ? 'Yes' : 'No');
    
    if (!user) {
     
      console.log('🔍 Creating new user...');
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        name: `Student ${student_id}`,
        student_id,
        personal_email: email,
        password: hashedPassword,
        role: student_id === 'admin' ? 'admin' : 'student'
      });
      console.log('🔍 User object created:', { name: user.name, student_id: user.student_id, role: user.role });
      await user.save();
      console.log('✅ User saved to database');
    } else {
     
      let needsUpdate = false;
      
      if (user.personal_email !== email) {
        console.log('🔍 Updating user email from', user.personal_email, 'to', email);
        user.personal_email = email;
        needsUpdate = true;
      }
      
      if (user.student_id !== student_id) {
        console.log('🔍 Updating user student_id from', user.student_id, 'to', student_id);
        user.student_id = student_id;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await user.save();
        console.log('✅ User updated');
      }
    }

   
    console.log('🔍 Creating JWT token for user:', { id: user._id, role: user.role, email: user.personal_email });
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.personal_email,
        student_id: user.student_id
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log('✅ Login successful for user:', user.student_id, 'with role:', user.role);
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        student_id: user.student_id,
        personal_email: user.personal_email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

   
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

router.post("/create-admin", async (req, res) => {
  try {
    const { name, student_id, personal_email, password } = req.body;

   
    const existing = await User.findOne({ personal_email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new User({
      name,
      student_id,
      personal_email,
      password: hashedPassword,
      role: "admin"
    });

    await admin.save();

    res.status(201).json({
      message: "Admin user created successfully",
      user: {
        id: admin._id,
        name: admin.name,
        student_id: admin.student_id,
        personal_email: admin.personal_email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Error creating admin:", err);
    res.status(500).json({ message: "Error creating admin user" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    console.log("🔍 Forgot password request received for:", req.body);
    const { personal_email } = req.body;

    if (!personal_email) {
      console.log("❌ No email provided");
      return res.status(400).json({ message: "Email is required" });
    }

   
    console.log("🔍 Looking for user with email:", personal_email);
    const user = await User.findOne({ personal_email });
    if (!user) {
      console.log("❌ User not found for email:", personal_email);
     
      return res.status(200).json({
        message: "If an account with that email exists, we've sent a password reset link."
      });
    }
    console.log("✅ User found:", user.name);

   
    const resetToken = crypto.randomBytes(32).toString('hex');

   
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

   
    console.log("📧 Attempting to send email to:", personal_email);
    const emailResult = await sendPasswordResetEmail(personal_email, resetToken);
    console.log("📧 Email result:", emailResult);

    if (!emailResult.success) {
      console.error('❌ Failed to send email:', emailResult.error);
      return res.status(500).json({ message: "Failed to send reset email" });
    }

    console.log("✅ Email sent successfully!");
    res.status(200).json({
      message: "Password reset email sent successfully",
      email: personal_email
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

   
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

   
    const hashedPassword = await bcrypt.hash(newPassword, 10);

   
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/verify-reset-token/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    res.status(200).json({
      message: "Token is valid",
      email: user.personal_email
    });

  } catch (err) {
    console.error("Verify token error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/users", authenticateToken, async (req, res) => {
  try {
   
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const users = await User.find().select("-password -resetPasswordToken -resetPasswordExpires");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

router.patch("/user/:id", authenticateToken, async (req, res) => {
  try {
   
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { enrollment_status } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
   
    if (enrollment_status) {
      user.enrollment_status = enrollment_status;
    }
    
    await user.save();
    
    const updatedUser = await User.findById(req.params.id).select("-password -resetPasswordToken -resetPasswordExpires");
    
    res.json({
      message: "User updated successfully",
      user: updatedUser
    });
    
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Error updating user", error: err.message });
  }
});

router.post("/admin/fix-google-student-ids", authenticateToken, async (req, res) => {
  try {
   
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

   
    const usersWithGoogleIds = await User.find({
      student_id: { $regex: /^GOOGLE_/ }
    });

    if (usersWithGoogleIds.length === 0) {
      return res.json({
        message: "No users found with Google IDs as student IDs",
        fixed: 0
      });
    }

    let fixedCount = 0;
    const results = [];

    for (const user of usersWithGoogleIds) {
      try {
       
        const tempStudentId = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
        results.push({
          userId: user._id,
          email: user.personal_email,
          name: user.name,
          oldStudentId: user.student_id,
          newStudentId: tempStudentId,
          action: "marked_for_manual_review"
        });

       
        user.student_id = tempStudentId;
        user.needsStudentIdUpdate = true;
        await user.save();
        
        fixedCount++;
      } catch (error) {
        results.push({
          userId: user._id,
          email: user.personal_email,
          error: error.message,
          action: "failed"
        });
      }
    }

    res.json({
      message: `Fixed ${fixedCount} users with invalid student IDs`,
      fixed: fixedCount,
      total: usersWithGoogleIds.length,
      results: results
    });

  } catch (error) {
    console.error("Fix Google student IDs error:", error);
    res.status(500).json({ message: "Failed to fix student IDs", error: error.message });
  }
});

router.get("/admin/users-needing-student-id-update", authenticateToken, async (req, res) => {
  try {
   
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const usersNeedingUpdate = await User.find({
      $or: [
        { needsStudentIdUpdate: true },
        { student_id: { $regex: /^(GOOGLE_|TEMP_)/ } }
      ]
    }).select('name personal_email student_id createdAt needsStudentIdUpdate');

    res.json({
      message: "Users needing student ID updates",
      count: usersNeedingUpdate.length,
      users: usersNeedingUpdate
    });

  } catch (error) {
    console.error("Get users needing update error:", error);
    res.status(500).json({ message: "Failed to get users", error: error.message });
  }
});

router.patch("/admin/update-user-student-id/:userId", authenticateToken, async (req, res) => {
  try {
   
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { userId } = req.params;
    const { student_id } = req.body;

    if (!student_id || student_id.trim() === "") {
      return res.status(400).json({ message: "Student ID is required" });
    }

   
    const existingUser = await User.findOne({ 
      student_id: student_id.trim(),
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Student ID is already taken by another user" });
    }

   
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldStudentId = user.student_id;
    user.student_id = student_id.trim();
    user.needsStudentIdUpdate = false;
    await user.save();

    res.json({
      message: "Student ID updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.personal_email,
        oldStudentId: oldStudentId,
        newStudentId: user.student_id
      }
    });

  } catch (error) {
    console.error("Update student ID error:", error);
    res.status(500).json({ message: "Failed to update student ID", error: error.message });
  }
});

router.delete("/admin/delete-user/:userId", authenticateToken, async (req, res) => {
  try {
   
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { userId } = req.params;

   
    if (userId === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own admin account" });
    }

   
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot delete admin accounts" });
    }

   
    const deletedUserInfo = {
      id: user._id,
      name: user.name,
      email: user.personal_email,
      student_id: user.student_id,
      role: user.role
    };

   
    const Appointment = (await import("../models/Appointment.js")).default;
    const deletedAppointments = await Appointment.deleteMany({ userId: userId });

   
    await User.findByIdAndDelete(userId);

    res.json({
      message: "User account deleted successfully",
      deletedUser: deletedUserInfo,
      deletedAppointments: deletedAppointments.deletedCount
    });

  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
});

router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    console.log("🔍 Change password request received for user:", req.user.id);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

   
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   
    let valid = false;
    if (user.password) {
      valid = await bcrypt.compare(currentPassword, user.password);
    } else {
      const students = readStudentCSV();
      const csvStudent = students.find(s => s.student_id === user.student_id);
      valid = !!csvStudent && csvStudent.password === currentPassword;
    }
    if (!valid) return res.status(400).json({ message: "Current password is incorrect" });

   
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

   
    try {
      const csvPath = path.join(__dirname, "../../../student_ids.csv");
      const csvContent = fs.readFileSync(csvPath, "utf8");
      const lines = csvContent.split(/\r?\n/);
      for (let i = 1; i < lines.length; i++) {
        const [sid, email, pwd] = lines[i].split(",");
        if (sid && sid.trim() === user.student_id) {
          const safeEmail = (email || "").trim();
          lines[i] = `${sid},${safeEmail},${newPassword}`;
          break;
        }
      }
      fs.writeFileSync(csvPath, lines.join("\n"));
    } catch (csvError) {
      console.error("Error updating CSV file:", csvError);
    }

    console.log("✅ Password changed successfully for user:", user.student_id);
    res.status(200).json({ message: "Password changed successfully" });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Failed to change password", error: error.message });
  }
});

export default router;

