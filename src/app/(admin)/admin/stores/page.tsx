import { prisma } from "@/lib/prisma";
import { Store, Eye, LogIn } from "lucide-react";
import Link from "next/link";
import { impersonateStore } from "./actions/impersonate-store";
import { StoreActions } from "./components/StoreActions";
import { StoreTabs } from "./components/StoreTabs";
import Image from "next/image";

export default async function AdminStoresPage(props: { searchParams: Promise<{ status?: string }> }) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams.status;

  const stores = await prisma.store.findMany({
    where: statusFilter ? { status: statusFilter as any } : undefined,
    include: {
      user: { select: { name: true, email: true, phone: true } },
      _count: { select: { orders: true, menuItems: true, categories: true } },
      domains: { where: { status: 'CONNECTED' }, take: 1 }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-surface-500 font-medium">
          <Link href="/admin" className="hover:text-primary-600 transition-colors">الرئيسية</Link>
          <span>/</span>
          <span className="text-surface-900 font-semibold">المتاجر</span>
        </div>
        <Link
          href="/admin/stores/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-[24px] hover:bg-primary-700 transition-colors"
        >
          <Store className="w-5 h-5" />
          إضافة متجر جديد
        </Link>
      </div>

      <StoreTabs currentStatus={statusFilter} />

      <div className="grid gap-6">
        {stores.map((store) => (
          <div
            key={store.id}
            className="bg-white rounded-[24px] border border-surface-200 p-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Store Info */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-[24px] bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-surface-200">
                  {store.logo ? (
                    <Image src={store.logo} alt={store.name} width={56} height={56} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-7 h-7 text-primary-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base text-surface-950">
                      {store.name}
                    </h3>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium ${
                        store.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : store.status === "SUSPENDED"
                            ? "bg-red-100 text-red-700"
                            : "bg-surface-100 text-surface-700"
                      }`}
                    >
                      {store.status === "ACTIVE"
                        ? "نشط"
                        : store.status === "SUSPENDED"
                          ? "موقوف"
                          : "محذوف"}
                    </span>
                  </div>
                  {(store.domains[0]?.name || store.subdomain) && (
                    <p className="text-xs text-primary-500 mt-1 font-medium" dir="ltr">
                      {store.domains[0] ? store.domains[0].name : `${store.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'almenu.pro'}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-surface-950">
                    {store._count.categories}
                  </p>
                  <p className="text-xs text-surface-800/50">أقسام</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-surface-950">
                    {store._count.menuItems}
                  </p>
                  <p className="text-xs text-surface-800/50">أصناف</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-surface-950">
                    {store._count.orders}
                  </p>
                  <p className="text-xs text-surface-800/50">طلبات</p>
                </div>
              </div>

              {/* We'll handle status within StoreActions to avoid redundancy, but we can keep the badge if we want. Let's remove the old status badge as StoreActions now renders 'نشط' or 'موقوف'. */}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {(store.domains[0]?.name || store.subdomain) && (
                  <Link
                    href={`https://${store.domains[0] ? store.domains[0].name : `${store.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'almenu.pro'}`}`}
                    target="_blank"
                    className="p-2 rounded-[24px] hover:bg-surface-50 text-surface-800/50 hover:text-primary-500 transition-colors"
                    title="عرض المتجر"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                )}

                <form action={impersonateStore.bind(null, store.id)}>
                  <button
                    type="submit"
                    className="p-2 rounded-[24px] hover:bg-primary-50 text-surface-800/50 hover:text-primary-600 transition-colors"
                    title="دخول للوحة التحكم (كأدمن)"
                  >
                    <LogIn className="w-5 h-5" />
                  </button>
                </form>

                <StoreActions 
                  storeId={store.id} 
                  storeName={store.name} 
                  status={store.status} 
                  ownerInfo={{ name: store.user.name, email: store.user.email, phone: store.user.phone || '' }} 
                  showWatermark={store.showWatermark}
                />
              </div>
            </div>
          </div>
        ))}

        {stores.length === 0 && (
          <div className="bg-white rounded-[24px] border border-surface-200 p-16 text-center">
            <Store className="w-16 h-16 text-surface-800/20 mx-auto mb-4" />
            <p className="text-lg text-surface-800/50">
              لا توجد متاجر مسجلة بعد
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
