"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button/Button";
import Switch from "@/components/ui/Switch/Switch";

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

interface Step {
  id: number;
  name: string;
  description: string | null;
  isMandatory: boolean;
  shortOrder: number;
  triggerCondition?: string | null;
  geminiInstructions?: string | null;
}

interface RootsTypeModalProps {
  rootsType: RootsType;
  allSteps: Step[];
  onClose: () => void;
  onToggleStep: (stepId: number, isAssociated: boolean) => void;
  onCreateStep: (
    name: string,
    description: string,
    isMandatory: boolean,
    shortOrder: number,
    triggerCondition: string,
    geminiInstructions: string
  ) => void;
  onUpdateStep: (
    stepId: number,
    name: string,
    description: string,
    isMandatory: boolean,
    shortOrder: number,
    triggerCondition: string,
    geminiInstructions: string
  ) => void;
  onReorderSteps: (stepIds: number[]) => void;
}

const NineSquaresIcon = () => (
  <div className="grid grid-cols-3 gap-1 w-6 h-6 items-center justify-items-center group-hover:rotate-12 transition-transform duration-300">
    <div className="w-1.5 h-1.5 bg-brand-400 rounded-sm"></div>
    <div className="w-1.5 h-1.5 bg-brand-400 rounded-sm"></div>
    <div className="w-1.5 h-1.5 bg-brand-400 rounded-sm"></div>
    <div className="w-1.5 h-1.5 bg-brand-400 rounded-sm"></div>
    <div className="w-1.5 h-1.5 bg-brand-400 rounded-sm"></div>
    <div className="w-1.5 h-1.5 bg-brand-400 rounded-sm"></div>
    <div className="w-1.5 h-1.5 bg-brand-400 rounded-sm"></div>
    <div className="w-1.5 h-1.5 bg-brand-400 rounded-sm"></div>
    <div className="w-1.5 h-1.5 bg-brand-400 rounded-sm"></div>
  </div>
);

export default function RootsTypeModal({
  rootsType,
  allSteps,
  onClose,
  onToggleStep,
  onCreateStep,
  onUpdateStep,
  onReorderSteps,
}: RootsTypeModalProps) {
  // Modal dashboard state (expanded split-view)
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Toggle between steps list and creation form inside dashboard
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Active dropdown menu for associated steps
  const [activeDropdownStepId, setActiveDropdownStepId] = useState<number | null>(null);

  // Prevent double-click associations
  const [togglingStepId, setTogglingStepId] = useState<number | null>(null);

  // Drag index tracking
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Drag over panel tracking (for transparency preview placeholder feedback)
  const [dragOverPanel, setDragOverPanel] = useState<"associated" | "catalog" | null>(null);

  // Editing step states
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [editStepName, setEditStepName] = useState("");
  const [editStepDesc, setEditStepDesc] = useState("");
  const [editStepMandatory, setEditStepMandatory] = useState(false);
  const [editStepOrder, setEditStepOrder] = useState(1);
  const [editStepTrigger, setEditStepTrigger] = useState("");
  const [editStepGemini, setEditStepGemini] = useState("");

  // New step states
  const [newStepName, setNewStepName] = useState("");
  const [newStepDesc, setNewStepDesc] = useState("");
  const [newStepMandatory, setNewStepMandatory] = useState(false);
  const [newStepOrder, setNewStepOrder] = useState(allSteps.length + 1);
  const [newStepTrigger, setNewStepTrigger] = useState("");
  const [newStepGemini, setNewStepGemini] = useState("");

  const handleCreateStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepName.trim()) return;
    onCreateStep(
      newStepName,
      newStepDesc,
      newStepMandatory,
      newStepOrder,
      newStepTrigger,
      newStepGemini
    );
    setNewStepName("");
    setNewStepDesc("");
    setNewStepMandatory(false);
    setNewStepTrigger("");
    setNewStepGemini("");
    setNewStepOrder(allSteps.length + 2);
    setShowCreateForm(false); // Return to steps list
  };

  const handleStartEditStep = (step: Step) => {
    setEditingStep(step);
    setEditStepName(step.name);
    setEditStepDesc(step.description || "");
    setEditStepMandatory(step.isMandatory);
    setEditStepOrder(step.shortOrder);
    setEditStepTrigger(step.triggerCondition || "");
    setEditStepGemini(step.geminiInstructions || "");
  };

  const handleEditStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStep) return;
    onUpdateStep(
      editingStep.id,
      editStepName,
      editStepDesc,
      editStepMandatory,
      editStepOrder,
      editStepTrigger,
      editStepGemini
    );
    setEditingStep(null);
  };

  // Drag & Drop handlers for catalog step -> associated column
  const handleDragStartFromCatalog = (e: React.DragEvent, stepId: number) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ type: "associate", stepId }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragOverPanel = (panel: "associated" | "catalog") => {
    if (dragOverPanel !== panel) {
      setDragOverPanel(panel);
    }
  };

  const handleDragLeavePanel = () => {
    setDragOverPanel(null);
  };

  const handleDropFromCatalog = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPanel(null);
    try {
      const rawData = e.dataTransfer.getData("text/plain");
      if (!rawData) return;
      const data = JSON.parse(rawData);
      if (data.type === "associate") {
        const isAlreadyAssociated = rootsType.rootsTypesSteps.some(rts => rts.stepId === data.stepId);
        if (!isAlreadyAssociated) {
          onToggleStep(data.stepId, false);
        }
      }
    } catch (err) {
      console.error("Drop error:", err);
    }
  };

  const handleDropToCatalog = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPanel(null);
    try {
      const rawData = e.dataTransfer.getData("text/plain");
      if (!rawData) return;
      const data = JSON.parse(rawData);
      if (data.type === "reorderOrDisassociate") {
        const isAlreadyAssociated = rootsType.rootsTypesSteps.some(rts => rts.stepId === data.stepId);
        if (isAlreadyAssociated) {
          onToggleStep(data.stepId, true); // Deactivate/disassociate
        }
      }
    } catch (err) {
      console.error("Drop to catalog error:", err);
    } finally {
      setDraggedIndex(null);
    }
  };

  // Drag & Drop handlers for reordering within associated list
  const handleDragStartReorder = (e: React.DragEvent, stepId: number, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData("text/plain", JSON.stringify({ type: "reorderOrDisassociate", stepId, fromIndex: index }));
  };

  const handleDragDropReorder = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    setDragOverPanel(null);
    try {
      const rawData = e.dataTransfer.getData("text/plain");
      if (!rawData) return;
      const data = JSON.parse(rawData);
      if (data.type === "reorderOrDisassociate") {
        const fromIndex = data.fromIndex;
        if (fromIndex === toIndex) return;

        const reorderedStepIds = [...associatedSteps.map(s => s.id)];
        const [movedId] = reorderedStepIds.splice(fromIndex, 1);
        reorderedStepIds.splice(toIndex, 0, movedId);

        onReorderSteps(reorderedStepIds);
      } else if (data.type === "associate") {
        const isAlreadyAssociated = rootsType.rootsTypesSteps.some(rts => rts.stepId === data.stepId);
        if (!isAlreadyAssociated) {
          onToggleStep(data.stepId, false);
        }
      }
    } catch (err) {
      console.error("Reorder drop error:", err);
    } finally {
      setDraggedIndex(null);
    }
  };

  const associatedSteps = rootsType.rootsTypesSteps
    .map((rts) => ({
      ...rts.step,
      description: allSteps.find((s) => s.id === rts.stepId)?.description || null,
      isMandatory: rts.isMandatory,
      shortOrder: rts.shortOrder,
    }))
    .sort((a, b) => a.shortOrder - b.shortOrder);

  // Shared associated list component structure
  const renderAssociatedStepsList = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-brand-200 pb-2">
        <h4 className="text-[11px] font-bold text-brand-900 uppercase tracking-wider">Pasos Asociados</h4>
        <span className="text-[10px] text-brand-500">
          {associatedSteps.length} {associatedSteps.length === 1 ? "paso requerido" : "pasos requeridos"}
        </span>
      </div>

      <div 
        onDragOver={(e) => {
          handleDragOver(e);
          handleDragOverPanel("associated");
        }}
        onDragLeave={handleDragLeavePanel}
        onDrop={handleDropFromCatalog}
        className={`flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1 rounded-card transition-colors duration-150 ${
          isDashboardOpen 
            ? `border-2 border-dashed p-2 min-h-[300px] ${
                dragOverPanel === "associated" ? "border-brand-500 bg-brand-50/50" : "border-brand-200"
              }` 
            : ""
        }`}
      >
        {associatedSteps.length === 0 ? (
          <div className="text-center py-12 text-brand-400 text-xs flex flex-col items-center justify-center">
            <svg className="w-8 h-8 text-brand-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>No hay pasos asociados.</span>
            {isDashboardOpen && <span className="text-[10px] text-brand-700 mt-1">Arrastra pasos aquí para vincularlos</span>}
          </div>
        ) : (
          associatedSteps.map((step, idx) => (
            <div
              key={step.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDragDropReorder(e, idx)}
              className={`border border-brand-200 bg-brand-50/30 rounded-card p-3.5 flex items-center justify-between relative ${
                draggedIndex === idx ? "opacity-40 scale-95 border-brand-500" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 flex-grow pr-2">
                {/* 6-Dots Drag Handle for Reordering */}
                <div
                  draggable={true}
                  onDragStart={(e) => handleDragStartReorder(e, step.id, idx)}
                  className="p-1 rounded text-brand-400 hover:text-brand-700 cursor-grab active:cursor-grabbing transition-colors"
                  title="Arrastra para reordenar"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <circle cx="8" cy="7" r="1.2" fill="currentColor" />
                    <circle cx="16" cy="7" r="1.2" fill="currentColor" />
                    <circle cx="8" cy="12" r="1.2" fill="currentColor" />
                    <circle cx="16" cy="12" r="1.2" fill="currentColor" />
                    <circle cx="8" cy="17" r="1.2" fill="currentColor" />
                    <circle cx="16" cy="17" r="1.2" fill="currentColor" />
                  </svg>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-1.5 py-0.5 bg-brand-50 border border-brand-200 text-brand-500 rounded font-bold">
                      #{step.shortOrder}
                    </span>
                    <span className="text-xs font-semibold text-brand-950">{step.name}</span>
                    {step.isMandatory && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 rounded font-semibold uppercase tracking-wider">
                        Requerido
                      </span>
                    )}
                  </div>
                  {step.description && (
                    <p className="text-[10px] text-brand-500 mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Ellipsis Options Button */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdownStepId(activeDropdownStepId === step.id ? null : step.id);
                  }}
                  className="p-1.5 rounded-lg text-brand-400 hover:text-brand-850 hover:bg-brand-50 transition-colors cursor-pointer"
                  aria-label="Opciones de paso"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                  </svg>
                </button>

                {/* Dropdown Popover */}
                {activeDropdownStepId === step.id && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownStepId(null);
                      }}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-white border border-brand-200 rounded-card shadow-xl py-1.5 min-w-[130px] z-40 animate-fade-in text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownStepId(null);
                          handleStartEditStep(step);
                        }}
                        className="w-full px-3.5 py-2 text-xs text-brand-700 hover:text-brand-900 hover:bg-brand-50 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownStepId(null);
                          onToggleStep(step.id, true); // Deactivate/disassociate
                        }}
                        className="w-full px-3.5 py-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Desactivar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {editingStep ? (
        /* Edit Step Form */
        <form onSubmit={handleEditStepSubmit} className="bg-brand-50/30 border border-brand-200 rounded-card p-5 space-y-4 animate-fade-in max-w-xl mx-auto">
          <div className="flex items-center justify-between border-b border-brand-200 pb-3">
            <h5 className="text-xs font-bold text-brand-900 uppercase tracking-wider">Editar Paso en Expediente</h5>
            <button
              type="button"
              onClick={() => setEditingStep(null)}
              className="text-[10px] font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1 cursor-pointer transition-colors"
            >
              Volver al listado
            </button>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-brand-500 uppercase">Nombre del Paso</label>
            <input
              type="text"
              value={editStepName}
              onChange={(e) => setEditStepName(e.target.value)}
              className="w-full bg-white border border-brand-200 rounded-card px-3.5 py-2 text-xs text-brand-950 focus:outline-none focus:border-brand-500 focus:bg-white"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-brand-500 uppercase">Descripción / Instrucciones (Cliente)</label>
            <textarea
              value={editStepDesc}
              onChange={(e) => setEditStepDesc(e.target.value)}
              className="w-full bg-white border border-brand-200 rounded-card px-3.5 py-2 text-xs text-brand-950 focus:outline-none focus:border-brand-500 h-16 resize-none focus:bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-brand-500 uppercase">Condición de Activación Conversacional (WhatsApp)</label>
            <input
              type="text"
              value={editStepTrigger}
              onChange={(e) => setEditStepTrigger(e.target.value)}
              placeholder="Ej: El usuario sube una imagen de su pasaporte"
              className="w-full bg-white border border-brand-200 rounded-card px-3.5 py-2 text-xs text-brand-950 focus:outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-brand-500 uppercase">Instrucciones de validación de la IA (Gemini)</label>
            <textarea
              value={editStepGemini}
              onChange={(e) => setEditStepGemini(e.target.value)}
              placeholder="Ej: Verifica que se lea el nombre completo, el número de pasaporte y no esté vencido"
              className="w-full bg-white border border-brand-200 rounded-card px-3.5 py-2 text-xs text-brand-950 focus:outline-none focus:border-brand-500 h-16 resize-none focus:bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-brand-500 uppercase">Orden Visual</label>
              <input
                type="number"
                value={editStepOrder}
                onChange={(e) => setEditStepOrder(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-brand-200 rounded-card px-3.5 py-2 text-xs text-brand-950 focus:outline-none focus:border-brand-500 focus:bg-white"
                min="1"
                required
              />
            </div>
            <div className="flex flex-col justify-end pb-2">
              <Switch
                checked={editStepMandatory}
                onChange={setEditStepMandatory}
                label="Requerido/Obligatorio"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditingStep(null)} className="rounded-xl">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl">
              Guardar Cambios
            </Button>
          </div>
        </form>
      ) : isDashboardOpen ? (
        /* Expanded SPLIT VIEW Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          {/* Left Column: Associated Steps List (Width 5/12) */}
          <div className="lg:col-span-5 space-y-4">
            {renderAssociatedStepsList()}
          </div>

          {/* Right Column: Catalog of Steps Dashboard (Width 7/12) */}
          <div 
            onDragOver={(e) => {
              handleDragOver(e);
              handleDragOverPanel("catalog");
            }}
            onDragLeave={handleDragLeavePanel}
            onDrop={handleDropToCatalog}
            className={`lg:col-span-7 bg-brand-50/30 border border-brand-200 rounded-card p-5 space-y-4 max-h-[70vh] overflow-y-auto transition-all duration-150 ${
              dragOverPanel === "catalog" ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-500/10" : "border-brand-200"
            }`}
          >
            <div className="flex items-center justify-between border-b border-brand-200 pb-3">
              <div>
                <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                  {showCreateForm ? "Crear Nuevo Paso" : "Catálogo Global de Pasos"}
                </h4>
                <p className="text-[9px] text-brand-500 mt-0.5">
                  {showCreateForm
                    ? "Registra un nuevo requisito global."
                    : "Arrastra cualquier paso a la columna izquierda o haz clic sobre él para asociarlo."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (showCreateForm) setShowCreateForm(false);
                  else setIsDashboardOpen(false);
                }}
                className="px-3 py-1 bg-white border border-brand-200 text-brand-700 hover:text-brand-900 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
              >
                {showCreateForm ? "Volver" : "Cerrar Dashboard"}
              </button>
            </div>

            {!showCreateForm ? (
              /* Grid catalog steps */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allSteps
                  .filter((step) => !rootsType.rootsTypesSteps.some((rts) => rts.stepId === step.id))
                  .map((step) => {
                    return (
                      <div
                        key={step.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStartFromCatalog(e, step.id)}
                        onClick={async () => {
                          if (togglingStepId !== null) return;
                          setTogglingStepId(step.id);
                          try {
                            await onToggleStep(step.id, false);
                          } finally {
                            setTogglingStepId(null);
                          }
                        }}
                        className={`bg-white border border-brand-200 rounded-card p-4 flex flex-col justify-between min-h-[130px] text-center select-none group relative shadow-sm transition-all duration-150 ${
                          togglingStepId === step.id
                            ? "opacity-60 cursor-wait"
                            : "cursor-grab active:cursor-grabbing hover:border-brand-400 hover:bg-brand-50/20"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] px-1.5 py-0.5 bg-brand-50 border border-brand-200 text-brand-500 rounded font-bold">
                              #{step.id}
                            </span>
                          </div>
                          <div>
                            <h5 className="text-[11px] font-bold transition-colors text-brand-900">
                              {step.name}
                            </h5>
                            <p className="text-[9px] text-brand-500 mt-1 line-clamp-3 leading-relaxed">
                              {step.description || "Sin descripción."}
                            </p>
                          </div>
                        </div>
                        {/* Drag Hint indicator on hover */}
                        <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-card pointer-events-none">
                          <span className="text-[9px] text-brand-700 font-bold uppercase tracking-wider bg-white border border-brand-200 px-2 py-0.5 rounded shadow">
                            Arrastra para vincular
                          </span>
                        </div>
                        <div className="pt-2.5 border-t border-brand-100 mt-2.5 flex items-center justify-center">
                          <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition-all bg-brand-50 border border-brand-200/60 text-brand-400">
                            No Asociado
                          </span>
                        </div>
                      </div>
                    );
                  })}

                {/* Special '+' Card to add step */}
                <div
                  onClick={() => setShowCreateForm(true)}
                  className="border-2 border-dashed border-brand-200 hover:border-brand-500 bg-white hover:bg-brand-50/20 rounded-card p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[130px] group"
                >
                  <div className="p-2 bg-brand-50 border border-brand-200 group-hover:border-brand-400 rounded-xl mb-1 text-brand-400 group-hover:text-brand-600 group-hover:scale-110 transition-all duration-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-brand-400 group-hover:text-brand-600 transition-colors">Crear Paso</span>
                </div>
              </div>
            ) : (
              /* Create Form inside Catalog */
              <form onSubmit={handleCreateStepSubmit} className="bg-white border border-brand-200 rounded-card p-5 space-y-4 animate-fade-in max-w-xl mx-auto shadow-sm">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-brand-500 uppercase">Nombre del Paso</label>
                  <input
                    type="text"
                    value={newStepName}
                    onChange={(e) => setNewStepName(e.target.value)}
                    placeholder="Ej: Carga de Comprobante"
                    className="w-full bg-brand-50 border border-brand-200 rounded-card px-3.5 py-2 text-xs text-brand-950 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-brand-500 uppercase">Descripción / Instrucciones (Cliente)</label>
                  <textarea
                    value={newStepDesc}
                    onChange={(e) => setNewStepDesc(e.target.value)}
                    placeholder="Instrucciones para que el cliente cargue el documento..."
                    className="w-full bg-brand-50 border border-brand-200 rounded-card px-3.5 py-2 text-xs text-brand-950 focus:outline-none focus:border-brand-500 h-16 resize-none focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-brand-500 uppercase">Condición de Activación Conversacional (WhatsApp)</label>
                  <input
                    type="text"
                    value={newStepTrigger}
                    onChange={(e) => setNewStepTrigger(e.target.value)}
                    placeholder="Ej: El usuario sube una imagen de su pasaporte"
                    className="w-full bg-brand-50 border border-brand-200 rounded-card px-3.5 py-2 text-xs text-brand-950 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-brand-500 uppercase">Instrucciones de validación de la IA (Gemini)</label>
                  <textarea
                    value={newStepGemini}
                    onChange={(e) => setNewStepGemini(e.target.value)}
                    placeholder="Ej: Verifica que se lea el nombre completo, el número de pasaporte y no esté vencido"
                    className="w-full bg-brand-50 border border-brand-200 rounded-card px-3.5 py-2 text-xs text-brand-950 focus:outline-none focus:border-brand-500 h-16 resize-none focus:bg-white transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-500 uppercase">Orden Visual</label>
                    <input
                      type="number"
                      value={newStepOrder}
                      onChange={(e) => setNewStepOrder(parseInt(e.target.value) || 1)}
                      className="w-full bg-brand-50 border border-brand-200 rounded-card px-3.5 py-2 text-xs text-brand-950 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                      min="1"
                      required
                    />
                  </div>
                  <div className="flex flex-col justify-end pb-2">
                    <Switch
                      checked={newStepMandatory}
                      onChange={setNewStepMandatory}
                      label="Requerido/Obligatorio"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2 justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreateForm(false)} className="rounded-xl">
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" size="sm" className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl">
                    Guardar y Asociar
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Centered Default Layout */
        <>
          {renderAssociatedStepsList()}

          {/* Launcher Card for Steps Dashboard */}
          <div
            onClick={() => setIsDashboardOpen(true)}
            className="border border-brand-100 hover:border-brand-300 bg-brand-50/30 hover:bg-brand-50/60 rounded-card p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group shadow-md hover:shadow-brand-500/5"
          >
            <div className="p-3 bg-brand-500/10 border border-brand-200 rounded-card mb-3 group-hover:scale-110 transition-transform duration-300">
              <NineSquaresIcon />
            </div>
            <h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider mb-1 group-hover:text-brand-600 transition-colors">
              Dashboard de Pasos
            </h4>
            <p className="text-[10px] text-brand-500 max-w-sm leading-relaxed">
              Ver, asociar, desasociar y registrar los requisitos interactivos requeridos para este expediente.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
