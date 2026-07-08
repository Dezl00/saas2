"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface Props {
  action: () => Promise<{ error?: string } | void | any>;
}

export function DeleteConfirmButton({ action }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    try {
      const result = await action();
      if (result && typeof result === "object" && "error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("تم الحذف بنجاح");
      }
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ أثناء الحذف");
    } finally {
      setIsPending(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="p-2 text-surface-400 hover:text-error-600 hover:bg-error-50 rounded-[24px] transition-colors shrink-0"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        title="تأكيد الحذف"
        description="هل أنت متأكد من رغبتك في الحذف؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDelete}
        onCancel={() => setIsOpen(false)}
        isLoading={isPending}
      />
    </>
  );
}
