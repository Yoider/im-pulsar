import { prisma } from "../db";

export interface SecureUser {
  id: string;
  name: string;
  lastname: string | null;
  email: string;
  whatsappId: string | null;
  role: {
    name: string;
    admin: boolean;
  } | null;
}

export async function getUserByIdSecure(id: string): Promise<SecureUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        lastname: true,
        email: true,
        whatsappId: true,
        role: {
          select: {
            name: true,
            admin: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.error("Error in getUserByIdSecure:", error);
    return null;
  }
}

export async function getUserByEmailSecure(email: string): Promise<SecureUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        lastname: true,
        email: true,
        whatsappId: true,
        role: {
          select: {
            name: true,
            admin: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.error("Error in getUserByEmailSecure:", error);
    return null;
  }
}
