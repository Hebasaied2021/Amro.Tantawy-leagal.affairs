import jsPDF from 'jspdf';
import { ClientAccount } from '../types';

/**
 * Generates and downloads a client financial report PDF for Lawyer Amr Tantawy
 */
export function exportClientReportToPDF(client: ClientAccount): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background and borders
  doc.setFillColor(10, 14, 26); // Midnight Blue
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Brand Header
  doc.setTextColor(0, 240, 255); // Cyber Cyan
  doc.setFontSize(16);
  doc.text('LAW FIRM OF ADV. AMR TANTAWY', 15, 12);

  doc.setTextColor(240, 240, 255);
  doc.setFontSize(9);
  doc.text('Legal Advocacy, Arbitration & Financial Audit Statement', 15, 18);
  doc.text('Office: El-Nokhba Tower, Cairo | WhatsApp & Phone: +20 100 367 6300', 15, 23);

  const reportDate = new Date().toLocaleDateString('en-GB');
  doc.setTextColor(0, 240, 255);
  doc.setFontSize(9);
  doc.text(`DATE: ${reportDate}`, pageWidth - 45, 12);
  doc.text(`REF: FIN-${client.id.toUpperCase()}`, pageWidth - 45, 18);

  // Decorative cyan accent line
  doc.setDrawColor(0, 240, 255);
  doc.setLineWidth(0.8);
  doc.line(0, 28, pageWidth, 28);

  // Document Title
  doc.setTextColor(26, 27, 47);
  doc.setFontSize(15);
  doc.text('OFFICIAL CLIENT FINANCIAL STATEMENT', 15, 40);

  // Client Information Box
  doc.setDrawColor(200, 215, 235);
  doc.setFillColor(245, 248, 255);
  doc.roundedRect(15, 45, pageWidth - 30, 32, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(60, 70, 90);
  doc.text(`Client Name: ${client.name}`, 20, 53);
  doc.text(`Entity / Company: ${client.companyName || 'Individual Client'}`, 20, 60);
  doc.text(`National ID / Reg: ${client.nationalId || 'N/A'}`, 20, 67);

  doc.text(`Phone: ${client.phone}`, pageWidth / 2 + 10, 53);
  doc.text(`Email: ${client.email}`, pageWidth / 2 + 10, 60);
  doc.text(`Address: ${client.address || 'Cairo, Egypt'}`, pageWidth / 2 + 10, 67);

  // Financial Metrics Summary Box
  const remaining = client.totalAgreedFees - client.totalPaid;
  const netDue = remaining + client.courtExpenses;

  doc.setFillColor(26, 27, 47); // Dark slate
  doc.roundedRect(15, 83, pageWidth - 30, 26, 2, 2, 'F');

  doc.setTextColor(160, 180, 210);
  doc.setFontSize(8);
  doc.text('AGREED LEGAL FEES', 22, 90);
  doc.text('TOTAL PAID FEES', 70, 90);
  doc.text('COURT EXPENSES', 120, 90);
  doc.text('NET BALANCE DUE', pageWidth - 55, 90);

  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`${client.totalAgreedFees.toLocaleString()} EGP`, 22, 99);

  doc.setTextColor(0, 230, 150); // Emerald green
  doc.text(`${client.totalPaid.toLocaleString()} EGP`, 70, 99);

  doc.setTextColor(255, 200, 80); // Amber
  doc.text(`${client.courtExpenses.toLocaleString()} EGP`, 120, 99);

  doc.setTextColor(0, 240, 255); // Cyan
  doc.text(`${netDue.toLocaleString()} EGP`, pageWidth - 55, 99);

  // Transactions Table Header
  doc.setTextColor(26, 27, 47);
  doc.setFontSize(11);
  doc.text('TRANSACTION LEDGER & PAYMENT AUDIT', 15, 118);

  let currentY = 124;
  doc.setFillColor(230, 236, 245);
  doc.rect(15, currentY, pageWidth - 30, 8, 'F');

  doc.setFontSize(8);
  doc.setTextColor(40, 50, 70);
  doc.text('#', 18, currentY + 5.5);
  doc.text('DATE', 28, currentY + 5.5);
  doc.text('TYPE & DESCRIPTION', 55, currentY + 5.5);
  doc.text('RECEIPT REF', 120, currentY + 5.5);
  doc.text('METHOD', 148, currentY + 5.5);
  doc.text('AMOUNT (EGP)', pageWidth - 40, currentY + 5.5);

  currentY += 8;

  // Transactions Rows
  if (client.transactions.length === 0) {
    doc.setTextColor(120, 130, 150);
    doc.text('No recorded financial transactions yet.', 20, currentY + 8);
    currentY += 16;
  } else {
    client.transactions.forEach((tx, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(250, 252, 255);
        doc.rect(15, currentY, pageWidth - 30, 9, 'F');
      }

      doc.setFontSize(8);
      doc.setTextColor(50, 60, 80);
      doc.text(String(idx + 1), 18, currentY + 6);
      doc.text(tx.date, 28, currentY + 6);

      const typeLabel = tx.type === 'دفعة أتعاب' ? 'Fee Payment' :
                        tx.type === 'مصروفات قضائية' ? 'Court Expenses' :
                        tx.type === 'رسوم توكيل وتوثيق' ? 'Power of Attorney' :
                        tx.type === 'أتعاب استشارة' ? 'Consultation Fee' : 'Expense Refund';
      
      doc.text(typeLabel, 55, currentY + 6);
      doc.text(tx.receiptNumber || `REC-${idx + 101}`, 120, currentY + 6);

      const methodLabel = tx.method === 'تحويل بنكي' ? 'Bank Wire' :
                          tx.method === 'شيك مصدّق' ? 'Certified Chq' :
                          tx.method === 'بطاقة دفع' ? 'Card / POS' : 'Cash';
      doc.text(methodLabel, 148, currentY + 6);

      // Amount
      const isExpense = tx.type.includes('مصروفات') || tx.type.includes('رسوم');
      if (isExpense) {
        doc.setTextColor(200, 100, 20);
      } else {
        doc.setTextColor(10, 140, 80);
      }
      doc.text(`${tx.amount.toLocaleString()}`, pageWidth - 35, currentY + 6);

      currentY += 9;
    });
  }

  // Final Summary Bottom Section
  currentY += 6;
  doc.setDrawColor(200, 215, 230);
  doc.line(15, currentY, pageWidth - 15, currentY);
  currentY += 8;

  doc.setFontSize(9);
  doc.setTextColor(50, 60, 80);
  doc.text('Settlement Terms:', 15, currentY);
  doc.setFontSize(8);
  doc.setTextColor(100, 110, 130);
  doc.text('All court receipts and official treasury vouchers are archived in original copies at our Cairo main office.', 15, currentY + 5);
  doc.text('This financial statement is electronically verified and issued under the authority of Adv. Amr Tantawy.', 15, currentY + 9);

  // Signatures & Official Stamp
  const sigY = pageHeight - 38;
  doc.setDrawColor(180, 195, 215);
  doc.line(20, sigY, 70, sigY);
  doc.line(pageWidth - 75, sigY, pageWidth - 25, sigY);

  doc.setFontSize(8);
  doc.setTextColor(70, 80, 100);
  doc.text('Prepared by: Finance Dept.', 22, sigY + 5);
  doc.text('Adv. Amr Tantawy - Managing Partner', pageWidth - 78, sigY + 5);

  // Cyan Footer Bar
  doc.setFillColor(10, 14, 26);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
  doc.setTextColor(0, 240, 255);
  doc.setFontSize(7);
  doc.text('OFFICE OF ADV. AMR TANTAWY - CONFIDENTIAL LEGAL & FINANCIAL AUDIT STATEMENT', 15, pageHeight - 5);
  doc.text('+20 100 367 6300', pageWidth - 45, pageHeight - 5);

  // Save the PDF
  const safeName = client.name.replace(/\s+/g, '_');
  doc.save(`كشف_حساب_المستشار_عمرو_طنطاوي_${safeName}.pdf`);
}
