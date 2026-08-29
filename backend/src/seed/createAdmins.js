import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../modules/user/user.model.js';

dotenv.config();

const createAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vendorbridge');
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('SecurePass@123', 10);

    // Create Admin
    await User.findOneAndUpdate(
      { email: 'admin@vendorbridge.com' },
      {
        name: 'System Admin',
        email: 'admin@vendorbridge.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
      },
      { upsert: true, new: true }
    );

    // Create Manager
    await User.findOneAndUpdate(
      { email: 'manager@vendorbridge.com' },
      {
        name: 'Operations Manager',
        email: 'manager@vendorbridge.com',
        passwordHash: hashedPassword,
        role: 'MANAGER',
      },
      { upsert: true, new: true }
    );

    console.log('Successfully created Admin (admin@vendorbridge.com) and Manager (manager@vendorbridge.com) with password: SecurePass@123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admins:', error);
    process.exit(1);
  }
};

createAdmins();
