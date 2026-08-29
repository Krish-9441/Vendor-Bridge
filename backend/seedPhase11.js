import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Vendor } from './src/modules/vendors/vendor.model.js';
import { Rfq } from './src/modules/rfq/rfq.model.js';
import { Quotation } from './src/modules/quotations/quotation.model.js';
import { PurchaseOrder } from './src/modules/purchaseOrders/purchaseOrder.model.js';
import { Invoice } from './src/modules/invoices/invoice.model.js';
import { User } from './src/modules/user/user.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vendorbridge';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get an officer and an admin to assign RFQs and POs
    const officer = await User.findOne({ role: 'PROCUREMENT_OFFICER' });
    const admin = await User.findOne({ role: 'ADMIN' });
    if (!officer || !admin) {
      console.log('Required users not found. Ensure the DB is seeded with users first.');
      process.exit(1);
    }

    // Get vendors, or create if needed
    let vendors = await Vendor.find().limit(5);
    if (vendors.length < 5) {
      console.log('Not enough vendors, run earlier seeders first.');
      process.exit(1);
    }

    const months = [0, 1, 2, 3, 4, 5, 6, 7]; // Jan (0) to August (7) 2026
    const year = 2026;

    console.log('Seeding Analytics Data...');

    // We'll create ~20-30 historical entries per month for trends
    for (const month of months) {
      console.log(`Processing month: ${month + 1}/${year}`);
      
      const numRecords = Math.floor(Math.random() * 5) + 5; // 5 to 9 POs per month
      
      for (let i = 0; i < numRecords; i++) {
        // Random date within the month
        const day = Math.floor(Math.random() * 28) + 1;
        const date = new Date(year, month, day);

        const vendor = vendors[Math.floor(Math.random() * vendors.length)];
        
        // Create an RFQ
        const rfq = await Rfq.create({
          rfqNumber: `RFQ-${year}${month+1}-${Math.floor(Math.random()*10000)}`,
          title: `Procurement for Month ${month+1}`,
          description: `Bulk materials for month ${month+1}`,
          category: 'IT Hardware',
          status: 'CLOSED',
          deadline: new Date(year, month, day + 5),
          createdBy: officer._id,
          assignedVendors: [vendor._id]
        });
        await Rfq.collection.updateOne({ _id: rfq._id }, { $set: { createdAt: date } });

        // Vendor creates a quotation
        const isAwarded = Math.random() > 0.3; // 70% win rate
        const quotation = await Quotation.create({
          rfqId: rfq._id,
          vendorId: vendor._id,
          quantity: 10,
          unitPrice: Math.floor((Math.random() * 50000) + 5000),
          totalAmount: Math.floor(Math.random() * 500000) + 50000,
          status: isAwarded ? 'AWARDED' : 'REJECTED',
          deliveryDays: Math.floor(Math.random() * 10) + 2,
          validUntil: new Date(year, month, day + 15)
        });
        await Quotation.collection.updateOne({ _id: quotation._id }, { $set: { createdAt: date } });

        // If not awarded, we create some other rejected quotations to inflate total quotations vs awarded
        if (!isAwarded) {
          const rejectedQuotation = await Quotation.create({
            rfqId: rfq._id,
            vendorId: vendors[(vendors.indexOf(vendor) + 1) % vendors.length]._id,
            quantity: 10,
            unitPrice: Math.floor((Math.random() * 60000) + 10000),
            totalAmount: Math.floor(Math.random() * 600000) + 100000,
            status: 'REJECTED',
            deliveryDays: Math.floor(Math.random() * 10) + 2,
            validUntil: new Date(year, month, day + 15)
          });
          await Quotation.collection.updateOne({ _id: rejectedQuotation._id }, { $set: { createdAt: date } });
        }

        // Only create POs for awarded ones
        if (isAwarded) {
          const po = await PurchaseOrder.create({
            poNumber: `PO-${year}${month+1}-${Math.floor(Math.random()*10000)}`,
            rfqId: rfq._id,
            vendorId: vendor._id,
            quotationId: quotation._id,
            totalAmount: quotation.totalAmount,
            status: 'ISSUED',
            issuedBy: officer._id
          });
          await PurchaseOrder.collection.updateOne({ _id: po._id }, { $set: { createdAt: date } });

          // Create Invoice
          const invoice = await Invoice.create({
            invoiceNumber: `INV-${year}${month+1}-${Math.floor(Math.random()*10000)}`,
            purchaseOrderId: po._id,
            vendorId: vendor._id,
            taxAmount: quotation.totalAmount * 0.18,
            totalAmount: quotation.totalAmount * 1.18,
            status: 'PAID', // Need PAID or SENT to count towards Spend To Date
          });
          await Invoice.collection.updateOne({ _id: invoice._id }, { $set: { createdAt: date } });
        }
      }
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
