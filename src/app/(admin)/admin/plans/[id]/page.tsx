import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PlanForm } from "../new/components/PlanForm";
import { updatePlanAction } from "../actions/update-plan-action";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const plan = await prisma.plan.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!plan) {
    notFound();
  }

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
          <h1 className="text-2xl font-bold text-surface-900">تعديل الباقة</h1>
          <p className="text-sm text-surface-500 mt-1">
            تعديل بيانات ومميزات الباقة "{plan.name}"
          </p>
        </div>
      </div>

      <PlanForm actionFn={updatePlanAction} initialData={plan} />
    </div>
  );
}
