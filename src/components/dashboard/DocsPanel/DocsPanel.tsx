"use client";

import React, { useState, useEffect, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import { getComponentDocContentAction } from "@/backend/actions";

interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
}

interface DocComponent {
  name: string;
  slug: string;
  description: string;
  subdomain: "landing" | "dashboard" | "ui";
  hasReference: boolean;
  hasExplanation: boolean;
  props?: ComponentProp[];
  snippet?: string;
  usedBy?: string[];
  dependsOn?: string[];
}

const COMPONENTS_LIST: DocComponent[] = [
  {
    name: "LoginForm",
    slug: "loginform",
    description: "Componente híbrido de inicio de sesión con soporte de credenciales seguras y Google OAuth.",
    subdomain: "landing",
    hasReference: true,
    hasExplanation: true,
    props: [],
    dependsOn: ["Button"],
    usedBy: [],
    snippet: `import LoginForm from "@/components/landing/LoginForm/LoginForm";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-card shadow-sm border border-brand-100">
      <LoginForm />
    </div>
  );
}`
  },
  {
    name: "Sidebar",
    slug: "sidebar",
    description: "Barra lateral de navegación colapsable y expandible por hover, con soporte de roles.",
    subdomain: "dashboard",
    hasReference: true,
    hasExplanation: true,
    props: [
      {
        name: "user",
        type: "{ name?: string | null; email?: string | null; role?: string | null; }",
        required: true,
        description: "Datos del usuario logueado en la sesión activa."
      },
      {
        name: "activeTab",
        type: "string",
        required: true,
        description: "Identificador de la pestaña activa en la interfaz del dashboard."
      },
      {
        name: "onTabChange",
        type: "(tab: string) => void",
        required: true,
        description: "Callback disparado al seleccionar una opción diferente en el menú."
      },
      {
        name: "onLogout",
        type: "() => void",
        required: true,
        description: "Función de salida para cerrar la sesión activa del usuario."
      }
    ],
    dependsOn: [],
    usedBy: ["DashboardClientContainer"],
    snippet: `<Sidebar
  user={{
    name: "Yodier Murillo",
    email: "yodiermurillo@gmail.com",
    role: "admin"
  }}
  activeTab={activeTab}
  onTabChange={(tab) => setActiveTab(tab)}
  onLogout={handleLogout}
/>`
  },
  {
    name: "AdminToolsPanel",
    slug: "admintoolspanel",
    description: "Panel de administración principal que gestiona expedientes, estados y auditoría.",
    subdomain: "dashboard",
    hasReference: true,
    hasExplanation: true,
    props: [],
    dependsOn: ["Modal", "Button", "DocumentViewerModal", "Switch"],
    usedBy: ["DashboardClientContainer"],
    snippet: `import AdminToolsPanel from "@/components/dashboard/AdminToolsPanel/AdminToolsPanel";

// Uso directo en la pestaña correspondiente del dashboard de administración
export default function AdminTabContent() {
  return <AdminToolsPanel />;
}`
  },
  {
    name: "DashboardClientContainer",
    slug: "dashboardclientcontainer",
    description: "Contenedor cliente principal que coordina el estado de pestañas y la inyección de vistas.",
    subdomain: "dashboard",
    hasReference: true,
    hasExplanation: true,
    props: [
      {
        name: "user",
        type: "{ name?: string | null; email?: string | null; role?: string | null; lastname?: string | null; }",
        required: true,
        description: "Detalles del usuario autenticado devuelto por NextAuth."
      },
      {
        name: "clientView",
        type: "React.ReactNode",
        required: true,
        description: "La vista pre-renderizada del dashboard de cara al cliente final."
      }
    ],
    dependsOn: ["Sidebar", "AdminToolsPanel", "DocsPanel"],
    usedBy: [],
    snippet: `<DashboardClientContainer
  user={session.user}
  clientView={<ClientDashboard clients={clients} />}
/>`
  },
  {
    name: "DocsPanel",
    slug: "docspanel",
    description: "Catálogo interactivo de documentación modular Diátaxis para desarrolladores de la plataforma.",
    subdomain: "dashboard",
    hasReference: true,
    hasExplanation: true,
    props: [],
    dependsOn: [],
    usedBy: ["DashboardClientContainer"],
    snippet: `import DocsPanel from "@/components/dashboard/DocsPanel/DocsPanel";

// Vista de documentación integrada en las pestañas del dashboard de desarrolladores
<DocsPanel />`
  },
  {
    name: "DocumentViewerModal",
    slug: "documentviewermodal",
    description: "Visor interactivo y responsivo de archivos e imágenes (PDF, PNG, JPG, WebP) integrado en la interfaz de usuario.",
    subdomain: "ui",
    hasReference: true,
    hasExplanation: true,
    props: [
      {
        name: "isOpen",
        type: "boolean",
        required: true,
        description: "Controla si el modal con el visor es visible en pantalla."
      },
      {
        name: "onClose",
        type: "() => void",
        required: true,
        description: "Callback para cerrar el visor y restablecer el scroll del fondo."
      },
      {
        name: "title",
        type: "string",
        required: true,
        description: "Título o nombre del documento que se mostrará en la cabecera del visor."
      },
      {
        name: "url",
        type: "string",
        required: true,
        description: "Enlace público o temporal del archivo o imagen a renderizar."
      }
    ],
    dependsOn: [],
    usedBy: ["AdminToolsPanel"],
    snippet: `<DocumentViewerModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Certificado de Dirección de Arraigo"
  url="/uploads/documento_usuario_12.pdf"
/>`
  },
  {
    name: "Button",
    slug: "button",
    description: "Componente de botón base interactivo con soporte de variantes y micro-animaciones.",
    subdomain: "ui",
    hasReference: true,
    hasExplanation: true,
    props: [
      {
        name: "variant",
        type: "'primary' | 'secondary' | 'ghost'",
        required: false,
        default: "'primary'",
        description: "Estilo visual del botón."
      },
      {
        name: "size",
        type: "'sm' | 'md' | 'lg'",
        required: false,
        default: "'md'",
        description: "Tamaño y espaciado del botón."
      },
      {
        name: "className",
        type: "string",
        required: false,
        description: "Clases de Tailwind CSS adicionales para extender el estilo."
      }
    ],
    dependsOn: [],
    usedBy: ["LoginForm", "AdminToolsPanel"],
    snippet: `import Button from "@/components/ui/Button/Button";\n\n<Button variant="primary" size="md">\n  Guardar cambios\n</Button>`
  },
  {
    name: "BackButton",
    slug: "backbutton",
    description: "Botón de retorno de historial del cliente que utiliza el hook useRouter de Next.js.",
    subdomain: "ui",
    hasReference: true,
    hasExplanation: true,
    props: [],
    dependsOn: [],
    usedBy: [],
    snippet: `import BackButton from "@/components/ui/BackButton/BackButton";\n\n<BackButton />`
  },
  {
    name: "Modal",
    slug: "modal",
    description: "Contenedor de diálogo superpuesto con bloqueo de scroll trasero y difuminado de fondo.",
    subdomain: "ui",
    hasReference: true,
    hasExplanation: true,
    props: [
      {
        name: "isOpen",
        type: "boolean",
        required: true,
        description: "Controla la visibilidad de la ventana modal."
      },
      {
        name: "onClose",
        type: "() => void",
        required: true,
        description: "Callback ejecutado al cerrar el modal."
      },
      {
        name: "title",
        type: "string",
        required: true,
        description: "Título visible en la barra de cabecera."
      },
      {
        name: "children",
        type: "React.ReactNode",
        required: true,
        description: "Contenido interno a renderizar en el cuerpo."
      }
    ],
    dependsOn: [],
    usedBy: ["AdminToolsPanel"],
    snippet: `import Modal from "@/components/ui/Modal/Modal";\n\n<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar Ficha">\n  <p>Contenido interno del modal</p>\n</Modal>`
  },
  {
    name: "Switch",
    slug: "switch",
    description: "Interruptor de palanca responsivo para alternar estados booleanos de manera interactiva.",
    subdomain: "ui",
    hasReference: true,
    hasExplanation: true,
    props: [
      {
        name: "checked",
        type: "boolean",
        required: true,
        description: "Valor booleano que define si el switch está activado."
      },
      {
        name: "onChange",
        type: "(checked: boolean) => void",
        required: true,
        description: "Callback invocado al alternar el switch."
      },
      {
        name: "label",
        type: "string",
        required: false,
        description: "Etiqueta opcional mostrada a la derecha de la palanca."
      },
      {
        name: "disabled",
        type: "boolean",
        required: false,
        default: "false",
        description: "Deshabilita la interacción visual y de clics."
      }
    ],
    dependsOn: [],
    usedBy: ["AdminToolsPanel"],
    snippet: `import Switch from "@/components/ui/Switch/Switch";\n\n<Switch\n  checked={isMandatory}\n  onChange={(val) => setIsMandatory(val)}\n  label="Paso obligatorio"\n/>`
  }
];

export default function DocsPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComp, setSelectedComp] = useState<DocComponent | null>(COMPONENTS_LIST[0] || null);
  const [activeType, setActiveType] = useState<"reference" | "explanation">("reference");
  const [docContent, setDocContent] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Collapsible state for each subdomain accordion
  const [openSubdomains, setOpenSubdomains] = useState<Record<string, boolean>>({
    landing: true,
    dashboard: true,
    ui: true,
  });

  // Copy code state
  const [copied, setCopied] = useState(false);

  // Tab switch for Column 3: "api" (Props & Snippets) vs "visual" (View / Visual demo)
  const [sideTab, setSideTab] = useState<"api" | "visual">("api");

  const toggleSubdomain = (subdomain: string) => {
    setOpenSubdomains((prev) => ({
      ...prev,
      [subdomain]: !prev[subdomain],
    }));
  };

  // Load documentation content on component or type changes
  useEffect(() => {
    if (!selectedComp) return;
    setDocContent(null);
    setSideTab("api"); // Reset the right panel sub-tab to Specs when switching components
    startTransition(async () => {
      try {
        const content = await getComponentDocContentAction(selectedComp.name, activeType);
        setDocContent(content);
      } catch (err) {
        console.error(err);
        setDocContent("Error al cargar el documento de documentación técnica.");
      }
    });
  }, [selectedComp, activeType]);

  const handleCopyCode = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSubdomainBadgeColor = (subdomain: string) => {
    switch (subdomain) {
      case "landing":
        return "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400";
      case "dashboard":
        return "bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400";
      default:
        return "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400";
    }
  };

  // Filter components in real-time
  const filteredList = COMPONENTS_LIST.filter(comp =>
    comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comp.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by subdomain
  const grouped = filteredList.reduce((acc, curr) => {
    acc[curr.subdomain].push(curr);
    return acc;
  }, { landing: [], dashboard: [], ui: [] } as Record<string, DocComponent[]>);

  const isDocComplete = (comp: DocComponent) => comp.hasReference && comp.hasExplanation;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:h-[calc(100vh-140px)] min-h-0 w-full animate-fade-in font-sans pb-4">
      
      {/* Columna 1: Listado, Buscador y Acordeones */}
      <div className="w-full lg:col-span-3 xl:col-span-2 bg-white border border-brand-200 rounded-card shadow-sm flex flex-col min-h-0 overflow-hidden">
        {/* Buscador de Componentes */}
        <div className="p-4 border-b border-brand-100 bg-brand-50/20 space-y-3 flex-shrink-0">
          <div>
            <h3 className="text-sm font-black text-brand-950 tracking-tight flex items-center gap-2">
              <svg className="w-4 h-4 text-brand-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Docs Hub
            </h3>
            <p className="text-[10px] text-brand-400 font-medium">Guías modulares Diátaxis</p>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
              <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar componentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-brand-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-brand-950 placeholder-brand-300 focus:outline-none focus:border-brand-450 focus:ring-1 focus:ring-brand-400 transition-all"
            />
          </div>
        </div>

        {/* Acordeones Colapsables */}
        <div className="flex-grow overflow-y-auto p-3 space-y-3">
          {Object.entries(grouped).map(([subdomain, list]) => {
            if (list.length === 0 && searchQuery) return null;
            const isOpen = openSubdomains[subdomain];
            return (
              <div key={subdomain} className="border border-brand-100 rounded-xl overflow-hidden bg-white shadow-2xs">
                {/* Cabecera del Acordeón */}
                <button
                  onClick={() => toggleSubdomain(subdomain)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-brand-50/40 hover:bg-brand-50 transition-colors text-left cursor-pointer border-b border-brand-100"
                >
                  <span className="text-[10px] font-black text-brand-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
                    {subdomain}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-brand-500 bg-brand-100 px-1.5 py-0.5 rounded-full">
                      {list.length}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-brand-500 transition-transform duration-250 ${isOpen ? "transform rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Lista de Componentes del Subdominio */}
                {isOpen && (
                  <div className="p-1.5 space-y-1 bg-white">
                    {list.length > 0 ? (
                      list.map((comp) => {
                        const isSelected = selectedComp?.name === comp.name;
                        const complete = isDocComplete(comp);
                        return (
                          <button
                            key={comp.name}
                            onClick={() => setSelectedComp(comp)}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold transition-all flex items-start gap-2 cursor-pointer ${
                              isSelected
                                ? "bg-brand-950 text-white shadow-xs"
                                : "text-brand-700 hover:bg-brand-50"
                            }`}
                          >
                            <span className="mt-0.5">
                              {complete ? (
                                <svg className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-emerald-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-amber-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="block truncate">{comp.name}</span>
                              <span className={`text-[9px] font-normal block truncate ${
                                isSelected ? "text-brand-200" : "text-brand-400"
                              }`}>
                                {comp.description}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-center text-brand-400 text-[10px] py-4 italic">
                        Sin componentes.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredList.length === 0 && (
            <div className="text-center text-brand-400 text-xs italic py-8 border border-dashed border-brand-200 rounded-xl bg-brand-50/20">
              Sin coincidencias.
            </div>
          )}
        </div>
      </div>

      {/* Columna 2: Visor de Markdown Central */}
      <div className="lg:col-span-6 xl:col-span-7 bg-white border border-brand-200 rounded-card shadow-sm flex flex-col min-h-[450px] lg:min-h-0 overflow-hidden">
        {selectedComp ? (
          <div className="flex flex-col h-full min-h-0">
            {/* Header del Lector Central */}
            <div className="px-6 py-4 bg-brand-50/20 border-b border-brand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-brand-950 tracking-tight leading-none">
                    {selectedComp.name}
                  </h2>
                  <span className={`text-[8px] px-2 py-0.5 border rounded-full font-bold uppercase tracking-wider ${getSubdomainBadgeColor(selectedComp.subdomain)}`}>
                    {selectedComp.subdomain}
                  </span>
                </div>
                <p className="text-[11px] text-brand-500 leading-normal max-w-xl">{selectedComp.description}</p>
              </div>

              {/* Tabs Switcher Diátaxis */}
              <div className="flex items-center gap-1 bg-brand-100/70 p-1 rounded-full self-start sm:self-auto border border-brand-200/50">
                <button
                  onClick={() => setActiveType("reference")}
                  className={`px-3.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer ${
                    activeType === "reference"
                      ? "bg-brand-950 text-white shadow-xs"
                      : "text-brand-600 hover:text-brand-850"
                  }`}
                >
                  Referencia
                </button>
                <button
                  onClick={() => setActiveType("explanation")}
                  className={`px-3.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer ${
                    activeType === "explanation"
                      ? "bg-brand-950 text-white shadow-xs"
                      : "text-brand-600 hover:text-brand-850"
                  }`}
                >
                  Explicación
                </button>
              </div>
            </div>

            {/* Markdown Content Viewer */}
            <div className="flex-grow overflow-y-auto p-6 md:p-8 relative min-h-0 bg-white">
              {isPending ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-xs z-20">
                  <svg className="animate-spin h-6 w-6 text-brand-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : null}

              {docContent ? (
                <article className="prose prose-slate max-w-none prose-headings:font-black prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-brand-700 prose-p:text-xs prose-p:leading-relaxed prose-li:text-brand-700 prose-li:text-xs prose-strong:text-brand-950 prose-code:text-brand-800 prose-code:bg-brand-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[11px] prose-pre:bg-brand-50/50 prose-pre:border prose-pre:border-brand-100 prose-pre:p-4 prose-pre:rounded-2xl prose-pre:text-xs">
                  <ReactMarkdown>{docContent}</ReactMarkdown>
                </article>
              ) : (
                <div className="py-20 text-center text-brand-400 italic text-xs">
                  Cargando documentación técnica...
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-850 shadow-inner">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-brand-950">Visor de Documentos de Desarrollo</h3>
              <p className="text-xs text-brand-500 max-w-sm">Selecciona un componente de la barra lateral izquierda para explorar sus guías Diátaxis de Referencia y Explicación.</p>
            </div>
          </div>
        )}
      </div>

      {/* Columna 3: Panel Lateral (Ocupa 3 de 12 columnas) */}
      <div className="w-full lg:col-span-3 xl:col-span-3 bg-white border border-brand-200 rounded-card shadow-sm flex flex-col overflow-hidden">
        {selectedComp ? (
          <div className="flex flex-col h-full min-h-0 p-4 space-y-4">
            {/* Título de la sección y selector de pestaña secundaria */}
            <div className="space-y-3 flex-shrink-0">
              <h3 className="text-xs font-black text-brand-950 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-brand-100">
                <svg className="w-4 h-4 text-brand-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                Especificaciones API
              </h3>

              {/* Sub-tab Switcher: API vs Vista Previa */}
              <div className="flex items-center gap-1 bg-brand-100/70 p-1 rounded-lg border border-brand-200/50">
                <button
                  onClick={() => setSideTab("api")}
                  className={`flex-1 text-center py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all duration-200 cursor-pointer ${
                    sideTab === "api"
                      ? "bg-brand-950 text-white shadow-xs"
                      : "text-brand-600 hover:text-brand-850"
                  }`}
                >
                  Props & Código
                </button>
                <button
                  onClick={() => setSideTab("visual")}
                  className={`flex-1 text-center py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all duration-200 cursor-pointer ${
                    sideTab === "visual"
                      ? "bg-brand-950 text-white shadow-xs"
                      : "text-brand-600 hover:text-brand-850"
                  }`}
                >
                  Vista Previa
                </button>
              </div>
            </div>

            {/* Relaciones Interactivas de Componentes */}
            {(selectedComp.dependsOn?.length || selectedComp.usedBy?.length) ? (
              <div className="p-3 bg-brand-50/15 border border-brand-100 rounded-xl flex-shrink-0 space-y-3">
                <h4 className="text-[9px] font-black text-brand-950 uppercase tracking-wider flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-brand-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Relaciones
                </h4>
                
                {selectedComp.dependsOn && selectedComp.dependsOn.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[8.5px] font-bold text-brand-400 uppercase tracking-tight block">Depende de:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedComp.dependsOn.map((depName) => {
                        const target = COMPONENTS_LIST.find(c => c.name.toLowerCase() === depName.toLowerCase());
                        return (
                          <button
                            key={depName}
                            onClick={() => target && setSelectedComp(target)}
                            disabled={!target}
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold border transition-all ${
                              target
                                ? "bg-white hover:bg-brand-950 hover:text-white hover:border-brand-950 text-brand-700 border-brand-200 cursor-pointer shadow-3xs"
                                : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                            }`}
                          >
                            {depName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedComp.usedBy && selectedComp.usedBy.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[8.5px] font-bold text-brand-400 uppercase tracking-tight block">Usado por:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedComp.usedBy.map((parentName) => {
                        const target = COMPONENTS_LIST.find(c => c.name.toLowerCase() === parentName.toLowerCase());
                        return (
                          <button
                            key={parentName}
                            onClick={() => target && setSelectedComp(target)}
                            disabled={!target}
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold border transition-all ${
                              target
                                ? "bg-white hover:bg-brand-950 hover:text-white hover:border-brand-950 text-brand-700 border-brand-200 cursor-pointer shadow-3xs"
                                : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                            }`}
                          >
                            {parentName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Contenido Dinámico de la Columna 3 (Props o Visual) */}
            <div className="flex-grow overflow-y-auto min-h-0 space-y-4">
              {sideTab === "api" ? (
                <div className="space-y-4">
                  {/* Props Table */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Props Declaradas</h4>
                    {selectedComp.props && selectedComp.props.length > 0 ? (
                      <div className="space-y-2.5">
                        {selectedComp.props.map((prop) => (
                          <div key={prop.name} className="p-2.5 border border-brand-100 rounded-xl bg-brand-50/10 hover:bg-brand-50/30 transition-colors space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs font-black text-brand-900 flex items-center gap-1">
                                {prop.name}
                                {prop.required && <span className="text-rose-500 font-sans" title="Requerido">*</span>}
                              </span>
                              {prop.default && (
                                <span className="text-[9px] bg-brand-100/60 text-brand-600 px-1.5 py-0.5 rounded font-mono">
                                  def: {prop.default}
                                </span>
                              )}
                            </div>
                            <span className="block font-mono text-[9px] text-brand-550 break-all select-all font-semibold leading-normal">
                              {prop.type}
                            </span>
                            <p className="text-[10px] text-brand-600 leading-normal font-medium pt-0.5">{prop.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5 border border-dashed border-brand-100 rounded-xl text-brand-400 text-[10px] font-medium bg-brand-50/10">
                        Este componente no recibe Props externas (Stateful).
                      </div>
                    )}
                  </div>

                  {/* Snippet de Código */}
                  {selectedComp.snippet && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Ejemplo de Uso</h4>
                        <button
                          onClick={() => handleCopyCode(selectedComp.snippet || "")}
                          className="text-[9px] font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2 py-0.5 rounded-md transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-emerald-700 text-[8.5px]">Copiado</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                              <span className="text-[8.5px]">Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="relative rounded-xl overflow-hidden border border-brand-150 bg-slate-900 shadow-sm">
                        <pre className="p-3 text-[9.5px] text-slate-200 font-mono overflow-x-auto max-h-[160px] whitespace-pre leading-relaxed select-all">
                          {selectedComp.snippet}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Representación Visual</h4>
                  <div className="border border-brand-150 rounded-xl overflow-hidden bg-brand-50/10 shadow-xs flex flex-col">
                    {/* Cabecera del Mock Browser */}
                    <div className="bg-brand-50/80 border-b border-brand-100 px-3 py-2 flex items-center gap-1.5 flex-shrink-0">
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-[9px] text-brand-500 font-mono ml-2 truncate font-bold">
                        {selectedComp.name} Preview
                      </span>
                    </div>
                    {/* Render de Imagen */}
                    <div className="p-2 bg-white flex items-center justify-center min-h-[180px]">
                      <img
                        src={`/docs-screenshots/${selectedComp.name}.png`}
                        alt={selectedComp.name}
                        className="w-full h-auto rounded-lg object-contain max-h-[300px] border border-brand-100 shadow-2xs hover:scale-[1.02] transition-transform duration-350"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600";
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-brand-500 leading-normal font-medium text-center">
                    Captura de pantalla de la interfaz de {selectedComp.name} en la plataforma.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center text-center p-8 text-brand-400 italic text-xs">
            Selecciona un componente para ver especificaciones técnicas.
          </div>
        )}
      </div>

    </div>
  );
}
