"use client";

import React, { useState } from "react";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, activeTab, onTabChange, onLogout }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isAdmin = user.role === "admin";
  const isDeveloper = user.email === "yodiermurillo@gmail.com";

  const menuItems = [
    {
      id: "inicio",
      label: "Inicio",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    ...(isAdmin
      ? [
          {
            id: "admin-tools",
            label: "Herramientas Admin",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l4 4M21.5 12H16c-.5 0-1-.2-1.4-.6L11.3 8.1c-.4-.4-.6-.9-.6-1.4V3.5l5.5 5.5M2 22l10-10M9 11L3 5" />
              </svg>
            ),
          },
        ]
      : []),
    ...(isDeveloper
      ? [
          {
            id: "docs",
            label: "Docs",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ),
          },
          {
            id: "workflow-bot",
            label: "Workflow Bot",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 h-screen z-30 bg-white/95 backdrop-blur-md border-r border-brand-100 flex flex-col justify-between py-6 transition-all duration-300 ease-in-out select-none ${
        isHovered ? "w-64" : "w-16"
      }`}
    >
      <div className="flex flex-col space-y-8">
        {/* Brand / Logo */}
        <div className="flex items-center px-4 overflow-hidden">
          <div className="min-w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white shadow-sm border border-brand-500">
            I
          </div>
          <span
            className={`ml-3 font-bold text-lg text-brand-950 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            Impulsar
          </span>
        </div>

        {/* Menu Navigation */}
        <nav className="flex flex-col space-y-1.5 px-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group text-left cursor-pointer border border-transparent ${
                  isActive
                    ? "bg-brand-100 text-brand-900 border-brand-200/50 shadow-sm"
                    : "text-brand-500 hover:bg-brand-50 hover:text-brand-800"
                }`}
              >
                <div className={`flex items-center justify-center min-w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-brand-900" : "text-brand-400 group-hover:text-brand-700"}`}>
                  {item.icon}
                </div>
                <span
                  className={`ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="flex flex-col space-y-4 px-2">
        <div className="flex items-center px-2 py-1.5 overflow-hidden">
          <div className="min-w-8 h-8 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-xs font-semibold text-brand-700 uppercase">
            {user.name ? user.name[0] : "U"}
          </div>
          <div
            className={`ml-3 flex flex-col overflow-hidden transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <span className="text-xs font-semibold text-brand-900 truncate">
              {user.name}
            </span>
            <span className="text-[10px] text-brand-500 truncate capitalize">
              {user.role}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-center min-w-5 h-5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <span
            className={`ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            Cerrar Sesión
          </span>
        </button>
      </div>
    </aside>
  );
}
