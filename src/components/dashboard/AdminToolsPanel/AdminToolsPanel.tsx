"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import DocumentViewerModal from "@/components/ui/DocumentViewerModal/DocumentViewerModal";
import RootsTypeModal from "./RootsTypeModal";
import KpiStatsBar from "./KpiStatsBar";
import AuditoriaSection from "./AuditoriaSection";
import ExpedientesSection from "./ExpedientesSection";
import EstadosSection from "./EstadosSection";
import {
  getRootsTypesAction,
  createRootsTypeAction,
  updateRootsTypeAction,
  deleteRootsTypeAction,
  getStepsAction,
  createStepAction,
  updateStepAction,
  associateStepAction,
  updateAssociationAction,
  disassociateStepAction,
  reorderStepsAction,
  getUsersAction,
  assignRootsTypeToUserAction,
  getStatusConfigsAction,
  saveStatusConfigAction,
  deleteStatusConfigAction,
  updateUserStepStatusAction,
  updateClientDetailsAction,
  uploadClientFileAction,
  getAuditLogsAction,
  ClientData,
  StatusConfig,
  AuditLogData,
} from "@/backend/actions";
import HistorialSection from "./HistorialSection";
import KanbanBoard from "./KanbanBoard";


interface RootsType {
  id: number;
  name: string;
  description: string | null;
  rootsTypesSteps: {
    stepId: number;
    isMandatory: boolean;
    shortOrder: number;
    step: {
      id: number;
      name: string;
    };
  }[];
}

interface Step {
  id: number;
  name: string;
  description: string | null;
  isMandatory: boolean;
  shortOrder: number;
  triggerCondition?: string | null;
  geminiInstructions?: string | null;
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

export default function AdminToolsPanel() {
  const [configTab, setConfigTab] = useState<"expedientes" | "estados" | "historial">("expedientes");
  const [rootsTypes, setRootsTypes] = useState<RootsType[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogData[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [statusConfigs, setStatusConfigs] = useState<StatusConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRootsType, setFilterRootsType] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal control states
  const [activeRt, setActiveRt] = useState<RootsType | null>(null);
  const [activeKanbanRt, setActiveKanbanRt] = useState<RootsType | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState<string>("");

  // States for editing client details
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [editFields, setEditFields] = useState({
    name: "",
    lastname: "",
    email: "",
    whatsappId: "",
    driveFolderUrl: "",
    appointmentDate: "",
    registrationMonth: "",
    passportStatus: "Pending",
  });

  useEffect(() => {
    if (selectedClient) {
      setEditFields({
        name: selectedClient.name || "",
        lastname: selectedClient.lastname || "",
        email: selectedClient.email || "",
        whatsappId: selectedClient.whatsappId || "",
        driveFolderUrl: selectedClient.driveFolderUrl || "",
        appointmentDate: selectedClient.appointmentDate
          ? new Date(selectedClient.appointmentDate).toISOString().split("T")[0]
          : "",
        registrationMonth: selectedClient.registrationMonth || "",
        passportStatus: selectedClient.passportStatus || "Pending",
      });
    } else {
      setIsEditingDetails(false);
    }
  }, [selectedClient]);

  // Form state for creating a new RootsType
  const [newRtName, setNewRtName] = useState("");
  const [newRtDesc, setNewRtDesc] = useState("");

  // State for editing a RootsType details in a separate modal
  const [editingRt, setEditingRt] = useState<RootsType | null>(null);
  const [editRtName, setEditRtName] = useState("");
  const [editRtDesc, setEditRtDesc] = useState("");

  // States for Status Config edit/create form
  const [statusId, setStatusId] = useState("");
  const [statusLabel, setStatusLabel] = useState("");
  const [statusColor, setStatusColor] = useState("#f1f5f9");
  const [statusTextColor, setStatusTextColor] = useState("#475569");
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isStatusFormOpen, setIsStatusFormOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rtData, stepData, clientData, statusData, auditData] = await Promise.all([
        getRootsTypesAction(),
        getStepsAction(),
        getUsersAction(),
        getStatusConfigsAction(),
        getAuditLogsAction(),
      ]);
      setRootsTypes(rtData as RootsType[]);
      setSteps(stepData as Step[]);
      setClients(clientData);
      setStatusConfigs(statusData);
      setAuditLogs(auditData);

      // Update activeRt state to keep UI in sync if the modal is open
      if (activeRt) {
        const updatedRt = rtData.find((rt) => rt.id === activeRt.id);
        if (updatedRt) {
          setActiveRt(updatedRt as RootsType);
        }
      }

      // Sync selectedClient reactively if open
      if (selectedClient) {
        const updatedClient = clientData.find((c) => c.id === selectedClient.id);
        if (updatedClient) {
          setSelectedClient(updatedClient);
        }
      }
    } catch (error) {
      console.error("Error loading administration data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [configTab]);

  // Handlers for creating an expediente (RootsType)
  const handleCreateRtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRtName.trim()) return;

    try {
      await createRootsTypeAction(newRtName, newRtDesc);
      setNewRtName("");
      setNewRtDesc("");
      setIsCreateOpen(false);
      await fetchData();
    } catch (error) {
      alert("Error al crear el expediente");
    }
  };

  // Handlers for editing details in dedicated modal
  const handleStartEdit = (rt: RootsType) => {
    setEditingRt(rt);
    setEditRtName(rt.name);
    setEditRtDesc(rt.description || "");
  };

  const handleSaveDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRt || !editRtName.trim()) return;
    try {
      await updateRootsTypeAction(editingRt.id, editRtName, editRtDesc);
      setEditingRt(null);
      await fetchData();
    } catch (error) {
      alert("Error al actualizar los datos");
    }
  };

  const handleToggleStep = async (stepId: number, isAssociated: boolean) => {
    if (!activeRt) return;
    try {
      if (isAssociated) {
        await disassociateStepAction(activeRt.id, stepId);
      } else {
        const nextOrder = activeRt.rootsTypesSteps.length + 1;
        await associateStepAction(activeRt.id, stepId, false, nextOrder);
      }
      await fetchData();
    } catch (error) {
      console.error("Error toggling step:", error);
    }
  };

  const handleCreateStep = async (
    name: string,
    description: string,
    isMandatory: boolean,
    shortOrder: number,
    triggerCondition?: string,
    geminiInstructions?: string
  ) => {
    if (!activeRt) return;
    try {
      const newStep = await createStepAction(
        name,
        description || null,
        triggerCondition || null,
        geminiInstructions || null
      );
      await associateStepAction(activeRt.id, newStep.id, isMandatory, shortOrder);
      await fetchData();
    } catch (error) {
      alert("Error al crear y asociar el paso");
    }
  };

  const handleUpdateStep = async (
    stepId: number,
    name: string,
    description: string,
    isMandatory: boolean,
    shortOrder: number,
    triggerCondition?: string,
    geminiInstructions?: string
  ) => {
    if (!activeRt) return;
    try {
      await updateStepAction(
        stepId,
        name,
        description || null,
        triggerCondition || null,
        geminiInstructions || null
      );
      await updateAssociationAction(activeRt.id, stepId, isMandatory, shortOrder);
      await fetchData();
    } catch (error) {
      alert("Error al actualizar la configuración del paso");
    }
  };

  const handleReorderSteps = async (stepIds: number[]) => {
    if (!activeRt) return;
    try {
      await reorderStepsAction(activeRt.id, stepIds);
      await fetchData();
    } catch (error) {
      alert("Error al reordenar los pasos");
    }
  };

  const handleDeleteRt = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este expediente? Se perderán las asociaciones de pasos.")) return;
    try {
      await deleteRootsTypeAction(id);
      await fetchData();
    } catch (error) {
      alert("Error al eliminar el expediente");
    }
  };

  const handleAssignRootsType = async (userId: string, value: string) => {
    const rootsTypeId = value === "null" ? null : parseInt(value, 10);
    setActionLoading(userId);
    try {
      await assignRootsTypeToUserAction(userId, rootsTypeId);
      await fetchData();
    } catch (error) {
      alert("Error al asignar el expediente");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusId.trim() || !statusLabel.trim()) return;
    try {
      await saveStatusConfigAction(statusId, statusLabel, statusColor, statusTextColor);
      setIsStatusFormOpen(false);
      setStatusId("");
      setStatusLabel("");
      setStatusColor("#f1f5f9");
      setStatusTextColor("#475569");
      setIsEditingStatus(false);
      await fetchData();
    } catch (error) {
      alert("Error al guardar la configuración de estado");
    }
  };

  const handleEditStatus = (config: StatusConfig) => {
    setStatusId(config.id);
    setStatusLabel(config.label);
    setStatusColor(config.color);
    setStatusTextColor(config.textColor);
    setIsEditingStatus(true);
    setIsStatusFormOpen(true);
  };

  const handleDeleteStatus = async (id: string) => {
    if (!confirm(`¿Está seguro de eliminar el estado "${id}"?`)) return;
    try {
      await deleteStatusConfigAction(id);
      await fetchData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al eliminar el estado");
    }
  };

  const handleUpdateStepStatus = async (userId: string, stepId: number, status: string) => {
    try {
      await updateUserStepStatusAction(userId, stepId, status);
      await fetchData();

      // Update selectedClient state reactively so the modal updates instantly!
      setSelectedClient(prev => {
        if (!prev) return null;
        return {
          ...prev,
          steps: prev.steps.map(step =>
            step.id === stepId ? { ...step, status } : step
          )
        };
      });
    } catch (error) {
      alert("Error al cambiar el estado del paso");
    }
  };

  const handleSaveClientDetails = async () => {
    if (!selectedClient) return;
    setIsSavingDetails(true);
    try {
      await updateClientDetailsAction(selectedClient.id, {
        name: editFields.name,
        lastname: editFields.lastname || null,
        email: editFields.email,
        whatsappId: editFields.whatsappId || null,
        driveFolderUrl: editFields.driveFolderUrl || null,
        passportUrl: selectedClient.passportUrl || null,
        passportStatus: editFields.passportStatus || "Pending",
        appointmentDate: editFields.appointmentDate ? new Date(editFields.appointmentDate) : null,
        registrationMonth: editFields.registrationMonth || null,
      });
      setIsEditingDetails(false);
      await fetchData();
    } catch (error) {
      alert("Error al guardar los datos del cliente");
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleUploadFile = async (stepId: number | null, file: File) => {
    if (!selectedClient) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await uploadClientFileAction(selectedClient.id, stepId, formData);
      await fetchData();
    } catch (error) {
      alert("Error al subir el archivo");
    }
  };


  const getStatusStyle = (statusName: string) => {
    const config = statusConfigs.find((s) => s.id === statusName);
    if (config) {
      return {
        backgroundColor: config.color,
        color: config.textColor,
        borderColor: `${config.textColor}25`
      };
    }
    return {
      backgroundColor: "#f1f5f9",
      color: "#475569",
      borderColor: "rgba(71, 85, 105, 0.1)"
    };
  };

  // ----------------------------------------------------
  // RENDER: UNIFIED DASHBOARD VIEW
  // ----------------------------------------------------
  return (
    <div className="flex flex-col md:h-[calc(100vh-100px)] space-y-6 w-full min-h-0 pb-6 animate-fade-in">
      {/* Header (Title & KPIs) */}
      <div className="flex-shrink-0 space-y-6">
        {/* Title */}
        <div className="border-b border-brand-200/80 pb-5 text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-bold text-brand-950 tracking-tight flex items-center justify-center sm:justify-start gap-2">
            <svg className="w-7 h-7 text-brand-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
            Herramientas Administrativas
          </h2>
          <p className="text-brand-500 text-xs">
            Panel de control integral para configurar expedientes, auditar clientes y gestionar estados del sistema.
          </p>
        </div>

        {/* KPIs Global Bar */}
        <KpiStatsBar clients={clients} rootsTypes={rootsTypes} />
      </div>

      {/* 2-Column Dashboard Layout */}
      <div className="flex-grow flex flex-col md:flex-row gap-6 min-h-0">
        
        {/* Columna Izquierda: Auditoría de Clientes */}
        <div className="flex-grow md:flex-[2_2_0%] flex flex-col min-h-[450px] md:min-h-0 bg-white border border-brand-200 rounded-card shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-brand-50/30 border-b border-brand-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-800 shadow-inner">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-brand-900 tracking-tight">Auditoría de Clientes</h3>
                <p className="text-[10px] text-brand-400">Consulta el progreso de los clientes.</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-brand-100 text-brand-850 border border-brand-200 px-2 py-0.5 rounded-full">
              {clients.length} Clientes
            </span>
          </div>

          {/* Scrollable Content */}
          <div className="flex-grow overflow-y-auto p-6 min-h-0">
            <AuditoriaSection
              clients={clients}
              rootsTypes={rootsTypes}
              actionLoading={actionLoading}
              onAssignRootsType={handleAssignRootsType}
              onSelectClient={setSelectedClient}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterRootsType={filterRootsType}
              setFilterRootsType={setFilterRootsType}
            />
          </div>
        </div>

        {/* Columna Derecha: Configuraciones (Expedientes / Estados / Historial) */}
        <div className="flex-grow md:flex-[1_1_0%] flex flex-col min-h-[450px] md:min-h-0 bg-white border border-brand-200 rounded-card shadow-sm overflow-hidden">
          {/* Header with Navigation Tabs */}
          <div className="px-6 py-3 bg-brand-50/30 border-b border-brand-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-1.5 bg-brand-100/70 p-1.5 rounded-full">
              <button
                onClick={() => setConfigTab("expedientes")}
                className={`px-5 py-2 text-xs font-bold rounded-full transition-all duration-300 cursor-pointer ${
                  configTab === "expedientes"
                    ? "bg-white text-brand-950 shadow-sm"
                    : "text-brand-600 hover:text-brand-850 hover:bg-white/30"
                }`}
              >
                Expedientes
              </button>
              <button
                onClick={() => setConfigTab("estados")}
                className={`px-5 py-2 text-xs font-bold rounded-full transition-all duration-300 cursor-pointer ${
                  configTab === "estados"
                    ? "bg-white text-brand-950 shadow-sm"
                    : "text-brand-600 hover:text-brand-850 hover:bg-white/30"
                }`}
              >
                Estados
              </button>
              <button
                onClick={() => setConfigTab("historial")}
                className={`px-5 py-2 text-xs font-bold rounded-full transition-all duration-300 cursor-pointer ${
                  configTab === "historial"
                    ? "bg-white text-brand-950 shadow-sm"
                    : "text-brand-600 hover:text-brand-850 hover:bg-white/30"
                }`}
              >
                Historial
              </button>
            </div>

            {/* Context-aware Button Actions */}
            {configTab === "expedientes" ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="h-7 text-[10px] px-2.5 shadow-none border border-brand-200 hover:bg-brand-50 text-brand-800 rounded-xl"
                >
                  + Nuevo Expediente
                </Button>
                <span className="text-[10px] font-semibold bg-brand-100 text-brand-850 border border-brand-200 px-2 py-0.5 rounded-full hidden sm:inline-block">
                  {rootsTypes.length}
                </span>
              </div>
            ) : configTab === "estados" ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsEditingStatus(false);
                    setStatusId("");
                    setStatusLabel("");
                    setStatusColor("#FAF7FD");
                    setStatusTextColor("#381D4E");
                    setIsStatusFormOpen(true);
                  }}
                  className="h-7 text-[10px] px-2.5 shadow-none border border-brand-200 hover:bg-brand-50 text-brand-800 rounded-xl"
                >
                  + Nuevo Estado
                </Button>
                <span className="text-[10px] font-semibold bg-brand-100 text-brand-850 border border-brand-200 px-2 py-0.5 rounded-full hidden sm:inline-block">
                  {statusConfigs.length}
                </span>
              </div>
            ) : null}
          </div>

          {/* Scrollable Content */}
          <div className="flex-grow overflow-y-auto p-6 min-h-0">
            {activeKanbanRt ? (
              <div className="animate-fade-in space-y-4">
                <div className="flex items-center justify-between border-b border-brand-200 pb-3">
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-brand-950">Tablero Kanban: {activeKanbanRt.name}</h4>
                    <p className="text-[10px] text-brand-400">Progreso ordenado por prioridad dinámica de documentos validados.</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveKanbanRt(null)}
                    className="h-7 text-[10px] text-brand-700 hover:bg-brand-100 rounded-xl"
                  >
                    Volver a lista
                  </Button>
                </div>
                <KanbanBoard
                  clients={clients.filter((c) => c.rootsTypeId === activeKanbanRt.id)}
                  steps={activeKanbanRt.rootsTypesSteps.map((rts) => ({
                    id: rts.step.id,
                    name: rts.step.name,
                  }))}
                  onSelectClient={setSelectedClient}
                  onUpdateStatus={handleUpdateStepStatus}
                />
              </div>
            ) : configTab === "expedientes" ? (
              <div className="animate-fade-in">
                <ExpedientesSection
                  rootsTypes={rootsTypes}
                  clients={clients}
                  loading={loading}
                  onActiveRt={setActiveKanbanRt}
                  onStartEdit={handleStartEdit}
                  onDeleteRt={handleDeleteRt}
                  onCreateClick={() => setIsCreateOpen(true)}
                />
              </div>
            ) : configTab === "estados" ? (
              <div className="animate-fade-in">
                <EstadosSection
                  statusConfigs={statusConfigs}
                  loading={loading}
                  onEditStatus={handleEditStatus}
                  onDeleteStatus={handleDeleteStatus}
                />
              </div>
            ) : (
              <div className="animate-fade-in h-full">
                <HistorialSection auditLogs={auditLogs} loading={loading} />
              </div>
            )}
          </div>
        </div>

      </div>


      {/* ========================================== */}
      {/* SYSTEM MODALS                              */}
      {/* ========================================== */}

      {/* MODAL 1: NUEVO EXPEDIENTE */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nuevo Tipo de Expediente">
        <form onSubmit={handleCreateRtSubmit} className="space-y-4 max-w-xl mx-auto">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-brand-500 uppercase">Nombre</label>
            <input
              type="text"
              value={newRtName}
              onChange={(e) => setNewRtName(e.target.value)}
              placeholder="Ej: Regularización de Nómina Comercial"
              className="w-full bg-brand-50 border border-brand-200 rounded-card px-3.5 py-2 text-xs text-brand-950 placeholder-brand-300 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-brand-500 uppercase">Descripción</label>
            <textarea
              value={newRtDesc}
              onChange={(e) => setNewRtDesc(e.target.value)}
              placeholder="Describa el objetivo y alcance de este tipo de expediente..."
              className="w-full bg-brand-50 border border-brand-200 rounded-card px-3.5 py-2 text-xs text-brand-950 placeholder-brand-300 focus:outline-none focus:border-brand-500 focus:bg-white h-28 resize-none transition-all"
            />
          </div>
          <div className="flex gap-2 pt-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl">
              Crear Expediente
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: GESTIONAR EXPEDIENTE Y PASOS */}
      {activeRt && (
        <Modal
          isOpen={true}
          onClose={() => setActiveRt(null)}
          title={`Configuración de Expediente: ${activeRt.name}`}
        >
          <RootsTypeModal
            rootsType={activeRt}
            allSteps={steps}
            onClose={() => setActiveRt(null)}
            onToggleStep={handleToggleStep}
            onCreateStep={handleCreateStep}
            onUpdateStep={handleUpdateStep}
            onReorderSteps={handleReorderSteps}
          />
        </Modal>
      )}

      {/* MODAL 3: EDITAR DETALLES DEL EXPEDIENTE */}
      {editingRt && (
        <Modal
          isOpen={true}
          onClose={() => setEditingRt(null)}
          title={`Editar Detalles: ${editingRt.name}`}
        >
          <form onSubmit={handleSaveDetailsSubmit} className="space-y-4 max-w-xl mx-auto">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-brand-500 uppercase">Nombre</label>
              <input
                type="text"
                value={editRtName}
                onChange={(e) => setEditRtName(e.target.value)}
                className="w-full bg-brand-50 border border-brand-200 rounded-card px-3.5 py-2 text-xs text-brand-950 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-brand-500 uppercase">Descripción</label>
              <textarea
                value={editRtDesc}
                onChange={(e) => setEditRtDesc(e.target.value)}
                className="w-full bg-brand-50 border border-brand-200 rounded-card px-3.5 py-2 text-xs text-brand-950 focus:outline-none focus:border-brand-500 focus:bg-white h-28 resize-none transition-all"
              />
            </div>
            <div className="flex gap-2 pt-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingRt(null)} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl">
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: DETALLE DE CLIENTE (SPLIT VIEW) */}
      {selectedClient && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedClient(null)}
          title="Ficha Detallada del Cliente"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-2 max-w-4xl mx-auto">
            {/* Column Left (1/3 width): Client Card details */}
            <div className="md:col-span-1 bg-brand-50/40 border border-brand-200 rounded-card p-6 flex flex-col items-center justify-between text-center space-y-6 shadow-xs max-h-[550px] overflow-y-auto">
              {isEditingDetails ? (
                <div className="w-full space-y-3 text-left text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-brand-400 uppercase tracking-wider block">Nombre</label>
                    <input
                      type="text"
                      value={editFields.name}
                      onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                      className="w-full bg-white border border-brand-200 rounded-lg px-2.5 py-1 text-xs text-brand-950 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-brand-400 uppercase tracking-wider block">Apellido</label>
                    <input
                      type="text"
                      value={editFields.lastname}
                      onChange={(e) => setEditFields({ ...editFields, lastname: e.target.value })}
                      className="w-full bg-white border border-brand-200 rounded-lg px-2.5 py-1 text-xs text-brand-950 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-brand-400 uppercase tracking-wider block">Correo Electrónico</label>
                    <input
                      type="email"
                      value={editFields.email}
                      onChange={(e) => setEditFields({ ...editFields, email: e.target.value })}
                      className="w-full bg-white border border-brand-200 rounded-lg px-2.5 py-1 text-xs text-brand-950 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-brand-400 uppercase tracking-wider block">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      value={editFields.whatsappId}
                      onChange={(e) => setEditFields({ ...editFields, whatsappId: e.target.value })}
                      className="w-full bg-white border border-brand-200 rounded-lg px-2.5 py-1 text-xs text-brand-950 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-brand-400 uppercase tracking-wider block">Carpeta de Google Drive</label>
                    <input
                      type="text"
                      value={editFields.driveFolderUrl}
                      onChange={(e) => setEditFields({ ...editFields, driveFolderUrl: e.target.value })}
                      className="w-full bg-white border border-brand-200 rounded-lg px-2.5 py-1 text-xs text-brand-950 focus:outline-none focus:border-brand-500 transition-colors"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-brand-400 uppercase tracking-wider block">Fecha de Cita</label>
                    <input
                      type="date"
                      value={editFields.appointmentDate}
                      onChange={(e) => setEditFields({ ...editFields, appointmentDate: e.target.value })}
                      className="w-full bg-white border border-brand-200 rounded-lg px-2.5 py-1 text-xs text-brand-950 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-brand-400 uppercase tracking-wider block">Mes de Registro</label>
                    <input
                      type="month"
                      value={editFields.registrationMonth}
                      onChange={(e) => setEditFields({ ...editFields, registrationMonth: e.target.value })}
                      className="w-full bg-white border border-brand-200 rounded-lg px-2.5 py-1 text-xs text-brand-950 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-brand-400 uppercase tracking-wider block">Estado del Pasaporte</label>
                    <select
                      value={editFields.passportStatus}
                      onChange={(e) => setEditFields({ ...editFields, passportStatus: e.target.value })}
                      className="w-full bg-white border border-brand-200 rounded-lg px-2.5 py-1.5 text-xs text-brand-950 focus:outline-none focus:border-brand-500 transition-colors cursor-pointer"
                    >
                      <option value="Pending">Pendiente</option>
                      <option value="Uploaded">Subido</option>
                      <option value="Approved">Aprobado</option>
                      <option value="Rejected">Rechazado</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 h-8 text-[10px] rounded-xl"
                      disabled={isSavingDetails}
                      onClick={() => setIsEditingDetails(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 h-8 text-[10px] bg-brand-600 hover:bg-brand-700 text-white rounded-xl"
                      disabled={isSavingDetails}
                      onClick={handleSaveClientDetails}
                    >
                      {isSavingDetails ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col justify-between h-full space-y-6">
                  <div className="w-full space-y-4">
                    {selectedClient.image ? (
                      <img
                        src={selectedClient.image}
                        alt={selectedClient.name}
                        className="w-24 h-24 rounded-card object-cover border-2 border-brand-100 shadow-md mx-auto"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-card bg-gradient-to-tr from-brand-500/10 to-brand-700/10 border-2 border-brand-500/20 flex items-center justify-center text-3xl font-extrabold text-brand-600 uppercase shadow-inner mx-auto">
                        {selectedClient.name ? selectedClient.name[0] : ""}{selectedClient.lastname ? selectedClient.lastname[0] : ""}
                      </div>
                    )}

                    <div className="flex justify-between items-center w-full">
                      <div className="space-y-1 text-left min-w-0 flex-grow pr-2">
                        <h3 className="text-lg font-extrabold text-brand-950 tracking-tight leading-snug truncate">
                          {selectedClient.name} {selectedClient.lastname || ""}
                        </h3>
                        <p className="text-xs text-brand-400 truncate">{selectedClient.email}</p>
                      </div>
                      <button
                        onClick={() => setIsEditingDetails(true)}
                        className="text-[10px] font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200/60 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs flex-shrink-0"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Editar
                      </button>
                    </div>

                    <div className="border-t border-brand-200/60 pt-4 space-y-3 w-full text-left text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-brand-100/50">
                        <span className="font-semibold text-brand-400 uppercase text-[9px] tracking-wider">NIE</span>
                        <span className="font-mono font-bold text-brand-800 bg-white px-2 py-0.5 rounded-lg border border-brand-200/60">
                          {generateMockNIE(selectedClient)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-brand-100/50">
                        <span className="font-semibold text-brand-400 uppercase text-[9px] tracking-wider">Teléfono / WA</span>
                        <span className="font-semibold text-brand-800 bg-white px-2 py-0.5 rounded-lg border border-brand-200/60">
                          {selectedClient.whatsappId || "No registrado"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-brand-100/50">
                        <span className="font-semibold text-brand-400 uppercase text-[9px] tracking-wider">Carpeta Drive</span>
                        {selectedClient.driveFolderUrl ? (
                          <a
                            href={selectedClient.driveFolderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-700 hover:text-brand-900 hover:underline font-semibold flex items-center gap-1 text-[11px] truncate max-w-[150px]"
                          >
                            Ver Carpeta
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-brand-400 italic">No configurada</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-brand-100/50">
                        <span className="font-semibold text-brand-400 uppercase text-[9px] tracking-wider">Fecha Cita</span>
                        <span className="font-semibold text-brand-800 bg-white px-2 py-0.5 rounded-lg border border-brand-200/60">
                          {selectedClient.appointmentDate
                            ? new Date(selectedClient.appointmentDate).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "Sin cita"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-brand-100/50">
                        <span className="font-semibold text-brand-400 uppercase text-[9px] tracking-wider">Mes Registro</span>
                        <span className="font-semibold text-brand-800 bg-white px-2 py-0.5 rounded-lg border border-brand-200/60">
                          {selectedClient.registrationMonth || "No registrado"}
                        </span>
                      </div>
                      <div className="flex justify-between items-start py-1 border-b border-brand-100/50">
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <span className="font-semibold text-brand-400 uppercase text-[9px] tracking-wider block">Pasaporte</span>
                          {selectedClient.passportUrl ? (
                            <button
                              type="button"
                              onClick={() => {
                                setViewerUrl(selectedClient.passportUrl || null);
                                setViewerTitle(`Pasaporte: ${selectedClient.name} ${selectedClient.lastname || ""}`);
                              }}
                              className="text-emerald-700 hover:text-emerald-900 hover:underline font-semibold flex items-center gap-1 text-[10px] truncate max-w-[120px] cursor-pointer text-left"
                            >
                              Ver Archivo
                            </button>
                          ) : (
                            <span className="text-brand-400 italic text-[10px]">No cargado</span>
                          )}
                        </div>
                        <span
                          className="px-2 py-0.5 text-[9px] font-bold rounded-full border shadow-xs flex-shrink-0"
                          style={getStatusStyle(selectedClient.passportStatus || "Pending")}
                        >
                          {statusConfigs.find((s) => s.id === (selectedClient.passportStatus || "Pending"))?.label || "Pendiente"}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <label className="text-[9px] font-semibold text-brand-400 uppercase tracking-wider block">Subir Pasaporte</label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleUploadFile(null, e.target.files[0]);
                            }
                          }}
                          className="block w-full text-[10px] text-brand-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Progress Summary in Left Column */}
                  <div className="w-full pt-4 border-t border-brand-200/60 text-left">
                    <div className="flex justify-between items-center text-[10px] text-brand-400 mb-1.5">
                      <span className="font-semibold uppercase tracking-wider text-[9px]">Avance Requisitos</span>
                      <span className="font-bold text-brand-800">
                        {selectedClient.steps.filter((s) => s.status === "Approved").length}/{selectedClient.steps.length}
                      </span>
                    </div>
                    {selectedClient.steps.length > 0 ? (
                      <div className="w-full bg-brand-100 rounded-full h-2 overflow-hidden border border-brand-200/40">
                        <div
                          className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round(
                              (selectedClient.steps.filter((s) => s.status === "Approved").length /
                                selectedClient.steps.length) *
                                100
                            )}%`
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-[10px] text-brand-400 italic block text-center">Sin expediente asignado</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Column Right (2/3 width): Step requirements detail list with status dropdowns */}
            <div className="md:col-span-2 bg-white border border-brand-200 rounded-card p-6 shadow-xs flex flex-col justify-between min-h-[400px] space-y-6">
              <div className="space-y-6 w-full">
                <div>
                  <span className="text-[9px] font-bold text-brand-600 uppercase tracking-wider block mb-0.5">Expediente Asignado</span>
                  <h3 className="text-xl font-bold text-brand-950 leading-none">
                    {selectedClient.processName}
                  </h3>
                </div>

                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                  {selectedClient.steps.map((step) => (
                    <div
                      key={step.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-brand-100 hover:border-brand-200 bg-brand-50/10 hover:bg-brand-50/30 transition-colors"
                    >
                      <div className="space-y-1 max-w-sm">
                        <h4 className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                          {step.name}
                          {step.isMandatory && (
                            <span className="text-[8px] bg-amber-50 text-amber-700 border border-amber-200 px-1 py-0.2 rounded font-bold uppercase">
                              Obligatorio
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-brand-500 leading-normal">
                          {step.description || "Sin descripción disponible."}
                        </p>
                        {step.document && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-fit">
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <button
                              type="button"
                              onClick={() => {
                                setViewerUrl(step.document?.url || null);
                                setViewerTitle(`${step.name} - ${selectedClient.name}`);
                              }}
                              className="hover:underline font-semibold truncate max-w-[200px] cursor-pointer text-left"
                            >
                              {step.document.name}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Status Dropdown and File Upload */}
                      <div className="w-full sm:w-auto flex-shrink-0 flex flex-col items-start sm:items-end gap-2">
                        <select
                          value={step.status}
                          onChange={(e) => handleUpdateStepStatus(selectedClient.id, step.id, e.target.value)}
                          className="w-full sm:w-40 border rounded-lg px-2.5 py-1.5 text-[11px] font-bold focus:outline-none cursor-pointer shadow-xs transition-all animate-fade-in"
                          style={getStatusStyle(step.status)}
                        >
                          {statusConfigs.map((status) => (
                            <option
                              key={status.id}
                              value={status.id}
                              style={{
                                backgroundColor: "#ffffff",
                                color: "#381D4E",
                                fontWeight: "normal"
                              }}
                            >
                              {status.label}
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
                          <label className="text-[9px] font-semibold text-brand-400 uppercase tracking-wider">Cargar:</label>
                          <input
                            type="file"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleUploadFile(step.id, e.target.files[0]);
                              }
                            }}
                            className="block text-[10px] text-brand-500 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-brand-50 file:text-brand-750 hover:file:bg-brand-100 cursor-pointer w-[150px]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {selectedClient.steps.length === 0 && (
                    <div className="py-12 text-center text-brand-400 italic text-xs border border-dashed border-brand-200 rounded-card bg-brand-50/10">
                      Este cliente no tiene ningún expediente o paso asignado.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-brand-100 w-full">
                <Button variant="secondary" size="sm" onClick={() => setSelectedClient(null)} className="border border-brand-200 hover:bg-brand-50 text-brand-800 rounded-xl">
                  Cerrar Ficha
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 5: CREAR / EDITAR ESTADO */}
      <Modal
        isOpen={isStatusFormOpen}
        onClose={() => setIsStatusFormOpen(false)}
        title={isEditingStatus ? `Editar Estado: ${statusId}` : "Nuevo Estado Personalizado"}
      >
        <form onSubmit={handleSaveStatusSubmit} className="space-y-4 max-w-xl mx-auto">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-brand-500 uppercase">Identificador (ID)</label>
            <input
              type="text"
              value={statusId}
              disabled={isEditingStatus}
              onChange={(e) => setStatusId(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
              placeholder="Ej: en_proceso"
              className="w-full bg-brand-50 border border-brand-200 rounded-card px-3.5 py-2 text-xs text-brand-950 placeholder-brand-300 focus:outline-none focus:border-brand-500 focus:bg-white disabled:opacity-50 transition-all"
              required
            />
            <span className="text-[9px] text-brand-400 block">Sólo letras, números y guiones bajos (sin espacios).</span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-brand-500 uppercase">Etiqueta de visualización</label>
            <input
              type="text"
              value={statusLabel}
              onChange={(e) => setStatusLabel(e.target.value)}
              placeholder="Ej: En Proceso Técnico"
              className="w-full bg-brand-50 border border-brand-200 rounded-card px-3.5 py-2 text-xs text-brand-950 placeholder-brand-300 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-brand-500 uppercase">Color de Fondo</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={statusColor}
                  onChange={(e) => setStatusColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-brand-200 cursor-pointer overflow-hidden p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={statusColor}
                  onChange={(e) => setStatusColor(e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1 bg-brand-50 border border-brand-200 rounded-lg px-2 text-xs text-brand-950 focus:outline-none focus:border-brand-500 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-brand-500 uppercase">Color del Texto</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={statusTextColor}
                  onChange={(e) => setStatusTextColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-brand-200 cursor-pointer overflow-hidden p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={statusTextColor}
                  onChange={(e) => setStatusTextColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 bg-brand-50 border border-brand-200 rounded-lg px-2 text-xs text-brand-950 focus:outline-none focus:border-brand-500 transition-all font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Preview Banner */}
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-card space-y-2">
            <span className="text-[9px] font-semibold text-brand-400 uppercase tracking-wider block">Vista Previa del Badge</span>
            <div className="flex justify-center p-3 bg-white rounded-lg border border-brand-100">
              <span
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full border shadow-xs"
                style={{
                  backgroundColor: statusColor,
                  color: statusTextColor,
                  borderColor: `${statusTextColor}25`
                }}
              >
                {statusLabel || "Ejemplo de Estado"}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsStatusFormOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl">
              {isEditingStatus ? "Guardar Cambios" : "Crear Estado"}
            </Button>
          </div>
        </form>
      </Modal>

      <DocumentViewerModal
        isOpen={!!viewerUrl}
        onClose={() => setViewerUrl(null)}
        url={viewerUrl || ""}
        title={viewerTitle}
      />
    </div>
  );
}
