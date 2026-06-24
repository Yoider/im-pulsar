"use client";

import React from "react";
import Button from "@/components/ui/Button/Button";

interface RootsType {
  id: number;
  name: string;
  description: string | null;
  rootsTypesSteps: {
    stepId: number;
    step: {
      id: number;
      name: string;
    };
  }[];
}

interface ExpedienteCardProps {
  rootsType: RootsType;
  clients?: any[];
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export default function ExpedienteCard({ rootsType, clients = [], onClick, onEdit, onDelete }: ExpedienteCardProps) {
  const stepsCount = rootsType.rootsTypesSteps.length;

  // Contar cuántos clientes han completado (Aprobado) la carga de todos los pasos/documentos requeridos
  const readyClientsCount = clients.filter((client) => {
    if (!client.steps || client.steps.length === 0) return false;
    return client.steps.every((s: any) => s.status === "Approved");
  }).length;

  return (
    <div
      onClick={onClick}
      className="bg-white hover:bg-brand-50/30 border border-brand-200 hover:border-brand-350 rounded-card p-5 transition-all duration-200 shadow-xs flex flex-row items-center justify-between gap-4 cursor-pointer group relative overflow-hidden"
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-sm text-brand-950 group-hover:text-brand-900 transition-colors tracking-tight truncate">
            {rootsType.name}
          </h4>
          <span className="text-[9px] px-2 py-0.5 bg-brand-100 border border-brand-200/85 text-brand-800 rounded-full font-semibold whitespace-nowrap">
            {stepsCount} {stepsCount === 1 ? "paso" : "pasos"}
          </span>
          {readyClientsCount > 0 && (
            <span 
              className="text-[10px] w-5 h-5 flex items-center justify-center bg-purple-600 text-white rounded-full font-bold shadow-xs animate-bounce"
              title={`${readyClientsCount} clientes listos para el siguiente paso`}
            >
              {readyClientsCount}
            </span>
          )}
        </div>
        <p className="text-[11px] text-brand-500 truncate pr-6">
          {rootsType.description || "Sin descripción disponible."}
        </p>
      </div>

      {/* Quick Actions (visible on hover) */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(e);
          }}
          className="h-7 px-2 text-[10px] border border-brand-200 hover:bg-brand-50 text-brand-800 rounded-xl"
          title="Editar información del expediente"
        >
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
          className="h-7 px-2 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
          title="Eliminar expediente"
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
}
