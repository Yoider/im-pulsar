"use client";

import React from "react";
import { ClientData } from "@/backend/actions";

interface RootsType {
  id: number;
  name: string;
  description: string | null;
}

interface KpiStatsBarProps {
  clients: ClientData[];
  rootsTypes: RootsType[];
}

export default function KpiStatsBar({ clients, rootsTypes }: KpiStatsBarProps) {
  // Calculo de Métricas
  const totalClients = clients.length;
  const totalExpedientes = rootsTypes.length;

  const clientsWithProcess = clients.filter((c) => c.rootsTypeId !== null && c.rootsTypeId !== undefined);
  const avgProgress = clientsWithProcess.length > 0
    ? Math.round(
        clientsWithProcess.reduce((acc, c) => {
          const totalSteps = c.steps.length;
          const approvedSteps = c.steps.filter((s) => s.status === "Approved").length;
          const pct = totalSteps > 0 ? (approvedSteps / totalSteps) * 100 : 0;
          return acc + pct;
        }, 0) / clientsWithProcess.length
      )
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto py-2">
      {/* Tarjeta 1: Clientes */}
      <div className="bg-white border border-brand-200 rounded-card p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">Clientes Registrados</span>
          <h3 className="text-3xl font-extrabold text-brand-950 leading-none">{totalClients}</h3>
          <span className="text-[10px] text-brand-500 block">Clientes activos en el sistema</span>
        </div>
        <div className="w-12 h-12 bg-purple-100 border border-purple-200/80 rounded-xl flex items-center justify-center text-purple-700 shadow-inner">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      </div>

      {/* Tarjeta 2: Expedientes */}
      <div className="bg-white border border-brand-200 rounded-card p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">Expedientes Activos</span>
          <h3 className="text-3xl font-extrabold text-brand-950 leading-none">{totalExpedientes}</h3>
          <span className="text-[10px] text-brand-500 block">Procesos creados y configurables</span>
        </div>
        <div className="w-12 h-12 bg-purple-100 border border-purple-200/80 rounded-xl flex items-center justify-center text-purple-700 shadow-inner">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
      </div>

      {/* Tarjeta 3: Progreso Promedio */}
      <div className="bg-white border border-brand-200 rounded-card p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">Avance Promedio</span>
          <h3 className="text-3xl font-extrabold text-brand-950 leading-none">{avgProgress}%</h3>
          <span className="text-[10px] text-brand-500 block">De progreso en expedientes asignados</span>
        </div>
        <div className="w-12 h-12 bg-purple-100 border border-purple-200/80 rounded-xl flex items-center justify-center text-purple-700 shadow-inner">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
