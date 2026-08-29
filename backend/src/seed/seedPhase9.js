import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../modules/user/user.model.js';
import { Vendor } from '../modules/vendors/vendor.model.js';
import { Rfq } from '../modules/rfq/rfq.model.js';
import { Quotation } from '../modules/quotations/quotation.model.js';
import { Approval } from '../modules/approvals/approval.model.js';
import { PurchaseOrder } from '../modules/purchaseOrders/purchaseOrder.model.js';

dotenv.config();

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vendorbridge');
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

// PO Number generator (matches backend pattern)
const generatePoNumber = () => `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;

const seedPhase9 = async () => {
  await connectDB();

  try {
    const passwordHash = await bcrypt.hash('SecurePass@123', 10);

    // 1. Manager
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

    // 2. Procurement Officer
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

    // 3. Vendor - Aurora Textiles
    let vendor = await Vendor.findOne({ companyName: 'Aurora Textiles Ltd.' });
    if (!vendor) {
      vendor = await Vendor.create({
        companyName: 'Aurora Textiles Ltd.',
        contactName: 'Aurora Procurement',
        contactEmail: 'aurora@example.com',
        contactPhone: '9988776655',
        gstNumber: `24AAACA1111B1Z8`,
        category: 'Textiles',
        status: 'ACTIVE',
        rating: 4.2
      });
    }

    // 4. Vendor User
    let vendorUser = await User.findOne({ email: 'aurora@example.com' });
    if (!vendorUser) {
      vendorUser = await User.create({
        name: 'Aurora Procurement',
        email: 'aurora@example.com',
        passwordHash,
        role: 'VENDOR',
        vendorId: vendor._id,
        status: 'ACTIVE'
      });
    }

    // 5. RFQ — already AWARDED (fully completed flow)
    const rfq = await Rfq.create({
      rfqNumber: `RFQ-9-${Math.floor(Math.random() * 10000)}`,
      title: 'Uniform fabric procurement — FY 26-27',
      description: 'Cotton fabric rolls for annual uniform requirement across 4 sites',
      status: 'AWARDED',
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdBy: officer._id,
      assignedVendors: [vendor._id],
      itemDetails: [
        { name: 'White cotton fabric (60 GSM)', quantity: 500, unit: 'meters' },
        { name: 'Navy blue polyester fabric', quantity: 250, unit: 'meters' },
        { name: 'Embroidery thread set', quantity: 50, unit: 'sets' }
      ]
    });

    // 6. Quotation — AWARDED
    const quotation = await Quotation.create({
      rfqId: rfq._id,
      vendorId: vendor._id,
      unitPrice: 850,
      quantity: 800,
      deliveryDays: 14,
      notes: 'Premium quality, ready stock',
      status: 'AWARDED',
      totalAmount: 680000
    });

    // 7. Approval — APPROVED
    const approval = await Approval.create({
      rfqId: rfq._id,
      quotationId: quotation._id,
      requestedBy: officer._id,
      approverId: manager._id,
      status: 'APPROVED',
      remarks: 'Best price and delivery terms. Proceed.',
      decidedAt: new Date()
    });

    // 8. Purchase Order — ACKNOWLEDGED (ready for invoice generation!)
    const po = await PurchaseOrder.create({
      poNumber: generatePoNumber(),
      quotationId: quotation._id,
      approvalId: approval._id,
      rfqId: rfq._id,
      vendorId: vendor._id,
      issuedBy: officer._id,
      status: 'ACKNOWLEDGED',
      totalAmount: 680000
    });

    console.log(`\n✅ Seed Complete!`);
    console.log(`   PO Number   : ${po.poNumber}`);
    console.log(`   PO Status   : ${po.status} (ready for invoice generation)`);
    console.log(`   Vendor Login: aurora@example.com / SecurePass@123`);
    console.log(`   Manager     : arjun.manager@vendorbridge.com / SecurePass@123`);
    console.log('\nTest Flow:');
    console.log('  1. Login as aurora@example.com');
    console.log('  2. Go to Purchase Orders → open the PO above');
    console.log('  3. Click "+ Generate Invoice" → select 18% GST → submit');
    console.log('  4. Download PDF or Send via Email');
    console.log('  5. Login as Manager → mark invoice as PAID');

    process.exit(0);
  } catch (error) {
    console.error('Seed Failed:', error.message);
    process.exit(1);
  }
};

seedPhase9();
