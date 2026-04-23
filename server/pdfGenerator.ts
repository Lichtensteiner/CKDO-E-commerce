import PDFDocument from 'pdfkit';
import { Response } from 'express';

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
}

export function generateInvoicePDF(data: InvoiceData, res: Response) {
  const doc = new PDFDocument({ margin: 50 });

  // Stream the PDF directly to the response
  doc.pipe(res);

  // Header
  // Note: Logo would be added here if available: doc.image('path/to/logo.png', 50, 45, { width: 50 })
  doc
    .fillColor('#0055A4') // CKDO Blue
    .fontSize(30)
    .text('CKDO SUPERMARCHÉ', 50, 50, { align: 'left' })
    .fillColor('#444444')
    .fontSize(10)
    .text('Libreville, Gabon', 50, 85)
    .text('Contact: contact@ckdo.ga', 50, 100)
    .moveDown();

  // Invoice Info
  doc
    .fontSize(20)
    .text('FACTURE', 50, 140, { align: 'right' })
    .fontSize(10)
    .text(`Numéro: ${data.invoiceNumber}`, 50, 165, { align: 'right' })
    .text(`Date: ${data.date}`, 50, 180, { align: 'right' })
    .moveDown();

  // Client Info
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Facturé à:', 50, 210)
    .font('Helvetica')
    .text(data.customerName, 50, 225)
    .text(data.customerEmail, 50, 240)
    .moveDown();

  // Table Header
  const tableTop = 280;
  doc
    .font('Helvetica-Bold')
    .text('Désignation', 50, tableTop)
    .text('Qté', 280, tableTop, { width: 50, align: 'right' })
    .text('Prix Unit.', 330, tableTop, { width: 80, align: 'right' })
    .text('Total', 410, tableTop, { width: 100, align: 'right' });

  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  // Table Body
  let position = tableTop + 25;
  doc.font('Helvetica');

  data.items.forEach((item) => {
    doc
      .text(item.name, 50, position, { width: 220 })
      .text(item.quantity.toString(), 280, position, { width: 50, align: 'right' })
      .text(`${item.price.toLocaleString()} CFA`, 330, position, { width: 80, align: 'right' })
      .text(`${(item.price * item.quantity).toLocaleString()} CFA`, 410, position, { width: 100, align: 'right' });

    position += 20;
  });

  // Summary
  doc.moveTo(50, position + 10).lineTo(550, position + 10).stroke();

  const summaryTop = position + 30;
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('TOTAL:', 330, summaryTop, { width: 80, align: 'right' })
    .fillColor('#0055A4')
    .text(`${data.totalAmount.toLocaleString()} CFA`, 410, summaryTop, { width: 100, align: 'right' });

  doc
    .fillColor('#444444')
    .font('Helvetica')
    .fontSize(10)
    .text(`Mode de paiement: ${data.paymentMethod}`, 50, summaryTop + 40);

  // Footer
  doc
    .fontSize(10)
    .text('Merci de votre confiance. À bientôt chez CKDO !', 50, 700, { align: 'center', width: 500 });

  doc.end();
}
