import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { CustomDomainWizard } from "@/components/dashboard/CustomDomainWizard";
import { Globe, Store, Save, Share2, MessageCircle, Clock, MapPin } from "lucide-react";
import { updateStoreSettings, updateSubdomain, updateContactSettings } from "./actions";
import { SubmitButton } from "@/components/dashboard/SubmitButton";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { ClientForm } from "@/components/dashboard/ClientForm";

export const metadata = {
  title: "إعدادات المتجر | لوحة التحكم",
};

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user?.storeId) {
    return null;
  }

  const store = await prisma.store.findUnique({
    where: { id: session.user.storeId },
    include: { domains: true }
  });

  if (!store) return null;

  return (
    <div className="animate-fade-in pb-10">
      <Breadcrumb title="إعدادات المتجر" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        
        {/* إعدادات الرابط (Subdomain) */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 start-0 w-1 h-full bg-primary-500"></div>
          
          <h3 className="text-xl font-bold text-surface-950 mb-2 flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary-500" />
            رابط المتجر (Subdomain)
          </h3>
          <p className="text-surface-500 text-sm mb-6">
            اختر الرابط الخاص بمتجرك والذي ستقوم بمشاركته مع عملائك.
          </p>

          <ClientForm action={updateSubdomain as any} className="max-w-xl">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label htmlFor="subdomain" className="block text-sm font-medium text-surface-950 mb-1">
                  رابط المتجر
                </label>
                <div className="flex items-center" dir="ltr">
                  <span className="px-4 py-2.5 bg-surface-100 border border-e-0 border-surface-200 rounded-s-xl text-surface-600 font-medium">
                    https://
                  </span>
                  <input
                    type="text"
                    id="subdomain"
                    name="subdomain"
                    defaultValue={store.subdomain || ""}
                    placeholder="my-restaurant"
                    required
                    pattern="[a-z0-9-]+"
                    title="الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطة فقط وبدون مسافات."
                    className="w-full px-3 py-2.5 bg-white border border-surface-200 text-surface-950 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                  />
                  <span className="px-4 py-2.5 bg-surface-100 border border-s-0 border-surface-200 rounded-e-xl text-surface-600 font-medium whitespace-nowrap">
                    .menura.site
                  </span>
                </div>
              </div>
              <SubmitButton
                className="py-2.5 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all whitespace-nowrap"
              >
                تحديث الرابط
              </SubmitButton>
            </div>
            {store.subdomain && (
              <div className="mt-4 p-4 bg-success-50 text-success-800 rounded-xl border border-success-200 text-sm">
                متجرك متاح حالياً للعملاء عبر الرابط: <br/>
                <a href={`https://${store.subdomain}.menura.site`} target="_blank" className="font-bold underline mt-1 inline-block" dir="ltr">
                  https://{store.subdomain}.menura.site
                </a>
              </div>
            )}
          </ClientForm>
        </div>

        {/* إعدادات الدومين الخاص (Custom Domain) */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 start-0 w-1 h-full bg-indigo-500"></div>
          
          <h3 className="text-xl font-bold text-surface-950 mb-2 flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-500" />
            الدومين الخاص (Custom Domain)
          </h3>
          <p className="text-surface-500 text-sm mb-6">
            اربط متجرك بدومينك الخاص (مثل www.your-restaurant.com) لتعزيز علامتك التجارية.
          </p>

          <CustomDomainWizard initialDomain={store.domains?.[0]} />
        </div>

        {/* الإعدادات الأساسية */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 lg:col-span-2">
          <h3 className="text-xl font-bold text-surface-950 mb-6 flex items-center gap-2">
            <Store className="w-6 h-6 text-surface-700" />
            البيانات الأساسية
          </h3>
          
          <ClientForm action={updateStoreSettings as any} className="space-y-4">
            <div>
              <label htmlFor="store_name" className="block text-sm font-medium text-surface-950 mb-1">
                اسم المتجر *
              </label>
              <input
                type="text"
                id="store_name"
                name="name"
                defaultValue={store.name}
                required
                className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-950 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
              />
            </div>

            <div>
              <ImageUpload name="logo" label="شعار المتجر (Logo)" defaultValue={store.logo} />
            </div>

            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-surface-950 mb-1">اللون الرئيسي للمتجر</label>
              <div className="flex items-center gap-3 bg-surface-50 p-2 rounded-xl border border-surface-200">
                <input
                  type="color"
                  id="primaryColor"
                  name="primaryColor"
                  defaultValue={store.primaryColor || "#000000"}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0 shrink-0"
                />
                <span className="text-sm font-medium text-surface-600" dir="ltr">{store.primaryColor || "#000000"}</span>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-surface-950 mb-1">
                وصف المتجر
              </label>
              <textarea
                id="description"
                name="description"
                defaultValue={store.description || ""}
                rows={3}
                placeholder="نبذة مختصرة عن المتجر تظهر للعملاء..."
                className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-surface-950 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-surface-950 mb-1">
                  رقم الهاتف
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  defaultValue={store.phone || ""}
                  dir="ltr"
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-surface-950 text-end focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-surface-950 mb-1">
                  العملة
                </label>
                <select
                  id="currency"
                  name="currency"
                  defaultValue={store.currency}
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-surface-950 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                >
                  <option value="EGP">جنيه مصري (EGP)</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="AED">درهم إماراتي (AED)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-surface-950 mb-1">
                العنوان التفصيلي
              </label>
              <input
                type="text"
                id="address"
                name="address"
                defaultValue={store.address || ""}
                className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-surface-950 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="mapLatitude" className="block text-sm font-medium text-surface-950 mb-1">
                  خط العرض (Latitude)
                </label>
                <input
                  type="text"
                  id="mapLatitude"
                  name="mapLatitude"
                  defaultValue={(store as any).mapLatitude || ""}
                  dir="ltr"
                  placeholder="مثال: 24.7136"
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-surface-950 text-end focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="mapLongitude" className="block text-sm font-medium text-surface-950 mb-1">
                  خط الطول (Longitude)
                </label>
                <input
                  type="text"
                  id="mapLongitude"
                  name="mapLongitude"
                  defaultValue={(store as any).mapLongitude || ""}
                  dir="ltr"
                  placeholder="مثال: 46.6753"
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-surface-950 text-end focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <SubmitButton
              className="w-full sm:w-auto mt-6 py-3 px-8 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              حفظ التغييرات الأساسية
            </SubmitButton>
          </ClientForm>
        </div>

        {/* مواعيد العمل */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 start-0 w-1 h-full bg-amber-500"></div>
          
          <h3 className="text-xl font-bold text-surface-950 mb-2 flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            مواعيد العمل
          </h3>
          <p className="text-surface-500 text-sm mb-6">
            حدد مواعيد عمل متجرك لكل يوم من أيام الأسبوع. ستظهر هذه المواعيد للعملاء في صفحة المتجر.
          </p>

          <ClientForm action={updateStoreSettings as any} className="space-y-3">
            <input type="hidden" name="name" value={store.name} />
            <input type="hidden" name="primaryColor" value={store.primaryColor || ""} />
            <input type="hidden" name="currency" value={store.currency} />
            <input type="hidden" name="isWorkingHoursOnly" value="true" />
            {(() => {
              const workingHours = (store as any).workingHours || {};
              const days = [
                { key: "saturday", label: "السبت" },
                { key: "sunday", label: "الأحد" },
                { key: "monday", label: "الإثنين" },
                { key: "tuesday", label: "الثلاثاء" },
                { key: "wednesday", label: "الأربعاء" },
                { key: "thursday", label: "الخميس" },
                { key: "friday", label: "الجمعة" },
              ];
              return days.map((day) => {
                const dayData = workingHours[day.key] || { enabled: true, allDay: true };
                return (
                  <div key={day.key} className="flex flex-wrap items-center gap-3 p-3 bg-surface-50 rounded-xl border border-surface-100">
                    <label className="flex items-center gap-2 min-w-[100px]">
                      <input
                        type="checkbox"
                        name={`wh_${day.key}_enabled`}
                        value="on"
                        defaultChecked={dayData.enabled !== false}
                        className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-bold text-surface-800">{day.label}</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name={`wh_${day.key}_allDay`}
                        value="on"
                        defaultChecked={dayData.allDay !== false}
                        className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-xs text-surface-600">مفتوح طول اليوم</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        name={`wh_${day.key}_from`}
                        defaultValue={dayData.from || "09:00"}
                        className="px-2 py-1 text-xs border border-surface-200 rounded-lg bg-white text-surface-700"
                      />
                      <span className="text-xs text-surface-400">إلى</span>
                      <input
                        type="time"
                        name={`wh_${day.key}_to`}
                        defaultValue={dayData.to || "23:00"}
                        className="px-2 py-1 text-xs border border-surface-200 rounded-lg bg-white text-surface-700"
                      />
                    </div>
                  </div>
                );
              });
            })()}

            <SubmitButton
              className="w-full sm:w-auto mt-4 py-3 px-8 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              حفظ مواعيد العمل
            </SubmitButton>
          </ClientForm>
        </div>

        {/* بيانات التواصل والسوشيال ميديا */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 lg:col-span-2">
          <h3 className="text-xl font-bold text-surface-950 mb-6 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-surface-700" />
            بيانات التواصل والسوشيال ميديا
          </h3>

          <ClientForm action={updateContactSettings as any} className="space-y-6">
            
            <div className="bg-success-50/50 p-6 rounded-2xl border border-success-100">
              <h4 className="font-bold text-surface-950 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-success-600" />
                استقبال الطلبات عبر واتساب
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="whatsappNumber" className="block text-sm font-medium text-surface-950 mb-1">
                    رقم الواتساب
                  </label>
                  <input
                    type="text"
                    id="whatsappNumber"
                    name="whatsappNumber"
                    placeholder="01012345678"
                    defaultValue={store.whatsappNumber || ""}
                    dir="ltr"
                    className="w-full px-3 py-2 bg-white border border-surface-200 rounded-xl text-surface-950 text-end focus:ring-2 focus:ring-success-500/20 focus:border-success-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-4 pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="enableWhatsappOrders" 
                      value="on"
                      defaultChecked={store.enableWhatsappOrders}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full rtl:peer-checked:after:-translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-500"></div>
                    <span className="ms-3 text-sm font-medium text-surface-700">تفعيل توجيه الزبون للواتساب بعد إتمام الطلب</span>
                  </label>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="enablePushPopup" 
                      value="on"
                      defaultChecked={(store as any).enablePushPopup ?? true}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full rtl:peer-checked:after:-translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-500"></div>
                    <span className="ms-3 text-sm font-medium text-surface-700">تفعيل نافذة الاشتراك في الإشعارات بالموقع</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="facebookUrl" className="block text-sm font-medium text-surface-950">
                    رابط فيسبوك
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer" title="تفعيل/إلغاء تفعيل الأيقونة في المتجر">
                    <input 
                      type="checkbox" 
                      name="showFacebook" 
                      value="on"
                      defaultChecked={(store as any).showFacebook ?? true}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-surface-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full rtl:peer-checked:after:-translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success-500"></div>
                  </label>
                </div>
                <input
                  type="url"
                  id="facebookUrl"
                  name="facebookUrl"
                  defaultValue={store.facebookUrl || ""}
                  dir="ltr"
                  placeholder="https://facebook.com/..."
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-surface-950 text-end focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="instagramUrl" className="block text-sm font-medium text-surface-950">
                    رابط انستجرام
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer" title="تفعيل/إلغاء تفعيل الأيقونة في المتجر">
                    <input 
                      type="checkbox" 
                      name="showInstagram" 
                      value="on"
                      defaultChecked={(store as any).showInstagram ?? true}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-surface-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full rtl:peer-checked:after:-translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success-500"></div>
                  </label>
                </div>
                <input
                  type="url"
                  id="instagramUrl"
                  name="instagramUrl"
                  defaultValue={store.instagramUrl || ""}
                  dir="ltr"
                  placeholder="https://instagram.com/..."
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-surface-950 text-end focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="twitterUrl" className="block text-sm font-medium text-surface-950">
                    رابط X (تويتر)
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer" title="تفعيل/إلغاء تفعيل الأيقونة في المتجر">
                    <input 
                      type="checkbox" 
                      name="showTwitter" 
                      value="on"
                      defaultChecked={(store as any).showTwitter ?? true}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-surface-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full rtl:peer-checked:after:-translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success-500"></div>
                  </label>
                </div>
                <input
                  type="url"
                  id="twitterUrl"
                  name="twitterUrl"
                  defaultValue={store.twitterUrl || ""}
                  dir="ltr"
                  placeholder="https://x.com/..."
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-surface-950 text-end focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="tiktokUrl" className="block text-sm font-medium text-surface-950">
                    رابط تيك توك
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer" title="تفعيل/إلغاء تفعيل الأيقونة في المتجر">
                    <input 
                      type="checkbox" 
                      name="showTiktok" 
                      value="on"
                      defaultChecked={(store as any).showTiktok ?? true}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-surface-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full rtl:peer-checked:after:-translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success-500"></div>
                  </label>
                </div>
                <input
                  type="url"
                  id="tiktokUrl"
                  name="tiktokUrl"
                  defaultValue={store.tiktokUrl || ""}
                  dir="ltr"
                  placeholder="https://tiktok.com/@..."
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-surface-950 text-end focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="snapchatUrl" className="block text-sm font-medium text-surface-950">
                    رابط سناب شات
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer" title="تفعيل/إلغاء تفعيل الأيقونة في المتجر">
                    <input 
                      type="checkbox" 
                      name="showSnapchat" 
                      value="on"
                      defaultChecked={(store as any).showSnapchat ?? true}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-surface-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full rtl:peer-checked:after:-translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success-500"></div>
                  </label>
                </div>
                <input
                  type="url"
                  id="snapchatUrl"
                  name="snapchatUrl"
                  defaultValue={store.snapchatUrl || ""}
                  dir="ltr"
                  placeholder="https://snapchat.com/add/..."
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-surface-950 text-end focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <SubmitButton
              className="mt-6 w-full sm:w-auto py-3 px-8 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              حفظ بيانات التواصل
            </SubmitButton>
          </ClientForm>
        </div>

      </div>
    </div>
  );
}

