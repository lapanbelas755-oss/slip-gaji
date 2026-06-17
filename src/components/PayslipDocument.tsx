import React from "react";
import { Payslip } from "../types";
import { Camera, Calendar, CheckSquare, ShieldCheck } from "lucide-react";

interface PayslipDocumentProps {
  payslip: Payslip;
  containerId?: string;
}

export const PayslipDocument: React.FC<PayslipDocumentProps> = ({ payslip, containerId }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const slipRefNumber = `S18P-${payslip.month.replace("-", "")}-${payslip.id.toUpperCase()}`;

  return (
    <div
      id={containerId}
      className="p-8 md:p-12 bg-white text-slate-800 rounded-xl border border-slate-200 max-w-3xl mx-auto shadow-sm relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-dashed border-slate-300 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
              <img src="/logo.png" alt="Studio Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-sans font-bold text-xl tracking-tight text-slate-900">
              STUDIO 18 PICTURE
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xs">
            Professional Photography & Videography Services<br />
            Langsa - Aceh Tamiang - Indonesia
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-left md:text-right">
          <div className="inline-block bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded font-semibold mb-2">
            SLIP GAJI DIGITAL
          </div>
          <div className="text-xs text-slate-400">Nomor Referensi</div>
          <div className="font-mono text-sm font-bold text-slate-700">{slipRefNumber}</div>
        </div>
      </div>

      {/* Meta Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 text-sm relative z-10">
        <div className="space-y-2">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Penerima (Karyawan)</h3>
          <div className="outline-none">
            <div className="font-bold text-slate-900 text-base">{payslip.photographerName}</div>
            <div className="text-slate-600 font-medium text-xs mt-0.5">{payslip.photographerRole}</div>
            <div className="text-slate-500 text-xs mt-1">{payslip.photographerEmail}</div>
          </div>
        </div>
        <div className="space-y-2 text-left md:text-right md:justify-self-end">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Periode & Pembayaran</h3>
          <div className="space-y-1 text-xs text-slate-600">
            <div>
              <span className="text-slate-400">Bulan:</span>{" "}
              <strong className="text-slate-800 font-semibold">{payslip.month}</strong>
            </div>
            <div>
              <span className="text-slate-400">Tanggal Pembayaran:</span>{" "}
              <strong className="text-slate-900 bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                {payslip.paymentDate}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Details Table */}
      <div className="space-y-6 relative z-10">
        
        {/* 2. Sesi & Proyek Pemotretan (Photographic Sessions) */}
        <div>
          <div className="pb-2 mb-2 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider flex justify-between items-center">
            <span>Rincian Gaji Per Project</span>
            <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase">
              {payslip.sessions.length} Sesi
            </span>
          </div>
          {payslip.sessions.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-xs italic">
              Tidak ada sesi pemotretan dalam periode pembayaran ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="p-3 pl-4">Tanggal</th>
                    <th className="p-3">Event / Klien</th>
                    <th className="p-3">Posisi</th>
                    <th className="p-3 text-right pr-4">Gaji</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payslip.sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50/10">
                      <td className="p-3 pl-4 text-slate-500">
                        <div className="flex flex-col gap-1.5 py-1">
                          {session.dates && session.dates.length > 0 ? (
                            session.dates.map((d, index) => {
                              const parts = d.split("-");
                              const formatted = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
                              return (
                                <span key={index} className="inline-flex items-center bg-slate-150/60 text-slate-800 font-mono text-[10px] px-1.5 py-0.5 rounded-md border border-slate-200/50 w-max leading-none">
                                  {formatted}
                                </span>
                              );
                            })
                          ) : (
                            <span className="font-mono text-[10px]">{session.date}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{session.clientName}</div>
                        <div className="text-slate-400 text-[10px] mt-0.5">{session.eventType}</div>
                        {session.feeMode === "PER_DAY" && session.dates && session.dates.length > 1 && (
                          <span className="inline-block bg-blue-50 text-blue-700 text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase mt-1 tracking-wider">
                            Tarif Per Hari (x{session.dates.length})
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 font-medium">{session.role}</td>
                      <td className="p-3 text-right pr-4 font-semibold text-slate-800 font-mono">
                        {formatCurrency(session.fee)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-semibold border-t border-slate-200 text-slate-800">
                    <td colSpan={3} className="p-3 pl-4 text-slate-500 text-right">Total Gaji Proyek:</td>
                    <td className="p-3 text-right pr-4 text-slate-800 font-bold">
                      {formatCurrency(payslip.totalSessionsEarnings)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. Tunjangan & Potongan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tunjangan / Allowances */}
          <div>
            <div className="pb-2 mb-2 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Tunjangan & Operasional (Bensin, Makan)
            </div>
            {payslip.allowances.length === 0 ? (
              <div className="py-2 text-slate-400 text-xs italic">
                Tidak ada tunjangan operasional.
              </div>
            ) : (
              <div className="py-1 space-y-2 text-xs">
                {payslip.allowances.map((allowance) => (
                  <div key={allowance.id} className="flex justify-between items-center">
                    <span className="text-slate-600">{allowance.name}</span>
                    <span className="font-semibold text-emerald-600">+{formatCurrency(allowance.amount)}</span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-dashed border-slate-200 flex justify-between font-bold text-slate-800">
                  <span>Total Tunjangan:</span>
                  <span>{formatCurrency(payslip.totalAllowances)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Potongan / Deductions */}
          <div>
            <div className="pb-2 mb-2 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Potongan Gaji (Kasbon, Kerusakan Alat, DLL)
            </div>
            {payslip.deductions.length === 0 ? (
              <div className="py-2 text-slate-400 text-xs italic">
                Tidak ada potongan gaji.
              </div>
            ) : (
              <div className="py-1 space-y-2 text-xs">
                {payslip.deductions.map((deduction) => (
                  <div key={deduction.id} className="flex justify-between items-center">
                    <span className="text-slate-600">{deduction.name}</span>
                    <span className="font-semibold text-rose-600">-{formatCurrency(deduction.amount)}</span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-dashed border-slate-200 flex justify-between font-bold text-slate-800">
                  <span>Total Potongan:</span>
                  <span>{formatCurrency(payslip.totalDeductions)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Grand Total Summary */}
        <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col md:flex-row justify-between items-center border border-slate-800 shadow-md">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Gaji Bersih Diterima</div>
            <div className="text-[10px] text-slate-500">Net Pay Outbound</div>
          </div>
          <div className="text-2xl md:text-3xl font-mono font-black text-amber-400 tracking-tight">
            {formatCurrency(payslip.netSalary)}
          </div>
        </div>

        {/* 5. Transfer Target Bank & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
          <div className="space-y-3">
            <div>
              <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Tujuan Rekening</span>
              <div className="mt-1">
                <div className="font-bold text-slate-800">{payslip.bankName}</div>
                <div className="text-slate-600 font-mono mt-0.5">{payslip.bankAccount}</div>
                <div className="text-slate-500 mt-1">A.N. {payslip.bankHolder}</div>
              </div>
            </div>
            {payslip.note && (
              <div>
                <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Catatan Internal</span>
                <p className="mt-1 text-slate-600 leading-relaxed italic">
                  "{payslip.note}"
                </p>
              </div>
            )}
          </div>

          <div className="text-center flex flex-col items-center justify-center p-4">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Tanda Tangan Authorized</div>
            <div className="my-3 flex flex-col items-center">
              <div className="border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold scale-95 shadow-sm">
                <ShieldCheck size={14} />
                <span>E-SIGNED SECURITIES</span>
              </div>
              <div className="text-[9px] text-slate-400 font-mono tracking-widest mt-1">
                HASH:{payslip.id.toUpperCase()}-{payslip.paymentDate}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal max-w-xs">
              Maksud dari dokumen ini sah dibuat secara digital dan dilindungi enkripsi sistem slip internal Studio 18 Picture.
            </p>
          </div>
        </div>

      </div>

      {/* Safety Bottom Header */}
      <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
        <div className="flex items-center gap-1">
          <Calendar size={10} />
          <span>Dicetak otomatis pada {new Date(payslip.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
        <div>lapanbelas &copy; 2026</div>
      </div>
    </div>
  );
};
