"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { hardDeleteUser } from "../actions/hard-delete-user";

export default function UserDeleteButton({ userId, storeName }: { userId: string; storeName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await hardDeleteUser(userId);
      toast.success("تم حذف المستخدم والمتجر نهائياً");
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الحذف");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        title="حذف نهائي"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 ">
          <div className="bg-white rounded-[24px]  max-w-md w-full p-6 animate-zoom-in">
            <h3 className="text-xl font-bold text-red-600 mb-2">حذف نهائي!</h3>
            <p className="text-gray-600 mb-4">
              هل أنت متأكد من رغبتك في حذف هذا المستخدم{storeName ? ` ومتجر (${storeName})` : ""}؟
            </p>
            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm mb-6">
              <strong>تنبيه خطير:</strong> سيتم مسح المستخدم وكل بيانات متجره، منتجاته، صورها المرفوعة، والطلبات بشكل نهائي ولا يمكن التراجع عن هذه الخطوة.
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    جاري الحذف...
                  </>
                ) : (
                  "نعم، احذف نهائياً"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
