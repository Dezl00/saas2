"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  Trash2,
  Phone,
  MapPin,
} from "lucide-react";
import {
  addGovernorate,
  updateGovernorate,
  deleteGovernorate,
  toggleGovernorate,
  addCity,
  updateCity,
  deleteCity,
  toggleCity,
} from "../actions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { SubmitButton } from "@/components/dashboard/SubmitButton";

interface City {
  id: string;
  name: string;
  deliveryFee: any;
  isActive: boolean;
  governorateId: string | null;
}

interface Governorate {
  id: string;
  name: string;
  whatsappNumber: string | null;
  uniformFee: any;
  isActive: boolean;
  sortOrder: number;
  cities: City[];
}

interface DeliveryAreasClientProps {
  governorates: Governorate[];
}

export function DeliveryAreasClient({
  governorates: initialGovernorates,
}: DeliveryAreasClientProps) {
  const [governorates, setGovernorates] = useState<Governorate[]>(initialGovernorates);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setGovernorates(initialGovernorates);
  }, [initialGovernorates]);

  // UI States
  const [isAddingGovernorate, setIsAddingGovernorate] = useState(false);
  const [editingGovernorateId, setEditingGovernorateId] = useState<string | null>(null);
  const [expandedGovIds, setExpandedGovIds] = useState<Set<string>>(new Set());
  const [addingCityToGovId, setAddingCityToGovId] = useState<string | null>(null);
  const [editingCityId, setEditingCityId] = useState<string | null>(null);

  const [deletingGov, setDeletingGov] = useState<Governorate | null>(null);
  const [deletingCity, setDeletingCity] = useState<{ city: City; govId: string } | null>(null);

  // Expand/Collapse
  const toggleExpand = (id: string) => {
    setExpandedGovIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // --- Governorate Actions ---

  const handleToggleGov = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      setGovernorates((prev) =>
        prev.map((g) => (g.id === id ? { ...g, isActive: !currentStatus } : g))
      );
      const res = await toggleGovernorate(id);
      if (res?.error) {
        toast.error(res.error);
        setGovernorates((prev) =>
          prev.map((g) => (g.id === id ? { ...g, isActive: currentStatus } : g))
        );
      } else if (res?.success) {
        toast.success(res.success);
      }
    });
  };

  const handleAddGov = async (formData: FormData) => {
    const res = await addGovernorate(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(res?.success || "تمت الإضافة بنجاح");
      setIsAddingGovernorate(false);
    }
  };

  const handleUpdateGov = async (id: string, formData: FormData) => {
    const res = await updateGovernorate(id, formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(res?.success || "تم التحديث بنجاح");
      setEditingGovernorateId(null);
    }
  };

  const handleDeleteGov = async () => {
    if (!deletingGov) return;
    const res = await deleteGovernorate(deletingGov.id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(res?.success || "تم الحذف بنجاح");
    }
    setDeletingGov(null);
  };

  // --- City Actions ---

  const handleToggleCity = (govId: string, cityId: string, currentStatus: boolean) => {
    startTransition(async () => {
      setGovernorates((prev) =>
        prev.map((g) =>
          g.id === govId
            ? {
                ...g,
                cities: g.cities.map((c) =>
                  c.id === cityId ? { ...c, isActive: !currentStatus } : c
                ),
              }
            : g
        )
      );
      const res = await toggleCity(cityId);
      if (res?.error) {
        toast.error(res.error);
        setGovernorates((prev) =>
          prev.map((g) =>
            g.id === govId
              ? {
                  ...g,
                  cities: g.cities.map((c) =>
                    c.id === cityId ? { ...c, isActive: currentStatus } : c
                  ),
                }
              : g
          )
        );
      } else if (res?.success) {
        toast.success(res.success);
      }
    });
  };

  const handleAddCity = async (govId: string, formData: FormData) => {
    formData.append("governorateId", govId);
    const res = await addCity(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(res?.success || "تمت إضافة المدينة بنجاح");
      setAddingCityToGovId(null);
    }
  };

  const handleUpdateCity = async (cityId: string, formData: FormData) => {
    const res = await updateCity(cityId, formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(res?.success || "تم تحديث المدينة بنجاح");
      setEditingCityId(null);
    }
  };

  const handleDeleteCity = async () => {
    if (!deletingCity) return;
    const res = await deleteCity(deletingCity.city.id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(res?.success || "تم الحذف بنجاح");
    }
    setDeletingCity(null);
  };

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-950">مناطق التوصيل</h1>
        <button
          onClick={() => {
            setIsAddingGovernorate(true);
            setEditingGovernorateId(null);
          }}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-3xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة محافظة</span>
        </button>
      </div>

      {/* Add Governorate Form */}
      {isAddingGovernorate && (
        <form
          action={handleAddGov}
          className="bg-white border-2 border-surface-200 rounded-3xl p-6 flex flex-col gap-4"
        >
          <h2 className="text-lg font-bold text-surface-950 mb-2">إضافة محافظة جديدة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium text-surface-950">
                اسم المحافظة *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="أدخل اسم المحافظة"
                className="border-2 border-surface-200 rounded-3xl px-4 py-2 focus:border-primary-500 focus:outline-none w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="whatsappNumber" className="text-sm font-medium text-surface-950">
                رقم الواتساب (اختياري)
              </label>
              <input
                type="text"
                id="whatsappNumber"
                name="whatsappNumber"
                placeholder="مثال: +201000000000"
                className="border-2 border-surface-200 rounded-3xl px-4 py-2 focus:border-primary-500 focus:outline-none w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="uniformFee" className="text-sm font-medium text-surface-950">
                سعر موحد (اختياري)
              </label>
              <input
                type="number"
                step="0.01"
                id="uniformFee"
                name="uniformFee"
                placeholder="0.00"
                className="border-2 border-surface-200 rounded-3xl px-4 py-2 focus:border-primary-500 focus:outline-none w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <SubmitButton className="rounded-3xl px-8">حفظ</SubmitButton>
            <button
              type="button"
              onClick={() => setIsAddingGovernorate(false)}
              className="bg-surface-100 text-surface-700 hover:bg-surface-200 px-6 py-2 rounded-3xl transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Governorates List */}
      <div className="flex flex-col gap-4">
        {governorates.length === 0 ? (
          <div className="bg-surface-50 border-2 border-surface-200 rounded-3xl flex flex-col items-center justify-center py-16 gap-4 text-surface-500">
            <MapPin className="w-12 h-12 text-surface-400" />
            <p className="text-lg font-medium">لم تقم بإضافة أي محافظات بعد</p>
          </div>
        ) : (
          governorates.map((gov) => {
            const isExpanded = expandedGovIds.has(gov.id);
            const isEditingGov = editingGovernorateId === gov.id;

            return (
              <div key={gov.id} className="bg-white border-2 border-surface-200 rounded-3xl overflow-hidden">
                {/* Header / Edit Form */}
                {isEditingGov ? (
                  <form
                    action={(formData) => handleUpdateGov(gov.id, formData)}
                    className="p-6 flex flex-col gap-4 border-b-2 border-surface-100"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-surface-950">اسم المحافظة *</label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={gov.name}
                          required
                          className="border-2 border-surface-200 rounded-3xl px-4 py-2 focus:border-primary-500 focus:outline-none w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-surface-950">رقم الواتساب</label>
                        <input
                          type="text"
                          name="whatsappNumber"
                          defaultValue={gov.whatsappNumber || ""}
                          className="border-2 border-surface-200 rounded-3xl px-4 py-2 focus:border-primary-500 focus:outline-none w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-surface-950">سعر موحد</label>
                        <input
                          type="number"
                          step="0.01"
                          name="uniformFee"
                          defaultValue={gov.uniformFee?.toString() || ""}
                          className="border-2 border-surface-200 rounded-3xl px-4 py-2 focus:border-primary-500 focus:outline-none w-full"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <SubmitButton className="rounded-3xl px-6">حفظ التغييرات</SubmitButton>
                      <button
                        type="button"
                        onClick={() => setEditingGovernorateId(null)}
                        className="bg-surface-100 text-surface-700 hover:bg-surface-200 px-6 py-2 rounded-3xl transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 sm:p-6 flex items-center justify-between hover:bg-surface-50 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleGov(gov.id, gov.isActive)}
                        className={`relative h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
                          gov.isActive ? "bg-success-500" : "bg-surface-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                            gov.isActive ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span className="text-lg font-bold text-surface-950">{gov.name}</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {gov.uniformFee !== null && gov.uniformFee !== undefined && (
                            <span className="bg-primary-50 text-primary-600 px-3 py-1 rounded-3xl text-sm font-medium border-2 border-primary-100">
                              سعر موحد: {gov.uniformFee.toString()}
                            </span>
                          )}
                          {gov.whatsappNumber && (
                            <span className="flex items-center gap-1 bg-surface-100 text-surface-700 px-3 py-1 rounded-3xl text-sm font-medium border-2 border-surface-200">
                              <Phone className="w-3 h-3" />
                              {gov.whatsappNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setEditingGovernorateId(gov.id)}
                        className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeletingGov(gov)}
                        className="p-2 text-surface-500 hover:text-error-600 hover:bg-error-50 rounded-full transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toggleExpand(gov.id)}
                        className="p-2 text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-full transition-colors ml-2"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Cities List (Expanded) */}
                {isExpanded && (
                  <div className="border-t-2 border-surface-100 bg-surface-50 p-4 sm:p-6 flex flex-col gap-4">
                    {gov.cities.length === 0 && !addingCityToGovId ? (
                      <p className="text-surface-500 text-center py-4">لا توجد مدن مضافة بعد.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {gov.cities.map((city) => (
                          <div key={city.id}>
                            {editingCityId === city.id ? (
                              <form
                                action={(formData) => handleUpdateCity(city.id, formData)}
                                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-4 rounded-3xl border-2 border-surface-200"
                              >
                                <input
                                  type="text"
                                  name="name"
                                  defaultValue={city.name}
                                  required
                                  placeholder="اسم المدينة"
                                  className="border-2 border-surface-200 rounded-3xl px-4 py-2 focus:border-primary-500 focus:outline-none flex-1 w-full"
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  name="fee"
                                  defaultValue={city.deliveryFee?.toString()}
                                  required
                                  placeholder="سعر التوصيل"
                                  className="border-2 border-surface-200 rounded-3xl px-4 py-2 focus:border-primary-500 focus:outline-none w-full sm:w-32"
                                />
                                <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                                  <SubmitButton className="rounded-3xl px-6 w-full sm:w-auto">حفظ</SubmitButton>
                                  <button
                                    type="button"
                                    onClick={() => setEditingCityId(null)}
                                    className="bg-surface-100 text-surface-700 hover:bg-surface-200 px-4 py-2 rounded-3xl transition-colors w-full sm:w-auto"
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <div className="flex items-center justify-between bg-white p-4 rounded-3xl border-2 border-surface-200 hover:border-primary-200 transition-colors">
                                <div className="flex items-center gap-4">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCity(gov.id, city.id, city.isActive)}
                                    className={`relative h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
                                      city.isActive ? "bg-success-500" : "bg-surface-300"
                                    }`}
                                  >
                                    <span
                                      className={`absolute top-1 left-1 inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                                        city.isActive ? "translate-x-5" : "translate-x-0"
                                      }`}
                                    />
                                  </button>
                                  <span className="font-bold text-surface-950">{city.name}</span>
                                  <span className="bg-surface-100 text-surface-700 px-3 py-1 rounded-3xl text-sm font-medium border-2 border-surface-200">
                                    {city.deliveryFee?.toString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setEditingCityId(city.id)}
                                    className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingCity({ city, govId: gov.id })}
                                    className="p-2 text-surface-500 hover:text-error-600 hover:bg-error-50 rounded-full transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add City Inline Form */}
                    {addingCityToGovId === gov.id ? (
                      <form
                        action={(formData) => handleAddCity(gov.id, formData)}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-4 rounded-3xl border-2 border-primary-200 mt-2"
                      >
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="اسم المدينة *"
                          className="border-2 border-surface-200 rounded-3xl px-4 py-2 focus:border-primary-500 focus:outline-none flex-1 w-full"
                        />
                        <input
                          type="number"
                          step="0.01"
                          name="fee"
                          required
                          placeholder="سعر التوصيل *"
                          className="border-2 border-surface-200 rounded-3xl px-4 py-2 focus:border-primary-500 focus:outline-none w-full sm:w-40"
                        />
                        <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                          <SubmitButton className="rounded-3xl px-6 w-full sm:w-auto">إضافة</SubmitButton>
                          <button
                            type="button"
                            onClick={() => setAddingCityToGovId(null)}
                            className="bg-surface-100 text-surface-700 hover:bg-surface-200 px-4 py-2 rounded-3xl transition-colors w-full sm:w-auto"
                          >
                            إلغاء
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setAddingCityToGovId(gov.id)}
                        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium py-2 px-4 rounded-3xl hover:bg-primary-50 self-start transition-colors mt-2"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة مدينة
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <ConfirmModal
        isOpen={!!deletingGov}
        title="حذف المحافظة"
        description={`هل أنت متأكد من حذف محافظة "${deletingGov?.name}"؟ سيتم حذف جميع المدن التابعة لها أيضاً.`}
        onConfirm={handleDeleteGov}
        onCancel={() => setDeletingGov(null)}
      />

      <ConfirmModal
        isOpen={!!deletingCity}
        title="حذف المدينة"
        description={`هل أنت متأكد من حذف مدينة "${deletingCity?.city.name}"؟`}
        onConfirm={handleDeleteCity}
        onCancel={() => setDeletingCity(null)}
      />
    </div>
  );
}
