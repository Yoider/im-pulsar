"use client";

import React from "react";
import { StatusConfig } from "@/backend/actions";

interface EstadosSectionProps {
  statusConfigs: StatusConfig[];
  loading: boolean;
  onEditStatus: (config: StatusConfig) => void;
  onDeleteStatus: (id: string) => void;
}

export default function EstadosSection({
  statusConfigs,
  loading,
  onEditStatus,
  onDeleteStatus,
}: EstadosSectionProps) {
  return (
    <div className="space-y-6">
      {loading && statusConfigs.length === 0 ? (
        <div className="py-20 text-center text-brand-500 text-sm">Cargando estados...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {statusConfigs.map((config) => {
            const isSystem = ["Pending", "Uploaded", "Approved", "Rejected"].includes(config.id);
            return (
              <div
                key={config.id}
                className="bg-white border border-brand-200 rounded-card p-4 flex flex-row items-center justify-between gap-4 hover:shadow-xs transition-all duration-200 group"
              >
                <div className="flex-grow flex items-center gap-4 min-w-0">
                  {/* Badge Previsualization */}
                  <div className="flex-shrink-0">
                    <span
                      className="inline-block px-3 py-1.5 text-xs font-semibold rounded-full border shadow-xs"
                      style={{
                        backgroundColor: config.color,
                        color: config.textColor,
                        borderColor: `${config.textColor}25`
                      }}
                    >
                      {config.label}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className="text-[9px] font-mono font-semibold text-brand-400 uppercase block">
                      ID: {config.id}
                    </span>
                    {isSystem && (
                      <span className="inline-block text-[8px] bg-brand-100 text-brand-700 border border-brand-200 px-1 py-0.2 rounded-lg font-bold uppercase mt-0.5">
                        Sistema
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                  <button
                    onClick={() => onEditStatus(config)}
                    className="p-1.5 text-brand-500 hover:text-brand-900 rounded-lg hover:bg-brand-50 transition-all text-xs cursor-pointer"
                    title="Editar colores"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {!isSystem && (
                    <button
                      onClick={() => onDeleteStatus(config.id)}
                      className="p-1.5 text-brand-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all text-xs cursor-pointer"
                      title="Eliminar estado"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
