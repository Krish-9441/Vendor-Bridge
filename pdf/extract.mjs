import fs from 'fs';
import pdf from 'pdf-parse';

const dataBuffer = fs.readFileSync('c:/VendorBridge/Vendor-Bridge/pdf/VendorBridge_Architecture_Spec.pdf');

// Handle different exports of pdf-parse
const parseFn = pdf.default || pdf;

parseFn(dataBuffer).then(data => {
  fs.writeFileSync('c:/VendorBridge/Vendor-Bridge/pdf/parsed.txt', data.text);
  console.log('Parsed successfully');
}).catch(console.error);
