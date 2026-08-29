import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

import { Rfq } from '../modules/rfq/rfq.model.js';
import { Quotation } from '../modules/quotations/quotation.model.js';
import { PurchaseOrder } from '../modules/purchaseOrders/purchaseOrder.model.js';

const seedKrish = async () => {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const vendorId = new mongoose.Types.ObjectId('6a888a916017ccf119e1d90d');

    // 1. Assign him to an active RFQ
    const rfq = await Rfq.create({
      rfqNumber: `RFQ-${Date.now().toString().slice(-6)}`,
      title: 'Ergonomic Office Chairs (200 Units)',
      description: 'Require 200 ergonomic chairs for the new HQ.',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'PUBLISHED',
      assignedVendors: [vendorId]
    });

    // 2. Create a Quotation he previously submitted
    const rfq2 = await Rfq.create({
      rfqNumber: `RFQ-${Date.now().toString().slice(-6)}-2`,
      title: 'MacBook Pro M3 (50 Units)',
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'EVALUATING',
      assignedVendors: [vendorId]
    });

    const quotation = await Quotation.create({
      rfqId: rfq2._id,
      vendorId: vendorId,
      unitPrice: 150000,
      quantity: 50,
      totalAmount: 7500000,
      deliveryDays: 14,
      status: 'SUBMITTED'
    });

    // 3. Create a Purchase Order he was awarded
    const rfq3 = await Rfq.create({
      rfqNumber: `RFQ-${Date.now().toString().slice(-6)}-3`,
      title: 'Logitech MX Master 3S (100 Units)',
      deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'CLOSED',
      assignedVendors: [vendorId]
    });

    const qAwarded = await Quotation.create({
      rfqId: rfq3._id,
      vendorId: vendorId,
      unitPrice: 8000,
      quantity: 100,
      totalAmount: 800000,
      deliveryDays: 5,
      status: 'AWARDED'
    });

    const po = await PurchaseOrder.create({
      poNumber: `PO-${Date.now().toString().slice(-6)}`,
      quotationId: qAwarded._id,
      vendorId: vendorId,
      totalAmount: 800000,
      status: 'ISSUED'
    });

    console.log('Seeded data for Krish!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedKrish();
