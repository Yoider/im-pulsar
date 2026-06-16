"use server";

import { prisma } from "@/backend/db";
import { auth } from "@/backend/auth";

export async function createAuditLog(data: {
  action: string;
  entityType: string;
  entityId: string;
  clientUserId?: string | null;
  oldValues?: any;
  newValues?: any;
}) {
  try {
    const session = await auth();
    const performedByUserId = session?.user?.id || null;

    await prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        performedByUserId,
        clientUserId: data.clientUserId || null,
        oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
        newValues: data.newValues ? JSON.stringify(data.newValues) : null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
