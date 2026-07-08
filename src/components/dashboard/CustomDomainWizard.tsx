"use client";

import { useState } from "react";
import { addCustomDomain } from "@/app/(dashboard)/dashboard/settings/domains/actions/add-custom-domain";
import { verifyDomainStatus } from "@/app/(dashboard)/dashboard/settings/domains/actions/verify-domain-status";
import { removeCustomDomain } from "@/app/(dashboard)/dashboard/settings/domains/actions/remove-custom-domain";
import { Globe, CheckCircle, Clock, AlertTriangle, RefreshCw, Trash2, Copy } from "lucide-react";

export function CustomDomainWizard({ initialDomain }: { initialDomain: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    const formData = new FormData(e.currentTarget);
    const res = await addCustomDomain(formData);
    
    if (res?.error) setError(res.error);
    if (res?.success) setSuccess(res.success);
    setIsSubmitting(false);
  };

  const handleVerify = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    const res = await verifyDomainStatus(initialDomain.id);
    if (res?.error) setError(res.error);
    if (res?.success) setSuccess(res.success);
    setIsSubmitting(false);
  };

  const handleRemove = async () => {
    if (!confirm("هل أنت متأكد من حذف الدومين؟ سيتوقف موقعك عن العمل بهذا الدومين فوراً.")) return;
    setIsSubmitting(true);
    const res = await removeCustomDomain(initialDomain.id);
    if (res?.error) setError(res.error);
    setIsSubmitting(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("تم النسخ!");
  };

  if (!initialDomain) {
    return (
      <form onSubmit={handleAdd} className="max-w-xl space-y-5">
        {error && <div className="p-4 bg-error-50 text-error-700 rounded-[24px] border-2 border-error-100 font-bold text-sm">{error}</div>}
        <div>
          <label htmlFor="domain" className="block text-sm font-bold text-surface-950 mb-2">
            الدومين الخاص
          </label>
          <div className="flex items-stretch" dir="ltr">
            <span className="px-4 flex items-center bg-surface-100 border-2 border-e-0 border-surface-200 rounded-s-2xl text-surface-600 font-bold">
              https://
            </span>
            <input
              type="text"
              id="domain"
              name="domain"
              placeholder="restaurant.com أو menu.restaurant.com"
              className="w-full px-4 py-3 bg-surface-50 border-2 border-surface-200 text-surface-950 font-bold rounded-e-2xl focus:border-primary-500 outline-none transition-colors"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto py-4 px-8 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-[24px] font-bold transition-all"
        >
          {isSubmitting ? "جاري الإضافة..." : "إضافة الدومين"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-error-50 text-error-700 rounded-[24px] border-2 border-error-100 font-bold text-sm">{error}</div>}
      {success && <div className="p-4 bg-success-50 text-success-700 rounded-[24px] border-2 border-success-100 font-bold text-sm">{success}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-surface-50 border-2 border-surface-200 rounded-[24px] gap-4">
        <div>
          <p className="text-sm font-bold text-surface-500 mb-1">الدومين الحالي</p>
          <p className="font-black text-xl text-surface-950" dir="ltr">{initialDomain.name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {initialDomain.status === "CONNECTED" ? (
            <span className="flex items-center gap-1.5 text-success-700 bg-success-50 border-2 border-success-100 px-4 py-2 rounded-[24px] text-sm font-bold">
              <CheckCircle className="w-4 h-4" /> متصل
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-warning-700 bg-warning-50 border-2 border-warning-100 px-4 py-2 rounded-[24px] text-sm font-bold">
              <Clock className="w-4 h-4" /> قيد المعالجة ({initialDomain.status})
            </span>
          )}
        </div>
      </div>

      {initialDomain.status !== "CONNECTED" && initialDomain.dnsRecords && (
        <div className="bg-surface-50 border-2 border-surface-200 rounded-[24px] overflow-hidden">
          <div className="p-5 border-b-2 border-surface-200 bg-surface-100">
            <h4 className="font-black text-surface-950">إعدادات DNS المطلوبة</h4>
            <p className="text-sm font-medium text-surface-500 mt-1">
              يرجى إضافة هذه السجلات في لوحة تحكم الدومين الخاص بك (مثال: Hostinger, GoDaddy).
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left" dir="ltr">
              <thead className="bg-surface-50 border-b-2 border-surface-200 text-surface-500 text-sm font-bold">
                <tr>
                  <th className="px-5 py-4 font-bold">Type</th>
                  <th className="px-5 py-4 font-bold">Name</th>
                  <th className="px-5 py-4 font-bold">Value</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-surface-200">
                {initialDomain.name.split('.').length === 2 ? (
                  <>
                    {initialDomain.dnsRecords.a && (
                      <tr className="hover:bg-white transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-sm text-surface-950">A</td>
                        <td className="px-5 py-4 font-mono font-bold text-sm text-surface-950">@</td>
                        <td className="px-5 py-4 font-mono font-bold text-sm text-surface-950">{initialDomain.dnsRecords.a}</td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => copyToClipboard(initialDomain.dnsRecords.a)} className="text-primary-600 hover:text-primary-800 text-sm font-bold bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">نسخ</button>
                        </td>
                      </tr>
                    )}
                    {initialDomain.dnsRecords.cname && (
                      <tr className="hover:bg-white transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-sm text-surface-950">CNAME</td>
                        <td className="px-5 py-4 font-mono font-bold text-sm text-surface-950">www</td>
                        <td className="px-5 py-4 font-mono font-bold text-sm text-surface-950">{initialDomain.dnsRecords.cname}</td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => copyToClipboard(initialDomain.dnsRecords.cname)} className="text-primary-600 hover:text-primary-800 text-sm font-bold bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">نسخ</button>
                        </td>
                      </tr>
                    )}
                  </>
                ) : (
                  <tr className="hover:bg-white transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-sm text-surface-950">CNAME</td>
                    <td className="px-5 py-4 font-mono font-bold text-sm text-surface-950">{initialDomain.name.split('.')[0]}</td>
                    <td className="px-5 py-4 font-mono font-bold text-sm text-surface-950">{initialDomain.dnsRecords.cname}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => copyToClipboard(initialDomain.dnsRecords.cname)} className="text-primary-600 hover:text-primary-800 text-sm font-bold bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">نسخ</button>
                    </td>
                  </tr>
                )}
                {initialDomain.dnsRecords.intendedNameservers && initialDomain.dnsRecords.intendedNameservers.map((ns: string, i: number) => (
                  <tr key={i} className="hover:bg-white transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-sm text-surface-950">NS</td>
                    <td className="px-5 py-4 font-mono font-bold text-sm text-surface-950">@</td>
                    <td className="px-5 py-4 font-mono font-bold text-sm text-surface-950">{ns}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => copyToClipboard(ns)} className="text-primary-600 hover:text-primary-800 text-sm font-bold bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">نسخ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-6 border-t-2 border-surface-200">
        {initialDomain.status !== "CONNECTED" && (
          <button
            onClick={handleVerify}
            disabled={isSubmitting}
            className="flex items-center gap-2 py-4 px-6 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-[24px] font-bold transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isSubmitting ? 'animate-spin' : ''}`} />
            تحقق الآن
          </button>
        )}
        <button
          onClick={handleRemove}
          disabled={isSubmitting}
          className="flex items-center gap-2 py-4 px-6 text-error-600 bg-error-50 border-2 border-error-100 hover:bg-error-100 rounded-[24px] font-bold transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          حذف الدومين
        </button>
      </div>
    </div>
  );
}
