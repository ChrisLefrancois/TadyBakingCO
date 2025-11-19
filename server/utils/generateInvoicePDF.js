// server/utils/generateInvoicePDF.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

async function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    // Ensure /temp exists
    const dir = path.join(__dirname, "../temp");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Receipt filename based on order id
    const receiptNumber = `TBC-${String(order._id).slice(-6).toUpperCase()}`;
    const filePath = path.join(dir, `receipt_${receiptNumber}.pdf`);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Palette
    const brown = "#4b2e24";
    const caramel = "#b67c5a";
    const cream = "#fbf1e5";

    // Optional logo
    const LOGO_PATH = process.env.RECEIPT_LOGO_PATH
      ? path.resolve(process.env.RECEIPT_LOGO_PATH)
      : null;

    if (LOGO_PATH && fs.existsSync(LOGO_PATH)) {
      try {
        doc.image(LOGO_PATH, 50, 40, { width: 80 });
      } catch (e) {
        console.warn("Logo failed to load for receipt:", e.message);
      }
    }

    // Header bar
    doc
      .rect(0, 0, doc.page.width, 90)
      .fill(cream);

    doc
      .fillColor(brown)
      .fontSize(22)
      .text("TADY BAKING CO", LOGO_PATH ? 150 : 50, 40);

    doc
      .fontSize(11)
      .fillColor(caramel)
      .text("Artisanal Cookies & Baked Goods", LOGO_PATH ? 150 : 50, 65);

    doc.moveDown(3);

    // Receipt details
    doc
      .fillColor(brown)
      .fontSize(16)
      .text("Receipt", { align: "right" });

    const dateStr = new Date(order.createdAt || Date.now()).toLocaleString(
      "en-CA",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    doc
      .fontSize(11)
      .fillColor("black")
      .text(`Receipt #: ${receiptNumber}`, { align: "right" })
      .text(`Date: ${dateStr}`, { align: "right" });

    doc.moveDown();

    // Customer info box
    doc
      .moveDown()
      .fontSize(13)
      .fillColor(brown)
      .text("Customer", 50);

    doc
      .fontSize(11)
      .fillColor("black")
      .text(`Name: ${order.customerName}`)
      .text(`Email: ${order.customerEmail}`)
      .text(`Phone: ${order.customerPhone}`);

    if (order.fulfillmentMethod === "delivery") {
      doc.text(`Delivery Address: ${order.deliveryAddress}`);
      if (order.city || order.postalCode) {
        doc.text(
          `City/Postal: ${order.city || ""} ${order.postalCode || ""}`.trim()
        );
      }
    } else {
      doc.text(`Pickup Address: 3 Mackeller Ct, Ajax, Ontario L1T 0G2`);
    }

    doc.moveDown();

    // Items table
    doc
      .fontSize(13)
      .fillColor(brown)
      .text("Order Summary", 50);

    doc.moveDown(0.5);
    doc
      .fontSize(11)
      .fillColor(caramel)
      .text("Qty", 50)
      .text("Item", 90, doc.y - 12)
      .text("Total", 420, doc.y - 12);

    doc.moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).strokeColor(caramel).stroke();

    doc.moveDown(0.5);
    order.items.forEach((item) => {
      doc
        .fillColor("black")
        .text(String(item.qty), 50)
        .text(item.name, 90, doc.y - 12, { width: 300 })
        .text(`$${item.totalPrice.toFixed(2)}`, 420, doc.y - 12, {
          width: 100,
          align: "right",
        });
      doc.moveDown(0.3);
    });

    doc.moveDown(1);

    // Totals
    doc
      .fontSize(11)
      .fillColor("black")
      .text(`Subtotal:`, 350, doc.y, { width: 100, align: "right" })
      .text(`$${order.subtotal.toFixed(2)}`, 460, doc.y - 12, {
        width: 80,
        align: "right",
      });

    doc
      .text(`Tax (13%):`, 350, doc.y + 10, { width: 100, align: "right" })
      .text(`$${order.tax.toFixed(2)}`, 460, doc.y - 12, {
        width: 80,
        align: "right",
      });

    doc
      .text(`Delivery Fee:`, 350, doc.y + 10, { width: 100, align: "right" })
      .text(`$${order.deliveryFee.toFixed(2)}`, 460, doc.y - 12, {
        width: 80,
        align: "right",
      });

    doc.moveDown(1);

    doc
      .fontSize(13)
      .fillColor(brown)
      .text(`TOTAL:`, 350, doc.y, { width: 100, align: "right" })
      .text(`$${order.total.toFixed(2)}`, 460, doc.y - 12, {
        width: 80,
        align: "right",
      });

    // Footer
    doc.moveDown(3);
    doc
      .fontSize(11)
      .fillColor(caramel)
      .text("Thank you for supporting local Bakery!", {
        align: "center",
      });

    doc
      .fontSize(9)
      .fillColor("gray")
      .text("Tady Baking Co — Ajax", { align: "center" });

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", (err) => reject(err));
  });
}

module.exports = generateInvoicePDF;
