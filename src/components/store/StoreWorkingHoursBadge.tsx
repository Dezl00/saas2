"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type WorkingHoursDay = {
  enabled: boolean;
  from?: string;
  to?: string;
  allDay?: boolean;
};

type WorkingHoursData = {
  saturday?: WorkingHoursDay;
  sunday?: WorkingHoursDay;
  monday?: WorkingHoursDay;
  tuesday?: WorkingHoursDay;
  wednesday?: WorkingHoursDay;
  thursday?: WorkingHoursDay;
  friday?: WorkingHoursDay;
};

type Props = {
  workingHours?: WorkingHoursData | null;
  primaryColor?: string | null;
  theme?: string | null;
  className?: string;
};

const DAY_NAMES: Record<string, string> = {
  saturday: "السبت",
  sunday: "الأحد",
  monday: "الإثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
};

const DAY_ORDER = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

function getCurrentDayKey(): string {
  const dayIndex = new Date().getDay();
  const mapping = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return mapping[dayIndex];
}

function checkIsOpen(workingHours?: WorkingHoursData | null): boolean {
  if (!workingHours) return false;
  const currentDay = getCurrentDayKey();
  const todayHours = (workingHours as any)[currentDay] as WorkingHoursDay | undefined;
  
  if (!todayHours?.enabled) return false;
  if (todayHours.allDay) return true;
  
  if (todayHours.from && todayHours.to) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [fromH, fromM] = todayHours.from.split(':').map(Number);
    const [toH, toM] = todayHours.to.split(':').map(Number);
    
    const fromMinutes = fromH * 60 + fromM;
    let toMinutes = toH * 60 + toM;
    
    if (toMinutes < fromMinutes) {
      if (currentMinutes >= fromMinutes || currentMinutes <= toMinutes) return true;
    } else {
      if (currentMinutes >= fromMinutes && currentMinutes <= toMinutes) return true;
    }
  }
  return false;
}

export function StoreWorkingHoursBadge({ workingHours, primaryColor, theme, className }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setIsOpen(checkIsOpen(workingHours));
    setMounted(true);
    const interval = setInterval(() => setIsOpen(checkIsOpen(workingHours)), 60000);
    return () => clearInterval(interval);
  }, [workingHours]);

  const color = primaryColor || "var(--color-primary-600)";
  const isDarkSolid = theme === "dark_solid";
  const currentDay = getCurrentDayKey();

  if (!mounted || !workingHours) return null;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center justify-center pb-[2px] whitespace-nowrap px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-bold text-sm sm:text-base border transition-transform hover:scale-105 z-20 ${
          isOpen 
            ? "bg-success-50/90 text-success-600 border-success-200 " 
            : "bg-error-50/90 text-error-600 border-error-200 "
        } ${className || ""}`}
      >
        {isOpen ? "مفتوح" : "مغلق"}
      </button>

      {isModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className={`w-[90%] max-w-md rounded-2xl overflow-hidden animate-zoom-in text-start ${isDarkSolid ? 'bg-[#0a0a0a]' : 'bg-white'}`} dir="rtl">
            <div className={`flex items-center justify-between p-5 border-b ${isDarkSolid ? 'border-[#222]' : 'border-surface-100'}`}>
              <h3 className={`text-lg font-bold ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>مواعيد العمل</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isDarkSolid ? 'hover:bg-white/10' : 'hover:bg-surface-50'}`}
              >
                <X className={`w-5 h-5 ${isDarkSolid ? 'text-surface-400' : 'text-surface-500'}`} />
              </button>
            </div>

            <div className="p-5 space-y-2 max-h-[70vh] overflow-y-auto">
              {DAY_ORDER.map((dayKey) => {
                const day = (workingHours as any)?.[dayKey] as WorkingHoursDay | undefined;
                const isToday = dayKey === currentDay;
                let statusText = "مغلق";
                if (day?.enabled) {
                  statusText = day.allDay ? "مفتوح طول اليوم" : (day.from && day.to ? `${day.from} - ${day.to}` : "مفتوح طول اليوم");
                }

                return (
                  <div
                    key={dayKey}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl border transition-colors ${
                      isToday
                        ? isDarkSolid ? "border-primary-500 bg-primary-500/10" : "border-primary-200 bg-primary-50/50"
                        : isDarkSolid ? "border-[#222] bg-[#111]" : "border-surface-100 bg-surface-50/50"
                    }`}
                    style={isToday ? { borderColor: isDarkSolid ? color : `${color}33`, backgroundColor: isDarkSolid ? `${color}1a` : `${color}0d` } : undefined}
                  >
                    <span className={`font-bold text-sm ${isToday ? "" : isDarkSolid ? "text-surface-300" : "text-surface-600"}`} style={isToday ? { color } : undefined}>
                      {DAY_NAMES[dayKey]}
                    </span>
                    <span className={`text-sm ${day?.enabled ? (isDarkSolid ? "text-surface-200" : "text-surface-700") : "text-surface-400"}`}>
                      {statusText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
