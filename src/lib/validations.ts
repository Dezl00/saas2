import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  otpCode: z.string().length(6, "كود التحقق يجب أن يكون 6 أرقام"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "اسم القسم مطلوب"),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, "اسم الصنف مطلوب"),
  description: z.string().optional(),
  price: z.number().positive("السعر يجب أن يكون أكبر من صفر"),
  image: z.string().optional(),
  isAvailable: z.boolean().default(true),
  categoryId: z.string().min(1, "القسم مطلوب"),
  sortOrder: z.number().int().min(0).default(0),
});

export const storeSettingsSchema = z.object({
  name: z.string().min(2, "اسم المتجر يجب أن يكون حرفين على الأقل"),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
  cover: z.string().optional(),
});

export const subdomainSchema = z.object({
  subdomain: z
    .string()
    .min(3, "اسم الرابط يجب أن يكون 3 أحرف على الأقل")
    .max(30, "اسم الرابط يجب ألا يتجاوز 30 حرفاً")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "اسم الرابط يجب أن يحتوي فقط على حروف إنجليزية صغيرة وأرقام وشرطات"
    ),
});

export const orderSchema = z.object({
  customerName: z.string().min(2, "الاسم مطلوب"),
  customerPhone: z.string().min(10, "رقم الهاتف غير صحيح"),
  customerAddress: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["CASH", "INSTAPAY", "BANK_WALLET", "BANK_TRANSFER"]),
  couponCode: z.string().optional(),
  items: z.array(
    z.object({
      menuItemId: z.string(),
      quantity: z.number().int().positive(),
      notes: z.string().optional(),
    })
  ),
});

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "كود الكوبون يجب أن يكون 3 أحرف على الأقل")
    .max(20, "كود الكوبون يجب ألا يتجاوز 20 حرفاً"),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive("القيمة يجب أن تكون أكبر من صفر"),
  minOrder: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  expiresAt: z.string().optional(),
});

export const paymentMethodSchema = z.object({
  type: z.enum(["CASH", "INSTAPAY", "BANK_WALLET", "BANK_TRANSFER"]),
  name: z.string().min(1, "اسم وسيلة الدفع مطلوب"),
  details: z.string().optional(),
  instructions: z.string().optional(),
  isEnabled: z.boolean().default(true),
});
