import toast from "react-hot-toast";
import React, { useState } from "react";
import { Payslip, PayslipStatus, SMTPSettings, Photographer } from "../types";
import { PayslipDocument } from "./PayslipDocument";
import { Camera, Calendar, Download, Mail, Eye, Search, Filter, CheckCircle, Clock, AlertCircle, X, CheckSquare, ListFilter, Send, History } from "lucide-react";
import { toCanvas } from "html-to-image";
import { jsPDF } from "jspdf";

interface PayslipsListPanelProps {
  payslips: Payslip[];
  photographers: Photographer[];
  smtpSettings: SMTPSettings;
  onUpdatePayslips: (payslips: Payslip[]) => void;
  onAddMailLog: (log: { payslipId: string; recipientEmail: string; recipientName: string; subject: string; status: "success" | "failed"; error?: string }) => void;
}

export const PayslipsListPanel: React.FC<PayslipsListPanelProps> = ({
  payslips,
  photographers,
  smtpSettings,
  onUpdatePayslips,
  onAddMailLog,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  
  // Tracking sending email state
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<{ id: string; success: boolean; message: string; mode?: string } | null>(null);

  // Filter logic + Inject latest photographer data dynamically
  const filteredPayslips = payslips.map((p) => {
    // Find current active photographer details
    const currentPhotographer = photographers.find((photo) => photo.id === p.photographerId);
    if (currentPhotographer) {
      // Overwrite bank info dynamically so the print/email always uses the newest bank info
      return {
        ...p,
        bankName: currentPhotographer.bankName,
        bankAccount: currentPhotographer.bankAccount,
        bankHolder: currentPhotographer.bankHolder,
      };
    }
    return p;
  }).filter((p) => {
    const matchesSearch =
      p.photographerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.photographerRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.month.includes(searchTerm);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "DRAFT" && p.status === PayslipStatus.DRAFT) ||
      (statusFilter === "PAID" && p.status === PayslipStatus.PAID) ||
      (statusFilter === "EMAILED" && p.status === PayslipStatus.EMAILED);

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 1. Secure PDF Generation (Client Side)
  const generatePDFBlob = async (payslip: Payslip): Promise<{ pdf: jsPDF; base64: string }> => {
    // Create a temporary hidden container to render target element completely
    // if not already mounted on DOM
    const divId = `payslip-print-temp-${payslip.id}`;
    let element = document.getElementById(divId);
    let createdLocal = false;

    if (!element) {
      createdLocal = true;
      element = document.createElement("div");
      element.id = divId;
      element.className = "absolute left-[-9999px] top-[-9999px] bg-white";
      document.body.appendChild(element);
      
      // Render components statically via custom ReactDOM path or inner HTML
      // Better alternative: Render temporary React Node natively
    }

    try {
      // Find visible container id or tell user to mount
      const targetId = `payslip-view-render-${payslip.id}`;
      let targetEl = document.getElementById(targetId);
      
      // If we don't have it visible on screen, we use the active selected one or create a fallback
      if (!targetEl) {
        // Fallback to active modal preview or hidden capture element
        targetEl = document.getElementById(`payslip-view-render-active`);
      }

      if (!targetEl) {
        throw new Error("Gagal menemukan elemen preview. Silakan buka detil preview slip terlebih dahulu sebelum melakukan unduh/kirim.");
      }

      // Expand scrollable area temporarily for full PDF capture
      const tableContainer = document.getElementById(`payslip-table-container-${payslip.id}`);
      let originalMaxHeight = '';
      let originalOverflowY = '';
      if (tableContainer) {
        originalMaxHeight = tableContainer.style.maxHeight;
        originalOverflowY = tableContainer.style.overflowY;
        tableContainer.style.maxHeight = 'none';
        tableContainer.style.overflowY = 'visible';
      }

      // Enforce high-quality render using html-to-image to support modern CSS like oklch
      const canvas = await toCanvas(targetEl, {
        pixelRatio: 2, // Retains high resolution
        backgroundColor: "#ffffff"
      });

      // Restore scrollable state
      if (tableContainer) {
        tableContainer.style.maxHeight = originalMaxHeight;
        tableContainer.style.overflowY = originalOverflowY;
      }

      // Gunakan JPEG dengan kompresi untuk menghindari error ukuran data (payload) terlalu besar
      const imgData = canvas.toDataURL("image/jpeg", 0.8);
      const imgWidth = 210; // Base width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Setup PDF dengan format dinamis mengikuti ukuran asli render agar tidak terpotong
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: [imgWidth, imgHeight]
      });

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      
      // Convert to Base64 String (for sending over JSON API)
      const base64 = pdf.output("datauristring");
      return { pdf, base64 };
    } finally {
      if (createdLocal && element) {
        document.body.removeChild(element);
      }
    }
  };

  // Trigger: Download PDF
  const handleDownloadPDF = async (payslip: Payslip) => {
    toast.loading("Memulai proses pembuatan PDF secara aman. Mohon tunggu beberapa detik...", { duration: 3000 });
    
    // Temporarily mount/set as active preview if none selected to ensure rendering exists
    const originalSelected = selectedPayslip;
    if (!selectedPayslip || selectedPayslip.id !== payslip.id) {
      setSelectedPayslip(payslip);
      // Wait for React to render DOM
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    try {
      const { pdf } = await generatePDFBlob(payslip);
      pdf.save(`Slip_Gaji_${payslip.photographerName.replace(/\s+/g, "_")}_${payslip.paymentDate}.pdf`);
    } catch (err) {
      toast.error(`Gagal membuat PDF: ${(err as Error).message}`);
    } finally {
      // Revert select state if needed
      if (!originalSelected) {
        setSelectedPayslip(null);
      }
    }
  };

  // Trigger: Send Automatic Email
  const handleSendEmail = async (payslip: Payslip) => {
    setSendingId(payslip.id);
    setSendResult(null);

    // Ensure active view is mounted for rendering engine
    const originalSelected = selectedPayslip;
    if (!selectedPayslip || selectedPayslip.id !== payslip.id) {
      setSelectedPayslip(payslip);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    try {
      // 1. Generate core PDF Base64 string on the client safely
      const { base64 } = await generatePDFBlob(payslip);

      // 2. Transmit to server side mailer
      const response = await fetch("/api/send-payslip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          recipientEmail: payslip.photographerEmail,
          recipientName: payslip.photographerName,
          month: payslip.month,
          paymentDate: payslip.paymentDate,
          netSalary: payslip.netSalary,
          pdfBase64: base64,
          smtp: smtpSettings // Pass custom settings
        })
      });

      const resJson = await response.json();

      if (response.ok && resJson.success) {
        // Success
        setSendResult({
          id: payslip.id,
          success: true,
          mode: resJson.mode,
          message: resJson.message
        });

        // 1. Update payslip status to EMAILED inside our storage state
        const updated = payslips.map((p) => {
          if (p.id === payslip.id) {
            return {
              ...p,
              status: PayslipStatus.EMAILED,
              emailSentAt: new Date().toISOString()
            };
          }
          return p;
        });
        onUpdatePayslips(updated);

        // 2. Add mail delivery logging
        onAddMailLog({
          payslipId: payslip.id,
          recipientEmail: payslip.photographerEmail,
          recipientName: payslip.photographerName,
          subject: `[Slip Gaji] Studio 18 Picture - Periode ${payslip.month}`,
          status: "success",
        });

      } else {
        // Fail
        setSendResult({
          id: payslip.id,
          success: false,
          message: resJson.message || "Gagal menghubungi modul mailer."
        });

        onAddMailLog({
          payslipId: payslip.id,
          recipientEmail: payslip.photographerEmail,
          recipientName: payslip.photographerName,
          subject: `[Slip Gaji] Studio 18 Picture - Periode ${payslip.month}`,
          status: "failed",
          error: resJson.message || "Gagal"
        });
      }

    } catch (err) {
      console.error(err);
      setSendResult({
        id: payslip.id,
        success: false,
        message: `Terjadi kendala jaringan: ${(err as Error).message}`
      });

      onAddMailLog({
        payslipId: payslip.id,
        recipientEmail: payslip.photographerEmail,
        recipientName: payslip.photographerName,
        subject: `[Slip Gaji] Studio 18 Picture - Periode ${payslip.month}`,
        status: "failed",
        error: (err as Error).message
      });
    } finally {
      setSendingId(null);
      if (!originalSelected) {
        setSelectedPayslip(null);
      }
    }
  };

  // Toggle status to Paid
  const handleMarkAsPaid = (payslip: Payslip) => {
    const updated = payslips.map((p) => {
      if (p.id === payslip.id) {
        return {
          ...p,
          status: PayslipStatus.PAID
        };
      }
      return p;
    });
    onUpdatePayslips(updated);
    toast.success(`Status pembayaran slip untuk ${payslip.photographerName} diubah ke PAID!`);
  };

  // Delete slip
  const handleDeleteSlip = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus slip gaji ${name}?`)) {
      onUpdatePayslips(payslips.filter((p) => p.id !== id));
      if (selectedPayslip?.id === id) {
        setSelectedPayslip(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Filters and Search toolbar */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari fotografer, peran, bulan..."
            className="w-full bg-slate-50 border border-slate-300 text-xs py-2 pl-9 pr-4 rounded-lg text-slate-700 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 whitespace-nowrap mr-2">
            <ListFilter size={14} />
            Filter Status:
          </span>
          {["ALL", "DRAFT", "PAID", "EMAILED"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold cursor-pointer transition ${
                statusFilter === filter
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main split grid when viewing a slip document */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - List of payrolls */}
        <div className={`space-y-4 ${selectedPayslip ? "lg:col-span-5" : "lg:col-span-12"}`}>
          {filteredPayslips.length === 0 ? (
            <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl">
              <Clock size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-600 text-sm">Tidak ditemukan Slip Gaji</p>
              <p className="text-xs text-slate-400 mt-1">Belum ada slip gaji yang cocok dengan filter atau kriteria pencarian.</p>
            </div>
          ) : (
            filteredPayslips.map((p) => {
              const isSelected = selectedPayslip?.id === p.id;
              const isSending = sendingId === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPayslip(p)}
                  className={`bg-white border p-5 rounded-2xl shadow-sm cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 ${
                    isSelected
                      ? "border-l-blue-600 border-blue-200 ring-2 ring-blue-50 bg-blue-50/10"
                      : p.status === PayslipStatus.EMAILED
                      ? "border-l-indigo-500 border-slate-200"
                      : p.status === PayslipStatus.PAID
                      ? "border-l-emerald-500 border-slate-200"
                      : "border-l-amber-500 border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{p.photographerName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                        {p.photographerRole}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Bulan: <strong>{p.month}</strong>
                      </span>
                      <span className="border-l border-slate-200 pl-3">
                        Transfer Target: <strong>{p.paymentDate}</strong>
                      </span>
                    </div>

                    <div className="text-xs pt-1">
                      Gaji Bersih: <span className="font-mono font-bold text-slate-900">{formatCurrency(p.netSalary)}</span>
                    </div>

                    {/* Meta action stats */}
                    {p.emailSentAt && (
                      <div className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1 pt-1">
                        <CheckSquare size={10} />
                        Auto-Emailed on {new Date(p.emailSentAt).toLocaleString("id-ID")}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:self-center" onClick={(e) => e.stopPropagation()}>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        p.status === PayslipStatus.EMAILED
                          ? "bg-indigo-50 text-indigo-700 font-extrabold"
                          : p.status === PayslipStatus.PAID
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {p.status}
                    </span>

                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => setSelectedPayslip(p)}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition"
                        title="Buka Preview Dokumen"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(p)}
                        className="p-1.5 hover:bg-slate-100 text-emerald-600 hover:text-emerald-700 rounded-lg transition"
                        title="Unduh PDF Resmi"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleSendEmail(p)}
                        disabled={isSending}
                        className={`p-1.5 rounded-lg transition ${
                          isSending
                            ? "bg-orange-50 text-orange-600 animate-pulse"
                            : p.status === PayslipStatus.EMAILED
                            ? "hover:bg-indigo-50 text-indigo-600"
                            : "hover:bg-blue-50 text-blue-600"
                        }`}
                        title="Kirim Email Otomatis"
                      >
                        <Mail size={14} className={isSending ? "animate-spin" : ""} />
                      </button>
                      <button
                        onClick={() => handleDeleteSlip(p.id, p.photographerName)}
                        className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg transition"
                        title="Hapus Slip"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column - Premium Document View Preview */}
        {selectedPayslip && (
          <div className="lg:col-span-7 space-y-4">
            
            {/* Action Bar inside View */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Penerbitan Slip:</span>
                <strong className="text-xs text-slate-200">{selectedPayslip.photographerName}</strong>
              </div>

              <div className="flex items-center gap-2">
                {selectedPayslip.status !== PayslipStatus.PAID && selectedPayslip.status !== PayslipStatus.EMAILED && (
                  <button
                    onClick={() => handleMarkAsPaid(selectedPayslip)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    <CheckCircle size={13} />
                    <span>Lunas (Paid)</span>
                  </button>
                )}
                <button
                  onClick={() => handleDownloadPDF(selectedPayslip)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Download size={13} />
                  <span>Unduh PDF</span>
                </button>
                <button
                  onClick={() => handleSendEmail(selectedPayslip)}
                  disabled={sendingId === selectedPayslip.id}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Send size={13} />
                  <span>{sendingId === selectedPayslip.id ? "Mengirim..." : "Kirim Email"}</span>
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Live Mailer Operation Status Feedback Alerts */}
            {sendResult && sendResult.id === selectedPayslip.id && (
              <div className={`p-4 rounded-xl text-xs flex items-start gap-2.5 shadow-sm border ${
                sendResult.success
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 text-emerald-950"
                  : "bg-rose-50 text-rose-800 border-rose-200 text-rose-950"
              }`}>
                {sendResult.success ? (
                  <CheckCircle size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-rose-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="space-y-1">
                  <div className="font-extrabold text-[13px]">
                    {sendResult.success ? "Pengiriman Email Berhasil!" : "Gagal Mengirimkan Email"}
                  </div>
                  <p className="leading-relaxed font-medium">{sendResult.message}</p>
                  
                  {sendResult.mode === "simulated" && (
                    <div className="bg-slate-900 text-slate-300 p-3 rounded-lg text-[10px] mt-2 font-mono max-h-48 overflow-y-auto leading-relaxed border border-slate-800">
                      <strong>INFO SANDBOX SIMULASI:</strong><br />
                      Sistem kami merekam visual email & data attachment PDF. Untuk mengirim ke alamat klien Google asli secara live, buka bagian <strong>Pengaturan SMTP</strong> dan isi SMTP password Anda.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rendered Document Wrapper Container which will be cloned/snapshotted by html2canvas */}
            <div className="bg-white p-2 rounded-2xl border border-slate-350 shadow-md">
              <PayslipDocument
                payslip={selectedPayslip}
                containerId={`payslip-view-render-${selectedPayslip.id}`}
              />
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
