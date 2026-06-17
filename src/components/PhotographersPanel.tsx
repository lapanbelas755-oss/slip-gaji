import toast from "react-hot-toast";
import React, { useState } from "react";
import { Photographer, Role, EVENT_CATEGORIES } from "../types";
import { Plus, Edit2, Trash2, Camera, Mail, Phone, Landmark, User, DollarSign, Search, PlusCircle, Check, X, ShieldAlert, BadgeInfo, Coins } from "lucide-react";

interface PhotographersPanelProps {
  photographers: Photographer[];
  onUpdate: (photographers: Photographer[]) => void;
}

export const PhotographersPanel: React.FC<PhotographersPanelProps> = ({ photographers, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Tab-state: Profiles vs Rates Matrix
  const [activeSubTab, setActiveSubTab] = useState<"profiles" | "rates">("profiles");

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>(Role.LEAD_PHOTOGRAPHER);
  const [bankName, setBankName] = useState("BCA");
  const [bankAccount, setBankAccount] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [baseSalary, setBaseSalary] = useState(2000000);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setRole(Role.LEAD_PHOTOGRAPHER);
    setBankName("BCA");
    setBankAccount("");
    setBankHolder("");
    setBaseSalary(2000000);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Nama dan Email wajib diisi!");
      return;
    }

    const newPhotographer: Photographer = {
      id: "p_" + Math.random().toString(36).substring(2, 9),
      name,
      email,
      phone,
      role,
      bankName,
      bankAccount,
      bankHolder: bankHolder || name, // Default holder is the name itself
      baseSalary: Number(baseSalary) || 0,
      isActive: true,
      rates: {
        "Prewed Backup": 200000,
        "Prewed Solo": 400000,
        "Akad Only": 200000,
        "Akad Postwed": 400050,
        "Lamaran": 400000,
        "Tasyakuran": 350000,
        "Resepsi Backup": 400000,
        "Resepsi Solo Fighter": 700000,
        "Akad Resepsi 1 Hari": 600000,
      }
    };

    onUpdate([...photographers, newPhotographer]);
    resetForm();
  };

  const handleStartEdit = (p: Photographer) => {
    setEditingId(p.id);
    setName(p.name);
    setEmail(p.email);
    setPhone(p.phone);
    setRole(p.role);
    setBankName(p.bankName);
    setBankAccount(p.bankAccount);
    setBankHolder(p.bankHolder);
    setBaseSalary(p.baseSalary);
    setIsAdding(true); // Open form
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !editingId) return;

    const updated = photographers.map((p) => {
      if (p.id === editingId) {
        return {
          ...p,
          name,
          email,
          phone,
          role,
          bankName,
          bankAccount,
          bankHolder: bankHolder || name,
          baseSalary: Number(baseSalary) || 0
        };
      }
      return p;
    });

    onUpdate(updated);
    resetForm();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data fotografer ${name}?`)) {
      onUpdate(photographers.filter((p) => p.id !== id));
    }
  };

  const handleUpdateRate = (photographerId: string, eventType: string, rateValue: number) => {
    const updated = photographers.map((p) => {
      if (p.id === photographerId) {
        const currentRates = p.rates || {
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
        return {
          ...p,
          rates: {
            ...currentRates,
            [eventType]: rateValue
          }
        };
      }
      return p;
    });
    onUpdate(updated);
  };

  const filteredPhotographers = photographers.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-850">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Karyawan & Fotografer</h2>
          <p className="text-sm text-slate-400">Atur database profil fotografer, videografer, editor, nomor rekening bank, dan konfigurasi tarif gaji per project.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl font-medium cursor-pointer transition"
          >
            <PlusCircle size={18} />
            <span>Tambah Tim Baru</span>
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl max-w-md">
        <button
          onClick={() => { setActiveSubTab("profiles"); setIsAdding(false); }}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "profiles"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-850"
          }`}
        >
          <User size={14} />
          <span>Profil & Rekening</span>
        </button>
        <button
          onClick={() => { setActiveSubTab("rates"); setIsAdding(false); }}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "rates"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-850"
          }`}
        >
          <Coins size={14} />
          <span>Atur Tarif Event (Matrix)</span>
        </button>
      </div>

      {/* Editor/Add Form */}
      {isAdding && (
        <form onSubmit={editingId ? handleSaveEdit : handleAdd} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-md font-bold text-slate-200">
              {editingId ? `Edit Profil: ${name}` : "Pendaftaran Anggota Tim Baru"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg transition"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: General Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1.5">NAMA LENGKAP</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-slate-500" size={16} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Gede Artha"
                    className="w-full bg-slate-950 border border-slate-800 text-sm py-2.5 pl-10 pr-4 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1.5">EMAIL AKTIF (Wajib untuk Slip Gaji)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-500" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Contoh: studio18.picture@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 text-sm py-2.5 pl-10 pr-4 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1.5">TELEPON / WA</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-slate-500" size={16} />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812XXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 text-sm py-2.5 pl-10 pr-4 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1.5 font-sans">PERAN / JABATAN UTAMA</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-slate-950 border border-slate-800 text-sm p-3 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  {Object.values(Role).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column: Bank Info */}
            <div className="space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-850">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-slate-850 pb-2 mb-2">Informasi Pembayaran & Rekening</h4>
              
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1.5">NAMA BANK</label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-3.5 text-slate-500" size={16} />
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="BCA, Mandiri, BRI, BNI"
                    className="w-full bg-slate-950 border border-slate-800 text-sm py-2.5 pl-10 pr-4 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1.5">NOMOR REKENING</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Masukkan nomor rekening pembayaran..."
                  className="w-full bg-slate-950 border border-slate-800 text-sm p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1.5">NAMA PEMILIK REKENING</label>
                <input
                  type="text"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  placeholder="A.N. Gede Artha (Kosongkan jika sama dengan nama lengkap)"
                  className="w-full bg-slate-950 border border-slate-800 text-sm p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Check size={18} />
              <span>{editingId ? "Simpan Perubahan" : "Simpan Tim Baru"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Directory Searching & Listing */}
      {activeSubTab === "profiles" ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, email, jab..."
                className="w-full bg-white border border-slate-300 text-xs py-2 pl-9 pr-4 rounded-lg text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-10 w-full"
              />
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Menampilkan {filteredPhotographers.length} dari {photographers.length} karyawan
            </div>
          </div>

          {filteredPhotographers.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Camera size={40} className="mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">Tidak ada tim yang cocok</p>
              <p className="text-xs text-slate-400">Silakan tambahkan data karyawan fotografer baru ke dalam sistem.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="p-4 pl-6">Profil & Jabatan</th>
                    <th className="p-4">Akun Rekening Bank</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right pr-6">Peralatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPhotographers.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{p.role}</div>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail size={10} />
                            {p.email}
                          </span>
                          {p.phone && (
                            <span className="flex items-center gap-1 border-l border-slate-200 pl-3">
                              <Phone size={10} />
                              {p.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Landmark size={14} className="text-slate-400" />
                          <span className="font-semibold text-slate-700">{p.bankName}</span>
                        </div>
                        <div className="font-mono text-slate-600 mt-1">{p.bankAccount}</div>
                        <div className="text-[10px] text-slate-400 font-medium font-sans">A.N. {p.bankHolder}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Aktif
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEdit(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition overflow-hidden"
                            title="Edit Profil"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition overflow-hidden"
                            title="Hapus Profil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-950 text-slate-100 border border-slate-900 rounded-2xl overflow-hidden shadow-xl p-5 md:p-6 space-y-4">
          <div className="flex items-start gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-850">
            <BadgeInfo size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed font-medium">
              Konfigurasi nominal honor per project yang berbeda-beda untuk tiap fotografer. Perubahan nominal honor langsung disimpan ke sistem dan akan otomatis mengisi slip gaji baru sesuai kategori yang dipilih.
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-850">
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead>
                <tr className="bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-850">
                  <th className="p-4 pl-6 min-w-[220px]">FOTOGRAFER / AKAD MODEL</th>
                  {EVENT_CATEGORIES.map((cat) => (
                    <th key={cat} className="p-4 text-center text-[10px] font-bold min-w-[160px] whitespace-nowrap">
                      {cat.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs">
                {filteredPhotographers.map((p) => {
                  const currentRates = p.rates || {
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
                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-slate-100 text-sm">{p.name}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{p.role}</div>
                      </td>
                      {EVENT_CATEGORIES.map((cat) => {
                        const rateVal = currentRates[cat] !== undefined ? currentRates[cat] : 0;
                        return (
                          <td key={cat} className="p-3">
                            <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition px-3 py-2">
                              <span className="text-[10px] font-bold text-slate-500 mr-1.5 select-none shrink-0">Rp</span>
                              <input
                                type="number"
                                value={rateVal || ""}
                                onChange={(e) => handleUpdateRate(p.id, cat, Number(e.target.value) || 0)}
                                className="w-full bg-transparent text-right text-xs text-white font-semibold font-mono outline-none p-0 border-0 focus:ring-0"
                                placeholder="0"
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
