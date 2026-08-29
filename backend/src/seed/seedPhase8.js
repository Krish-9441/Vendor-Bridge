import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../modules/user/user.model.js';
import { Vendor } from '../modules/vendors/vendor.model.js';
import { Rfq } from '../modules/rfq/rfq.model.js';
import { Quotation } from '../modules/quotations/quotation.model.js';
import { Approval } from '../modules/approvals/approval.model.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vendorbridge');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedPhase8 = async () => {
  await connectDB();

  try {
    const passwordHash = await bcrypt.hash('SecurePass@123', 10);

    // Manager
    let manager = await User.findOne({ email: 'arjun.manager@vendorbridge.com' });
    if (!manager) {
      manager = await User.create({
        name: 'Arjun Kapoor',
        email: 'arjun.manager@vendorbridge.com',
        passwordHash,
        role: 'MANAGER',
        status: 'ACTIVE'
      });
    }

    // Procurement Officer
    let officer = await User.findOne({ email: 'riya.officer@vendorbridge.com' });
    if (!officer) {
        officer = await User.create({
            name: 'Riya Shah',
            email: 'riya.officer@vendorbridge.com',
            passwordHash,
            role: 'PROCUREMENT_OFFICER',
            status: 'ACTIVE'
        });
    }

    // Vendor
    let vendor = await Vendor.findOne({ companyName: 'Cascade Networks Pvt Ltd' });
    if (!vendor) {
        vendor = await Vendor.create({
            companyName: 'Cascade Networks Pvt Ltd',
            contactName: 'Cascade Admin',
            contactEmail: 'cascade@example.com',
            contactPhone: '1231231234',
            gstNumber: `GST-CASCADE-${Date.now()}`,
            category: 'IT Hardware',
            status: 'ACTIVE',
            rating: 4.8
        });
        
        await User.create({
            name: 'Cascade Admin',
            email: 'cascade@example.com',
            passwordHash,
            role: 'VENDOR',
            vendorId: vendor._id,
            status: 'ACTIVE'
        });
    }

    // Create RFQ
    const rfq = await Rfq.create({
        rfqNumber: `RFQ-8-${Math.floor(Math.random() * 10000)}`,
        title: 'Network hardware refresh',
        description: 'Need switches and cabling',
        status: 'AWARDED',
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Past
        createdBy: officer._id,
        assignedVendors: [vendor._id],
        itemDetails: [
          { name: '24-port managed switch, PoE+', quantity: 6, unit: 'pcs' },
          { name: 'Cat6A cabling — 305m box', quantity: 18, unit: 'box' }
        ]
    });

    // Create Quotation
    const quotation = await Quotation.create({
        rfqId: rfq._id,
        vendorId: vendor._id,
        unitPrice: 58000, 
        quantity: 1, 
        deliveryDays: 5,
        remarks: 'All items in stock',
        status: 'AWARDED',
        totalAmount: 513600 // (6*58k + 18*9.2k)
    });

    // Create Approval
    const approval = await Approval.create({
        rfqId: rfq._id,
        quotationId: quotation._id,
        requestedBy: officer._id,
        approverId: manager._id,
        status: 'APPROVED',
        remarks: 'Looks good, generate PO',
        decidedAt: new Date()
    });

    console.log(`Created APPROVED approval for RFQ ${rfq.rfqNumber}`);
    
    console.log('Seed completed successfully for Phase 8');
    process.exit(0);
  } catch (error) {
    console.error('Seed Failed:', error);
    process.exit(1);
  }
};

seedPhase8();
