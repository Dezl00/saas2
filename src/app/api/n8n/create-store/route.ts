import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // التحقق من مفتاح الـ API المرسل من N8N
    const authHeader = request.headers.get('authorization');
    const n8nApiKey = process.env.N8N_API_KEY || 'my-super-secret-n8n-key-123';
    
    if (authHeader !== `Bearer ${n8nApiKey}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { store_name, store_slug, logo_url, address, phone_number, whatsapp_number } = body;

    if (!store_name || !store_slug || !phone_number) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // تنظيف الـ Slug وتحويله لأحرف صغيرة
    const cleanSlug = store_slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    // التحقق من أن رابط المتجر غير مستخدم مسبقاً
    const existingStore = await prisma.store.findUnique({
        where: { subdomain: cleanSlug }
    });

    if (existingStore) {
        return NextResponse.json({ error: 'Store slug already exists' }, { status: 400 });
    }

    // إنشاء المستخدم والمتجر في نفس العملية (Transaction) لضمان عدم حدوث أخطاء
    const result = await prisma.$transaction(async (tx) => {
        // إنشاء كلمة مرور عشوائية بسيطة: رقم الهاتف
        const passwordHash = await bcrypt.hash(phone_number, 10);
        
        // بريد إلكتروني وهمي بناء على رابط المتجر
        const email = `admin@${cleanSlug}.com`;
        
        // البحث عن المستخدم باستخدام رقم الهاتف
        let user = await tx.user.findFirst({
            where: { phone: phone_number },
            include: { store: true } // نجلب متجره لنتأكد
        });

        // إذا كان المستخدم موجوداً ولديه متجر بالفعل، نرفض الطلب
        if (user && user.store) {
            throw new Error('USER_ALREADY_HAS_STORE');
        }

        // إذا لم يكن موجوداً نقوم بإنشائه
        if (!user) {
            user = await tx.user.create({
                data: {
                    name: store_name,
                    email: email,
                    password: passwordHash,
                    phone: phone_number,
                    role: 'OWNER',
                },
                include: { store: true }
            });
        }

        // إنشاء المتجر
        const store = await tx.store.create({
            data: {
                name: store_name,
                subdomain: cleanSlug,
                logo: logo_url || null,
                phone: phone_number,
                address: address || null,
                whatsappNumber: whatsapp_number || phone_number,
                userId: user.id,
                status: 'ACTIVE',
            }
        });

        // Fetch platform settings for trial days
        const settings = await tx.platformSetting.findFirst();
        const trialDays = settings?.trialDays ?? 7;

        // إنشاء اشتراك تجريبي لمدة حسب إعدادات المنصة
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + trialDays);

        await tx.subscription.create({
            data: {
                storeId: store.id,
                status: 'TRIAL',
                startDate,
                endDate,
            }
        });

        return { user, store };
    });

    // الرد الناجح الذي سيستلمه N8N
    return NextResponse.json({
        success: true,
        message: 'تم إنشاء المتجر بنجاح',
        data: {
            storeUrl: `https://${cleanSlug}.almenu.pro`, // رابط المنصة الحقيقي
            adminEmail: result.user.email,
            adminPassword: phone_number, // كلمة المرور هي رقم هاتف العميل
            storeName: result.store.name,
            whatsappNumber: result.store.whatsappNumber
        }
    });

  } catch (error: any) {
    console.error('Error creating store via N8N:', error);
    
    if (error.message === 'USER_ALREADY_HAS_STORE') {
        return NextResponse.json({ error: 'User with this phone number already owns a store' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
