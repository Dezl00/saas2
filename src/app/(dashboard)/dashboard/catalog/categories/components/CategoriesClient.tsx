import { useState, useTransition, useRef, useEffect } from "react";
import { LayoutGrid, GripVertical, Check, X, Edit2, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import toast from "react-hot-toast";
import { toggleCategoryStatus } from "../actions/toggle-category-status";
import { updateCategoryName } from "../actions/update-category-name";
import { reorderCategories } from "../actions/reorder-categories";
import { deleteCategory } from "../actions/delete-category";
import { createCategory } from "../actions/create-category";
import { updateCategory } from "../actions/update-category";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { updateCategoryImage, uploadCategoryImage } from "../actions/update-category-image";
import { SubmitButton } from "@/components/dashboard/SubmitButton";
import { ImageUpload } from "@/components/dashboard/ImageUpload";

interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: { items: number };
}

interface CategoriesClientProps {
  initialCategories: Category[];
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editCategoryData, setEditCategoryData] = useState<Category | null>(null);
  
  // Sync state when props change (from server actions revalidating)
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newCategories = Array.from(categories);
    const [reorderedItem] = newCategories.splice(sourceIndex, 1);
    newCategories.splice(destinationIndex, 0, reorderedItem);

    setCategories(newCategories);

    startTransition(async () => {
      const result = await reorderCategories(newCategories.map(c => c.id));
      if (result?.error) toast.error(result.error);
    });
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    setCategories(prev => 
      prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c)
    );

    startTransition(async () => {
      const result = await toggleCategoryStatus(id, currentStatus);
      if (result?.error) {
        toast.error(result.error);
        setCategories(prev => 
          prev.map(c => c.id === id ? { ...c, isActive: currentStatus } : c)
        );
      }
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);

    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("تم حذف القسم");
        if (editCategoryData?.id === id) {
          setFormMode("create");
          setEditCategoryData(null);
        }
      }
    });
  };

  const startEdit = (category: Category) => {
    setFormMode("edit");
    setEditCategoryData(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setFormMode("create");
    setEditCategoryData(null);
  };

  const handleFormAction = async (formData: FormData) => {
    if (formMode === "edit" && editCategoryData) {
      const result = await updateCategory(editCategoryData.id, formData);
      if (result.success) {
        toast.success(result.success);
        setFormMode("create");
        setEditCategoryData(null);
      } else {
        toast.error(result.error);
      }
    } else {
      const result = await createCategory(formData);
      if (result.success) {
        toast.success(result.success);
        document.getElementById("categoryForm")?.closest("form")?.reset();
      } else {
        toast.error(result.error);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white border-2 border-surface-100 rounded-[32px] p-6 lg:p-8 sticky top-36">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-surface-950 flex items-center gap-2">
              {formMode === "create" ? (
                <><Plus className="w-5 h-5 text-primary-600" /> إضافة قسم جديد</>
              ) : (
                <><Edit2 className="w-5 h-5 text-primary-600" /> تعديل القسم</>
              )}
            </h3>
            {formMode === "edit" && (
              <button onClick={cancelEdit} className="text-sm text-surface-500 hover:text-surface-950">
                إلغاء
              </button>
            )}
          </div>
          
          <form 
            id="categoryForm"
            key={editCategoryData?.id || "new"} 
            action={handleFormAction} 
            className="space-y-4"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-surface-950 mb-2">
                اسم القسم *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={editCategoryData?.name || ""}
                placeholder="مثال: مقبلات، مشويات"
                className="w-full px-4 py-3 bg-white border-2 border-surface-200 rounded-[24px] text-surface-950 focus:border-primary-500 focus:outline-none transition-colors font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-surface-950 mb-2">
                صورة القسم
              </label>
              {editCategoryData?.image && (
                <div className="mb-3">
                  <span className="block text-xs text-surface-500 mb-2">الصورة الحالية:</span>
                  <div className="relative w-16 h-16 rounded-[16px] overflow-hidden border border-surface-200">
                    <Image src={editCategoryData.image} alt={editCategoryData.name} fill className="object-cover" />
                  </div>
                </div>
              )}
              <div className="bg-white border-2 border-surface-200 rounded-[24px] overflow-hidden p-4">
                <ImageUpload name="imageFile" label={editCategoryData?.image ? "تغيير الصورة" : "اختر صورة للقسم"} />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-bold text-surface-950 mb-2">
                الوصف (اختياري)
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={editCategoryData?.description || ""}
                className="w-full px-4 py-3 bg-white border-2 border-surface-200 rounded-[24px] text-surface-950 focus:border-primary-500 focus:outline-none transition-colors font-medium"
              />
            </div>

            <SubmitButton
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[24px] font-bold transition-all text-lg mt-2"
            >
              {formMode === "create" ? "حفظ القسم" : "تحديث القسم"}
            </SubmitButton>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        {categories.length === 0 ? (
          <div className="border-2 border-surface-100 rounded-[32px] p-12 text-center flex flex-col items-center justify-center bg-white">
            <LayoutGrid className="w-16 h-16 text-surface-300 mb-4" />
            <p className="text-lg font-medium text-surface-500">لم تقم بإضافة أي أقسام بعد.</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="categories">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {categories.map((category, index) => (
                    <Draggable key={category.id} draggableId={category.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "bg-white border-2 rounded-[24px] p-5 transition-colors flex flex-col relative cursor-pointer",
                            snapshot.isDragging ? "border-primary-500  z-50" : "border-surface-100 hover:border-surface-200",
                            editCategoryData?.id === category.id && "border-primary-500"
                          )}
                          onClick={() => startEdit(category)}
                        >
                          <div 
                            {...provided.dragHandleProps}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-4 left-4 p-1.5 text-surface-300 hover:text-surface-600 hover:bg-surface-50 rounded-[24px] cursor-grab active:cursor-grabbing transition-colors"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>

                          <div className="flex items-start justify-between mb-4 pr-1 pl-10">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="shrink-0 relative w-16 h-16 rounded-full overflow-hidden border-2 border-surface-200 bg-surface-50 flex items-center justify-center">
                                {category.image ? (
                                  <Image src={category.image} alt={category.name} fill className="object-cover" />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-surface-300" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[64px]">
                                <h4 className="font-bold text-surface-950 text-xl line-clamp-1">
                                  {category.name}
                                </h4>
                                {category.description && (
                                  <p className="text-sm text-surface-500 mt-1 line-clamp-2 font-medium">{category.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-auto pt-4 border-t-2 border-surface-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleToggle(category.id, category.isActive); }}
                                className={cn(
                                  "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none",
                                  category.isActive ? 'bg-success-500' : 'bg-surface-200'
                                )}
                              >
                                <span
                                  className={cn(
                                    "inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out ",
                                    category.isActive ? '-translate-x-6' : '-translate-x-1'
                                  )}
                                />
                              </button>
                              <span className="inline-flex items-center px-3 py-1 rounded-[24px] text-xs font-bold bg-surface-50 text-surface-600 border border-surface-100">
                                {category._count.items} أصناف
                              </span>
                            </div>
                            
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteId(category.id); }}
                              className="p-2 text-surface-400 hover:text-error-600 hover:bg-error-50 rounded-[24px] transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="حذف القسم"
        description="هل أنت متأكد من حذف هذا القسم؟ سيتم حذفه فقط إذا كان لا يحتوي على منتجات."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isPending}
      />
    </div>
  );
}

