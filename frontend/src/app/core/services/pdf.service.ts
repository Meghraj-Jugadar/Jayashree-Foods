import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../models/order.model';

// Brand colours
const BRAND   = [26, 35, 126] as [number, number, number];   // #1a237e
const ACCENT  = [255, 179, 0]  as [number, number, number];  // #ffb300
const LIGHT   = [232, 234, 246] as [number, number, number]; // #e8eaf6
const GREY    = [97, 97, 97]   as [number, number, number];  // #616161
const DARK    = [33, 33, 33]   as [number, number, number];  // #212121
const WHITE   = [255, 255, 255] as [number, number, number];
const PAGE_W  = 210;
const MARGIN  = 14;

@Injectable({ providedIn: 'root' })
export class PdfService {
  generateInvoice(order: Order, settings: any = {}): void {
    const doc      = new jsPDF({ unit: 'mm', format: 'a4' });
    const name     = settings.factory_name    || 'Food Factory Co.';
    const address  = settings.factory_address || '';
    const phone    = settings.factory_phone   || '';
    const currency = settings.currency        || 'INR';
    const fmt      = (v: any) => `${currency} ${parseFloat(String(v)).toFixed(2)}`;

    // ── Header band ───────────────────────────────────────────────────────────
    doc.setFillColor(...BRAND);
    doc.rect(0, 0, PAGE_W, 38, 'F');

    // Accent bar at bottom of header
    doc.setFillColor(...ACCENT);
    doc.rect(0, 36, PAGE_W, 3, 'F');

    // Company name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...WHITE);
    doc.text(name, MARGIN, 16);

    // Company sub-info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(200, 210, 255);
    let subY = 23;
    if (address) { doc.text(address, MARGIN, subY); subY += 5; }
    if (phone)   { doc.text(phone,   MARGIN, subY); }

    // "INVOICE" label (right side)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(...WHITE);
    doc.text('INVOICE', PAGE_W - MARGIN, 18, { align: 'right' });

    // ── Invoice meta box ──────────────────────────────────────────────────────
    const metaX = PAGE_W - MARGIN - 72;
    doc.setFillColor(...LIGHT);
    doc.roundedRect(metaX, 42, 72, 28, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND);
    doc.text('INVOICE NO',  metaX + 4, 49);
    doc.text('DATE',        metaX + 4, 57);
    doc.text('STATUS',      metaX + 4, 65);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.setFontSize(9);
    doc.text(order.orderNumber,                                    metaX + 72 - 4, 49, { align: 'right' });
    doc.text(new Date(order.createdAt).toLocaleDateString('en-IN'), metaX + 72 - 4, 57, { align: 'right' });

    // Status pill
    const statusColors: Record<string, [number,number,number][]> = {
      COMPLETED:  [[232,245,233],[46,125,50]],
      PENDING:    [[255,243,224],[230,81,0]],
      PROCESSING: [[227,242,253],[21,101,192]],
      CANCELLED:  [[252,228,236],[198,40,40]],
    };
    const [bgC, txC] = statusColors[order.status] ?? [LIGHT, GREY];
    doc.setFillColor(...(bgC as [number,number,number]));
    doc.roundedRect(metaX + 28, 61, 40, 7, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...(txC as [number,number,number]));
    doc.text(order.status, metaX + 48, 66, { align: 'center' });

    // ── Bill To ───────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND);
    doc.text('BILL TO', MARGIN, 49);

    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, 51, MARGIN + 22, 51);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.text(order.user?.name || '', MARGIN, 57);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...GREY);
    let billY = 63;
    doc.text(order.user?.email || '', MARGIN, billY); billY += 5;
    const userPhone = (order.user as any)?.phone;
    if (userPhone) { doc.text(userPhone, MARGIN, billY); billY += 5; }

    // ── Address boxes (side by side) ──────────────────────────────────────────
    const addrText   = order.deliveryAddress || 'Not provided';
    const BOX_W      = (PAGE_W - MARGIN * 2 - 6) / 2;  // ~86mm each
    const leftX      = MARGIN;
    const rightX     = MARGIN + BOX_W + 6;
    const addrY      = 74;
    const addrLines  = doc.splitTextToSize(addrText, BOX_W - 6);
    const addrBoxH   = 13 + addrLines.length * 5;

    // Billing box
    doc.setFillColor(255, 248, 225);
    doc.setDrawColor(255, 224, 130);
    doc.setLineWidth(0.4);
    doc.roundedRect(leftX, addrY, BOX_W, addrBoxH, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 100, 0);
    doc.text('BILLING ADDRESS', leftX + 3, addrY + 5);
    doc.setDrawColor(255, 179, 0);
    doc.setLineWidth(0.4);
    doc.line(leftX + 3, addrY + 7, leftX + BOX_W - 3, addrY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(addrLines, leftX + 3, addrY + 13);

    // Delivery box
    doc.setFillColor(240, 247, 255);
    doc.setDrawColor(144, 202, 249);
    doc.setLineWidth(0.4);
    doc.roundedRect(rightX, addrY, BOX_W, addrBoxH, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(21, 101, 192);
    doc.text('DELIVERY ADDRESS', rightX + 3, addrY + 5);
    doc.setDrawColor(144, 202, 249);
    doc.setLineWidth(0.4);
    doc.line(rightX + 3, addrY + 7, rightX + BOX_W - 3, addrY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(addrLines, rightX + 3, addrY + 13);

    const tableStartY = addrY + addrBoxH + 8;

    // ── Items table ───────────────────────────────────────────────────────────
    const rows = order.orderItems.map((item, i) => [
      (i + 1).toString(),
      item.product.name,
      item.quantity.toString(),
      fmt(item.unitPrice),
      fmt(item.subtotal),
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [['#', 'Product', 'Qty', 'Unit Price', 'Subtotal']],
      body: rows,
      theme: 'plain',
      styles: {
        fontSize: 9.5,
        cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
        textColor: DARK,
      },
      headStyles: {
        fillColor: BRAND,
        textColor: WHITE,
        fontStyle: 'bold',
        fontSize: 9,
      },
      alternateRowStyles: { fillColor: [248, 249, 255] },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        2: { cellWidth: 16, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
      },
      margin: { left: MARGIN, right: MARGIN },
    });

    // ── Totals block ──────────────────────────────────────────────────────────
    const finalY   = (doc as any).lastAutoTable.finalY + 6;
    const subtotal = parseFloat(String(order.totalAmount)) - parseFloat(String(order.taxAmount));
    const boxX     = PAGE_W - MARGIN - 72;

    // Totals background
    doc.setFillColor(...LIGHT);
    doc.roundedRect(boxX, finalY, 72, 36, 3, 3, 'F');

    const row = (label: string, value: string, y: number, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(bold ? 11 : 9.5);
      if (bold) doc.setTextColor(...DARK); else doc.setTextColor(...GREY);
      doc.text(label, boxX + 4, y);
      if (bold) doc.setTextColor(...BRAND); else doc.setTextColor(...DARK);
      doc.text(value, boxX + 68, y, { align: 'right' });
    };

    row('Subtotal', fmt(subtotal),          finalY + 9);
    row('Tax',      fmt(order.taxAmount),   finalY + 18);

    // Divider
    doc.setDrawColor(...BRAND);
    doc.setLineWidth(0.4);
    doc.line(boxX + 4, finalY + 22, boxX + 68, finalY + 22);

    row('Total',    fmt(order.totalAmount), finalY + 30, true);

    // ── Payment info ──────────────────────────────────────────────────────────
    if (order.payment) {
      doc.setFillColor(232, 245, 233);
      doc.roundedRect(MARGIN, finalY, 68, order.payment.transactionId ? 22 : 16, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(46, 125, 50);
      doc.text('PAYMENT', MARGIN + 3, finalY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      doc.text(`${order.payment.method}  ·  ${order.payment.status}`, MARGIN + 3, finalY + 13);
      if (order.payment.transactionId) {
        doc.setFontSize(8);
        doc.setTextColor(...GREY);
        doc.text(`Txn: ${order.payment.transactionId}`, MARGIN + 3, finalY + 19);
      }
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    const pageH = 297;
    doc.setFillColor(...BRAND);
    doc.rect(0, pageH - 16, PAGE_W, 16, 'F');
    doc.setFillColor(...ACCENT);
    doc.rect(0, pageH - 16, PAGE_W, 2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(200, 210, 255);
    doc.text('Thank you for your order!', PAGE_W / 2, pageH - 8, { align: 'center' });
    doc.setTextColor(150, 160, 220);
    doc.setFontSize(7);
    doc.text(name, MARGIN, pageH - 5);
    doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, PAGE_W - MARGIN, pageH - 5, { align: 'right' });

    doc.save(`invoice-${order.orderNumber}.pdf`);
  }
}
