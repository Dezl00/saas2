"use client";

import { useState, useTransition } from "react";
import { LayoutGrid, GripVertical, Check, X, Edit2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import toast from "react-hot-toast";
import { toggleCategoryStatus } from "../actions/toggle-category-status";
import { updateCategoryName } from "../actions/update-category-name";
import { reorderCategories } from "../actions/reorder-categories";
import { deleteCategory } from "../actions/delete-category";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { cn } from "@/lib/utils";
import { Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { updateCategoryImage, uploadCategoryImage } from "../actions/update-category-image";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    // Optimistic update
    setCategories(prev => 
      prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c)
    );

    startTransition(async () => {
      const result = await toggleCategoryStatus(id, currentStatus);
      if (result?.error) {
        toast.error(result.error);
        // Revert on error
        setCategories(prev => 
          prev.map(c => c.id === id ? { ...c, isActive: currentStatus } : c)
        );
      }
    });
  };

  const handleEditSave = (id: string) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }

    const oldName = categories.find(c => c.id === id)?.name || "";
    
    // Optimistic update
    setCategories(prev => 
      prev.map(c => c.id === id ? { ...c, name: editName.trim() } : c)
    );
    setEditingId(null);

    startTransition(async () => {
      const result = await updateCategoryName(id, editName.trim());
      if (result?.error) {
        toast.error(result.error);
        // Revert on error
        setCategories(prev => 
          prev.map(c => c.id === id ? { ...c, name: oldName } : c)
        );
      } else {
        toast.success("تم تحديث اسم القسم");
      }
    });
  };

  const handleImageUpload = (id: string, file: File) => {
    // We upload immediately when a file is selected
    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      
      const result = await uploadCategoryImage(id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.imageUrl) {
        setCategories(prev => 
          prev.map(c => c.id === id ? { ...c, image: result.imageUrl! } : c)
        );
        toast.success("تم تحديث صورة القسم");
      }
    });
  };

  const handleImageRemove = (id: string) => {
    startTransition(async () => {
      const oldImage = categories.find(c => c.id === id)?.image || null;
      setCategories(prev => prev.map(c => c.id === id ? { ...c, image: null } : c));

      const result = await updateCategoryImage(id, null);
      if (result?.error) {
        toast.error(result.error);
        setCategories(prev => prev.map(c => c.id === id ? { ...c, image: oldImage } : c));
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
        setCategories(prev => prev.filter(c => c.id !== id));
      }
    });
  };

  if (categories.length === 0) {
    return (
      <div className="border-2 border-surface-100 rounded-[32px] p-12 text-center flex flex-col items-center justify-center bg-white">
        <LayoutGrid className="w-16 h-16 text-surface-300 mb-4" />
        <p className="text-lg font-medium text-surface-500">لم تقم بإضافة أي أقسام بعد.</p>
      </div>
    );
  }

  return (
    <>
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
                        "bg-white border-2 rounded-[24px] p-5 transition-colors flex flex-col relative",
                        snapshot.isDragging ? "border-primary-500  z-50" : "border-surface-100 hover:border-surface-200"
                      )}
                    >
                      {/* Drag Handle */}
                      <div 
                        {...provided.dragHandleProps}
                        className="absolute top-4 left-4 p-1.5 text-surface-300 hover:text-surface-600 hover:bg-surface-50 rounded-[24px] cursor-grab active:cursor-grabbing transition-colors"
                      >
                        <GripVertical className="w-5 h-5" />
                      </div>

                      <div className="flex items-start justify-between mb-4 pr-1 pl-10">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Image Thumbnail / Uploader */}
                          <div className="shrink-0 relative group/img cursor-pointer w-16 h-16 rounded-full overflow-hidden border-2 border-surface-200 bg-surface-50 flex items-center justify-center">
                            {category.image ? (
                              <Image src={category.image} alt={category.name} fill className="object-cover" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-surface-300" />
                            )}
                            
                            {/* Hover Overlay for uploading */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <label className="cursor-pointer w-full h-full flex items-center justify-center">
                                <Edit2 className="w-4 h-4 text-white" />
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleImageUpload(category.id, e.target.files[0]);
                                    }
                                  }} 
                                />
                              </label>
                            </div>
                            
                            {category.image && (
                              <button 
                                onClick={(e) => { e.preventDefault(); handleImageRemove(category.id); }}
                                className="absolute -top-1 -right-1 bg-error-500 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 z-10"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[64px]">
                            {editingId === category.id ? (
                              <div className="flex items-center gap-2 w-full">
                              <input
                                autoFocus
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleEditSave(category.id);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                className="flex-1 min-w-0 px-3 py-1.5 bg-surface-50 border-2 border-primary-200 rounded-[24px] text-surface-950 font-bold focus:border-primary-500 focus:outline-none"
                              />
                              <button onClick={() => handleEditSave(category.id)} className="p-1.5 text-success-600 hover:bg-success-50 rounded-lg">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 text-surface-400 hover:bg-surface-100 rounded-lg">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group/title">
                              <h4 
                                className="font-bold text-surface-950 text-xl cursor-pointer"
                                onClick={() => {
                                  setEditName(category.name);
                                  setEditingId(category.id);
                                }}
                              >
                                {category.name}
                              </h4>
                              <button 
                                onClick={() => {
                                  setEditName(category.name);
                                  setEditingId(category.id);
                                }}
                                className="opacity-0 group-hover/title:opacity-100 p-1 text-surface-400 hover:text-primary-600 transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                          
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
                            onClick={() => handleToggle(category.id, category.isActive)}
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
                          onClick={() => setDeleteId(category.id)}
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

      <ConfirmModal
        isOpen={!!deleteId}
        title="حذف القسم"
        description="هل أنت متأكد من حذف هذا القسم؟ سيتم حذفه فقط إذا كان لا يحتوي على منتجات."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isPending}
      />
    </>
  );
}
