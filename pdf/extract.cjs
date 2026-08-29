const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('c:/VendorBridge/Vendor-Bridge/pdf/VendorBridge_Architecture_Spec.pdf');

pdf(dataBuffer).then(function(data) {
  fs.writeFileSync('c:/VendorBridge/Vendor-Bridge/pdf/parsed.txt', data.text);
  console.log('Parsed successfully');
}).catch(console.error);
