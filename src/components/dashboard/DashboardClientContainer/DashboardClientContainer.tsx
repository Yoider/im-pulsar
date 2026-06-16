"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import Sidebar from "@/components/dashboard/Sidebar/Sidebar";
import AdminToolsPanel from "../AdminToolsPanel/AdminToolsPanel";
import DocsPanel from "../DocsPanel/DocsPanel";
import BotWorkflowPanel from "../BotWorkflowPanel/BotWorkflowPanel";

interface DashboardClientContainerProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    lastname?: string | null;
  };
  clientView: React.ReactNode;
}

export default function DashboardClientContainer({
  user,
  clientView,
}: DashboardClientContainerProps) {
  const [activeTab, setActiveTab] = useState("inicio");
  const isAdmin = user.role === "admin";
  const isDeveloper = user.email === "yodiermurillo@gmail.com";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen w-full bg-brand-50/30 text-brand-900 flex font-sans">
      {/* Fixed Expandable Sidebar */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-grow pl-16 min-h-screen flex flex-col relative overflow-hidden">
        {/* Background Decorative Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-400/22 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-300/18 rounded-full blur-3xl pointer-events-none" />

        {/* Dynamic Views Area */}
        <main className={`z-10 flex-grow w-full mx-auto py-12 space-y-8 transition-all duration-300 ${
          (activeTab === "admin-tools" || activeTab === "docs" || activeTab === "workflow-bot") ? "max-w-[calc(100vw-200px)] px-12" : "max-w-5xl px-6"
        }`}>
          {activeTab === "inicio" ? (
            isAdmin ? (
              <div className="space-y-8">
                {/* Welcome Section */}
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-bold text-brand-950 tracking-tight">
                    Hola, {user.name} 👋
                  </h2>
                  <p className="text-brand-600 text-sm md:text-base">
                    Bienvenido al panel principal de administración de Impulsar.
                  </p>
                </div>


                {/* Toolbar options grid */}
                <div className={`grid grid-cols-1 ${isDeveloper ? "md:grid-cols-2" : "max-w-md mx-auto"} gap-6`}>
                  {/* Card 1: Herramientas Administrativas */}
                  <button
                    onClick={() => setActiveTab("admin-tools")}
                    className="group text-left p-6 bg-white border border-brand-200/60 hover:border-brand-400 rounded-card transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-6 cursor-pointer"
                  >
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-purple-100/70 border border-purple-200/80 rounded-xl flex items-center justify-center text-purple-700 group-hover:scale-105 transition-transform">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l4 4M21.5 12H16c-.5 0-1-.2-1.4-.6L11.3 8.1c-.4-.4-.6-.9-.6-1.4V3.5l5.5 5.5M2 22l10-10M9 11L3 5" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-brand-950 tracking-tight">Herramientas Admin</h3>
                      <p className="text-brand-500 text-sm leading-relaxed">
                        Configura expedientes, edita pasos del catálogo global y gestiona la auditoría de clientes.
                      </p>
                    </div>
                    <div className="flex items-center text-brand-800 text-sm font-bold group-hover:translate-x-1 transition-transform">
                      Acceder a herramientas
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>

                  {/* Card 2: Documentación */}
                  {isDeveloper && (
                    <button
                      onClick={() => setActiveTab("docs")}
                      className="group text-left p-6 bg-white border border-brand-200/60 hover:border-brand-400 rounded-card transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-6 cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-purple-100/70 border border-purple-200/80 rounded-xl flex items-center justify-center text-purple-700 group-hover:scale-105 transition-transform">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-brand-950 tracking-tight">Documentación</h3>
                        <p className="text-brand-500 text-sm leading-relaxed">
                          Explora la arquitectura del sistema, el modelo de datos y las guías de desarrollo modular.
                        </p>
                      </div>
                      <div className="flex items-center text-brand-800 text-sm font-bold group-hover:translate-x-1 transition-transform">
                        Ver documentación
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              clientView
            )
          ) : activeTab === "admin-tools" ? (
            <AdminToolsPanel />
          ) : activeTab === "docs" && isDeveloper ? (
            <DocsPanel />
          ) : activeTab === "workflow-bot" && isDeveloper ? (
            <BotWorkflowPanel />
          ) : null}
        </main>
      </div>
    </div>
  );
}
