import { useState, useEffect } from "react";
import { Photographer, Payslip, SMTPSettings, MailLog, PayslipStatus } from "./types";
import {
  getPhotographers,
  savePhotographers,
  getPayslips,
  savePayslips,
  getSMTPSettings,
  saveSMTPSettings,
  getMailLogs,
  addMailLog,
  saveMailLogs,
  deletePhotographer,
  deletePayslip
} from "./utils/storage";
import { PhotographersPanel } from "./components/PhotographersPanel";
import { CreatePayslipPanel } from "./components/CreatePayslipPanel";
import { PayslipsListPanel } from "./components/PayslipsListPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { Camera, Calendar, DollarSign, Mail, Users, CreditCard, Layers, Sliders, PlayCircle, Image, Aperture, CheckCircle } from "lucide-react";
import { Toaster } from "react-hot-toast";

import { supabase } from "./utils/supabase";

export default function App() {
  // Core Application Database States
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [smtpSettings, setSmtpSettings] = useState<SMTPSettings | null>(null);
  const [mailLogs, setMailLogs] = useState<MailLog[]>([]);

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<"payslips" | "photographers" | "create" | "settings">("payslips");

  // Load and Initialize data safely from Supabase
  useEffect(() => {
    const loadPhotographers = async () => {
      setPhotographers(await getPhotographers());
    };
    const loadPayslips = async () => {
      setPayslips(await getPayslips());
    };
    const loadSMTPSettings = async () => {
      const smtp = await getSMTPSettings();
      if (smtp) {
        setSmtpSettings(smtp);
      } else {
        setSmtpSettings({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          user: "",
          pass: "",
          senderName: "Studio 18 Picture",
          senderEmail: ""
        });
      }
    };
    const loadMailLogs = async () => {
      setMailLogs(await getMailLogs());
    };

    const loadAll = async () => {
      await Promise.all([
        loadPhotographers(),
        loadPayslips(),
        loadSMTPSettings(),
        loadMailLogs()
      ]);
    };
    loadAll();

    // Set up realtime subscriptions for automatic sync
    const channel = supabase
      .channel("db-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "photographers" }, () => {
        loadPhotographers();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "payslips" }, () => {
        loadPayslips();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "smtp_settings" }, () => {
        loadSMTPSettings();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "mail_logs" }, () => {
        loadMailLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update Photographers Directory
  const handleUpdatePhotographers = async (updated: Photographer[]) => {
    // Delete removed photographers
    const deleted = photographers.filter(p => !updated.find(u => u.id === p.id));
    for (const d of deleted) {
      await deletePhotographer(d.id);
    }
    setPhotographers(updated);
    await savePhotographers(updated);
  };

  // Add a brand new Payslip
  const handleAddPayslip = async (newPayslip: Payslip) => {
    const updated = [newPayslip, ...payslips];
    setPayslips(updated);
    await savePayslips(updated);
  };

  // Update Payslips List (e.g., status changes, deletions)
  const handleUpdatePayslips = async (updated: Payslip[]) => {
    // Delete removed payslips
    const deleted = payslips.filter(p => !updated.find(u => u.id === p.id));
    for (const d of deleted) {
      await deletePayslip(d.id);
    }
    setPayslips(updated);
    await savePayslips(updated);
  };

  // Append new automatic Email Log
  const handleAddMailLog = async (logData: Omit<MailLog, "id" | "sentAt">) => {
    await addMailLog(logData);
    setMailLogs(await getMailLogs()); // Reload log state
  };

  // Clear historic logs
  const handleClearLogs = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus seluruh histori log pengiriman email?")) {
      await saveMailLogs([]);
      setMailLogs([]);
    }
  };

  // Save new SMTP configurations
  const handleSaveSMTPSettings = async (newSettings: SMTPSettings) => {
    setSmtpSettings(newSettings);
    await saveSMTPSettings(newSettings);
  };

  // KPI Metrics Calculation helper
  const totalSpend = payslips
    .filter((p) => p.status === PayslipStatus.PAID || p.status === PayslipStatus.EMAILED)
    .reduce((sum, p) => sum + p.netSalary, 0);

  const pendingSpend = payslips
    .filter((p) => p.status === PayslipStatus.DRAFT)
    .reduce((sum, p) => sum + p.netSalary, 0);

  const deliveryRate = payslips.length > 0
    ? Math.round((payslips.filter((p) => p.status === PayslipStatus.EMAILED).length / payslips.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 flex flex-col font-sans">
      <Toaster position="top-right" toastOptions={{ className: 'text-sm font-semibold' }} />
      
      {/* Cinematic Photography Theme Header */}
      <header className="bg-slate-950 text-white border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Studio */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl shadow-md overflow-hidden bg-slate-900 flex items-center justify-center">
                <img src="/logo.png" alt="Studio Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight uppercase block leading-tight">STUDIO 18 PICTURE</span>
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">SnapSlip Payroll Eng</span>
              </div>
            </div>

            {/* Sub banner text */}
            <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-300 font-mono tracking-wider font-semibold">AUTO-MAIL SYSTEM ACTIVE (3000)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dynamic KPI Bar - Business Centred Visual Metrics */}
      <section className="bg-white border-b border-slate-200 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* KPI 1: Active staff directory count */}
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-3.5">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
                <Users size={20} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Database Tim</div>
                <div className="text-xl font-bold text-slate-800 font-mono mt-0.5">{photographers.length} Org</div>
              </div>
            </div>

            {/* KPI 2: Total paid disbursements */}
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-3.5">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <CreditCard size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Gaji Lunas</div>
                <div className="text-lg font-bold text-slate-800 font-mono truncate mt-0.5" title={new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalSpend)}>
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalSpend)}
                </div>
              </div>
            </div>

            {/* KPI 3: Pending drafts sum */}
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-3.5">
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
                <DollarSign size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-slate-400">Menunggu (Draft)</div>
                <div className="text-lg font-bold text-slate-800 font-mono truncate mt-0.5" title={new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(pendingSpend)}>
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(pendingSpend)}
                </div>
              </div>
            </div>

            {/* KPI 4: Email outbound success delivery rate */}
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-3.5">
              <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-lg">
                <Mail size={20} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Rasio Kirim Email</div>
                <div className="text-xl font-bold text-indigo-900 font-mono mt-0.5">{deliveryRate}%</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Workspace Frame container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-grow">
        
        {/* Responsive Tab Bar Navigation links */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab("payslips")}
            className={`py-3 px-5 text-sm font-semibold transition border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "payslips"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            <Layers size={16} />
            <span>Daftar Slip Gaji ({payslips.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab("create")}
            className={`py-3 px-5 text-sm font-semibold transition border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "create"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            <Calendar size={16} />
            <span>Buat Slip Baru</span>
          </button>

          <button
            onClick={() => setActiveTab("photographers")}
            className={`py-3 px-5 text-sm font-semibold transition border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "photographers"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            <Users size={16} />
            <span>Karyawan ({photographers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`py-3 px-5 text-sm font-semibold transition border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "settings"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            <Sliders size={16} />
            <span>Setelan SMTP & Logs</span>
          </button>
        </div>

        {/* Dynamic Panel Mount Router */}
        <div>
          {activeTab === "payslips" && (
            <PayslipsListPanel
              payslips={payslips}
              photographers={photographers}
              smtpSettings={smtpSettings || { host: "smtp.gmail.com", port: 587, secure: false, user: "", pass: "", senderName: "Studio 18 Picture", senderEmail: "" }}
              onUpdatePayslips={handleUpdatePayslips}
              onAddMailLog={handleAddMailLog}
            />
          )}

          {activeTab === "create" && (
            <CreatePayslipPanel
              photographers={photographers}
              onAddPayslip={handleAddPayslip}
              onNavigateToList={() => setActiveTab("payslips")}
            />
          )}

          {activeTab === "photographers" && (
            <PhotographersPanel
              photographers={photographers}
              onUpdate={handleUpdatePhotographers}
            />
          )}

          {activeTab === "settings" && smtpSettings && (
            <SettingsPanel
              settings={smtpSettings}
              mailLogs={mailLogs}
              onSave={handleSaveSMTPSettings}
              onClearLogs={handleClearLogs}
            />
          )}
        </div>

      </main>

    </div>
  );
}
