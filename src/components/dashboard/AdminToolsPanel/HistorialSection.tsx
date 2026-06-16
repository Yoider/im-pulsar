"use client";

import React, { useState } from "react";
import { AuditLogData } from "@/backend/actions";

interface HistorialSectionProps {
  auditLogs: AuditLogData[];
  loading: boolean;
}

export default function HistorialSection({ auditLogs, loading }: HistorialSectionProps) {
  const [filterAction, setFilterAction] = useState<string>("all");

  const getActionDetails = (action: string) => {
    switch (action) {
      case "ASSIGN_ROOTS_TYPE":
        return {
          label: "Expediente Asignado",
          color: "bg-brand-50 text-brand-700 border-brand-200/80",
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          ),
        };
      case "UPDATE_STEP_STATUS":
        return {
          label: "Estado Actualizado",
          color: "bg-brand-100 text-brand-800 border-brand-200",
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
            </svg>
          ),
        };
      case "VALIDATE_STEP":
        return {
          label: "Paso Validado",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
        };
      case "UPLOAD_DOCUMENT":
        return {
          label: "Documento Subido",
          color: "bg-amber-50 text-amber-700 border-amber-200/80",
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        };
      case "UPLOAD_PASSPORT":
        return {
          label: "Pasaporte Cargado",
          color: "bg-teal-50 text-teal-700 border-teal-200/80",
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
          ),
        };
      case "UPDATE_CLIENT_DETAILS":
        return {
          label: "Ficha Actualizada",
          color: "bg-brand-50 text-brand-800 border-brand-200",
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
        };
      default:
        return {
          label: "Acción de Auditoría",
          color: "bg-brand-50/50 text-brand-700 border-brand-200",
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
    }
  };

  const parseJsonValues = (valString: string | null) => {
    if (!valString) return null;
    try {
      return JSON.parse(valString);
    } catch {
      return valString;
    }
  };

  const getLogSummary = (log: AuditLogData) => {
    const oldVal = parseJsonValues(log.oldValues);
    const newVal = parseJsonValues(log.newValues);

    switch (log.action) {
      case "ASSIGN_ROOTS_TYPE":
        return `Asignó tipo de expediente ID: ${newVal?.rootsTypeId || "Sin asignar"}`;
      case "UPDATE_STEP_STATUS":
        return `Cambió estado a "${newVal?.status || "Pendiente"}"`;
      case "VALIDATE_STEP":
        return newVal?.status === "Approved"
          ? "Aprobó el requisito"
          : `Rechazó el requisito: "${newVal?.adminComments || "Sin comentarios"}"`;
      case "UPLOAD_DOCUMENT":
        return `Subió documento: ${newVal?.fileUrl?.split("/").pop() || "archivo"}`;
      case "UPLOAD_PASSPORT":
        return "Subió pasaporte del cliente";
      case "UPDATE_CLIENT_DETAILS":
        return "Actualizó datos de la ficha personal del cliente";
      default:
        return "Realizó una acción en el sistema";
    }
  };

  const filteredLogs = auditLogs.filter(
    (log) => filterAction === "all" || log.action === filterAction
  );

  const formatLogDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleString("es-ES", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4 h-full flex flex-col min-h-0">
      {/* Filters Bar */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-brand-100 pb-3">
        <label className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Filtrar por Acción:</label>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="border border-brand-200 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand-800 focus:outline-none focus:border-brand-400 shadow-xs"
        >
          <option value="all">Todas las acciones</option>
          <option value="VALIDATE_STEP">Validación de Pasos</option>
          <option value="UPLOAD_DOCUMENT">Subida de Documentos</option>
          <option value="UPLOAD_PASSPORT">Carga de Pasaportes</option>
          <option value="ASSIGN_ROOTS_TYPE">Asignación de Expediente</option>
          <option value="UPDATE_CLIENT_DETAILS">Cambios en Ficha Cliente</option>
        </select>
      </div>

      {/* Logs Scrollable Content */}
      <div className="flex-grow overflow-y-auto pr-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-xs text-brand-500 font-medium">Cargando logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-brand-400 italic text-xs border border-dashed border-brand-200 rounded-card bg-brand-50/20">
            No se encontraron registros de auditoría.
          </div>
        ) : (
          <div className="relative border-l border-brand-200 ml-3.5 pl-6 space-y-6">
            {filteredLogs.map((log) => {
              const details = getActionDetails(log.action);
              return (
                <div key={log.id} className="relative group text-left">
                  {/* Circle Indicator on line */}
                  <span className={`absolute -left-[35px] top-1.5 flex items-center justify-center w-7 h-7 rounded-full border shadow-xs ${details.color}`}>
                    {details.icon}
                  </span>

                  {/* Log Card */}
                  <div className="p-3 bg-white border border-brand-100 rounded-card group-hover:border-brand-300 hover:shadow-xs transition-all space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-extrabold uppercase border px-2 py-0.5 rounded-full ${details.color}`}>
                        {details.label}
                      </span>
                      <span className="text-[9px] text-brand-400 font-medium font-mono">
                        {formatLogDate(log.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-brand-900 leading-normal">
                      {getLogSummary(log)}
                    </p>

                    <div className="flex flex-col gap-0.5 text-[10px] text-brand-500 border-t border-brand-50 pt-1.5">
                      {log.performedByUserName && (
                        <div>
                          <span className="font-semibold text-brand-700">Por:</span> {log.performedByUserName}
                        </div>
                      )}
                      {log.clientUserName && (
                        <div>
                          <span className="font-semibold text-brand-700">Cliente:</span> {log.clientUserName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
