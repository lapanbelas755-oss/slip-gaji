import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Increase request size limits for handling base64 PDF attachments
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

// API Endpoint: Send Payslip Email
app.post("/api/send-payslip", async (req, res) => {
  const {
    recipientEmail,
    recipientName,
    month,
    paymentDate,
    netSalary,
    pdfBase64,
    smtp
  } = req.body;

  if (!recipientEmail || !recipientName || !pdfBase64) {
    return res.status(400).json({
      success: false,
      message: "Data tidak lengkap. Diperlukan Email, Nama Karyawan, dan File PDF."
    });
  }

  // Format currency for Indonesian Rupiah
  const formattedSalary = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(netSalary || 0);

  // Check if real SMTP should be used (if user filled the password)
  const isRealSMTP = smtp && smtp.pass && smtp.pass.trim() !== "";

  // Base64 PDF processing
  const pdfBuffer = Buffer.from(pdfBase64.split(",")[1] || pdfBase64, "base64");
  const attachmentName = `Slip_Gaji_${recipientName.replace(/\s+/g, "_")}_${paymentDate}.pdf`;

  // Construct styled HTML Body
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: #0f172a; padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.025em; }
        .header p { margin: 4px 0 0 0; color: #94a3b8; font-size: 14px; }
        .content { padding: 32px 24px; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #0f172a; }
        .highlight-box { background: #f1f5f9; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 20px; margin: 24px 0; }
        .salary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .salary-row:last-child { margin-bottom: 0; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-weight: bold; font-size: 16px; color: #0284c7; }
        .label { color: #64748b; }
        .value { text-align: right; color: #0f172a; }
        .footer { padding: 24px; text-align: center; background: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin-top: 16px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Studio 18 Picture</h1>
          <p>Layanan Foto & Video Profesional</p>
        </div>
        <div class="content">
          <div class="greeting">Halo, ${recipientName}</div>
          <p>Terima kasih atas dedikasi dan kontribusi luar biasa Anda di balik kamera untuk menyukseskan berbagai proyek pemotretan dan videografi kita.</p>
          <p>Berikut kami sampaikan rincian slip gaji digital Anda. Dokumen resmi Slip Gaji format PDF yang aman telah dilampirkan dalam email ini.</p>
          
          <div class="highlight-box">
            <div style="margin-bottom: 12px; font-weight:600; color:#475569; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Ringkasan Pembayaran</div>
            <div class="salary-row">
              <span class="label">Bulan Pembayaran:</span>
              <span class="value" style="font-weight: 600;">${month}</span>
            </div>
            <div class="salary-row">
              <span class="label">Tanggal Transfer:</span>
              <span class="value" style="font-weight: 600;">${paymentDate}</span>
            </div>
            <div class="salary-row">
              <span class="label">Gaji Bersih (Net Pay):</span>
              <span class="value" style="font-weight: 700; color: #0f172a;">${formattedSalary}</span>
            </div>
          </div>

          <p>Silakan unduh lampiran PDF untuk melihat rincian honor sesi pemotretan, uang harian, serta potongan (jika ada).</p>
          <p>Jika ada pertanyaan atau ketidaksesuaian mengenai perhitungan slip gaji ini, silakan hubungi tim Finance Studio 18 segera.</p>
          
          <p style="margin-top:24px;">Salam hormat,<br><strong>Finance Studio 18 Picture</strong></p>
        </div>
        <div class="footer">
          &copy; 2026 Studio 18 Picture. All rights reserved.<br>
          Email dikirim secara otomatis oleh SnapSlip System.
        </div>
      </div>
    </body>
    </html>
  `;

  if (isRealSMTP) {
    try {
      // Create transport with configured SMTP Settings
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: Number(smtp.port),
        secure: smtp.port === 465 || smtp.secure, // uses SSL if 465
        auth: {
          user: smtp.user,
          pass: smtp.pass
        },
        tls: {
          rejectUnauthorized: false // bypass certificates issue if any
        }
      });

      // Send mail
      await transporter.sendMail({
        from: `"${smtp.senderName}" <${smtp.senderEmail}>`,
        to: recipientEmail,
        subject: `[Slip Gaji] Studio 18 Picture - Periode ${month} - ${recipientName}`,
        html: emailHtml,
        attachments: [
          {
            filename: attachmentName,
            content: pdfBuffer,
            contentType: "application/pdf"
          }
        ]
      });

      return res.json({
        success: true,
        mode: "live",
        message: `Slip gaji berhasil dikirim ke email ${recipientEmail} menggunakan SMTP Anda.`
      });
    } catch (err) {
      console.error("SMTP error: ", err);
      return res.status(500).json({
        success: false,
        message: `Gagal mengirim email secara nyata via SMTP: ${(err as Error).message}`
      });
    }
  } else {
    // Simulated Mode: SMTP Settings not fully complete (missing password)
    // We log it and simulate a perfectly successful delivery
    setTimeout(() => {
      console.log(`[SIMULATED EMAIL]
To: ${recipientEmail}
Subject: [Slip Gaji] Studio 18 Picture - Periode ${month} - ${recipientName}
Attachment: ${attachmentName} (${pdfBuffer.length} bytes)
`);
    }, 100);

    return res.json({
      success: true,
      mode: "simulated",
      message: `[Simulasi Sukses] Slip gaji disimulasikan terkirim ke email ${recipientEmail}. Silakan lengkapi SMTP Password di menu Pengaturan untuk mengirim email ril.`,
      htmlPreview: emailHtml
    });
  }
});

// Configure Vite or Serve Static Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server if we are not running on Vercel Serverless
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
  });
}

// Export the app for Vercel Serverless Function
export default app;
