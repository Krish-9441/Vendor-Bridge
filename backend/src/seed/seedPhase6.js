import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../modules/user/user.model.js';
import { Vendor } from '../modules/vendors/vendor.model.js';
import { Rfq } from '../modules/rfq/rfq.model.js';
import { Quotation } from '../modules/quotations/quotation.model.js';

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

const seedPhase6 = async () => {
  await connectDB();

  try {
    const passwordHash = await bcrypt.hash('SecurePass@123', 10);

    // 1. Create or Find Officer
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

    // 2. Create Vendors
    let vendor1 = await Vendor.findOne({ companyName: 'Meridian Packaging Co.' });
    if (!vendor1) {
      vendor1 = await Vendor.create({
        companyName: 'Meridian Packaging Co.',
        contactName: 'Meridian Admin',
        contactEmail: 'meridian@example.com',
        contactPhone: '1234567890',
        gstNumber: 'GST-MERIDIAN-001',
        category: 'Packaging',
        status: 'ACTIVE',
        rating: 3.5
      });
      console.log('Vendor 1 created');
    }

    let vendor2 = await Vendor.findOne({ companyName: 'PackRight Industries' });
    if (!vendor2) {
      vendor2 = await Vendor.create({
        companyName: 'PackRight Industries',
        contactName: 'PackRight Admin',
        contactEmail: 'packright@example.com',
        contactPhone: '0987654321',
        gstNumber: 'GST-PACKRIGHT-001',
        category: 'Packaging',
        status: 'ACTIVE',
        rating: 4.2
      });
      console.log('Vendor 2 created');
    }
    
    // Also create Users for these vendors so they can login if needed
    for (const v of [vendor1, vendor2]) {
      const u = await User.findOne({ email: v.contactEmail });
      if (!u) {
        await User.create({
          name: v.contactName,
          email: v.contactEmail,
          passwordHash,
          role: 'VENDOR',
          vendorId: v._id,
          status: 'ACTIVE'
        });
      }
    }

    // 3. Create RFQ
    const rfq = await Rfq.create({
      rfqNumber: `RFQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      title: 'INDUSTRIAL PACKAGING SUPPLY — Q3 2026',
      description: 'Require corrugated boxes and packaging materials for the Q3 production run.',
      status: 'PUBLISHED',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
      createdBy: officer._id,
      assignedVendors: [vendor1._id, vendor2._id],
      itemDetails: [
        { name: 'Corrugated Boxes 12x12x12', quantity: 1000, unit: 'pcs' },
        { name: 'Bubble Wrap 50m', quantity: 50, unit: 'rolls' }
      ]
    });
    console.log('RFQ Created:', rfq.rfqNumber);

    // 4. Create Quotations
    // Quotation 1: Lowest Price
    await Quotation.create({
      rfqId: rfq._id,
      vendorId: vendor1._id,
      unitPrice: 150, // total 150 * 1050? The front-end merges total qty, let's just use unitPrice and totalAmount
      quantity: 1050, 
      deliveryDays: 14,
      remarks: 'Freight included to both warehouses; partial shipment available.',
      status: 'SUBMITTED',
      totalAmount: 150 * 1050 // 157,500
    });
    console.log('Quotation 1 (Lowest Price) Created');

    // Quotation 2: Fastest Delivery
    await Quotation.create({
      rfqId: rfq._id,
      vendorId: vendor2._id,
      unitPrice: 180,
      quantity: 1050,
      deliveryDays: 9,
      remarks: 'Freight billed separately; single delivery point only.',
      status: 'SUBMITTED',
      totalAmount: 180 * 1050 // 189,000
    });
    console.log('Quotation 2 (Fastest Delivery) Created');

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed Failed:', error);
    process.exit(1);
  }
};

seedPhase6();
