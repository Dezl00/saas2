import Link from 'next/link';
import { Store } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-surface-200">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Store className="w-10 h-10 text-primary-600" />
        </div>
        <h1 className="text-2xl font-black text-surface-950 mb-3">المتجر غير موجود!</h1>
        <p className="text-surface-600 mb-8">
          عذراً، الرابط الذي تحاول الوصول إليه غير صحيح أو أن المتجر غير متاح حالياً.
        </p>
        <Link 
          href="https://almenu.pro" 
          className="block w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors"
        >
          أنشئ متجرك مجاناً
        </Link>
      </div>
    </div>
  );
}
