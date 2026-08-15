import { v2 as cloudinary } from 'cloudinary';

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dw7senbmg",
    api_key: process.env.CLOUDINARY_API_KEY || "158265941332155",
    api_secret: process.env.CLOUDINARY_API_SECRET || "mBJcsqsgRlp9nuR0rMAquNp6E8s",
  });
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  configureCloudinary();
  if (file.size > 5 * 1024 * 1024) throw new Error('حجم الملف يتجاوز الحد المسموح (5 ميجابايت)');
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) throw new Error('نوع الملف غير مدعوم');

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Convert buffer to Base64 string for Cloudinary upload
  const base64String = buffer.toString('base64');
  const dataUri = `data:${file.type};base64,${base64String}`;

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      dataUri,
      { folder: 'almenu' },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          reject(error || new Error("Failed to upload image"));
        } else {
          resolve(result.secure_url);
        }
      }
    );
  });
}

export async function uploadUrlToCloudinary(url: string): Promise<string> {
  configureCloudinary();
  try {
    // Fetch the image to our server first to avoid Cloudinary IP bans from free AI generators
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/jpeg, image/png, image/webp, image/*;q=0.8'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("يوجد ضغط كبير على سيرفر الذكاء الاصطناعي حالياً. يرجى المحاولة بعد دقيقة.");
      }
      throw new Error(`فشل جلب الصورة (${response.status})`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      throw new Error("الرابط لا يحتوي على صورة صالحة");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    if (buffer.length > 10 * 1024 * 1024) {
      throw new Error("حجم الصورة يتجاوز الحد المسموح (10 ميجابايت)");
    }
    
    const base64String = buffer.toString('base64');
    const dataUri = `data:${contentType};base64,${base64String}`;

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUri,
        { folder: 'almenu' },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary upload error:", error);
            reject(new Error("فشل حفظ الصورة في الخادم السحابي"));
          } else {
            resolve(result.secure_url);
          }
        }
      );
    });
  } catch (error: any) {
    console.error("uploadUrlToCloudinary error:", error);
    throw error;
  }
}

export async function deleteImageFromCloudinary(url: string): Promise<void> {
  configureCloudinary();
  if (!url || !url.includes('cloudinary.com')) return;
  try {
    const parts = url.split('/');
    const filenameWithExt = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const filename = filenameWithExt.split('.')[0];
    const publicId = `${folder}/${filename}`;
    
    await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
  }
}