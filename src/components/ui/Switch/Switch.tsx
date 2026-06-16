"use client";

import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Switch({ checked, onChange, label, disabled = false }: SwitchProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <label className={`flex items-center gap-3 select-none ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
      {/* Switch Track */}
      <div
        onClick={handleToggle}
        className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
          checked ? "bg-indigo-600" : "bg-slate-200"
        }`}
      >
        {/* Switch Handle */}
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
      {label && <span className="text-xs font-semibold text-slate-600">{label}</span>}
    </label>
  );
}
