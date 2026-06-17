import { Photographer, Role, Payslip, PayslipStatus, SMTPSettings, MailLog } from "../types";
import { supabase } from "./supabase";

export async function getPhotographers(): Promise<Photographer[]> {
  const { data, error } = await supabase.from('photographers').select('*');
  if (error) {
    console.error("Error fetching photographers:", error);
    return [];
  }
  // Postgres lowercases unquoted column names, so we map them back
  return (data || []).map(d => ({
    ...d,
    bankName: d.bankname || d.bankName,
    bankAccount: d.bankaccount || d.bankAccount,
    bankHolder: d.bankholder || d.bankHolder,
    baseSalary: d.basesalary || d.baseSalary,
    isActive: d.isactive === undefined ? d.isActive : d.isactive
  })) as Photographer[];
}

export async function savePhotographers(photographers: Photographer[]): Promise<void> {
  const mapped = photographers.map(p => ({
    id: p.id,
    name: p.name,
    email: p.email,
    phone: p.phone,
    role: p.role,
    bankname: p.bankName,
    bankaccount: p.bankAccount,
    bankholder: p.bankHolder,
    basesalary: p.baseSalary,
    isactive: p.isActive,
    rates: p.rates
  }));
  const { error } = await supabase.from('photographers').upsert(mapped);
  if (error) {
    console.error("Error saving photographers:", error);
  }
}

export async function getPayslips(): Promise<Payslip[]> {
  const { data, error } = await supabase.from('payslips').select('*').order('createdat', { ascending: false });
  if (error) {
    console.error("Error fetching payslips:", error);
    return [];
  }
  return (data || []).map(d => ({
    ...d,
    photographerId: d.photographerid || d.photographerId,
    photographerName: d.photographername || d.photographerName,
    photographerEmail: d.photographeremail || d.photographerEmail,
    photographerRole: d.photographerrole || d.photographerRole,
    paymentDate: d.paymentdate || d.paymentDate,
    periodStart: d.periodstart || d.periodStart,
    periodEnd: d.periodend || d.periodEnd,
    baseSalary: d.basesalary || d.baseSalary,
    totalSessionsEarnings: d.totalsessionsearnings || d.totalSessionsEarnings,
    totalAllowances: d.totalallowances || d.totalAllowances,
    totalDeductions: d.totaldeductions || d.totalDeductions,
    netSalary: d.netsalary || d.netSalary,
    createdAt: d.createdat || d.createdAt,
    emailSentAt: d.emailsentat || d.emailSentAt,
    bankName: d.bankname || d.bankName,
    bankAccount: d.bankaccount || d.bankAccount,
    bankHolder: d.bankholder || d.bankHolder
  })) as Payslip[];
}

export async function savePayslips(payslips: Payslip[]): Promise<void> {
  const mapped = payslips.map(p => ({
    id: p.id,
    photographerid: p.photographerId,
    photographername: p.photographerName,
    photographeremail: p.photographerEmail,
    photographerrole: p.photographerRole,
    month: p.month,
    paymentdate: p.paymentDate,
    periodstart: p.periodStart,
    periodend: p.periodEnd,
    basesalary: p.baseSalary,
    totalsessionsearnings: p.totalSessionsEarnings,
    totalallowances: p.totalAllowances,
    totaldeductions: p.totalDeductions,
    netsalary: p.netSalary,
    status: p.status,
    note: p.note,
    createdat: p.createdAt,
    emailsentat: p.emailSentAt,
    bankname: p.bankName,
    bankaccount: p.bankAccount,
    bankholder: p.bankHolder,
    sessions: p.sessions,
    allowances: p.allowances,
    deductions: p.deductions
  }));
  const { error } = await supabase.from('payslips').upsert(mapped);
  if (error) {
    console.error("Error saving payslips:", error);
  }
}

export async function getSMTPSettings(): Promise<SMTPSettings | null> {
  const { data, error } = await supabase.from('smtp_settings').select('*').eq('id', 'default').single();
  if (error) {
    console.error("Error fetching SMTP settings:", error);
    return null;
  }
  return {
    host: data.host,
    port: data.port,
    secure: data.secure,
    user: data.user,
    pass: data.pass,
    senderName: data.sendername || data.senderName,
    senderEmail: data.senderemail || data.senderEmail
  } as SMTPSettings;
}

export async function saveSMTPSettings(settings: SMTPSettings): Promise<void> {
  const mapped = {
    id: 'default',
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    user: settings.user,
    pass: settings.pass,
    sendername: settings.senderName,
    senderemail: settings.senderEmail
  };
  const { error } = await supabase.from('smtp_settings').upsert(mapped);
  if (error) {
    console.error("Error saving SMTP settings:", error);
  }
}

export async function getMailLogs(): Promise<MailLog[]> {
  const { data, error } = await supabase.from('mail_logs').select('*').order('sentat', { ascending: false });
  if (error) {
    console.error("Error fetching mail logs:", error);
    return [];
  }
  return (data || []).map(d => ({
    ...d,
    payslipId: d.payslipid || d.payslipId,
    recipientEmail: d.recipientemail || d.recipientEmail,
    recipientName: d.recipientname || d.recipientName,
    sentAt: d.sentat || d.sentAt
  })) as MailLog[];
}

export async function saveMailLogs(logs: MailLog[]): Promise<void> {
  const mapped = logs.map(l => ({
    id: l.id,
    payslipid: l.payslipId,
    recipientemail: l.recipientEmail,
    recipientname: l.recipientName,
    subject: l.subject,
    status: l.status,
    error: l.error,
    sentat: l.sentAt
  }));
  const { error } = await supabase.from('mail_logs').upsert(mapped);
  if (error) {
    console.error("Error saving mail logs:", error);
  }
}

export async function addMailLog(log: Omit<MailLog, "id" | "sentAt">): Promise<MailLog> {
  const newLog: MailLog = {
    ...log,
    id: "log_" + Math.random().toString(36).substring(2, 9),
    sentAt: new Date().toISOString()
  };
  const mapped = {
    id: newLog.id,
    payslipid: newLog.payslipId,
    recipientemail: newLog.recipientEmail,
    recipientname: newLog.recipientName,
    subject: newLog.subject,
    status: newLog.status,
    error: newLog.error,
    sentat: newLog.sentAt
  };
  const { error } = await supabase.from('mail_logs').insert([mapped]);
  if (error) {
    console.error("Error adding mail log:", error);
  }
  return newLog;
}
