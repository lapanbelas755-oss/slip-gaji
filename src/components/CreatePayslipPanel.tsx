import toast from "react-hot-toast";
import React, { useState, useEffect } from "react";
import { Photographer, Role, Payslip, PayslipStatus, SessionWorked, AllowanceItem, DeductionItem, EVENT_CATEGORIES } from "../types";
import { Camera, Calendar, Plus, Trash2, Landmark, DollarSign, Wallet, FileText, CheckCircle, Sparkles } from "lucide-react";

interface CreatePayslipPanelProps {
  photographers: Photographer[];
  onAddPayslip: (payslip: Payslip) => void;
  onNavigateToList: () => void;
}

export const CreatePayslipPanel: React.FC<CreatePayslipPanelProps> = ({
  photographers,
  onAddPayslip,
  onNavigateToList,
}) => {
  if (photographers.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center text-amber-800">
        <Camera className="mx-auto mb-3 text-amber-500" size={36} />
        <h3 className="font-bold text-lg">Format Pembuatan Belum Tersedia</h3>
        <p className="text-sm text-amber-700 mt-1 max-w-sm mx-auto">
          Silakan tambahkan profil fotografer terlebih dahulu di menu <strong>Daftar Karyawan</strong> sebelum membuat slip gaji baru.
        </p>
      </div>
    );
  }

  // Selected Photographer (Defaults to first active/available)
  const [selectedPhotographerId, setSelectedPhotographerId] = useState(photographers[0].id);
  const currentPhotographer = photographers.find((p) => p.id === selectedPhotographerId) || photographers[0];

  // Payslip Metadata
  const [month, setMonth] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`;
  });
  const [paymentDate, setPaymentDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [periodStart, setPeriodStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14); // Default 2 weeks ago
    return d.toISOString().split("T")[0];
  });
  const [periodEnd, setPeriodEnd] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  const [baseSalary, setBaseSalary] = useState(0);
  const [note, setNote] = useState("");

  // Lists State
  const [sessions, setSessions] = useState<SessionWorked[]>([]);
  const [allowances, setAllowances] = useState<AllowanceItem[]>([]);
  const [deductions, setDeductions] = useState<DeductionItem[]>([]);

  // Session Input Temps
  const [sessionDate, setSessionDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [clientName, setClientName] = useState("");
  const [eventType, setEventType] = useState("Prewed Backup");
  const [sessionFee, setSessionFee] = useState(200000);

  // Auto-fill fee when selected photographer or eventType changes based on custom rates config
  useEffect(() => {
    if (currentPhotographer) {
      if (currentPhotographer.rates && currentPhotographer.rates[eventType] !== undefined) {
        setSessionFee(currentPhotographer.rates[eventType]);
      } else {
        const fallbackRates: Record<string, number> = {
          "Prewed Backup": 200000,
          "Prewed Solo": 400000,
          "Akad Only": 200000,
          "Akad Postwed": 400000,
          "Lamaran": 400000,
          "Tasyakuran": 350000,
          "Resepsi Backup": 400000,
          "Resepsi Solo Fighter": 700000,
          "Akad Resepsi 1 Hari": 600000,
        };
        setSessionFee(fallbackRates[eventType] || 200000);
      }
    }
  }, [selectedPhotographerId, eventType, currentPhotographer]);

  // Allowance Input Temps
  const [allowanceName, setAllowanceName] = useState("");
  const [allowanceAmount, setAllowanceAmount] = useState(100000);

  // Deduction Input Temps
  const [deductionName, setDeductionName] = useState("");
  const [deductionAmount, setDeductionAmount] = useState(50000);

  // Action: Add Session
  const handleAddSession = () => {
    if (!clientName) {
      toast.error("Nama Klien/Event wajib diisi!");
      return;
    }

    const targetDate = sessionDate || new Date().toISOString().split("T")[0];

    // Display string formatted
    let dateFormatted = targetDate;
    const parts = targetDate.split("-");
    if (parts.length === 3) {
      dateFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`; // dd/mm/yyyy
    }

    const item: SessionWorked = {
      id: "s_" + Math.random().toString(36).substring(2, 9),
      date: dateFormatted,
      dates: [targetDate],
      clientName,
      eventType,
      role: currentPhotographer.role,
      fee: Number(sessionFee) || 0,
      feeMode: "TOTAL_PROJECT",
    };

    setSessions([...sessions, item]);
    setClientName("");
    // Keep date filled with selected date for convenience
  };

  // Action: Remove Session
  const handleRemoveSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  // Action: Add Allowance
  const handleAddAllowance = () => {
    if (!allowanceName) {
      toast.error("Nama / Jenis tunjangan wajib diisi!");
      return;
    }
    const item: AllowanceItem = {
      id: "a_" + Math.random().toString(36).substring(2, 9),
      name: allowanceName,
      amount: Number(allowanceAmount) || 0
    };
    setAllowances([...allowances, item]);
    setAllowanceName("");
  };

  // Action: Remove Allowance
  const handleRemoveAllowance = (id: string) => {
    setAllowances(allowances.filter((a) => a.id !== id));
  };

  // Action: Add Deduction
  const handleAddDeduction = () => {
    if (!deductionName) {
      toast.error("Keterangan potongan wajib diisi!");
      return;
    }
    const item: DeductionItem = {
      id: "d_" + Math.random().toString(36).substring(2, 9),
      name: deductionName,
      amount: Number(deductionAmount) || 0
    };
    setDeductions([...deductions, item]);
    setDeductionName("");
  };

  // Action: Remove Deduction
  const handleRemoveDeduction = (id: string) => {
    setDeductions(deductions.filter((d) => d.id !== id));
  };

  // Calculations
  const totalSessionsEarnings = sessions.reduce((acc, s) => acc + s.fee, 0);
  const totalAllowances = allowances.reduce((acc, a) => acc + a.amount, 0);
  const totalDeductions = deductions.reduce((acc, d) => acc + d.amount, 0);
  const netSalary = totalSessionsEarnings + totalAllowances - totalDeductions;

  // Final Save
  const handleRegisterPayslip = (e: React.FormEvent) => {
    e.preventDefault();

    if (netSalary < 0) {
      toast.error("Gaji bersih tidak boleh minus! Silakan periksa rincian potongan.");
      return;
    }

    const newPayslip: Payslip = {
      id: "sl_" + Math.random().toString(36).substring(2, 9),
      photographerId: currentPhotographer.id,
      photographerName: currentPhotographer.name,
      photographerEmail: currentPhotographer.email,
      photographerRole: currentPhotographer.role,
      month,
      paymentDate,
      periodStart,
      periodEnd,
      baseSalary: 0,
      sessions,
      allowances,
      deductions,
      totalSessionsEarnings,
      totalAllowances,
      totalDeductions,
      netSalary,
      status: PayslipStatus.DRAFT,
      note,
      createdAt: new Date().toISOString(),
      bankName: currentPhotographer.bankName,
      bankAccount: currentPhotographer.bankAccount,
      bankHolder: currentPhotographer.bankHolder,
    };

    onAddPayslip(newPayslip);
    toast.success(`Berhasil membuat slip gaji periode ${month} untuk ${currentPhotographer.name}!`);
    onNavigateToList();
  };

  return (
    <div className="space-y-6">
      {/* Description Title Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-850">
        <h2 className="text-xl font-bold tracking-tight">Buat Slip Gaji Baru</h2>
        <p className="text-sm text-slate-400">
          Kalkulasikan total retainer, komisi per event, tunjangan transport bensin, plus potongan kasbon. Sistem mendukung pembuatan multi-tanggal transfer di bulan yang sama.
        </p>
      </div>

      <form onSubmit={handleRegisterPayslip} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Form Configurations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Penerima & Jadwal */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Calendar size={16} className="text-blue-500" />
              <span>Penerima & Periode Gaji</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-500 font-semibold mb-1">PILIH FOTOGRAFER / VIDEOGRAFER</label>
                <select
                  value={selectedPhotographerId}
                  onChange={(e) => setSelectedPhotographerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs p-2.5 outline-none focus:border-blue-500 text-slate-700 font-medium"
                >
                  {photographers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-1">EMAIL PENERIMA</label>
                <input
                  type="email"
                  value={currentPhotographer?.email || ""}
                  readOnly
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg text-xs p-2.5 text-slate-500 cursor-not-allowed font-medium select-all"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-1">BULAN PEMBAYARAN</label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs p-2.5 outline-none focus:border-blue-500 text-slate-700 font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Card 2: Honor Per Event / Sesi */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Camera size={16} className="text-blue-500" />
              <span>Gaji Per Project</span>
            </h3>

            {/* Inline Sesi Adder Form */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1.5 uppercase">TANGGAL</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1.5 uppercase">KLIEN / EVENT</label>
                  <input
                    type="text"
                    placeholder="Reza & Ayu Wedding"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1.5 uppercase">JOB</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    {EVENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1.5 uppercase">GAJI (Rp)</label>
                  <input
                    type="number"
                    value={sessionFee || ""}
                    onChange={(e) => setSessionFee(Number(e.target.value))}
                    placeholder="500000"
                    className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-700 font-mono focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200/50">
                <button
                  type="button"
                  onClick={handleAddSession}
                  className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus size={14} />
                  <span>Tambahkan Sesi</span>
                </button>
              </div>
            </div>

            {/* List of Sessions Added */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wide block">Terdaftar ({sessions.length})</span>
              {sessions.length === 0 ? (
                <div className="p-4 border border-dashed border-slate-150 rounded-lg text-center text-slate-400 text-xs italic">
                  Belum ada sesi pemotretan yang diinput.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                  {sessions.map((s) => (
                    <div key={s.id} className="flex justify-between items-center p-3 hover:bg-slate-50/50 bg-white">
                      <div>
                        <div className="font-bold text-slate-800">{s.clientName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {s.eventType} &bull; Sesi pada {s.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900">
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(s.fee)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSession(s.id)}
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-md transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Tunjangan & Potongan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* allowances */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-50 pb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Tunjangan (Bensin, Makan)</span>
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Uang Bensin Canggu"
                  value={allowanceName}
                  onChange={(e) => setAllowanceName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs p-2 text-slate-700 outline-none focus:border-blue-500 text-slate-700"
                />
                <input
                  type="number"
                  placeholder="100000"
                  value={allowanceAmount || ""}
                  onChange={(e) => setAllowanceAmount(Number(e.target.value))}
                  className="w-28 bg-slate-50 border border-slate-300 rounded-lg text-xs p-2 text-slate-700 font-mono outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddAllowance}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-lg cursor-pointer transition flex items-center justify-center font-bold"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {allowances.map((a) => (
                  <div key={a.id} className="flex justify-between items-center p-2.5 bg-emerald-50/20 border border-emerald-100 rounded-lg">
                    <span className="text-slate-600 font-medium">{a.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-600 font-mono">
                        +{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(a.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllowance(a.id)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* deductions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2 border-b border-rose-50 pb-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Potongan (Kasbon, Kerusakan)</span>
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kasbon Awal Bulan"
                  value={deductionName}
                  onChange={(e) => setDeductionName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs p-2 text-slate-700 outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="50000"
                  value={deductionAmount || ""}
                  onChange={(e) => setDeductionAmount(Number(e.target.value))}
                  className="w-28 bg-slate-50 border border-slate-300 rounded-lg text-xs p-2 text-slate-700 font-mono outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddDeduction}
                  className="bg-rose-600 hover:bg-rose-700 text-white p-2.5 rounded-lg cursor-pointer transition flex items-center justify-center font-bold"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {deductions.map((d) => (
                  <div key={d.id} className="flex justify-between items-center p-2.5 bg-rose-50/25 border border-rose-100 rounded-lg">
                    <span className="text-slate-600 font-medium">{d.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-600 font-mono">
                        -{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(d.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeduction(d.id)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Notes Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <label className="block text-xs text-slate-500 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} className="text-slate-400" />
              <span>Catatan / Keterangan Tambahan Slip</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Berikan keterangan detail, misalnya rincian peminjaman alat, revisi editing bonus..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl text-xs p-3 min-h-24 text-slate-700 outline-none focus:border-blue-500"
            />
          </div>

        </div>

        {/* Right Sticky Column - Total Preview Box */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-6 sticky top-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Kalkulator Gaji</div>
              <h3 className="font-bold text-lg text-slate-200">Ringkasan Selesai</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between text-slate-400 col-span-2">
                <span>Total Gaji Project ({sessions.length}x):</span>
                <span className="font-mono text-slate-200">+{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalSessionsEarnings)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Tunjangan:</span>
                <span className="font-mono text-emerald-400">+{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalAllowances)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Potongan:</span>
                <span className="font-mono text-rose-400">-{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalDeductions)}</span>
              </div>
              
              <div className="border-t border-dashed border-slate-800 pt-4 flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Bersih (Net Pay)</span>
                <span className="text-2xl font-mono font-black text-amber-400 mt-1">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(netSalary)}
                </span>
              </div>
            </div>

            {/* Target Account Mini Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase">
                <Landmark size={12} />
                <span>Rekening Tujuan Transfer</span>
              </div>
              <div>
                <div className="font-bold text-slate-200">{currentPhotographer.bankName}</div>
                <div className="font-mono text-slate-300 tracking-wide mt-0.5">{currentPhotographer.bankAccount}</div>
                <div className="text-[10px] italic mt-1 font-sans">A.N. {currentPhotographer.bankHolder}</div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold text-sm tracking-wide text-white transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <CheckCircle size={18} />
              <span>Simpan Slip (Draft)</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
