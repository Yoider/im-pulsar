"use client";

import React from "react";
import { ClientData } from "@/backend/actions";

interface KanbanBoardProps {
  clients: ClientData[];
  onSelectClient: (client: ClientData) => void;
  onUpdateStatus: (userId: string, stepId: number, status: string) => void;
}

export default function KanbanBoard({
  clients,
  onSelectClient,
  onUpdateStatus,
}: KanbanBoardProps) {
  // Las 4 etapas globales recomendadas y aprobadas:
  // 1: Inicio y Registro
  // 2: Carga de Documentación
  // 3: Expediente Enviado al Socio
  // 4: Resolución del Socio
  const columns = [
    { id: 1, title: "Inicio y Registro" },
    { id: 2, title: "Carga de Documentación" },
    { id: 3, title: "Expediente Enviado al Socio" },
    { id: 4, title: "Resolución del Socio" },
  ];

  // Regla de clasificación relacional para colocar a cada cliente en su respectiva etapa global
  const getClientStageId = (client: ClientData) => {
    // Si el cliente no tiene expediente asignado o no tiene pasos
    if (!client.rootsTypeId || !client.steps || client.steps.length === 0) {
      return 1; // Inicio y Registro
    }

    const totalSteps = client.steps.length;
    const approvedSteps = client.steps.filter((s) => s.status === "Approved").length;

    // Si tiene todos los pasos individuales aprobados, avanza a la siguiente fase global
    if (approvedSteps === totalSteps) {
      // Si el expediente ya está validado por completo, pero aún falta la resolución final del socio
      // (Podemos verificar el pasaporte u otra propiedad final como indicador de la resolución)
      if (client.passportStatus === "Approved" || client.appointmentDate) {
        return 4; // Resolución del Socio
      }
      return 3; // Expediente Enviado al Socio
    }

    // Si tiene pasos pendientes o cargados en revisión
    return 2; // Carga de Documentación
  };

  return (
    <div className="w-full flex gap-6 overflow-x-auto pb-4 pt-2 min-h-[480px]">
      {columns.map((col) => {
        // Filtrar clientes de esta etapa global
        const colClients = clients.filter((c) => getClientStageId(c) === col.id);

        // Ordenar prioritariamente por lastDocumentValidationAt (el cliente que validó antes va primero)
        const sortedClients = [...colClients].sort((a, b) => {
          const aTime = a.lastDocumentValidationAt ? new Date(a.lastDocumentValidationAt).getTime() : Infinity;
          const bTime = b.lastDocumentValidationAt ? new Date(b.lastDocumentValidationAt).getTime() : Infinity;
          return aTime - bTime;
        });

        return (
          <div
            key={col.id}
            className="flex-shrink-0 w-80 bg-brand-50/50 border border-brand-200/80 rounded-card flex flex-col max-h-[500px]"
          >
            {/* Column Header */}
            <div className="p-4 border-b border-brand-200 bg-white rounded-t-card flex items-center justify-between">
              <h4 className="text-xs font-bold text-brand-950 tracking-tight truncate max-w-[80%]">
                {col.title}
              </h4>
              <span className="text-[10px] bg-brand-100 text-brand-850 px-2 py-0.5 rounded-full font-semibold">
                {sortedClients.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div className="p-3 flex-grow overflow-y-auto space-y-3">
              {sortedClients.map((client) => {
                const completedCount = client.steps.filter((s) => s.status === "Approved").length;
                const totalSteps = client.steps.length;

                return (
                  <div
                    key={client.id}
                    onClick={() => onSelectClient(client)}
                    className="p-3.5 bg-white border border-brand-100 hover:border-brand-350 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer space-y-3 group relative overflow-hidden"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-brand-900 group-hover:text-brand-950 truncate max-w-[80%]">
                          {client.name} {client.lastname || ""}
                        </h5>
                        {client.lastDocumentValidationAt && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 animate-pulse" title="Prioridad alta por validación" />
                        )}
                      </div>
                      <p className="text-[10px] text-brand-400 truncate">{client.email}</p>
                    </div>

                    {/* Sub-steps details inside Card */}
                    {totalSteps > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[9px] font-medium text-brand-500">
                          <span>Documentos validados</span>
                          <span>{completedCount}/{totalSteps}</span>
                        </div>
                        <div className="w-full bg-brand-100 rounded-full h-1">
                          <div
                            className="bg-brand-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${(completedCount / totalSteps) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Badge alert if waiting for verification */}
                    {client.steps.some((s) => s.status === "Uploaded") && (
                      <div className="text-[9px] text-blue-700 bg-blue-50 border border-blue-150 px-2 py-1 rounded-lg font-medium inline-block animate-pulse">
                        Documentos subidos esperando revisión
                      </div>
                    )}
                  </div>
                );
              })}

              {sortedClients.length === 0 && (
                <div className="h-28 border border-dashed border-brand-200 rounded-xl flex items-center justify-center bg-white/40">
                  <span className="text-[10px] text-brand-400">Sin clientes en esta etapa</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
