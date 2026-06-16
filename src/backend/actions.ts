"use server";

import { prisma } from "@/backend/db";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/backend/audit";
import { getComponentDocContent } from "@/backend/services/docs.service";

export interface Step {
  id: number;
  name: string;
  description?: string | null;
  isMandatory: boolean;
  shortOrder: number;
  status: string;
  value?: string;
  comments?: string;
  document?: {
    name: string;
    extension: string;
    url: string;
  };
}

export interface ClientData {
  id: string;
  name: string;
  lastname: string | null;
  email: string;
  whatsappId?: string | null;
  processName: string;
  steps: Step[];
  rootsTypeId?: number | null;
  image?: string | null;
  driveFolderUrl?: string | null;
  passportUrl?: string | null;
  passportStatus?: string | null;
  appointmentDate?: Date | null;
  registrationMonth?: string | null;
}

export async function getUsersAction(): Promise<ClientData[]> {
  try {
    const clients = await prisma.user.findMany({
      where: {
        role: {
          name: "client"
        }
      },
      include: {
        rootsType: {
          include: {
            rootsTypesSteps: {
              include: {
                step: true
              }
            }
          }
        },
        progressList: {
          include: {
            step: true,
            document: true
          }
        }
      }
    });

    return clients.map(client => {
      // Get associated steps sorted by shortOrder from intermediate table
      const relevantSteps = client.rootsType
        ? [...client.rootsType.rootsTypesSteps]
            .sort((a, b) => a.shortOrder - b.shortOrder)
            .map(rts => ({
              ...rts.step,
              isMandatory: rts.isMandatory,
              shortOrder: rts.shortOrder
            }))
        : [];

      const mappedSteps = relevantSteps.map(step => {
        const progress = client.progressList.find(p => p.stepId === step.id);
        return {
          id: step.id,
          name: step.name,
          description: step.description,
          isMandatory: step.isMandatory,
          shortOrder: step.shortOrder,
          status: progress?.status || "Pending",
          value: progress?.value || undefined,
          comments: progress?.adminComments || undefined,
          document: progress?.document ? {
            name: progress.document.name,
            extension: progress.document.extension,
            url: progress.document.url
          } : undefined
        };
      });

      return {
        id: client.id,
        name: client.name,
        lastname: client.lastname,
        email: client.email,
        whatsappId: client.whatsappId,
        processName: client.rootsType?.name || "Sin Asignar",
        steps: mappedSteps,
        rootsTypeId: client.rootsTypeId,
        image: client.image,
        driveFolderUrl: client.driveFolderUrl,
        passportUrl: client.passportUrl,
        passportStatus: client.passportStatus,
        appointmentDate: client.appointmentDate,
        registrationMonth: client.registrationMonth
      };
    });
  } catch (error) {
    console.error("Error in getUsersAction:", error);
    return [];
  }
}

export async function uploadDocumentAction(userId: string, stepId: number, docName: string, docUrl: string) {
  try {
    // Create a new document record
    const document = await prisma.document.create({
      data: {
        name: docName,
        extension: docName.split(".").pop() || "pdf",
        url: docUrl
      }
    });

    // Upsert progress
    const progress = await prisma.userProcessProgress.findFirst({
      where: { userId, stepId }
    });

    if (progress) {
      await prisma.userProcessProgress.update({
        where: { id: progress.id },
        data: {
          documentId: document.id,
          status: "Uploaded",
          adminComments: null
        }
      });
      await createAuditLog({
        action: "UPLOAD_DOCUMENT",
        entityType: "UserProcessProgress",
        entityId: String(progress.id),
        clientUserId: userId,
        oldValues: { documentId: progress.documentId, status: progress.status },
        newValues: { documentId: document.id, status: "Uploaded", fileUrl: docUrl }
      });
    } else {
      const newProgress = await prisma.userProcessProgress.create({
        data: {
          userId,
          stepId,
          documentId: document.id,
          status: "Uploaded"
        }
      });
      await createAuditLog({
        action: "UPLOAD_DOCUMENT",
        entityType: "UserProcessProgress",
        entityId: String(newProgress.id),
        clientUserId: userId,
        oldValues: null,
        newValues: { documentId: document.id, status: "Uploaded", fileUrl: docUrl }
      });
    }

    revalidatePath("/");
  } catch (error) {
    console.error("Error in uploadDocumentAction:", error);
    throw new Error("No se pudo subir el documento");
  }
}

export async function updateStepValueAction(userId: string, stepId: number, value: string) {
  try {
    const progress = await prisma.userProcessProgress.findFirst({
      where: { userId, stepId }
    });

    if (progress) {
      await prisma.userProcessProgress.update({
        where: { id: progress.id },
        data: {
          value,
          status: "Uploaded",
          adminComments: null
        }
      });
    } else {
      await prisma.userProcessProgress.create({
        data: {
          userId,
          stepId,
          value,
          status: "Uploaded"
        }
      });
    }

    revalidatePath("/");
  } catch (error) {
    console.error("Error in updateStepValueAction:", error);
    throw new Error("No se pudo guardar el valor");
  }
}

export async function validateStepAction(
  userId: string,
  stepId: number,
  status: "Approved" | "Rejected",
  comments?: string
) {
  try {
    // Find the admin user to use as validator
    const admin = await prisma.user.findFirst({
      where: {
        role: {
          name: "admin"
        }
      }
    });

    const progress = await prisma.userProcessProgress.findFirst({
      where: { userId, stepId }
    });

    const adminComments = status === "Rejected" ? comments || null : null;

    if (!progress) {
      // Create if it doesn't exist
      const newProgress = await prisma.userProcessProgress.create({
        data: {
          userId,
          stepId,
          status,
          adminComments,
          validatedByUserId: admin?.id || null
        }
      });
      await createAuditLog({
        action: "VALIDATE_STEP",
        entityType: "UserProcessProgress",
        entityId: String(newProgress.id),
        clientUserId: userId,
        oldValues: null,
        newValues: { status, adminComments }
      });
    } else {
      await prisma.userProcessProgress.update({
        where: { id: progress.id },
        data: {
          status,
          adminComments,
          validatedByUserId: admin?.id || null
        }
      });
      await createAuditLog({
        action: "VALIDATE_STEP",
        entityType: "UserProcessProgress",
        entityId: String(progress.id),
        clientUserId: userId,
        oldValues: { status: progress.status, adminComments: progress.adminComments },
        newValues: { status, adminComments }
      });
    }

    revalidatePath("/");
  } catch (error) {
    console.error("Error in validateStepAction:", error);
    throw new Error("No se pudo validar el paso");
  }
}

// ==========================================
// CRUD: RootsType (Expedientes)
// ==========================================

export async function getRootsTypesAction() {
  try {
    return await prisma.rootsType.findMany({
      orderBy: { id: "asc" },
      include: {
        rootsTypesSteps: {
          include: {
            step: true
          }
        }
      }
    });
  } catch (error) {
    console.error("Error in getRootsTypesAction:", error);
    return [];
  }
}

export async function createRootsTypeAction(name: string, description?: string) {
  try {
    const item = await prisma.rootsType.create({
      data: { name, description }
    });
    revalidatePath("/");
    return item;
  } catch (error) {
    console.error("Error in createRootsTypeAction:", error);
    throw new Error("No se pudo crear el tipo de expediente");
  }
}

export async function updateRootsTypeAction(id: number, name: string, description?: string) {
  try {
    const item = await prisma.rootsType.update({
      where: { id },
      data: { name, description }
    });
    revalidatePath("/");
    return item;
  } catch (error) {
    console.error("Error in updateRootsTypeAction:", error);
    throw new Error("No se pudo actualizar el tipo de expediente");
  }
}

export async function deleteRootsTypeAction(id: number) {
  try {
    // Delete associations first
    await prisma.rootsTypesSteps.deleteMany({
      where: { rootsTypeId: id }
    });
    const item = await prisma.rootsType.delete({
      where: { id }
    });
    revalidatePath("/");
    return item;
  } catch (error) {
    console.error("Error in deleteRootsTypeAction:", error);
    throw new Error("No se pudo eliminar el tipo de expediente");
  }
}

// ==========================================
// CRUD: Step (Pasos de Registro)
// ==========================================

export async function getStepsAction() {
  try {
    return await prisma.step.findMany({
      orderBy: { id: "asc" }
    });
  } catch (error) {
    console.error("Error in getStepsAction:", error);
    return [];
  }
}

export async function createStepAction(
  name: string,
  description: string | null,
  triggerCondition: string | null = null,
  geminiInstructions: string | null = null
) {
  try {
    const item = await prisma.step.create({
      data: { name, description, triggerCondition, geminiInstructions }
    });
    revalidatePath("/");
    return item;
  } catch (error) {
    console.error("Error in createStepAction:", error);
    throw new Error("No se pudo crear el paso");
  }
}

export async function updateStepAction(
  id: number,
  name: string,
  description: string | null,
  triggerCondition: string | null = null,
  geminiInstructions: string | null = null
) {
  try {
    const item = await prisma.step.update({
      where: { id },
      data: { name, description, triggerCondition, geminiInstructions }
    });
    revalidatePath("/");
    return item;
  } catch (error) {
    console.error("Error in updateStepAction:", error);
    throw new Error("No se pudo actualizar el paso");
  }
}

export async function deleteStepAction(id: number) {
  try {
    // Delete associations first
    await prisma.rootsTypesSteps.deleteMany({
      where: { stepId: id }
    });
    // Delete user progress entries related to this step to prevent constraint violation
    await prisma.userProcessProgress.deleteMany({
      where: { stepId: id }
    });
    const item = await prisma.step.delete({
      where: { id }
    });
    revalidatePath("/");
    return item;
  } catch (error) {
    console.error("Error in deleteStepAction:", error);
    throw new Error("No se pudo eliminar el paso");
  }
}

// ==========================================
// CRUD: RootsTypesSteps (Asociaciones)
// ==========================================

export async function associateStepAction(
  rootsTypeId: number,
  stepId: number,
  isMandatory: boolean = false,
  shortOrder: number = 1
) {
  try {
    const item = await prisma.rootsTypesSteps.upsert({
      where: {
        rootsTypeId_stepId: { rootsTypeId, stepId }
      },
      update: { isMandatory, shortOrder },
      create: { rootsTypeId, stepId, isMandatory, shortOrder }
    });
    revalidatePath("/");
    return item;
  } catch (error) {
    console.error("Error in associateStepAction:", error);
    throw new Error("No se pudo asociar el paso al expediente");
  }
}


export async function updateAssociationAction(
  rootsTypeId: number,
  stepId: number,
  isMandatory: boolean,
  shortOrder: number
) {
  try {
    const item = await prisma.rootsTypesSteps.update({
      where: {
        rootsTypeId_stepId: {
          rootsTypeId,
          stepId
        }
      },
      data: { isMandatory, shortOrder }
    });
    revalidatePath("/");
    return item;
  } catch (error) {
    console.error("Error in updateAssociationAction:", error);
    throw new Error("No se pudo actualizar la configuración del paso");
  }
}

export async function disassociateStepAction(rootsTypeId: number, stepId: number) {
  try {
    const item = await prisma.rootsTypesSteps.delete({
      where: {
        rootsTypeId_stepId: {
          rootsTypeId,
          stepId
        }
      }
    });
    revalidatePath("/");
    return item;
  } catch (error) {
    console.error("Error in disassociateStepAction:", error);
    throw new Error("No se pudo desasociar el paso del expediente");
  }
}

export async function reorderStepsAction(rootsTypeId: number, stepIds: number[]) {
  try {
    await prisma.$transaction(
      stepIds.map((stepId, index) =>
        prisma.rootsTypesSteps.update({
          where: {
            rootsTypeId_stepId: { rootsTypeId, stepId }
          },
          data: { shortOrder: index + 1 }
        })
      )
    );
    revalidatePath("/");
  } catch (error) {
    console.error("Error in reorderStepsAction:", error);
    throw new Error("No se pudo reordenar los pasos");
  }
}

export async function assignRootsTypeToUserAction(userId: string, rootsTypeId: number | null) {
  try {
    const oldUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { rootsTypeId }
    });
    await createAuditLog({
      action: "ASSIGN_ROOTS_TYPE",
      entityType: "User",
      entityId: userId,
      clientUserId: userId,
      oldValues: { rootsTypeId: oldUser?.rootsTypeId },
      newValues: { rootsTypeId }
    });
    revalidatePath("/");
    return updatedUser;
  } catch (error) {
    console.error("Error in assignRootsTypeToUserAction:", error);
    throw new Error("No se pudo asignar el expediente al usuario");
  }
}

export interface StatusConfig {
  id: string;
  label: string;
  color: string;
  textColor: string;
}

export async function getStatusConfigsAction(): Promise<StatusConfig[]> {
  try {
    let configs = await prisma.statusConfig.findMany();
    
    // Auto-seed default system statuses if empty
    if (configs.length === 0) {
      const defaults = [
        { id: "Pending", label: "Pendiente", color: "#f1f5f9", textColor: "#475569" },
        { id: "Uploaded", label: "Subido", color: "#e0e7ff", textColor: "#4f46e5" },
        { id: "Approved", label: "Aprobado", color: "#d1fae5", textColor: "#059669" },
        { id: "Rejected", label: "Rechazado", color: "#fee2e2", textColor: "#dc2626" },
      ];
      
      await prisma.$transaction(
        defaults.map(item => prisma.statusConfig.create({ data: item }))
      );
      
      configs = await prisma.statusConfig.findMany();
    }
    
    return configs;
  } catch (error) {
    console.error("Error in getStatusConfigsAction:", error);
    return [];
  }
}

export async function saveStatusConfigAction(id: string, label: string, color: string, textColor: string) {
  try {
    const config = await prisma.statusConfig.upsert({
      where: { id },
      update: { label, color, textColor },
      create: { id, label, color, textColor }
    });
    revalidatePath("/");
    return config;
  } catch (error) {
    console.error("Error in saveStatusConfigAction:", error);
    throw new Error("No se pudo guardar la configuración de estado");
  }
}

export async function deleteStatusConfigAction(id: string) {
  try {
    const systemIds = ["Pending", "Uploaded", "Approved", "Rejected"];
    if (systemIds.includes(id)) {
      throw new Error("No se pueden eliminar los estados base del sistema");
    }
    
    const config = await prisma.statusConfig.delete({
      where: { id }
    });
    revalidatePath("/");
    return config;
  } catch (error) {
    console.error("Error in deleteStatusConfigAction:", error);
    throw new Error("No se pudo eliminar el estado");
  }
}

export async function updateUserStepStatusAction(userId: string, stepId: number, status: string) {
  try {
    const progress = await prisma.userProcessProgress.findFirst({
      where: { userId, stepId }
    });
    
    if (progress) {
      await prisma.userProcessProgress.update({
        where: { id: progress.id },
        data: { status }
      });
      await createAuditLog({
        action: "UPDATE_STEP_STATUS",
        entityType: "UserProcessProgress",
        entityId: String(progress.id),
        clientUserId: userId,
        oldValues: { status: progress.status },
        newValues: { status }
      });
    } else {
      const newProgress = await prisma.userProcessProgress.create({
        data: {
          userId,
          stepId,
          status
        }
      });
      await createAuditLog({
        action: "UPDATE_STEP_STATUS",
        entityType: "UserProcessProgress",
        entityId: String(newProgress.id),
        clientUserId: userId,
        oldValues: null,
        newValues: { status }
      });
    }
    revalidatePath("/");
  } catch (error) {
    console.error("Error in updateUserStepStatusAction:", error);
    throw new Error("No se pudo actualizar el estado del paso");
  }
}

export async function updateClientDetailsAction(
  userId: string,
  data: {
    name: string;
    lastname?: string | null;
    email: string;
    whatsappId?: string | null;
    driveFolderUrl?: string | null;
    passportUrl?: string | null;
    passportStatus?: string | null;
    appointmentDate?: Date | null;
    registrationMonth?: string | null;
  }
) {
  try {
    const oldUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        lastname: data.lastname,
        email: data.email,
        whatsappId: data.whatsappId,
        driveFolderUrl: data.driveFolderUrl,
        passportUrl: data.passportUrl,
        passportStatus: data.passportStatus || "Pending",
        appointmentDate: data.appointmentDate,
        registrationMonth: data.registrationMonth,
      }
    });
    await createAuditLog({
      action: "UPDATE_CLIENT_DETAILS",
      entityType: "User",
      entityId: userId,
      clientUserId: userId,
      oldValues: oldUser ? {
        name: oldUser.name,
        lastname: oldUser.lastname,
        email: oldUser.email,
        whatsappId: oldUser.whatsappId,
        driveFolderUrl: oldUser.driveFolderUrl,
        passportUrl: oldUser.passportUrl,
        passportStatus: oldUser.passportStatus,
        appointmentDate: oldUser.appointmentDate,
        registrationMonth: oldUser.registrationMonth
      } : null,
      newValues: data
    });
    revalidatePath("/");
    return updatedUser;
  } catch (error) {
    console.error("Error in updateClientDetailsAction:", error);
    throw new Error("No se pudieron actualizar los datos del cliente");
  }
}

export async function uploadClientFileAction(userId: string, stepId: number | null, formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No se proporcionó ningún archivo");
    }

    const fs = require("fs");
    const path = require("path");

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads", userId);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = file.name;
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${userId}/${filename}`;

    if (stepId !== null) {
      const document = await prisma.document.create({
        data: {
          name: filename,
          extension: filename.split(".").pop() || "pdf",
          url: relativeUrl
        }
      });

      const progress = await prisma.userProcessProgress.findFirst({
        where: { userId, stepId }
      });

      if (progress) {
        await prisma.userProcessProgress.update({
          where: { id: progress.id },
          data: {
            documentId: document.id,
            status: "Uploaded",
            adminComments: null
          }
        });
        await createAuditLog({
          action: "UPLOAD_DOCUMENT",
          entityType: "UserProcessProgress",
          entityId: String(progress.id),
          clientUserId: userId,
          oldValues: { documentId: progress.documentId, status: progress.status },
          newValues: { documentId: document.id, status: "Uploaded", fileUrl: relativeUrl }
        });
      } else {
        const newProgress = await prisma.userProcessProgress.create({
          data: {
            userId,
            stepId,
            documentId: document.id,
            status: "Uploaded"
          }
        });
        await createAuditLog({
          action: "UPLOAD_DOCUMENT",
          entityType: "UserProcessProgress",
          entityId: String(newProgress.id),
          clientUserId: userId,
          oldValues: null,
          newValues: { documentId: document.id, status: "Uploaded", fileUrl: relativeUrl }
        });
      }
    } else {
      const oldUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      await prisma.user.update({
        where: { id: userId },
        data: {
          passportUrl: relativeUrl,
          passportStatus: "Uploaded"
        }
      });
      await createAuditLog({
        action: "UPLOAD_PASSPORT",
        entityType: "User",
        entityId: userId,
        clientUserId: userId,
        oldValues: { passportUrl: oldUser?.passportUrl, passportStatus: oldUser?.passportStatus },
        newValues: { passportUrl: relativeUrl, passportStatus: "Uploaded" }
      });
    }

    revalidatePath("/");
    return { success: true, url: relativeUrl };
  } catch (error) {
    console.error("Error in uploadClientFileAction:", error);
    throw new Error("Error al subir el archivo");
  }
}

export interface AuditLogData {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedByUserId: string | null;
  performedByUserName: string | null;
  clientUserId: string | null;
  clientUserName: string | null;
  oldValues: string | null;
  newValues: string | null;
  createdAt: Date;
}

export async function getAuditLogsAction(): Promise<AuditLogData[]> {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        performedByUser: true,
        clientUser: true
      }
    });

    return logs.map(log => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      performedByUserId: log.performedByUserId,
      performedByUserName: log.performedByUser
        ? `${log.performedByUser.name} ${log.performedByUser.lastname || ""}`.trim()
        : null,
      clientUserId: log.clientUserId,
      clientUserName: log.clientUser
        ? `${log.clientUser.name} ${log.clientUser.lastname || ""}`.trim()
        : null,
      oldValues: log.oldValues,
      newValues: log.newValues,
      createdAt: log.createdAt
    }));
  } catch (error) {
    console.error("Error in getAuditLogsAction:", error);
    return [];
  }
}

export interface WhatsAppMessageData {
  id: string;
  whatsappId: string;
  direction: string;
  type: string;
  content: string;
  createdAt: Date;
}

export async function getWhatsAppMessagesAction(): Promise<WhatsAppMessageData[]> {
  try {
    const messages = await prisma.whatsAppMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    });
    return messages.map(msg => ({
      id: msg.id,
      whatsappId: msg.whatsappId,
      direction: msg.direction,
      type: msg.type,
      content: msg.content,
      createdAt: msg.createdAt
    }));
  } catch (error) {
    console.error("Error in getWhatsAppMessagesAction:", error);
    return [];
  }
}

export async function getComponentDocContentAction(componentName: string, docType: string): Promise<string | null> {
  return await getComponentDocContent(componentName, docType);
}

