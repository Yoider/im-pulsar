"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getWhatsAppMessagesAction, WhatsAppMessageData } from "@/backend/actions";

interface StateDetail {
  title: string;
  description: string;
  trigger: string;
  geminiInstructions: string;
  dbChanges: string;
}

const STATES_INFO: Record<string, StateDetail> = {
  GDPR_CONSENT: {
    title: "1. Consentimiento LOPD/GDPR",
    description: "Fase inicial obligatoria de privacidad para números no vinculados.",
    trigger: "El usuario saluda o escribe por primera vez al número del bot.",
    geminiInstructions: "No solicitar correos ni datos personales. Explicar brevemente el tratamiento de datos y pedir confirmación con 'Acepto' o 'Sí'.",
    dbChanges: "Ninguno inmediato. La respuesta queda almacenada únicamente en el historial de mensajes de la sesión.",
  },
  EMAIL_REQ: {
    title: "2. Solicitud de Correo",
    description: "Una vez otorgado el consentimiento, el bot pide el email de acceso.",
    trigger: "El usuario confirma su aceptación en el historial reciente.",
    geminiInstructions: "Solicitar el correo electrónico de registro en la plataforma para enlazar su WhatsApp.",
    dbChanges: "Ninguno hasta que el usuario responda con un correo válido.",
  },
  VINCULACION_REGISTRO: {
    title: "3. Vincular / Registrar Cuenta",
    description: "El bot cruza el correo ingresado con la base de datos de usuarios.",
    trigger: "El usuario proporciona una dirección de correo válida.",
    geminiInstructions: "Llamar a 'vincularCorreo'. Si no existe la cuenta, solicitar Nombre y Apellido y llamar a 'registrarNuevoCliente'.",
    dbChanges: "Se actualiza el usuario en la BD asignando 'whatsappId', 'consentGiven: true' y rol 'client'. La clave se deja en blanco para definir por la web.",
  },
  ESPERANDO_GESTOR: {
    title: "4. En Espera de Asignación",
    description: "La cuenta está vinculada pero el expediente aún no ha sido asignado por el gestor de la oficina.",
    trigger: "El usuario está identificado pero el campo 'rootsTypeId' en el modelo User es nulo.",
    geminiInstructions: "Informar de forma amable que su cuenta ya está vinculada, pero debe esperar a que el gestor asocie manualmente su trámite.",
    dbChanges: "Monitoreo del campo rootsTypeId del usuario.",
  },
  PROCESO_GUIADO: {
    title: "5. Flujo Guiado de Expediente",
    description: "El expediente está asignado y el bot asiste al cliente recolectando sus requisitos.",
    trigger: "El usuario está identificado y tiene un expediente asignado ('rootsTypeId' no es nulo).",
    geminiInstructions: "Usar 'consultarProgreso' y 'obtenerFechaCita' para responder dudas. Al recibir imágenes/documentos, clasificarlos contra los requisitos pendientes de la BD y subirlos mediante 'guardarProgresoDocumento'.",
    dbChanges: "Carga física de archivos a public/uploads/[userId]/ y actualización del paso del cliente a 'Uploaded'.",
  },
};

export default function BotWorkflowPanel() {
  const [messages, setMessages] = useState<WhatsAppMessageData[]>([]);
  const [activeState, setActiveState] = useState<string>("GDPR_CONSENT");
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Simulador de Webhook
  const [simPhone, setSimPhone] = useState<string>("34604305221");
  const [simText, setSimText] = useState<string>("Hola");
  const [simType, setSimType] = useState<string>("text");
  const [simSending, setSimSending] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<string>("");

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    const data = await getWhatsAppMessagesAction();
    setMessages(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!isPolling) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPolling, fetchLogs]);

  const handleSimulateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimSending(true);
    setSimResult("");

    try {
      const response = await fetch("/api/webhook/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          object: "whatsapp_business_account",
          entry: [
            {
              id: "1976120849956129",
              changes: [
                {
                  value: {
                    messaging_product: "whatsapp",
                    metadata: {
                      display_phone_number: "15551603895",
                      phone_number_id: "1073156369207045",
                    },
                    contacts: [
                      {
                        profile: { name: "Simulador Dev" },
                        wa_id: simPhone,
                      },
                    ],
                    messages: [
                      {
                        from: simPhone,
                        id: `wamid.SIMULATED_${Date.now()}`,
                        timestamp: Math.floor(Date.now() / 1000).toString(),
                        text: simType === "text" ? { body: simText } : undefined,
                        type: simType,
                        image: simType === "image" ? { id: "simulated_media_id" } : undefined,
                      },
                    ],
                  },
                  field: "messages",
                },
              ],
            },
          ],
        }),
      });

      if (response.ok) {
        setSimResult("Mensaje despachado exitosamente. Recarga el historial para ver la respuesta.");
        setSimText("");
        // Retrasar refresco de logs para dar tiempo al procesamiento asíncrono
        setTimeout(() => fetchLogs(), 1500);
      } else {
        setSimResult(`Fallo al enviar mensaje: Código de respuesta ${response.status}`);
      }
    } catch (error: any) {
      setSimResult(`Error de conexión: ${error.message}`);
    } finally {
      setSimSending(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & State Machine Panel (Co-ubicación de la documentación del nodo en el Top-Left) */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 pb-5 border-b border-brand-100/60 bg-transparent">
        <div className="space-y-4 flex-grow">
          <div>
            <h2 className="text-2xl font-black text-brand-950 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
              Workflow Bot WhatsApp
            </h2>
            <p className="text-brand-500 text-xs mt-0.5">
              Monitorea el historial de mensajes de WhatsApp y depura la máquina de estados de la IA en tiempo real.
            </p>
          </div>

          {/* Máquina de Estados compacta */}
          <div className="flex items-center gap-3 bg-transparent py-1">
            <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider mr-1">
              Máquina de Estados:
            </span>
            <div className="relative flex items-center">
              {/* Línea de conexión */}
              <div className="absolute left-3 right-3 h-[2px] bg-slate-200/80 z-0" />
              
              {/* Nodos */}
              <div className="relative z-10 flex items-center gap-6">
                {Object.keys(STATES_INFO).map((stateKey, idx) => {
                  const state = STATES_INFO[stateKey];
                  const isSelected = activeState === stateKey;
                  return (
                    <div key={stateKey} className="group relative flex items-center justify-center">
                      {/* Círculo del Nodo */}
                      <button
                        onClick={() => setActiveState(stateKey)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-350 shadow-2xs hover:scale-110 cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white ring-4 ring-indigo-150 font-black animate-pulse scale-105"
                            : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {idx + 1}
                      </button>

                      {/* Tooltip flotante al pasar el ratón */}
                      <div className="absolute top-9 left-1/2 -translate-x-1/2 hidden group-hover:block w-64 p-3.5 bg-slate-950/95 backdrop-blur-xs text-white rounded-xl shadow-xl z-30 transition-all duration-200 border border-slate-800">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-950 rotate-45 border-l border-t border-slate-800" />
                        <h4 className="font-black text-[10.5px] text-indigo-400 tracking-wider uppercase">{state.title}</h4>
                        <p className="text-[10px] text-slate-300 mt-1 leading-relaxed font-normal">
                          {state.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ficha de Estado Activo: Posicionada justo al lado/abajo de la máquina de estados en el Top-Left */}
          <div className="bg-white/80 border border-brand-200/50 rounded-xl p-3.5 shadow-2xs max-w-4xl text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-brand-100 pb-1.5">
              <span className="text-[10px] font-black text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                Documentación: {STATES_INFO[activeState].title}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
              <div>
                <span className="font-bold text-brand-400 block text-[9.5px] uppercase tracking-wider">Disparador de Entrada</span>
                <p className="text-brand-700 font-medium mt-0.5 leading-relaxed">{STATES_INFO[activeState].trigger}</p>
              </div>
              <div>
                <span className="font-bold text-brand-400 block text-[9.5px] uppercase tracking-wider">Instrucción Prompt (Gemini)</span>
                <p className="text-brand-750 font-mono text-[9.5px] mt-0.5 leading-relaxed bg-brand-50/50 p-2 rounded border border-brand-100/50 break-words select-all">
                  {STATES_INFO[activeState].geminiInstructions}
                </p>
              </div>
              <div>
                <span className="font-bold text-brand-400 block text-[9.5px] uppercase tracking-wider">Cambio en Base de Datos</span>
                <p className="text-brand-700 font-medium mt-0.5 leading-relaxed">{STATES_INFO[activeState].dbChanges}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de Acción (Actualizar & Auto-refresco) */}
        <div className="flex items-center gap-2.5 self-start xl:self-start mt-1 flex-shrink-0">
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="flex items-center px-4 py-2 border border-brand-200 hover:border-brand-400 bg-white text-brand-850 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            {isLoading ? (
              <span className="w-3.5 h-3.5 mr-2 border-2 border-brand-800 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5 mr-1.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m-3 3l-3-3m3 3V3" />
              </svg>
            )}
            Actualizar
          </button>
          <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 border border-brand-200 rounded-xl shadow-2xs text-xs font-bold select-none text-brand-700">
            <input
              type="checkbox"
              checked={isPolling}
              onChange={(e) => setIsPolling(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Auto-refresco (5s)</span>
          </label>
        </div>
      </div>

      {/* Grid Inferior: Monitor a la izquierda (2/3) + Simulador a la derecha (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Columna Izquierda (8/12): Terminal de WhatsApp Message Feed Monitor */}
        <div className="lg:col-span-8 bg-slate-950 text-slate-100 p-5 rounded-card shadow-md flex flex-col h-[650px] border border-slate-900">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-mono text-xs font-black text-slate-300 tracking-wider">
                WHATSAPP_MESSAGE_FEED_MONITOR
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              {messages.length} eventos en buffer
            </span>
          </div>

          <div className="flex-grow overflow-y-auto space-y-3 pr-2 font-mono text-xs custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 font-mono text-center">
                [ Esperando eventos entrantes/salientes de WhatsApp ... ]
              </div>
            ) : (
              messages.map((msg) => {
                const isIncoming = msg.direction === "INCOMING";
                return (
                  <div key={msg.id} className="space-y-1.5 p-3 rounded-lg bg-slate-900/60 border border-slate-900/60">
                    <div className="flex items-center justify-between text-[9px] text-slate-500 border-b border-slate-900/40 pb-1 mb-1.5">
                      <span className={`font-black uppercase ${isIncoming ? "text-sky-400" : "text-indigo-400"}`}>
                        [{msg.direction}]
                      </span>
                      <span>
                        Cel: {msg.whatsappId} | {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-slate-300 leading-relaxed break-words whitespace-pre-wrap text-[11px]">
                      {msg.content}
                    </div>
                    {msg.type === "image" && (
                      <div className="inline-flex items-center px-2 py-0.5 bg-slate-800 border border-slate-700/50 rounded text-[9.5px] text-amber-400 space-x-1 font-sans mt-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Adjunto multimedia de imagen (clasificado)</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Columna Derecha (4/12): Simulador de Webhook */}
        <div className="lg:col-span-4 bg-white p-5 border border-brand-200/80 rounded-card shadow-xs self-start">
          <form onSubmit={handleSimulateMessage} className="space-y-4">
            <h3 className="text-xs font-black text-brand-950 uppercase tracking-wider border-b border-brand-100 pb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-brand-850" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Simulador de Webhook
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-brand-500 uppercase tracking-wide mb-1">
                  Número wa_id
                </label>
                <input
                  type="text"
                  required
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-brand-200 rounded-xl focus:ring-brand-500 focus:border-brand-500 bg-brand-50/20 font-mono"
                  placeholder="34604305221"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brand-500 uppercase tracking-wide mb-1">
                  Tipo de Evento
                </label>
                <select
                  value={simType}
                  onChange={(e) => setSimType(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-brand-200 rounded-xl focus:ring-brand-500 focus:border-brand-500 bg-brand-50/20"
                >
                  <option value="text">Mensaje de Texto plano</option>
                  <option value="image">Adjunto de Imagen (Media)</option>
                </select>
              </div>

              {simType === "text" && (
                <div>
                  <label className="block text-[10px] font-bold text-brand-500 uppercase tracking-wide mb-1">
                    Cuerpo del Mensaje
                    </label>
                  <textarea
                    required
                    rows={4}
                    value={simText}
                    onChange={(e) => setSimText(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-brand-200 rounded-xl focus:ring-brand-500 focus:border-brand-500 bg-brand-50/20 font-sans resize-none"
                    placeholder="Simula la entrada de WhatsApp..."
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={simSending}
              className="w-full py-2.5 bg-brand-950 hover:bg-brand-900 text-white font-bold rounded-xl text-xs shadow-2xs transition-all cursor-pointer disabled:bg-brand-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {simSending ? (
                <>
                  <span className="w-3.5 h-3.5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando Payload...
                </>
              ) : (
                "Despachar Webhook"
              )}
            </button>
          </form>

          {simResult && (
            <div className={`mt-3 p-3.5 rounded-xl text-[10px] font-semibold leading-relaxed border ${
              simResult.startsWith("Error") || simResult.startsWith("Fallo")
                ? "bg-rose-50 text-rose-700 border-rose-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-100"
            }`}>
              {simResult}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
