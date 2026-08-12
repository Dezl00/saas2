"use client";

import { useTransition, useState } from "react";
import toast from "react-hot-toast";

export function OptimisticToggle({ 
  initialStatus, 
  action 
}: { 
  initialStatus: boolean, 
  action: (status: boolean) => Promise<{error?: string, success?: string}> 
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const newStatus = !status;
    setStatus(newStatus);
    
    startTransition(async () => {
      try {
        const result = await action(newStatus);
        if (result?.error) {
          toast.error(result.error);
          setStatus(!newStatus); // Revert
        }
      } catch (e) {
        toast.error("حدث خطأ");
        setStatus(!newStatus); // Revert
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        status ? 'bg-success-500' : 'bg-surface-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          status ? '-translate-x-6' : '-translate-x-1'
        }`}
      />
    </button>
  );
}
