import React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getComponentDocContent } from "@/backend/services/docs.service";
import BackButton from "@/components/ui/BackButton/BackButton";

interface DocsPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export default async function DocsPage({ params }: DocsPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];

  // Validate slug structure: must be exactly [componentName, docType]
  if (slug.length !== 2) {
    return <ErrorCard message="URL de documentación inválida. El formato esperado es /dashboard/docs/[componente]/[referencia|explicacion]." />;
  }

  const [componentName, docType] = slug;

  if (docType !== "reference" && docType !== "explanation") {
    return <ErrorCard message={`Tipo de documentación '${docType}' no válido. Use 'reference' o 'explanation'.`} />;
  }

  // Fetch the markdown content from the backend service
  const markdownContent = await getComponentDocContent(componentName, docType);

  if (!markdownContent) {
    return (
      <ErrorCard 
        message={`No se encontró el documento solicitado para el componente '${componentName}' (${docType}).`}
        showHint={true}
        componentName={componentName}
        docType={docType}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-xl font-bold text-slate-900 capitalize tracking-tight flex items-center gap-2">
              <span>{componentName}</span>
              <span className="text-xs px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full font-semibold uppercase tracking-wider">
                {docType === "reference" ? "Referencia" : "Explicación"}
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Documento modular Diátaxis del subdominio de interfaz</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/dashboard/docs/${componentName}/reference`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              docType === "reference"
                ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            Referencia
          </Link>
          <Link
            href={`/dashboard/docs/${componentName}/explanation`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              docType === "explanation"
                ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            Explicación
          </Link>
        </div>
      </div>

      {/* Markdown Document Content */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-sm">
        <article className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-900 prose-code:text-indigo-600 prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-100">
          <ReactMarkdown>{markdownContent}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

interface ErrorCardProps {
  message: string;
  showHint?: boolean;
  componentName?: string;
  docType?: string;
}

function ErrorCard({ message, showHint, componentName, docType }: ErrorCardProps) {
  return (
    <div className="max-w-xl mx-auto py-12 animate-fade-in">
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-8 backdrop-blur-sm text-center space-y-6">
        <div className="w-14 h-14 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mx-auto">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white tracking-tight">404 - Documento No Encontrado</h3>
          <p className="text-sm text-slate-400 leading-relaxed px-4">
            {message}
          </p>
        </div>

        {showHint && componentName && docType && (
          <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl text-left text-xs text-slate-500 space-y-1">
            <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[10px]">Ruta de escaneo esperada:</span>
            <code>src/components/[subdomain]/{componentName}/{componentName}.{docType}.md</code>
            <p className="mt-2 text-[10px] text-slate-600">
              Asegúrese de que la carpeta del componente exista en uno de los dominios (ui, dashboard, landing) y de que los nombres de los archivos coincidan exactamente (PascalCase).
            </p>
          </div>
        )}

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
