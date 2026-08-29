import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

import { Vendor } from '../modules/vendors/vendor.model.js';
import { Rfq } from '../modules/rfq/rfq.model.js';
import { Quotation } from '../modules/quotations/quotation.model.js';
import { Approval } from '../modules/approvals/approval.model.js';
import { PurchaseOrder } from '../modules/purchaseOrders/purchaseOrder.model.js';
import { Invoice } from '../modules/invoices/invoice.model.js';

const seedDashboard = async () => {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Clean up
    await Vendor.deleteMany({});
    await Rfq.deleteMany({});
    await Quotation.deleteMany({});
    await Approval.deleteMany({});
    await PurchaseOrder.deleteMany({});
    await Invoice.deleteMany({});
    
    // Create vendors
    const v1 = await Vendor.create({
      companyName: 'Shree Balaji Traders',
      gstNumber: '24ABCDE1234F1Z5',
      contactEmail: 'vendor1@test.com',
      contactPhone: '1234567890'
    });
    
    const v2 = await Vendor.create({
      companyName: 'Cascade Networks Pvt Ltd',
      gstNumber: '24ABCDE1234F1Z6',
      contactEmail: 'vendor2@test.com',
      contactPhone: '0987654321'
    });
    
    // Create RFQs
    const rfq1 = await Rfq.create({
      rfqNumber: 'RFQ-001',
      title: 'Laptops',
      deadline: new Date(),
      status: 'PUBLISHED',
      assignedVendors: [v1._id, v2._id]
    });
    
    const rfq2 = await Rfq.create({
      rfqNumber: 'RFQ-002',
      title: 'Desktops',
      deadline: new Date(),
      status: 'PUBLISHED',
      assignedVendors: [v1._id]
    });

    // Create Quotations
    const q1 = await Quotation.create({
      rfqId: rfq1._id,
      vendorId: v1._id,
      unitPrice: 50000,
      quantity: 10,
      totalAmount: 500000,
      deliveryDays: 5,
      status: 'SELECTED'
    });
    
    const q2 = await Quotation.create({
      rfqId: rfq1._id,
      vendorId: v2._id,
      unitPrice: 55000,
      quantity: 10,
      totalAmount: 550000,
      deliveryDays: 7,
      status: 'SUBMITTED'
    });
    
    const q3 = await Quotation.create({
      rfqId: rfq2._id,
      vendorId: v1._id,
      unitPrice: 30000,
      quantity: 20,
      totalAmount: 600000,
      deliveryDays: 3,
      status: 'SELECTED'
    });

    // Create Approvals
    await Approval.create({
      quotationId: q1._id,
      status: 'PENDING',
    });
    await Approval.create({
      quotationId: q2._id,
      status: 'PENDING',
    });
    await Approval.create({
      quotationId: q3._id,
      status: 'PENDING',
    });

    // Create POs
    const po1 = await PurchaseOrder.create({
      poNumber: 'PO-2026-0009',
      quotationId: q1._id,
      vendorId: v1._id,
      totalAmount: 1362500,
      status: 'ISSUED'
    });
    
    const po2 = await PurchaseOrder.create({
      poNumber: 'PO-2026-0010',
      quotationId: q3._id,
      vendorId: v1._id,
      totalAmount: 500000,
      status: 'ISSUED'
    });

    // Create Invoices
    await Invoice.create({
      invoiceNumber: 'INV-2026-0009',
      purchaseOrderId: po1._id,
      status: 'SENT',
      totalAmount: 1607750
    });
    
    await Invoice.create({
      invoiceNumber: 'INV-2026-0010',
      purchaseOrderId: po2._id,
      status: 'PAID',
      totalAmount: 590000
    });

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDashboard();
