"use client";

import React, { useState, useTransition } from "react";
import { uploadClientFileAction } from "@/backend/actions";
import DocumentViewerModal from "@/components/ui/DocumentViewerModal/DocumentViewerModal";

interface Step {
  id: number;
  name: string;
  description?: string | null;
  isMandatory: boolean;
  shortOrder: number;
  status: string;
  value?: string;
  comments?: string;
  document?: {
    name: string;
    extension: string;
    url: string;
  };
}

interface ClientDashboardProps {
  clientData: {
    id: string;
    name: string;
    lastname: string | null;
    email: string;
    whatsappId?: string | null;
    processName: string;
    steps: Step[];
    rootsTypeId?: number | null;
    driveFolderUrl?: string | null;
    passportUrl?: string | null;
    passportStatus?: string | null;
    appointmentDate?: Date | null;
    registrationMonth?: string | null;
  };
}

export default function ClientDashboard({ clientData }: ClientDashboardProps) {
  const [uploadingStepId, setUploadingStepId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState<string>("");

  const totalSteps = clientData.steps.length;
  const approvedSteps = clientData.steps.filter(s => s.status === "Approved").length;
  const uploadedSteps = clientData.steps.filter(s => s.status === "Uploaded").length;
  const pendingSteps = clientData.steps.filter(s => s.status === "Pending" || s.status === "Rejected").length;

  const pct = totalSteps > 0 ? Math.round((approvedSteps / totalSteps) * 100) : 0;

  // Donut chart stroke math
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, stepId: number | null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    if (stepId !== null) {
      setUploadingStepId(stepId);
    }

    startTransition(async () => {
      try {
        await uploadClientFileAction(clientData.id, stepId, formData);
        alert("Archivo subido con éxito.");
      } catch (err) {
        console.error(err);
        alert("Error al subir el archivo.");
      } finally {
        setUploadingStepId(null);
      }
    });
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">Aprobado</span>;
      case "Uploaded":
        return <span className="px-2.5 py-1 text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 rounded-full animate-pulse">Subido / En Revisión</span>;
      case "Rejected":
        return <span className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100 rounded-full">Rechazado</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold bg-brand-50/50 text-brand-400 border border-brand-200 rounded-full">Pendiente</span>;
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Upper Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Circular Progress (Clean, white, subtle border) */}
        <div className="bg-white border border-brand-200 rounded-card p-6 shadow-sm flex flex-col justify-between relative overflow-hidden h-64">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Progreso del Trámite</span>
            <h3 className="text-2xl font-extrabold text-brand-950 tracking-tight">{pct}% Completado</h3>
            {clientData.steps && clientData.steps.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {clientData.steps.map((step) => {
                  let dotColor = "bg-slate-300 ring-1 ring-slate-200/50";
                  let statusTxt = "Pendiente";
                  if (step.status === "Approved") {
                    dotColor = "bg-emerald-500 ring-1 ring-emerald-300";
                    statusTxt = "Aprobado";
                  } else if (step.status === "Uploaded") {
                    dotColor = "bg-blue-500 animate-pulse ring-1 ring-blue-300";
                    statusTxt = "Subido / En Revisión";
                  } else if (step.status === "Rejected") {
                    dotColor = "bg-rose-500 ring-1 ring-rose-300";
                    statusTxt = "Rechazado";
                  }

                  return (
                    <span
                      key={step.id}
                      className={`w-2.5 h-2.5 rounded-full ${dotColor} shadow-xs transition-all duration-300 hover:scale-125`}
                      title={`${step.name}: ${statusTxt}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="space-y-2 text-xs font-medium text-brand-500">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>{approvedSteps} Aprobados</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse" />
                <span>{uploadedSteps} Subidos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-200" />
                <span>{pendingSteps} Restantes</span>
              </div>
            </div>

            {/* Circular Progress Gauge */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  className="stroke-brand-100 fill-none"
                  strokeWidth="8"
                />
                {/* Active circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  className="stroke-brand-500 fill-none transition-all duration-500"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-brand-950">{pct}%</span>
                <span className="text-[9px] font-semibold text-brand-400 uppercase tracking-wider">
                  {approvedSteps}/{totalSteps} pasos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Custom Concentric Ring Card - "Gain Control" style */}
        <div className="bg-brand-950 text-white rounded-card p-6 shadow-sm flex flex-col justify-between relative overflow-hidden h-64 border border-brand-900">
          {/* Concentric Geometric Background Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-brand-800/40 pointer-events-none opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-brand-800/60 pointer-events-none opacity-30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-brand-800 pointer-events-none opacity-40" />

          <div className="z-10 space-y-1">
            <span className="text-[10px] font-bold text-brand-300 uppercase tracking-widest">Tipo de Proceso</span>
            <h3 className="text-2xl font-extrabold tracking-tight text-white">{clientData.processName}</h3>
          </div>

          <div className="z-10 space-y-3.5 text-xs text-brand-100">
            <div className="flex justify-between border-b border-brand-900 pb-1.5">
              <span className="font-medium">Identificador:</span>
              <span className="font-semibold text-white">{clientData.email}</span>
            </div>
            <div className="flex justify-between border-b border-brand-900 pb-1.5">
              <span className="font-medium">Mes Registro:</span>
              <span className="font-semibold text-white">{clientData.registrationMonth || "No asignado"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Cita de Extranjería:</span>
              <span className="font-semibold text-emerald-400">
                {clientData.appointmentDate
                  ? new Date(clientData.appointmentDate).toLocaleDateString()
                  : "Pendiente de asignar"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Pasaporte status / Quick Actions */}
        <div className="bg-white border border-brand-200 rounded-card p-6 shadow-sm flex flex-col justify-between relative overflow-hidden h-64">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Documento de Identidad</span>
            <h3 className="text-2xl font-extrabold text-brand-950 tracking-tight">Pasaporte Principal</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-550 font-semibold">Estado de Validación:</span>
              {clientData.passportStatus === "Approved" ? (
                <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">Aprobado</span>
              ) : clientData.passportStatus === "Uploaded" ? (
                <span className="px-2.5 py-1 text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 rounded-full animate-pulse">Subido</span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100 rounded-full">Pendiente / No Cargado</span>
              )}
            </div>

            <div className="flex gap-3">
              {clientData.passportUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setViewerUrl(clientData.passportUrl || null);
                    setViewerTitle("Pasaporte Principal");
                  }}
                  className="flex-1 text-center py-2.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-xl hover:bg-brand-100 transition-all duration-200 cursor-pointer"
                >
                  Ver Documento
                </button>
              )}
              <label className="flex-grow cursor-pointer text-center py-2.5 text-xs font-semibold text-white bg-brand-950 border border-transparent rounded-xl hover:bg-brand-900 transition-all duration-200">
                <span>{clientData.passportUrl ? "Actualizar" : "Subir Pasaporte"}</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  disabled={isPending}
                  onChange={(e) => handleFileUpload(e, null)}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Steps List Card: "Track your expenses" and "Blog" style layout */}
      <div className="bg-white border border-brand-200 rounded-card p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Detalle de Requisitos</span>
          <h2 className="text-3xl font-extrabold text-brand-950 tracking-tight">Pasos Requeridos</h2>
        </div>

        <div className="divide-y divide-brand-100">
          {clientData.steps.map((step, idx) => (
            <div key={step.id} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 flex-grow max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-brand-50 border border-brand-200 flex items-center justify-center text-xs font-bold text-brand-700">
                    {idx + 1}
                  </div>
                  <h4 className="text-lg font-bold text-brand-950 tracking-tight">{step.name}</h4>
                  {step.isMandatory && (
                    <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                      Obligatorio
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className="text-sm text-brand-500 leading-relaxed pl-9">{step.description}</p>
                )}
                
                {step.comments && (
                  <div className="pl-9 mt-2">
                    <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 font-medium space-y-1">
                      <span className="font-bold block uppercase tracking-wider text-[9px] text-rose-500">Retroalimentación del Administrador</span>
                      <p>{step.comments}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 pl-9 md:pl-0">
                <div className="flex flex-col items-end gap-2.5">
                  {getStatusBadge(step.status)}
                  {step.document && (
                    <button
                      type="button"
                      onClick={() => {
                        setViewerUrl(step.document?.url || null);
                        setViewerTitle(step.name);
                      }}
                      className="text-xs text-brand-400 hover:text-brand-900 font-semibold underline truncate max-w-[200px] cursor-pointer text-left"
                    >
                      {step.document.name}
                    </button>
                  )}
                </div>

                <label className={`cursor-pointer w-10 h-10 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl flex items-center justify-center text-brand-650 transition-all ${
                  uploadingStepId === step.id ? "animate-spin cursor-not-allowed" : ""
                }`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    disabled={uploadingStepId !== null || isPending}
                    onChange={(e) => handleFileUpload(e, step.id)}
                  />
                </label>
              </div>
            </div>
          ))}
          
          {clientData.steps.length === 0 && (
            <div className="py-12 text-center text-brand-400 font-medium">
              No hay pasos requeridos configurados para tu expediente todavía.
            </div>
          )}
        </div>
      </div>

      <DocumentViewerModal
        isOpen={!!viewerUrl}
        onClose={() => setViewerUrl(null)}
        url={viewerUrl || ""}
        title={viewerTitle}
      />
    </div>
  );
}
