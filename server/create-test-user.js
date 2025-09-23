import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  student_id: { type: String, required: true, unique: true },
  personal_email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  try {
   
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

   
    const existingUser = await User.findOne({ personal_email: 'test@student.com' });
    if (existingUser) {
      console.log('✅ Test user already exists');
      process.exit(0);
    }

   
    const hashedPassword = await bcrypt.hash('password123', 10);

   
    const testUser = new User({
      name: 'Test Student',
      student_id: '2024-12345',
      personal_email: 'test@student.com',
      password: hashedPassword,
      role: 'student'
    });

    await testUser.save();
    console.log('✅ Test user created successfully');
    console.log('📧 Email: test@student.com');
    console.log('🔑 Password: password123');

   
    const existingAdmin = await User.findOne({ personal_email: 'admin@nu-dasma.edu.ph' });
    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const adminUser = new User({
        name: 'ITSO Admin',
        student_id: 'ADMIN-001',
        personal_email: 'admin@nu-dasma.edu.ph',
        password: adminPassword,
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Admin user created successfully');
      console.log('📧 Admin Email: admin@nu-dasma.edu.ph');
      console.log('🔑 Admin Password: admin123');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();

