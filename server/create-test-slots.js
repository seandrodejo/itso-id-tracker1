import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Slot schema (simplified)
const slotSchema = new mongoose.Schema({
  date: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  purpose: { type: String, enum: ['NEW_ID', 'RENEWAL', 'LOST_REPLACEMENT'], required: true },
  capacity: { type: Number, default: 5 },
  bookedCount: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Slot = mongoose.model('Slot', slotSchema);

async function createTestSlots() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing slots
    await Slot.deleteMany({});
    console.log('🗑️ Cleared existing slots');

    // Create test slots for the next 30 days
    const today = new Date();
    const slots = [];

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Morning slots
      slots.push({
        date: dateStr,
        start: '09:00',
        end: '10:00',
        purpose: 'NEW_ID',
        capacity: 5,
        bookedCount: Math.floor(Math.random() * 3), // Random booking count
        isAvailable: true
      });
      
      slots.push({
        date: dateStr,
        start: '10:00',
        end: '11:00',
        purpose: 'RENEWAL',
        capacity: 5,
        bookedCount: Math.floor(Math.random() * 3),
        isAvailable: true
      });
      
      // Afternoon slots
      slots.push({
        date: dateStr,
        start: '14:00',
        end: '15:00',
        purpose: 'LOST_REPLACEMENT',
        capacity: 3,
        bookedCount: Math.floor(Math.random() * 2),
        isAvailable: true
      });
      
      slots.push({
        date: dateStr,
        start: '15:00',
        end: '16:00',
        purpose: 'NEW_ID',
        capacity: 5,
        bookedCount: Math.floor(Math.random() * 4),
        isAvailable: true
      });
    }

    // Insert all slots
    await Slot.insertMany(slots);
    console.log(`✅ Created ${slots.length} test slots`);
    console.log('📅 Slots created for the next 30 weekdays');
    console.log('🕐 Time slots: 9-10 AM, 10-11 AM, 2-3 PM, 3-4 PM');
    console.log('🎯 Services: New ID, Renewal, Lost/Replacement');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test slots:', error);
    process.exit(1);
  }
}

createTestSlots();
