"use server";

import { signIn, auth } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { sendOTP } from "@/lib/email";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

const SECRET_KEY = process.env.NEXTAUTH_SECRET;
if (!SECRET_KEY) {
  throw new Error('NEXTAUTH_SECRET environment variable is required');
}
const ALGORITHM = 'aes-256-cbc';

function encryptData(data: any): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(String(SECRET_KEY)).digest('base64').substring(0, 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptData(text: string): any {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = crypto.createHash('sha256').update(String(SECRET_KEY)).digest('base64').substring(0, 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
  } catch (e) {
    return null;
  }
}

async function createUserWithStore(userData: any, isVerified: boolean, otpMethod?: 'EMAIL' | 'PHONE' | null) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      phone: userData.phone || null,
      role: "OWNER",
      isVerified,
      otpCode: null,
      otpExpiry: null,
    },
  });

  await prisma.store.create({
    data: {
      name: "متجر جديد",
      type: "RESTAURANT",
      userId: user.id,
    },
  });

  try {
    const msg = otpMethod === 'EMAIL' 
      ? `سجل ${user.name} حساباً جديداً بالمنصة (مفعل بالبريد).`
      : otpMethod === 'PHONE'
      ? `سجل ${user.name} حساباً جديداً بالمنصة وتم تفعيل رقمه ${user.phone}.`
      : `سجل ${user.name} حساباً جديداً بالمنصة (بدون تحقق).`;
      
    await prisma.adminNotification.create({
      data: {
        title: "مستخدم جديد",
        message: msg,
        type: "NEW_USER",
        link: `/admin/users`
      }
    });
  } catch (e) {
    console.error("Failed to notify admin", e);
  }
  return user;
}

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const email = rawData.email as string;
    const ip = await getClientIP();
    
    // IP-based limit (Global brute force protection)
    const ipLimit = await checkRateLimit({ key: `login_ip:${ip}`, limit: 20, windowMs: 15 * 60 * 1000 });
    if (!ipLimit.success) {
      return { error: "محاولات كثيرة جداً. يرجى الانتظار 15 دقيقة." };
    }

    if (email) {
      // Identifier-based limit (Account brute force protection)
      const rl = await checkRateLimit({ key: `login_email:${email}`, limit: 10, windowMs: 5 * 60 * 1000 });
      if (!rl.success) {
        return { error: "محاولات كثيرة. يرجى الانتظار قبل المحاولة مرة أخرى.", values: rawData };
      }
    }
    const validatedData = loginSchema.parse(rawData);

    // Get user to determine role for redirect and check suspension
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (user?.status === "SUSPENDED") {
      const platformSetting = await prisma.platformSetting.findUnique({ where: { id: "1" } });
      const whatsapp = platformSetting?.supportWhatsapp || "";
      return { error: `تم ايقاف حسابك تواصل مع الدعم عبر واتساب ${whatsapp}`, values: rawData };
    }

    const redirectTo = user?.role === "ADMIN" ? "/admin" : "/dashboard";

    const result = await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    if (result?.error) {
      return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة", values: rawData };
    }
    
    // Manual redirect after successful sign in
    redirect(redirectTo);
  } catch (error) {
    const rawData = Object.fromEntries(formData);
    if (error && typeof error === 'object' && ('errors' in error || 'issues' in error)) {
      const issues = (error as any).errors || (error as any).issues;
      if (Array.isArray(issues) && issues.length > 0) {
        return { error: issues[0].message, values: rawData };
      }
    }
    const isCredentialsError = 
      (error && typeof error === "object" && "type" in error && (error as any).type === "CredentialsSignin") ||
      (error instanceof Error && (error.message.includes("CredentialsSignin") || error.name === "CredentialsSignin"));

    if (isCredentialsError) {
      if ((error as any)?.cause?.err?.message === "UNVERIFIED") {
        return { error: "يرجى تفعيل حسابك أولاً. قم بإنشاء حساب بنفس البريد لإعادة إرسال الكود.", values: rawData };
      }
      return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة", values: rawData };
    }
    // Check if it's a NEXT_REDIRECT error thrown by Next.js or Auth.js
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as any).digest === "string" &&
      (error as any).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    // Return any other unexpected error safely to avoid 500 Internal Server Error
    return { error: "خطأ غير متوقع: " + (error instanceof Error ? error.message : String(error)), values: rawData };
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const email = rawData.email as string;
    const ip = await getClientIP();
    
    // Prevent Account creation spam by IP
    const ipLimit = await checkRateLimit({ key: `register_ip:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 });
    if (!ipLimit.success) {
      return { error: "لقد تجاوزت الحد المسموح للتسجيل من هذا الجهاز. يرجى المحاولة لاحقاً.", values: rawData };
    }

    if (email) {
      const rl = await checkRateLimit({ key: `register_email:${email}`, limit: 3, windowMs: 5 * 60 * 1000 });
      if (!rl.success) {
        return { error: "محاولات كثيرة. يرجى الانتظار قبل المحاولة مرة أخرى.", values: rawData };
      }
    }
    const validatedData = registerSchema.parse(rawData);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    const settings = await prisma.platformSetting.findUnique({ where: { id: "1" } });
    const enablePhoneOtp = settings?.enablePhoneOtp ?? true;
    const enableEmailOtp = settings?.enableEmailOtp ?? false;

    let isVerified = false;
    let requiresOtp: false | 'PHONE' | 'EMAIL' = false;

    if (!enablePhoneOtp && !enableEmailOtp) {
      isVerified = true;
    } else if (enablePhoneOtp && rawData.phone) {
      requiresOtp = 'PHONE';
    } else if (enableEmailOtp) {
      requiresOtp = 'EMAIL';
    } else {
      isVerified = true;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    if (existingUser) {
      return { error: "البريد الإلكتروني مستخدم بالفعل", values: rawData };
    }

    if (requiresOtp === 'EMAIL' || requiresOtp === 'PHONE') {
      const pendingData = {
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        phone: rawData.phone,
        otpCode,
        otpExpiry: otpExpiry.getTime(),
      };
      const cookieStore = await cookies();
      cookieStore.set("pending_registration", encryptData(pendingData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60, // 15 mins
      });

      if (requiresOtp === 'EMAIL') {
        const sent = await sendOTP(validatedData.email, otpCode);
        if (!sent) {
          return { error: "حدث خطأ أثناء إرسال كود التحقق. يرجى المحاولة لاحقاً.", values: rawData };
        }
      }
    } else {
      await createUserWithStore(validatedData, true, null);
    }

    return { requiresOtp, email: validatedData.email, phone: rawData.phone as string, values: rawData };
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    const rawData = Object.fromEntries(formData);
    if (error && typeof error === 'object' && ('errors' in error || 'issues' in error)) {
      const issues = (error as any).errors || (error as any).issues;
      if (Array.isArray(issues) && issues.length > 0) {
        return { error: issues[0].message, values: rawData };
      }
    }
    return { error: "خطأ داخلي: " + (error instanceof Error ? error.message : String(error)), values: rawData };
  }
}

export async function verifyOtpAction(email: string, otp: string) {
  try {
    const ip = await getClientIP();
    const rl = await checkRateLimit({ key: `otp_verify:${email}_${ip}`, limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rl.success) {
      return { error: "محاولات كثيرة. يرجى الانتظار قبل المحاولة مرة أخرى." };
    }

    const cookieStore = await cookies();
    const pendingCookie = cookieStore.get("pending_registration");
    if (!pendingCookie?.value) return { error: "انتهت صلاحية الجلسة، يرجى التسجيل من جديد" };

    const pendingData = decryptData(pendingCookie.value);
    if (!pendingData || pendingData.email !== email) return { error: "بيانات الجلسة غير صالحة" };

    if (pendingData.otpCode !== otp) return { error: "الكود غير صحيح" };
    if (pendingData.otpExpiry && pendingData.otpExpiry < Date.now()) return { error: "الكود منتهي الصلاحية" };

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { error: "تم التسجيل مسبقاً" };

    await createUserWithStore(pendingData, true, 'EMAIL');
    cookieStore.delete("pending_registration");

    return { success: true };
  } catch (error) {
    console.error("OTP VERIFY ERROR:", error);
    return { error: "حدث خطأ أثناء التحقق من الكود" };
  }
}

export async function verifyFirebaseTokenAction(email: string, idToken: string) {
  try {
    const ip = await getClientIP();
    const rl = await checkRateLimit({ key: `otp_firebase:${email}_${ip}`, limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rl.success) {
      return { error: "محاولات كثيرة. يرجى الانتظار قبل المحاولة مرة أخرى." };
    }

    const { adminAuth } = await import("@/lib/firebase-admin");
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    if (!decodedToken.phone_number) {
      return { error: "لم يتم العثور على رقم هاتف في التوثيق" };
    }

    const cookieStore = await cookies();
    const pendingCookie = cookieStore.get("pending_registration");
    if (!pendingCookie?.value) return { error: "انتهت صلاحية الجلسة، يرجى التسجيل من جديد" };

    const pendingData = decryptData(pendingCookie.value);
    if (!pendingData || pendingData.email !== email) return { error: "بيانات الجلسة غير صالحة" };

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { error: "تم التسجيل مسبقاً" };

    await createUserWithStore(pendingData, true, 'PHONE');
    cookieStore.delete("pending_registration");

    return { success: true };
  } catch (error) {
    console.error("Firebase Verify Error:", error);
    return { error: "فشل التحقق من رقم الهاتف. قد تكون الجلسة منتهية." };
  }
}
export async function forgotPasswordAction(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const rawEmail = rawData.email as string;
    const ip = await getClientIP();

    const ipLimit = await checkRateLimit({ key: `forgot_ip:${ip}`, limit: 5, windowMs: 30 * 60 * 1000 });
    if (!ipLimit.success) return { error: "لقد تجاوزت الحد المسموح. يرجى المحاولة بعد قليل." };

    if (rawEmail) {
      const rl = await checkRateLimit({ key: `forgot_email:${rawEmail}`, limit: 3, windowMs: 10 * 60 * 1000 });
      if (!rl.success) {
        return { error: "محاولات كثيرة. يرجى الانتظار قبل المحاولة مرة أخرى." };
      }
    }
    const { email } = await import("@/lib/validations").then(m => m.forgotPasswordSchema.parse(rawData));

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak whether user exists or not for security, just pretend it was sent.
      return { success: true, email };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { email },
      data: { otpCode, otpExpiry }
    });

    const { sendPasswordResetOTP } = await import("@/lib/email");
    const sent = await sendPasswordResetOTP(email, otpCode);
    
    if (!sent) {
      return { error: "حدث خطأ أثناء إرسال كود التحقق" };
    }

    return { success: true, email };
  } catch (error) {
    if (error && typeof error === 'object' && ('errors' in error || 'issues' in error)) {
      const issues = (error as any).errors || (error as any).issues;
      if (Array.isArray(issues) && issues.length > 0) {
        return { error: issues[0].message };
      }
    }
    return { error: "خطأ داخلي، يرجى المحاولة لاحقاً" };
  }
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const { email, otpCode, password } = await import("@/lib/validations").then(m => m.resetPasswordSchema.parse(rawData));

    const ip = await getClientIP();
    const rl = await checkRateLimit({ key: `reset_password:${email}_${ip}`, limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rl.success) {
      return { error: "محاولات كثيرة. يرجى الانتظار قبل المحاولة مرة أخرى." };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.otpCode !== otpCode) {
      return { error: "الكود غير صحيح" };
    }

    if (user.otpExpiry && user.otpExpiry < new Date()) {
      return { error: "الكود منتهي الصلاحية" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        otpCode: null, 
        otpExpiry: null,
        isVerified: true // verify them if they weren't
      }
    });

    return { success: true };
  } catch (error) {
    if (error && typeof error === 'object' && ('errors' in error || 'issues' in error)) {
      const issues = (error as any).errors || (error as any).issues;
      if (Array.isArray(issues) && issues.length > 0) {
        return { error: issues[0].message };
      }
    }
    return { error: "حدث خطأ أثناء تغيير كلمة المرور" };
  }
}
