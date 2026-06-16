"use client";

import React, { useEffect } from "react";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  title,
  url,
}: DocumentViewerModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Simple check for image types
  const isImage = /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(url) || url.startsWith("data:image/");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop Overlay */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="bg-white border border-slate-200/85 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col z-10 overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <div className="min-w-0 flex-1 pr-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate">{title}</h3>
            <span className="text-[10px] text-slate-400 block truncate">{url}</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Descargar o abrir en pestaña nueva"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar / Abrir
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Cerrar visor"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-grow bg-slate-100 overflow-hidden p-4 relative flex items-center justify-center">
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
              <img
                src={url}
                alt={title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-md border border-slate-200/50 bg-white"
              />
            </div>
          ) : (
            <iframe
              src={`${url}#toolbar=1`}
              className="w-full h-full border-0 rounded-lg shadow-inner bg-white"
              title={title}
            />
          )}
        </div>
      </div>
    </div>
  );
}
