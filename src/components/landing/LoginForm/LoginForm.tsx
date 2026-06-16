"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Button from "@/components/ui/Button/Button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Credenciales incorrectas. Inténtalo de nuevo.");
      } else {
        setSuccessMsg("¡Sesión iniciada con éxito! Redirigiendo...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error inesperado durante el inicio de sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn("google");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white border border-brand-100 rounded-card shadow-xl shadow-brand-200/20 backdrop-blur-xl space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-bold text-brand-950 tracking-tight">Acceso a la plataforma</h2>
        <p className="text-brand-500 text-sm font-medium">Ingresa tus datos para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold text-center animate-fade-in">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-semibold text-center animate-fade-in">
            {successMsg}
          </div>
        )}

        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-brand-50 border border-brand-200/60 hover:border-brand-400 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 rounded-xl text-sm text-brand-950 placeholder-brand-300 outline-none transition-all duration-200"
            placeholder="ejemplo@correo.com"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-brand-50 border border-brand-200/60 hover:border-brand-400 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 rounded-xl text-sm text-brand-950 placeholder-brand-300 outline-none transition-all duration-200"
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full mt-2 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md shadow-brand-500/20">
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
      </form>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-brand-100"></div>
        <span className="flex-shrink mx-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">
          O ingresar con
        </span>
        <div className="flex-grow border-t border-brand-100"></div>
      </div>

      <Button
        variant="secondary"
        onClick={handleGoogleLogin}
        className="w-full py-2.5 flex items-center justify-center gap-2 border border-brand-200 hover:bg-brand-50 text-brand-700 rounded-xl"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Google
      </Button>
    </div>
  );
}
