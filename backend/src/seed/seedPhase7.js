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

const seedPhase7 = async () => {
  await connectDB();

  try {
    const passwordHash = await bcrypt.hash('SecurePass@123', 10);

    // 1. Ensure Manager Exists
    let manager = await User.findOne({ email: 'arjun.manager@vendorbridge.com' });
    if (!manager) {
      manager = await User.create({
        name: 'Arjun Kapoor',
        email: 'arjun.manager@vendorbridge.com',
        passwordHash,
        role: 'MANAGER',
        status: 'ACTIVE'
      });
      console.log('Manager created');
    }

    // Ensure Procurement Officer exists
    let officer = await User.findOne({ email: 'riya.officer@vendorbridge.com' });
    if (!officer) {
        officer = await User.create({
            name: 'Riya Shah',
            email: 'riya.officer@vendorbridge.com',
            passwordHash,
            role: 'PROCUREMENT_OFFICER',
            status: 'ACTIVE'
        });
        console.log('Officer created');
    }

    // Ensure Vendor Exists
    let vendor = await Vendor.findOne({ companyName: 'Meridian Packaging Co.' });
    if (!vendor) {
        vendor = await Vendor.create({
            companyName: 'Meridian Packaging Co.',
            contactName: 'Meridian Admin',
            contactEmail: 'meridian@example.com',
            contactPhone: '1234567890',
            gstNumber: `GST-${Date.now()}`,
            category: 'Packaging',
            status: 'ACTIVE',
            rating: 3.5
        });
    }

    // Create RFQ
    const rfq = await Rfq.create({
        rfqNumber: `RFQ-7-${Math.floor(Math.random() * 10000)}`,
        title: 'Phase 7 Approval Test RFQ',
        description: 'Test RFQ for Phase 7 Approvals',
        status: 'CLOSED', // It transitions to CLOSED once a quote is selected
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: officer._id,
        assignedVendors: [vendor._id],
        itemDetails: [{ name: 'Item', quantity: 10, unit: 'pcs' }]
    });

    // Create Quotation
    const quotation = await Quotation.create({
        rfqId: rfq._id,
        vendorId: vendor._id,
        unitPrice: 100,
        quantity: 10,
        deliveryDays: 10,
        remarks: 'Test quote',
        status: 'SELECTED', // Selected state
        totalAmount: 1000
    });

    // Create Approval
    const approval = await Approval.create({
        rfqId: rfq._id,
        quotationId: quotation._id,
        requestedBy: officer._id,
        status: 'PENDING' // Awaiting manager approval
    });

    console.log(`Created PENDING approval for RFQ ${rfq.rfqNumber}`);
    
    // Check if there are any other RFQs that can be set for a REJECTED or APPROVED case
    // For now, PENDING is enough to test.
    
    console.log('Seed completed successfully for Phase 7');
    process.exit(0);
  } catch (error) {
    console.error('Seed Failed:', error);
    process.exit(1);
  }
};

seedPhase7();
