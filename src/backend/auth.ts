import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Extend NextAuth session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      lastname: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    lastname?: string | null;
  }
}

const prismaAdapter = PrismaAdapter(prisma);
const customAdapter = {
  ...prismaAdapter,
  createUser: async (data: any) => {
    // Find the client role in the database dynamically
    const clientRole = await prisma.role.findUnique({
      where: { name: "client" },
    });
    
    // Enrich user data with the client role ID
    const enrichedData = {
      ...data,
      lastname: data.lastname || null,
      roleId: clientRole ? clientRole.id : null,
    };
    
    if (prismaAdapter.createUser) {
      return prismaAdapter.createUser(enrichedData);
    }
    // Fallback if createUser is somehow not defined on the base adapter
    return prisma.user.create({ data: enrichedData }) as any;
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: customAdapter,
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { role: true },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          lastname: user.lastname,
          role: user.role?.name || "client",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const anyToken = token as any;

      // Direct Google Login or Credentials Login - first call
      if (user) {
        anyToken.id = user.id;
        anyToken.role = user.role;
        anyToken.lastname = user.lastname;
      }
      
      // If signed up via Google OAuth, the user won't have a role in the session initially.
      // Let's query the database to make sure the token always has the latest role.
      if (token.email && !anyToken.role) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          include: { role: true },
        });
        if (dbUser) {
          anyToken.id = String(dbUser.id);
          anyToken.role = dbUser.role?.name || "client";
          anyToken.lastname = dbUser.lastname;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      const anyToken = token as any;
      if (session.user && anyToken) {
        session.user.id = anyToken.id || "";
        session.user.role = anyToken.role || "client";
        session.user.lastname = anyToken.lastname || null;
      }
      return session;
    },
  },
});
