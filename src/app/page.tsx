import LoginForm from "@/components/landing/LoginForm/LoginForm";
import { auth } from "@/backend/auth";
import { redirect } from "next/navigation";

export default async function ImpulsarPage() {
  const session = await auth();

  // Redirect if user is already authenticated
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden font-sans p-6">
      {/* Background Decorative Gradients - Slate themed */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-slate-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-slate-300/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Container */}
      <div className="z-10 w-full flex flex-col items-center space-y-8 max-w-md text-center">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-slate-950 to-slate-650 select-none">
            Impulsar
          </h1>
          <p className="text-slate-500 font-semibold text-xs md:text-sm tracking-widest uppercase">
            Plataforma de Regularización
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
