import { prisma } from "@/lib/prisma";

export const DEFAULT_TRIAL_LIMITS = {
  products: 50,
  branches: 1,
  staff: 2,
  reports: false,
  qr: true,
  inventory: false,
  customDomain: false,
  ai: false,
};

export async function getStoreLimits(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });

  if (!store || !store.subscription || !store.subscription.plan) {
    return DEFAULT_TRIAL_LIMITS;
  }

  // Parse plan features, fallback to trial if empty or missing
  try {
    const features = store.subscription.plan.features as any;
    if (!features || typeof features !== "object") return DEFAULT_TRIAL_LIMITS;
    
    return {
      products: typeof features.products === 'number' ? features.products : DEFAULT_TRIAL_LIMITS.products,
      branches: typeof features.branches === 'number' ? features.branches : DEFAULT_TRIAL_LIMITS.branches,
      staff: typeof features.staff === 'number' ? features.staff : DEFAULT_TRIAL_LIMITS.staff,
      reports: !!features.reports,
      qr: features.qr !== undefined ? !!features.qr : DEFAULT_TRIAL_LIMITS.qr,
      inventory: !!features.inventory,
      customDomain: !!features.customDomain,
      ai: !!features.ai,
    };
  } catch (error) {
    return DEFAULT_TRIAL_LIMITS;
  }
}

export async function checkProductLimit(storeId: string, addingCount: number = 1): Promise<{ allowed: boolean, limit: number, current: number }> {
  const limits = await getStoreLimits(storeId);
  
  const currentCount = await prisma.menuItem.count({
    where: { storeId }
  });

  return {
    allowed: limits.products === -1 ? true : (currentCount + addingCount) <= limits.products,
    limit: limits.products,
    current: currentCount
  };
}

export async function checkBranchLimit(storeId: string, addingCount: number = 1): Promise<{ allowed: boolean, limit: number, current: number }> {
  const limits = await getStoreLimits(storeId);
  
  const currentCount = await prisma.branch.count({
    where: { storeId }
  });

  return {
    allowed: limits.branches === -1 ? true : (currentCount + addingCount) <= limits.branches,
    limit: limits.branches,
    current: currentCount
  };
}

export async function checkFeatureEnabled(storeId: string, feature: keyof typeof DEFAULT_TRIAL_LIMITS): Promise<boolean> {
  const limits = await getStoreLimits(storeId);
  return !!limits[feature];
}
