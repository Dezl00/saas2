import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShareStoreButton } from "@/components/dashboard/ShareStoreButton";
import { Suspense } from "react";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentOrders } from "@/components/dashboard/RecentOrders";

// Skeletons for Suspense
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-surface-100 rounded-[24px] p-6 h-36 animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="w-14 h-14 bg-surface-200 rounded-2xl"></div>
            <div className="h-8 bg-surface-200 rounded-xl w-16"></div>
          </div>
          <div className="h-4 bg-surface-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-surface-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="bg-white border border-surface-200 rounded-[24px] overflow-hidden animate-pulse">
      <div className="p-6 border-b border-surface-100 flex justify-between items-center">
        <div className="h-8 bg-surface-200 rounded w-40"></div>
        <div className="h-10 bg-surface-200 rounded-xl w-24"></div>
      </div>
      <div className="divide-y divide-surface-100">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-white w-full"></div>
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) {
    return (
      <div className="text-center py-20 bg-white border border-surface-200 rounded-[24px]">
        <h2 className="text-xl font-semibold text-surface-950">لا يوجد متجر مرتبط بحسابك</h2>
      </div>
    );
  }

  // Fetch only what's needed for the top section
  const store = await prisma.store.findUnique({ 
    where: { id: storeId }, 
    select: { id: true, name: true, subdomain: true, currency: true, domains: true } 
  });

  return (
    <div className="space-y-8 pb-10">
      {(store?.subdomain || store?.domains?.[0]?.name) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 w-full">
          <div>
            <h3 className="font-black text-xl text-primary-900">رابط متجرك جاهز!</h3>
            <p className="text-sm font-bold text-primary-700 mt-2">شارك هذا الرابط مع عملائك لاستقبال الطلبات</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <ShareStoreButton 
              storeUrl={store.domains?.[0]?.name ? `https://${store.domains[0].name}` : `https://${store.subdomain}.menura.site`} 
              storeName={store.name}
              qrUrl={`https://menura.site/qr/${store.id}`}
            />
            <Link
              href={store.domains?.[0]?.name ? `https://${store.domains[0].name}` : `https://${store.subdomain}.menura.site`}
              target="_blank"
              className="flex-1 sm:flex-none px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors text-center"
            >
              زيارة المتجر
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats storeId={storeId} currency={store?.currency || undefined} />
      </Suspense>

      {/* Recent Orders */}
      <Suspense fallback={<OrdersSkeleton />}>
        <RecentOrders storeId={storeId} currency={store?.currency || undefined} />
      </Suspense>
    </div>
  );
}
