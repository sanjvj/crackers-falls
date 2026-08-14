import jsPDF from 'jspdf';

export interface ThermalReceiptData {
  billNumber: string;
  orderDate: string;
  customerName: string;
  customerPhone?: string;
  paymentMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  grandTotal: number;
  billPrefix?: string;
}

export function generateThermalReceiptPDF(data: ThermalReceiptData) {
  // 80mm thermal paper width (~80mm format, height dynamic)
  const itemHeight = data.items.length * 6;
  const pageHeight = Math.max(150, 100 + itemHeight);

  const doc = new jsPDF({
    unit: 'mm',
    format: [80, pageHeight]
  });

  const prefix = data.billPrefix || 'CF-POS-';
  const fullBillNo = `${prefix}${data.billNumber}`;

  // Receipt Header
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text('CRACKERS FALLS — SIVAKASI', 40, 8, { align: 'center' });

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.text('Authentic Wholesale Sivakasi Fireworks', 40, 12, { align: 'center' });
  doc.text('Ph: +91 91590 38240 | GSTIN: 33AAAAA0000A1Z5', 40, 15, { align: 'center' });
  doc.text('------------------------------------------', 40, 18, { align: 'center' });

  // Bill Metadata
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.text(`RECEIPT #: ${fullBillNo}`, 5, 23);
  doc.text(`DATE: ${new Date(data.orderDate).toLocaleDateString('en-IN')} ${new Date(data.orderDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, 5, 27);
  doc.text(`CUSTOMER: ${data.customerName} (${data.customerPhone || 'Walk-in'})`, 5, 31);
  doc.text(`PAYMENT: ${data.paymentMethod.toUpperCase()}`, 5, 35);
  doc.text('------------------------------------------', 40, 38, { align: 'center' });

  // Item Table Headers
  doc.setFont('courier', 'bold');
  doc.text('ITEM', 5, 42);
  doc.text('QTY', 42, 42);
  doc.text('RATE', 54, 42);
  doc.text('TOTAL', 75, 42, { align: 'right' });
  doc.text('------------------------------------------', 40, 45, { align: 'center' });

  // Line Items
  doc.setFont('courier', 'normal');
  let y = 49;
  data.items.forEach((item) => {
    const itemName = item.name.length > 18 ? item.name.substring(0, 18) + '.' : item.name;
    doc.text(itemName, 5, y);
    doc.text(String(item.quantity), 44, y);
    doc.text(String(item.unitPrice), 54, y);
    doc.text(`Rs.${item.total}`, 75, y, { align: 'right' });
    y += 5;
  });

  doc.text('------------------------------------------', 40, y, { align: 'center' });
  y += 4;

  // Totals Summary
  doc.setFont('courier', 'normal');
  doc.text('Subtotal:', 45, y);
  doc.text(`Rs.${data.subtotal}`, 75, y, { align: 'right' });
  y += 4;

  if (data.discount > 0) {
    doc.text('Discount:', 45, y);
    doc.text(`-Rs.${data.discount}`, 75, y, { align: 'right' });
    y += 4;
  }

  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.text('GRAND TOTAL:', 35, y);
  doc.text(`Rs.${data.grandTotal}`, 75, y, { align: 'right' });
  y += 6;

  // Footer Message
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.text('------------------------------------------', 40, y, { align: 'center' });
  y += 4;
  doc.text('Thank you for shopping at Crackers Falls!', 40, y, { align: 'center' });
  y += 4;
  doc.text('*** Licensed Moisture-Proof Sivakasi Fireworks ***', 40, y, { align: 'center' });

  // Open PDF Blob for printing
  const pdfBlob = doc.output('bloburl');
  window.open(pdfBlob.toString(), '_blank');
}
