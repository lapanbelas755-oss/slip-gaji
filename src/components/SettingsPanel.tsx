import React, { useState } from "react";
import { SMTPSettings, MailLog } from "../types";
import { Save, AlertCircle, HelpCircle, Key, RefreshCw, Mail, CheckCircle, Database, ShieldAlert, History, Trash } from "lucide-react";

interface SettingsPanelProps {
  settings: SMTPSettings;
  mailLogs: MailLog[];
  onSave: (settings: SMTPSettings) => void;
  onClearLogs: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  mailLogs,
  onSave,
  onClearLogs,
}) => {
  const [host, setHost] = useState(settings.host);
  const [port, setPort] = useState(settings.port);
  const [user, setUser] = useState(settings.user);
  const [pass, setPass] = useState(settings.pass);
  const [senderName, setSenderName] = useState(settings.senderName);
  const [senderEmail, setSenderEmail] = useState(settings.senderEmail);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      host,
      port: Number(port),
      secure: port === 465,
      user,
      pass,
      senderName,
      senderEmail
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetToDefault = () => {
    if (confirm("Reset konfigurasi SMTP ke setelan default Gmail?")) {
      setHost("smtp.gmail.com");
      setPort(587);
      setUser("studio18.picture@gmail.com");
      setPass("");
      setSenderName("Studio 18 Picture");
      setSenderEmail("studio18.picture@gmail.com");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* SMTP Configuration Form Panel */}
      <div className="lg:col-span-7 space-y-6">
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Key size={16} className="text-blue-500" />
              <span>Konfigurasi Server SMTP</span>
            </h3>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-[11px] text-slate-500 hover:text-slate-800 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Setel Default</span>
            </button>
          </div>

          {savedSuccess && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-600" />
              <span>Konfigurasi SMTP berhasil disimpan!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-500 font-semibold mb-1">NAMA PENGIRIM (MUNCUL DI INBOX)</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Studio 18 Picture"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs p-2.5 outline-none focus:border-blue-500 text-slate-700 font-semibold"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-500 font-semibold mb-1">EMAIL PENGIRIM (SENDER MAIL)</label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="studio18.picture@gmail.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs p-2.5 outline-none focus:border-blue-500 text-slate-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 font-semibold mb-1">HOST SMTP</label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="smtp.gmail.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs p-2.5 outline-none focus:border-blue-500 text-slate-700 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 font-semibold mb-1">PORT SMTP</label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                placeholder="587"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs p-2.5 outline-none focus:border-blue-500 text-slate-700 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 font-semibold mb-1">USER / EMAIL SMTP</label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="studio18.picture@gmail.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs p-2.5 outline-none focus:border-blue-500 text-slate-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 font-bold mb-1 text-blue-600">SMTP PASSWORD (APP PASSWORD)</label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-blue-50/20 border border-blue-250 rounded-lg text-xs p-2.5 outline-none focus:border-blue-500 tracking-widest text-slate-800 font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">Kosongkan sandi ini untuk tetap masuk mode <strong>Simulasi Sandbox</strong>.</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save size={14} />
              <span>Simpan Setelan</span>
            </button>
          </div>
        </form>

        {/* Info Card: Tutorial on App Passwords */}
        <div className="bg-blue-50/50 border border-blue-150 p-6 rounded-2xl space-y-4">
          <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle size={16} />
            <span>Cara Menghubungkan Slip Gaji ke Gmail Anda</span>
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Demi keamanan akun Anda, Google melarang login email as-is langsung menggunakan password akun utama. Anda wajib menggunakan <strong>Google App Password</strong> (Sandi Aplikasi):
          </p>

          <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2.5 pl-1 leading-relaxed">
            <li>
              Aktifkan <strong>Verifikasi 2 Langkah</strong> di Akun Google Anda (<a href="https://myaccount.google.com" target="_blank" className="font-bold underline text-blue-600 hover:text-blue-800">My Google Account</a>).
            </li>
            <li>
              Masuk ke tab <strong>Keamanan (Security)</strong>.
            </li>
            <li>
              Cari kolom pencarian atau menu **Sandi Aplikasi (App Passwords)**.
            </li>
            <li>
              Ketik nama aplikasi Anda (misal: <code>SnapSlip Gaji</code>) lalu klik **Buat (Create)**.
            </li>
            <li>
              Salin kode sandi <strong>16 karakter berlatar kuning</strong> yang ditunjukkan Google.
            </li>
            <li>
              Paste/masukkan kode tersebut di kolom <strong>SMTP Password</strong> di atas. Klik Simpan. Selesai! Slip kini dikirim dari email asli Gmail studio Anda.
            </li>
          </ol>
        </div>
      </div>

      {/* History Mail Logs Panel */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <History size={15} className="text-slate-500" />
              <span>Log Pengiriman Email</span>
            </h3>
            {mailLogs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="text-[10px] text-rose-500 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Trash size={10} />
                Hapus Log
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {mailLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                <Mail size={24} className="mx-auto text-slate-300 mb-1" />
                Belum ada email slip gaji yang dikirimkan.
              </div>
            ) : (
              mailLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-800">{log.recipientName}</div>
                      <div className="text-[10px] text-slate-500">{log.recipientEmail}</div>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                      log.status === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                        : "bg-rose-50 text-rose-800 border border-rose-100"
                    }`}>
                      {log.status === "success" ? "Sukses" : "Gagal"}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 bg-white border border-slate-100 p-2 rounded">
                    <div><strong>Subjek:</strong> {log.subject}</div>
                    <div><strong>Waktu:</strong> {new Date(log.sentAt).toLocaleString("id-ID")}</div>
                    {log.error && (
                      <div className="text-rose-600 font-semibold mt-1 bg-rose-50/50 p-1.5 rounded border border-rose-100">
                        Error: {log.error}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
