"use client";

import React from "react";
import { ClientData } from "@/backend/actions";

interface RootsType {
  id: number;
  name: string;
  description: string | null;
}

interface AuditoriaSectionProps {
  clients: ClientData[];
  rootsTypes: RootsType[];
  actionLoading: string | null;
  onAssignRootsType: (userId: string, value: string) => void;
  onSelectClient: (client: ClientData) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterRootsType: string;
  setFilterRootsType: (filter: string) => void;
}

const generateMockNIE = (client: ClientData) => {
  const firstLetter = "XYZ"[client.name.charCodeAt(0) % 3];
  const lastLetter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[client.email.charCodeAt(0) % 26];
  const digits = Array.from(client.id || "1234567")
    .filter(char => /\d/.test(char))
    .slice(0, 7)
    .join("");
  const finalDigits = (digits + "7654321").slice(0, 7);
  return `${firstLetter}-${finalDigits}-${lastLetter}`;
};

export default function AuditoriaSection({
  clients,
  rootsTypes,
  actionLoading,
  onAssignRootsType,
  onSelectClient,
  searchQuery,
  setSearchQuery,
  filterRootsType,
  setFilterRootsType,
}: AuditoriaSectionProps) {
  // 1. Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch = 
      `${c.name} ${c.lastname || ""}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterRootsType === "all") return true;
    if (filterRootsType === "unassigned") return c.rootsTypeId === null || c.rootsTypeId === undefined;
    return c.rootsTypeId?.toString() === filterRootsType;
  });

  // 2. Group clients
  const groupedClients = [
    {
      id: "unassigned",
      name: "Sin Asignar",
      clients: filteredClients.filter((c) => !c.rootsTypeId),
    },
    ...rootsTypes.map((rt) => ({
      id: rt.id.toString(),
      name: rt.name,
      clients: filteredClients.filter((c) => c.rootsTypeId === rt.id),
    })),
  ].filter((g) => g.clients.length > 0);

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por cliente o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-brand-200 rounded-card pl-9 pr-4 py-2.5 text-xs text-brand-950 placeholder-brand-300 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={filterRootsType}
            onChange={(e) => setFilterRootsType(e.target.value)}
            className="w-full bg-white border border-brand-200 rounded-card px-3 py-2.5 text-xs text-brand-800 focus:outline-none focus:border-brand-400 transition-colors cursor-pointer"
          >
            <option value="all">Todos los Expedientes</option>
            <option value="unassigned">Sin Asignar</option>
            {rootsTypes.map((rt) => (
              <option key={rt.id} value={rt.id.toString()}>
                {rt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grouped Client Grid Representation */}
      <div className="space-y-10">
        {groupedClients.map((group) => (
          <div key={group.id} className="space-y-4 animate-fade-in">
            {/* Group Title Badge */}
            <div className="flex items-center gap-2 border-b border-brand-200/80 pb-2">
              <h3 className="text-xs font-bold text-brand-900 tracking-tight">
                {group.name}
              </h3>
              <span className="bg-brand-100 text-brand-800 border border-brand-200 text-[9px] font-semibold px-2 py-0.5 rounded-full">
                {group.clients.length} {group.clients.length === 1 ? "cliente" : "clientes"}
              </span>
            </div>

            {/* Grid of Client Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.clients.map((client) => {
                const totalSteps = client.steps.length;
                const approvedSteps = client.steps.filter((s) => s.status === "Approved").length;
                const pct = totalSteps > 0 ? Math.round((approvedSteps / totalSteps) * 100) : 0;

                return (
                  <div
                    key={client.id}
                    onClick={() => onSelectClient(client)}
                    className="bg-white border border-brand-200/80 rounded-card p-4 flex flex-col justify-between space-y-4 hover:border-brand-400 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  >
                    {/* Concentric Circle Pattern Graphics matching user reference */}
                    <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full border border-purple-200/25 pointer-events-none z-0" />
                    <div className="absolute -bottom-28 -right-28 w-56 h-56 rounded-full border border-purple-200/15 pointer-events-none z-0" />

                    {/* Image / Avatar Header with badges */}
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200/40 border border-brand-200/50 flex-shrink-0 z-10 flex items-center justify-center">
                      {/* Floating steps progress dots overlay (Top Left) */}
                      {client.steps && client.steps.length > 0 && (
                        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5 max-w-[65%]">
                          {client.steps.map((step) => {
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

                      {client.image ? (
                        <img
                          src={client.image}
                          alt={client.name}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-tr from-purple-100/60 to-brand-100/30">
                          {/* Inner circle logo style */}
                          <div className="w-16 h-16 rounded-full bg-white/90 border border-brand-200/60 flex items-center justify-center text-xl font-black text-brand-800 shadow-md">
                            {client.name ? client.name[0] : ""}{client.lastname ? client.lastname[0] : ""}
                          </div>
                        </div>
                      )}

                      {/* Diagonal Arrow Action Trigger overlay (Top Right) */}
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 border border-brand-200/50 flex items-center justify-center text-brand-950 shadow-md hover:bg-white hover:scale-105 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" className="hidden" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 19L19 5m0 0H9m10 0v10" />
                        </svg>
                      </div>

                      {/* Floating NIE Badge Overlay (Bottom Left) */}
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-brand-100/60 text-[9px] font-bold text-brand-800 shadow-sm">
                        NIE: {generateMockNIE(client)}
                      </div>
                    </div>

                    {/* Text Details Area */}
                    <div className="space-y-4 z-10">
                      <div>
                        <h4 className="text-base font-black text-brand-950 tracking-tight leading-snug group-hover:text-brand-700 transition-colors">
                          {client.name} {client.lastname || ""}
                        </h4>
                        <span className="text-[10px] text-brand-400 block truncate">
                          {client.email}
                        </span>
                      </div>

                      {/* Dropdown to assign RootsType */}
                      <div className="space-y-1.5 pt-2 border-t border-brand-100/50">
                        <label className="text-[9px] font-bold text-brand-400 uppercase tracking-wider block">
                          Expediente Asignado
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            value={client.rootsTypeId || "null"}
                            disabled={actionLoading === client.id}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onAssignRootsType(client.id, e.target.value)}
                            className="w-full bg-brand-50 border border-brand-200/80 rounded-xl px-3 py-2 text-xs text-brand-950 focus:outline-none focus:border-brand-500 focus:bg-white disabled:opacity-50 cursor-pointer transition-all duration-200 shadow-xs"
                          >
                            <option value="null">Sin Asignar</option>
                            {rootsTypes.map((rt) => (
                              <option key={rt.id} value={rt.id}>
                                {rt.name}
                              </option>
                            ))}
                          </select>
                          {actionLoading === client.id && (
                            <svg className="animate-spin h-4 w-4 text-brand-850 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="pt-2 border-t border-brand-100/50">
                        <div className="flex justify-between items-center text-[10px] text-brand-400 font-semibold mb-1">
                          <span>Progreso General</span>
                          <span className="text-brand-700">
                            {approvedSteps}/{totalSteps} ({pct}%)
                          </span>
                        </div>
                        {totalSteps > 0 ? (
                          <div className="w-full bg-brand-100/80 rounded-full h-1.5 overflow-hidden border border-brand-200/30">
                            <div
                              className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        ) : (
                          <span className="text-[10px] text-brand-400 italic block">Sin pasos requeridos</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {groupedClients.length === 0 && (
          <div className="py-16 text-center border border-dashed border-brand-200 rounded-card bg-white text-brand-400 italic text-xs">
            No se encontraron clientes que coincidan con la búsqueda o filtro seleccionado.
          </div>
        )}
      </div>
    </div>
  );
}
