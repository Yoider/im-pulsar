"use client";

import React from "react";
import Button from "@/components/ui/Button/Button";
import ExpedienteCard from "./ExpedienteCard";

interface RootsType {
  id: number;
  name: string;
  description: string | null;
  rootsTypesSteps: {
    stepId: number;
    isMandatory: boolean;
    shortOrder: number;
    step: {
      id: number;
      name: string;
    };
  }[];
}

interface ExpedientesSectionProps {
  rootsTypes: RootsType[];
  loading: boolean;
  onActiveRt: (rt: RootsType) => void;
  onStartEdit: (rt: RootsType) => void;
  onDeleteRt: (id: number) => void;
  onCreateClick: () => void;
}

export default function ExpedientesSection({
  rootsTypes,
  loading,
  onActiveRt,
  onStartEdit,
  onDeleteRt,
  onCreateClick,
}: ExpedientesSectionProps) {
  return (
    <div className="space-y-6">
      {/* Header action button inside block header, but wait, the section card handles header buttons visually. We can just render the grid and empty state here. */}
      {loading && rootsTypes.length === 0 ? (
        <div className="py-20 text-center text-brand-500 text-sm">Cargando expedientes del sistema...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {rootsTypes.map((rt) => (
            <ExpedienteCard
              key={rt.id}
              rootsType={rt}
              onClick={() => onActiveRt(rt)}
              onEdit={() => onStartEdit(rt)}
              onDelete={() => onDeleteRt(rt.id)}
            />
          ))}

          {rootsTypes.length === 0 && (
            <div className="col-span-full py-16 text-center border border-dashed border-brand-200 rounded-card bg-white space-y-4 shadow-sm shadow-brand-100/10">
              <span className="text-sm text-brand-600 block">No hay expedientes registrados.</span>
              <Button variant="secondary" size="sm" onClick={onCreateClick} className="border border-brand-200 hover:bg-brand-50 text-brand-800 rounded-xl">
                Crear el Primer Expediente
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
