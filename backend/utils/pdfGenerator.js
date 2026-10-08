const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF receipt for an order
 * @param {Object} order - Order data with items and addresses
 * @returns {Buffer} - PDF buffer
 */
const generateOrderReceipt = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        margin: 50,
        bufferPages: true
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Colors
      const primaryColor = '#D4AF37'; // Gold
      const darkColor = '#1F2937';
      const lightGray = '#F3F4F6';

      // Header
      doc.fillColor(primaryColor)
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('My Clock', 50, 50, { align: 'left' });

      doc.fillColor(darkColor)
        .fontSize(12)
        .font('Helvetica')
        .text('Premium Timepieces', 50, 80);

      // Receipt Title
      doc.fillColor(darkColor)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('ORDER RECEIPT', 50, 120);

      // Order Information Box
      doc.rect(50, 160, 495, 80)
        .fillColor(lightGray)
        .fill()
        .stroke();

      doc.fillColor(darkColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Order Number:', 60, 175)
        .text('Order Date:', 60, 195)
        .text('Payment Method:', 60, 215);

      doc.font('Helvetica')
        .text(order.order_number || 'N/A', 200, 175)
        .text(new Date(order.created_at).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }), 200, 195)
        .text(order.payment_method?.toUpperCase() || 'COD', 200, 215);

      // Shipping Address
      let yPos = 260;
      doc.fillColor(darkColor)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Shipping Address:', 50, yPos);

      yPos += 20;
      doc.fontSize(10)
        .font('Helvetica')
        .text(`${order.shipping_address?.first_name || ''} ${order.shipping_address?.last_name || ''}`, 50, yPos);
      
      yPos += 15;
      doc.text(order.shipping_address?.address || '', 50, yPos);
      
      yPos += 15;
      doc.text(`${order.shipping_address?.city || ''}, ${order.shipping_address?.state || ''} - ${order.shipping_address?.zip_code || ''}`, 50, yPos);
      
      yPos += 15;
      doc.text(`${order.shipping_address?.country || 'India'}`, 50, yPos);
      
      yPos += 15;
      doc.text(`Phone: ${order.shipping_address?.phone || ''}`, 50, yPos);

      // Order Items Table Header
      yPos += 30;
      doc.fillColor(primaryColor)
        .rect(50, yPos, 495, 25)
        .fill();

      doc.fillColor('#FFFFFF')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Product', 60, yPos + 8)
        .text('SKU', 250, yPos + 8)
        .text('Qty', 320, yPos + 8)
        .text('Unit Price', 360, yPos + 8)
        .text('Total', 480, yPos + 8);
      
      doc.fillColor(primaryColor)
        .rect(50, yPos, 495, 25)
        .stroke();

      // Order Items
      yPos += 25;
      if (order.order_items && order.order_items.length > 0) {
        order.order_items.forEach((item, index) => {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          const isEven = index % 2 === 0;
          if (isEven) {
            doc.fillColor(lightGray)
              .rect(50, yPos, 495, 30)
              .fill();
          }

          doc.fillColor(darkColor)
            .fontSize(9)
            .font('Helvetica')
            .text(item.product_name || 'Product', 60, yPos + 10, { width: 180 })
            .text(item.product_sku || 'N/A', 250, yPos + 10, { width: 60 })
            .text(item.quantity?.toString() || '1', 320, yPos + 10, { width: 30 })
            .text(`₹${parseFloat(item.unit_price || 0).toFixed(2)}`, 360, yPos + 10, { width: 110, align: 'right' })
            .text(`₹${parseFloat(item.total_price || 0).toFixed(2)}`, 480, yPos + 10, { width: 60, align: 'right' });

          yPos += 30;
        });
      }

      // Summary Box
      yPos += 10;
      doc.fillColor(darkColor)
        .rect(350, yPos, 195, 100)
        .stroke();

      doc.fontSize(10)
        .font('Helvetica')
        .text('Subtotal:', 360, yPos + 10)
        .text('Tax (GST 18%):', 360, yPos + 30)
        .text('Shipping:', 360, yPos + 50)
        .font('Helvetica-Bold')
        .text('Total Amount:', 360, yPos + 70);

      doc.font('Helvetica')
        .text(`₹${parseFloat(order.subtotal || 0).toFixed(2)}`, 500, yPos + 10, { align: 'right' })
        .text(`₹${parseFloat(order.tax_amount || 0).toFixed(2)}`, 500, yPos + 30, { align: 'right' })
        .text(`₹${parseFloat(order.shipping_amount || 0).toFixed(2)}`, 500, yPos + 50, { align: 'right' })
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor(primaryColor)
        .text(`₹${parseFloat(order.total_amount || 0).toFixed(2)}`, 500, yPos + 70, { align: 'right' });

      // Footer
      const pageHeight = doc.page.height;
      const footerY = pageHeight - 100;

      doc.fillColor(darkColor)
        .fontSize(9)
        .font('Helvetica')
        .text('Thank you for your purchase!', 50, footerY, { align: 'center', width: 495 })
        .text('For any queries, contact us at: customercare@myclock.in', 50, footerY + 15, { align: 'center', width: 495 })
        .text('Phone: +91 80806 56656', 50, footerY + 30, { align: 'center', width: 495 })
        .text(`This is a computer-generated receipt. No signature required.`, 50, footerY + 50, { align: 'center', width: 495, opacity: 0.6 });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateOrderReceipt,
};

