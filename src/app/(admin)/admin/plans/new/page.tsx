import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PlanForm } from "./PlanForm";
import { createPlanAction } from "../actions";

export default function NewPlanPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/plans"
          className="p-2 text-surface-500 hover:text-surface-900 bg-white rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
        >
          <ChevronRight className="w-5 h-5 rtl:rotate-180" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">إضافة باقة جديدة</h1>
          <p className="text-sm text-surface-500 mt-1">
            قم بتعريف باقة جديدة وتحديد المميزات المتاحة لها.
          </p>
        </div>
      </div>

      <PlanForm actionFn={createPlanAction} />
    </div>
  );
}
