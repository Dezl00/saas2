import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";

export const maxDuration = 60; // Allow up to 60 seconds

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && !session.user.storeId) {
      return NextResponse.json({ error: "غير مصرح لك بالقيام بهذه العملية" }, { status: 401 });
    }

    const ip = await getClientIP();
    const rl = await checkRateLimit({ key: `ai_scan_${session.user.storeId || session.user.id}_${ip}`, limit: 5, windowMs: 60 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "تم تجاوز الحد المسموح من طلبات الذكاء الاصطناعي. يرجى المحاولة لاحقاً." },
        { status: 429, headers: { 'Retry-After': Math.ceil(rl.resetIn / 1000).toString() } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File;
    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: "الرجاء إرفاق صورة صالحة" }, { status: 400 });
    }

    const keysString = process.env.GEMINI_API_KEYS;
    if (!keysString) {
      return NextResponse.json({ error: "مفاتيح GEMINI_API_KEYS غير موجودة في إعدادات البيئة." }, { status: 500 });
    }
    const apiKeys = keysString.split(",").map(k => k.trim()).filter(k => k.length > 0);

    if (apiKeys.length === 0) {
      return NextResponse.json({ error: "لا توجد مفاتيح صالحة." }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");

    const prompt = `أنت مساعد ذكي متخصص في قراءة قوائم الطعام (Menus). 
قم بتحليل صورة قائمة الطعام المرفقة واستخراج جميع الأقسام والأصناف والأسعار منها بدقة عالية. 
إذا وجدت وصفاً للصنف قم بإضافته، وإذا لم تجد اتركه فارغاً. 
تأكد من أن الأسعار أرقام صحيحة (أو عشرية) بدون رموز العملة.
إذا كان للصنف أحجام مختلفة بأسعار مختلفة (مثل: صغير، وسط، كبير)، ضع السعر الأساسي (أو الأصغر) في حقل price، وأضف مصفوفة sizes تحتوي على اسم الحجم وسعره. إذا لم يكن هناك أحجام، اترك المصفوفة فارغة.

أرجع النتيجة بصيغة JSON فقط، بدون أي نصوص إضافية وبدون علامات \`\`\`json.
يجب أن يكون الـ JSON بهذا الهيكل تماماً:
{
  "categories": [
    {
      "name": "اسم القسم (مثال: المشويات)",
      "items": [
        {
          "name": "اسم الصنف",
          "description": "وصف الصنف إن وجد",
          "price": 100,
          "sizes": [
            { "name": "وسط", "price": 150 },
            { "name": "كبير", "price": 200 }
          ]
        }
      ]
    }
  ]
}`;

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
    ];

    let responseText = "";
    let lastError: any = null;

    // Loop through all provided API keys
    for (const apiKey of apiKeys) {
      console.log("Trying API Key starting with:", apiKey.substring(0, 8));
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      try {
        const result = await model.generateContent([prompt, ...imageParts]);
        responseText = result.response.text();
        break; // Success! Break the key loop
      } catch (modelError: any) {
        lastError = modelError;
        const msg = modelError.message || "";
        console.error(`Key ${apiKey.substring(0, 8)} failed:`, msg);
        
        if (msg.includes("429") || msg.includes("quota") || msg.includes("API_KEY_INVALID")) {
          console.log("Key quota exceeded or invalid, switching to the next key...");
          continue; // Try next key
        }

        if (msg.includes("503") || msg.includes("Service Unavailable")) {
          // If it's a server overload, switching keys won't help. 
          // We break and tell the user to wait.
          break;
        }
        
        // Other errors (e.g. 404), maybe we should throw or continue? We will break.
        break;
      }
    }

    if (!responseText) {
      const errMsg = lastError?.message || "";
      if (errMsg.includes("429") || errMsg.includes("quota")) {
        return NextResponse.json({ error: "تم تجاوز الحصة لجميع المفاتيح المتاحة! الرجاء المحاولة غداً." }, { status: 429 });
      }
      if (errMsg.includes("503") || errMsg.includes("Service Unavailable")) {
        return NextResponse.json({ error: "سيرفرات جوجل تواجه ضغطاً عالياً حالياً. يرجى المحاولة بعد قليل." }, { status: 503 });
      }
      return NextResponse.json({ error: `خطأ من الذكاء الاصطناعي: ${errMsg}` }, { status: 500 });
    }
    
    // تنظيف النص لاحتمال وجود علامات markdown
    const cleanText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    try {
      const parsedData = JSON.parse(cleanText);
      
      if (!parsedData || !Array.isArray(parsedData.categories)) {
        return NextResponse.json({ error: "لم يتم التعرف على هيكل المنيو بشكل صحيح." }, { status: 400 });
      }

      if (parsedData.categories.length === 0) {
        return NextResponse.json({ error: "لم نتمكن من استخراج أي أصناف من الصورة." }, { status: 400 });
      }

      const totalItems = parsedData.categories.reduce((acc: number, cat: any) => acc + (cat.items?.length || 0), 0);
      if (totalItems === 0) {
        return NextResponse.json({ error: "البيانات المستخرجة غير مكتملة." }, { status: 400 });
      }

      return NextResponse.json({ success: true, data: parsedData });

    } catch (parseError) {
      console.error("Failed to parse JSON:", cleanText);
      return NextResponse.json({ error: "حدث خطأ أثناء معالجة بيانات المنيو." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("AI Scan Error:", error);
    return NextResponse.json({ error: `خطأ أثناء الاتصال: ${error.message || "سبب غير معروف"}` }, { status: 500 });
  }
}
