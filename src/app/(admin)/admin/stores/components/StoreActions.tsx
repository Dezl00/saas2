"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Trash2, AlertTriangle, Loader2, User, Phone, Mail, Megaphone, MegaphoneOff } from "lucide-react";
import { toggleStoreStatus } from "../new/actions/toggle-store-status";
import { toggleStoreWatermark } from "../actions/toggle-store-watermark";

interface StoreActionsProps {
  storeId: string;
  storeName: string;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  ownerInfo: { name: string; email: string; phone: string };
  showWatermark: boolean;
}

export function StoreActions({ storeId, storeName, status, ownerInfo, showWatermark }: StoreActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isWatermarkPending, startWatermarkTransition] = useTransition();
  
  const [optimisticStatus, addOptimisticStatus] = useOptimistic(
    status,
    (state: string, newStatus: string) => newStatus as "ACTIVE" | "SUSPENDED" | "DELETED"
  );
  
  const [optimisticWatermark, addOptimisticWatermark] = useOptimistic(
    showWatermark,
    (state: boolean, newValue: boolean) => newValue
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const isActive = optimisticStatus === "ACTIVE";

  const handleToggle = () => {
    const newStatus = isActive ? "suspend" : "activate";
    startTransition(async () => {
      addOptimisticStatus(isActive ? "SUSPENDED" : "ACTIVE");
      await toggleStoreStatus(storeId, newStatus);
    });
  };
  
  const handleToggleWatermark = () => {
    startWatermarkTransition(async () => {
      const newValue = !optimisticWatermark;
      addOptimisticWatermark(newValue);
      await toggleStoreWatermark(storeId, newValue);
    });
  };

  const handleDelete = () => {
    if (deleteConfirmText !== storeName) return;
    startTransition(async () => {
      await toggleStoreStatus(storeId, "delete");
      setShowDeleteModal(false);
    });
  };

  if (status === "DELETED") return null;

  return (
    <div className="flex items-center gap-4">
      {/* Watermark/Ad Toggle Button */}
      <button
        onClick={handleToggleWatermark}
        disabled={isWatermarkPending}
        className={`p-2 rounded-[24px] hover:bg-surface-50 transition-colors ${
          optimisticWatermark ? 'text-primary-600' : 'text-surface-800/30'
        }`}
        title={optimisticWatermark ? "إلغاء إعلان المنصة" : "تفعيل إعلان المنصة"}
      >
        {isWatermarkPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : optimisticWatermark ? (
          <Megaphone className="w-5 h-5" />
        ) : (
          <MegaphoneOff className="w-5 h-5" />
        )}
      </button>

      {/* Toggle Switch */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 ${
          isActive ? "bg-green-500" : "bg-red-500"
        }`}
        dir="ltr"
        title={isActive ? "إيقاف المتجر" : "تفعيل المتجر"}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isActive ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>

      {/* Owner Info Button */}
      <button
        onClick={() => setShowOwnerModal(true)}
        className="p-2 rounded-[24px] hover:bg-surface-50 text-surface-800/50 hover:text-primary-600 transition-colors"
        title="معلومات المالك"
      >
        <User className="w-5 h-5" />
      </button>

      {/* Owner Info Modal */}
      {showOwnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/50 ">
          <div className="bg-white rounded-[24px] w-full max-w-sm  p-6 animate-fade-in relative">
            <button onClick={() => setShowOwnerModal(false)} className="absolute top-4 left-4 text-surface-400 hover:text-surface-900">
              ✕
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-surface-950">معلومات المالك</h3>
              <p className="text-surface-500 text-sm">{storeName}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-[24px]">
                <User className="w-5 h-5 text-primary-500" />
                <div className="flex-1">
                  <p className="text-xs text-surface-500 font-bold">الاسم</p>
                  <p className="font-medium text-surface-900">{ownerInfo.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-[24px]">
                <Phone className="w-5 h-5 text-primary-500" />
                <div className="flex-1">
                  <p className="text-xs text-surface-500 font-bold">رقم الهاتف</p>
                  <p className="font-medium text-surface-900" dir="ltr">{ownerInfo.phone || 'غير محدد'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-[24px]">
                <Mail className="w-5 h-5 text-primary-500" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-surface-500 font-bold">البريد الإلكتروني</p>
                  <p className="font-medium text-surface-900 truncate" dir="ltr">{ownerInfo.email}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowOwnerModal(false)}
              className="w-full mt-6 px-4 py-2.5 bg-surface-100 text-surface-700 font-bold rounded-[24px] hover:bg-surface-200 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Delete Button */}
      <button
        onClick={() => setShowDeleteModal(true)}
        disabled={isPending}
        className="p-2 rounded-[24px] hover:bg-red-50 text-surface-800/50 hover:text-red-500 transition-colors disabled:opacity-50"
        title="حذف"
      >
        {isPending && showDeleteModal ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/50 ">
          <div className="bg-white rounded-[24px] w-full max-w-md  p-6 space-y-6 animate-fade-in">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-surface-950">حذف المتجر</h3>
                <p className="text-surface-600 mt-2">
                  هل أنت متأكد من حذف المتجر <span className="font-bold text-surface-900">{storeName}</span>؟ هذا الإجراء لا يمكن التراجع عنه بسهولة.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-surface-950 mb-2">
                اكتب <span className="text-red-600 select-all">{storeName}</span> للتأكيد:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-2 bg-surface-50 border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                placeholder="اسم المتجر..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-surface-100 text-surface-700 font-bold rounded-[24px] hover:bg-surface-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== storeName || isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-[24px] hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "حذف المتجر"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
