"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, LogIn } from "lucide-react";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { addNotificacion } from "../../lib/services";
import GoogleIcon  from "../../components/GoogleIcon";
import LoginLoader from "../../components/LoginLoader";

export default function LoginPage() {
  const router = useRouter();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe,   setRememberMe]   = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [showLoader,   setShowLoader]   = useState(false);

  // Redirige al dashboard cuando el loader termina los 5s
  useEffect(() => {
    if (!showLoader) return;
    const t = setTimeout(() => router.push("/dashboard"), 5000);
    return () => clearTimeout(t);
  }, [showLoader, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        localStorage.setItem("auth", "1");
      } else {
        sessionStorage.setItem("auth", "1");
      }
      await addNotificacion({
        mensaje: `Admin inició sesión correctamente`,
        seccion: "/login",
      });
      setShowLoader(true);
    } catch {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
    }
  }

  if (showLoader) return <LoginLoader />;

  return (
    <div className="login-root">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-card">
        <h1>Iniciar<br />sesión</h1>
        <p className="subtitle">Ingresa tus credenciales para continuar</p>

        <button type="button" className="social-btn">
          <GoogleIcon /> Continuar con Google
        </button>

        <div className="divider">o ingresa con tu correo</div>

        {error && (
          <div className="alert-error">
            <AlertCircle size={14} strokeWidth={2} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          <div className="field-group">
            <label htmlFor="email" className="field-label">Usuario</label>
            <div className="field-icon-wrap">
              <Mail size={14} className="field-icon" strokeWidth={1.8} />
              <input
                id="email"
                type="text"
                className={`field-input has-icon${error ? " error" : ""}`}
                placeholder="admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="password" className="field-label">Contraseña</label>
            <div className="field-icon-wrap password-wrap">
              <Lock size={14} className="field-icon" strokeWidth={1.8} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`field-input has-icon${error ? " error" : ""}`}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword
                  ? <EyeOff size={15} strokeWidth={1.8} />
                  : <Eye    size={15} strokeWidth={1.8} />}
              </button>
            </div>
          </div>

          <div className="options-row">
            <label className="check-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              Recordarme
            </label>
            <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading
              ? <><Loader2 size={15} className="btn-spin" /> Verificando...</>
              : <><LogIn   size={15} strokeWidth={2.2} /> Iniciar sesión</>}
          </button>

        </form>
      </div>
    </div>
  );
}
