import React from "react";
import { auth } from "@/backend/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/backend/db";
import DashboardClientContainer from "@/components/dashboard/DashboardClientContainer/DashboardClientContainer";
import ClientDashboard from "@/components/dashboard/ClientDashboard";

export default async function DashboardPage() {
  const session = await auth();

  // Guard redirection if session not found
  if (!session || !session.user || !session.user.email) {
    redirect("/");
  }

  const user = session.user;
  // Query actual client user data
  const clientUser = await prisma.user.findUnique({
    where: { email: user.email as string },
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

  if (!clientUser) {
    redirect("/");
  }

  // Map intermediate steps and progress to fit ClientDashboard props
  const relevantSteps = clientUser.rootsType
    ? [...clientUser.rootsType.rootsTypesSteps]
        .sort((a, b) => a.shortOrder - b.shortOrder)
        .map(rts => ({
          ...rts.step,
          isMandatory: rts.isMandatory,
          shortOrder: rts.shortOrder
        }))
    : [];

  const mappedSteps = relevantSteps.map(step => {
    const progress = clientUser.progressList.find(p => p.stepId === step.id);
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

  const clientData = {
    id: clientUser.id,
    name: clientUser.name,
    lastname: clientUser.lastname,
    email: clientUser.email,
    whatsappId: clientUser.whatsappId,
    processName: clientUser.rootsType?.name || "Sin Asignar",
    steps: mappedSteps,
    rootsTypeId: clientUser.rootsTypeId,
    driveFolderUrl: clientUser.driveFolderUrl,
    passportUrl: clientUser.passportUrl,
    passportStatus: clientUser.passportStatus,
    appointmentDate: clientUser.appointmentDate,
    registrationMonth: clientUser.registrationMonth
  };

  const clientView = <ClientDashboard clientData={clientData} />;

  return (
    <DashboardClientContainer
      user={{
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
      }}
      clientView={clientView}
    />
  );
}

