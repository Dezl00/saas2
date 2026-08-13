"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, Store, User, Phone, Mail, CheckCircle, AlertTriangle, Trash2, X } from "lucide-react";
import { globalSearch } from "@/app/(admin)/admin/searchAction";
import Link from "next/link";
import Image from "next/image";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ stores: any[]; users: any[] }>({ stores: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    if (query.trim().length < 1) {
      setResults({ stores: [], users: [] });
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await globalSearch(query);
        setResults(res as any);
        setIsOpen(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <Search className="w-4 h-4 text-surface-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (query.trim().length > 0) setIsOpen(true);
        }}
        placeholder="ابحث عن متجر، مستخدم، أو رقم هاتف..."
        className="w-full pl-4 pr-10 py-2 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all"
      />

      {/* Dropdown Results */}
      {isOpen && (query.trim().length > 0) && (
        <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl border border-surface-100 overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-surface-500 animate-pulse">جاري البحث...</div>
          ) : results.stores.length === 0 && results.users.length === 0 ? (
            <div className="p-4 text-center text-sm text-surface-500">لا توجد نتائج مطابقة</div>
          ) : (
            <div className="py-2">
              {/* Stores Results */}
              {results.stores.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-bold text-surface-400 uppercase tracking-wider">المتاجر</div>
                  {results.stores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => {
                        setSelectedStore(store);
                        setIsOpen(false);
                      }}
                      className="w-full text-start px-4 py-3 hover:bg-surface-50 transition-colors flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                        {store.logo ? (
                          <Image src={store.logo} alt={store.name} width={40} height={40} className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          <Store className="w-5 h-5 text-primary-600" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-surface-950 truncate">{store.name}</p>
                        {store.subdomain && (
                          <p className="text-xs text-primary-500 truncate" dir="ltr">{store.subdomain}</p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        store.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                        store.status === "SUSPENDED" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {store.status === "ACTIVE" ? "نشط" : store.status === "SUSPENDED" ? "موقوف" : "محذوف"}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Users Results */}
              {results.users.length > 0 && (
                <div>
                  <div className="px-4 py-1 text-xs font-bold text-surface-400 uppercase tracking-wider">المستخدمين</div>
                  {results.users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        setIsOpen(false);
                      }}
                      className="w-full text-start px-4 py-3 hover:bg-surface-50 transition-colors flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center flex-shrink-0 text-surface-600 font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-surface-950 truncate">{user.name}</p>
                        <p className="text-xs text-surface-500 truncate" dir="ltr">{user.phone || user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Store Modal */}
      {mounted && selectedStore && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-surface-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-fade-in">
            <button onClick={() => setSelectedStore(null)} className="absolute top-4 left-4 text-surface-400 hover:text-surface-900">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 flex items-center justify-center mx-auto mb-4 rounded-2xl">
                {selectedStore.logo ? (
                  <Image src={selectedStore.logo} alt={selectedStore.name} width={64} height={64} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <Store className="w-8 h-8 text-primary-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-surface-950">{selectedStore.name}</h3>
              <p className="text-sm text-surface-500 mt-1">{selectedStore.subdomain ? `(${selectedStore.subdomain})` : ""}</p>
              <div className="mt-2">
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                  selectedStore.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                  selectedStore.status === "SUSPENDED" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {selectedStore.status === "ACTIVE" ? "نشط" : selectedStore.status === "SUSPENDED" ? "موقوف" : "محذوف"}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-surface-50 rounded-xl">
                <p className="text-xs text-surface-500 font-bold mb-1">المالك</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-500" />
                  <span className="font-medium text-surface-900 text-sm">{selectedStore.user.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Phone className="w-4 h-4 text-primary-500" />
                  <span className="font-medium text-surface-900 text-sm" dir="ltr">{selectedStore.user.phone || 'غير محدد'}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Mail className="w-4 h-4 text-primary-500" />
                  <span className="font-medium text-surface-900 text-sm truncate" dir="ltr">{selectedStore.user.email}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Link
                href={`/admin/stores?status=${selectedStore.status}`}
                className="flex-1 text-center px-4 py-2 bg-surface-100 text-surface-700 font-bold rounded-xl hover:bg-surface-200 transition-colors"
                onClick={() => setSelectedStore(null)}
              >
                المتاجر
              </Link>
              {selectedStore.subdomain && (
                <a
                  href={`https://${selectedStore.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'almenu.pro'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center px-4 py-2 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors"
                >
                  زيارة
                </a>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* User Modal */}
      {mounted && selectedUser && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-surface-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-fade-in">
            <button onClick={() => setSelectedUser(null)} className="absolute top-4 left-4 text-surface-400 hover:text-surface-900">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-surface-100 text-surface-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                {selectedUser.name.charAt(0)}
              </div>
              <h3 className="text-lg font-bold text-surface-950">{selectedUser.name}</h3>
              <div className="mt-2">
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                  selectedUser.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {selectedUser.status === "ACTIVE" ? "حساب نشط" : "حساب موقوف"}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
                <Phone className="w-5 h-5 text-primary-500" />
                <div className="flex-1">
                  <p className="text-xs text-surface-500 font-medium">رقم الهاتف</p>
                  <p className="font-medium text-surface-900 text-sm" dir="ltr">{selectedUser.phone || 'غير محدد'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
                <Mail className="w-5 h-5 text-primary-500" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-surface-500 font-medium">البريد الإلكتروني</p>
                  <p className="font-medium text-surface-900 text-sm truncate" dir="ltr">{selectedUser.email}</p>
                </div>
              </div>
              {selectedUser.store && (
                <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Store className="w-5 h-5 text-primary-500" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-surface-500 font-medium">متجره</p>
                      <p className="font-medium text-surface-900 text-sm truncate">{selectedUser.store.name}</p>
                    </div>
                  </div>
                  {selectedUser.store.subdomain && (
                    <a
                      href={`https://${selectedUser.store.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'almenu.pro'}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-lg hover:bg-primary-200 transition-colors flex-shrink-0"
                    >
                      زيارة
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 text-center">
              <p className="text-[10px] text-surface-400 font-medium">تاريخ الانضمام: {new Date(selectedUser.createdAt).toLocaleDateString('ar-EG')}</p>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full mt-6 px-4 py-2.5 bg-surface-100 text-surface-700 font-medium rounded-xl hover:bg-surface-200 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
