import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './src/modules/user/user.model.js';
import { Vendor } from './src/modules/vendors/vendor.model.js';
import { Rfq } from './src/modules/rfq/rfq.model.js';
import { Quotation } from './src/modules/quotations/quotation.model.js';
import { PurchaseOrder } from './src/modules/purchaseOrders/purchaseOrder.model.js';
import { Approval } from './src/modules/approvals/approval.model.js';

const MONGODB_URI = 'mongodb+srv://krishkanjani86_db_user:EcxWch16hNGjeS2b@cluster0.jtec8lk.mongodb.net/version1';

async function seedTestVendor() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Create Test Vendor User
    const email = 'vendor_test@example.com';
    const password = 'password123';
    
    // 1. Create Vendor Profile
    let vendor = await Vendor.findOne({ contactEmail: email });
    if (!vendor) {
      vendor = await Vendor.create({
        companyName: 'Tax Test Solutions Ltd.',
        gstNumber: 'GST-TAX-TEST',
        contactName: 'Tax Tester',
        contactEmail: email,
        contactPhone: '9876543210',
        status: 'ACTIVE',
        category: 'IT Hardware',
        rating: 4.5
      });
      console.log('Created vendor profile');
    } else {
      console.log('Vendor profile already exists');
    }

    // 2. Create Test Vendor User
    let user = await User.findOne({ email });
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        name: 'Test Vendor User',
        email,
        passwordHash: hashedPassword,
        role: 'VENDOR',
        vendorId: vendor._id
      });
      console.log('Created vendor user:', email);
    } else {
      console.log('Vendor user already exists:', email);
    }

    // Need an officer user to create RFQ and PO
    const officer = await User.findOne({ role: 'PROCUREMENT_OFFICER' });
    const manager = await User.findOne({ role: 'MANAGER' });

    if (!officer || !manager) {
      console.log('Need an officer and a manager in the DB to proceed.');
      process.exit(1);
    }

    // 3. Create RFQ
    const rfq = await Rfq.create({
      rfqNumber: `RFQ-TEST-${Math.floor(Math.random() * 1000)}`,
      title: 'IT Equipment for Tax Testing',
      description: 'Laptops and servers required for testing invoice generation.',
      category: 'IT Hardware',
      status: 'CLOSED', // Closed because it's already awarded
      deadline: new Date(),
      createdBy: officer._id,
      assignedVendors: [vendor._id]
    });
    console.log('Created RFQ:', rfq.rfqNumber);

    // 4. Create Awarded Quotation
    const quotation = await Quotation.create({
      rfqId: rfq._id,
      vendorId: vendor._id,
      quantity: 50,
      unitPrice: 45000,
      totalAmount: 2250000,
      status: 'AWARDED',
      deliveryDays: 14,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    console.log('Created Awarded Quotation');

    // 5. Create Approval
    const approval = await Approval.create({
      quotationId: quotation._id,
      rfqId: rfq._id,
      vendorId: vendor._id,
      status: 'APPROVED',
      approverId: manager._id,
      comments: 'Approved for tax testing.'
    });
    console.log('Created Approval');

    // 6. Create Purchase Order in ISSUED state
    const po = await PurchaseOrder.create({
      poNumber: `PO-TEST-${Math.floor(Math.random() * 1000)}`,
      rfqId: rfq._id,
      vendorId: vendor._id,
      quotationId: quotation._id,
      approvalId: approval._id,
      totalAmount: quotation.totalAmount,
      status: 'ISSUED',
      issuedBy: officer._id
    });
    console.log('Created ISSUED Purchase Order:', po.poNumber);

    console.log('\n--- Test Account Details ---');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`PO Number ready for invoice: ${po.poNumber}`);
    console.log('----------------------------\n');

  } catch (error) {
    console.error('Error seeding test vendor:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedTestVendor();
