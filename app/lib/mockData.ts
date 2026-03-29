// ─── Datos de ejemplo compartidos ───────────────────────────────────────────
// Cuando conectes la base de datos, reemplaza estos arrays con llamadas a tu API

export const CLIENTES_DATA = [
  { id: 1, nombre: "Carlos Méndez",  dni: "45123678", correo: "carlos@email.com",  telefono: "+51 999 111 222", pais: "Perú",      proyecto: "MiTienda Online",   fechaInicio: "2024-10-01", fechaMaxima: "2025-01-15", contrato: "6",  tipoPago: "mensual", valorPago: "150" },
  { id: 2, nombre: "Ana Torres",     dni: "52984321", correo: "ana@email.com",      telefono: "+54 911 222 333", pais: "Argentina", proyecto: "FitTrack App",      fechaInicio: "2024-08-10", fechaMaxima: "2024-12-20", contrato: "4",  tipoPago: "unico",   valorPago: "1200" },
  { id: 3, nombre: "Luis Ramírez",   dni: "30112456", correo: "luis@email.com",     telefono: "+52 55 3344 5566",pais: "México",    proyecto: "Panel de Gestión",  fechaInicio: "2024-06-01", fechaMaxima: "2024-09-30", contrato: "3",  tipoPago: "mensual", valorPago: "200" },
  { id: 4, nombre: "María González", dni: "18765432", correo: "maria@email.com",    telefono: "+57 300 444 5555",pais: "Colombia",  proyecto: "Agenda Médica",     fechaInicio: "2025-01-05", fechaMaxima: "2025-04-30", contrato: "3",  tipoPago: "mensual", valorPago: "180" },
  { id: 5, nombre: "Jorge Paredes",  dni: "25543210", correo: "jorge@email.com",    telefono: "+51 987 654 321", pais: "Perú",      proyecto: "EduPlatform",       fechaInicio: "2025-02-01", fechaMaxima: "2025-07-01", contrato: "5",  tipoPago: "unico",   valorPago: "2500" },
];

export const PEDIDOS_DATA = [
  { id: "P-001", clienteId: 1, cliente: "Carlos Méndez",  proyecto: "MiTienda Online",  tipo: "web",     servicio: "E-Commerce",            prioridad: "alta",    estado: "desarrollo", tecnologias: ["Next.js","PostgreSQL","Tailwind CSS"], fecha: "2024-10-01", fechaEntrega: "2025-01-15" },
  { id: "P-002", clienteId: 2, cliente: "Ana Torres",     proyecto: "FitTrack App",     tipo: "app",     servicio: "Aplicación Móvil",       prioridad: "media",   estado: "revision",   tecnologias: ["Flutter","Firebase"],                  fecha: "2024-08-10", fechaEntrega: "2024-12-20" },
  { id: "P-003", clienteId: 3, cliente: "Luis Ramírez",   proyecto: "Panel de Gestión", tipo: "desktop", servicio: "Dashboard / Panel Admin", prioridad: "baja",   estado: "entregado",  tecnologias: ["React","Node.js","MySQL"],              fecha: "2024-06-01", fechaEntrega: "2024-09-30" },
  { id: "P-004", clienteId: 4, cliente: "María González", proyecto: "Agenda Médica",    tipo: "web",     servicio: "Reservas / Citas Online", prioridad: "urgente",estado: "pendiente",  tecnologias: ["Next.js","Supabase"],                   fecha: "2025-01-05", fechaEntrega: "2025-04-30" },
  { id: "P-005", clienteId: 5, cliente: "Jorge Paredes",  proyecto: "EduPlatform",      tipo: "web",     servicio: "SaaS / Software como Servicio", prioridad: "alta", estado: "desarrollo", tecnologias: ["React","Node.js","PostgreSQL"],   fecha: "2025-02-01", fechaEntrega: "2025-07-01" },
];

export const PROYECTOS_CONCLUIDOS = [
  { id: 1, clienteId: 3, cliente: "Luis Ramírez",   proyecto: "Panel de Gestión", tipo: "desktop", servicio: "Dashboard / Panel Admin", fechaInicio: "2024-06-01", fechaEntrega: "2024-09-30", tecnologias: ["React","Node.js","MySQL"],       mensajeFinal: "Proyecto entregado. Fue un placer trabajar contigo Luis." },
  { id: 2, clienteId: 2, cliente: "Ana Torres",     proyecto: "FitTrack App",     tipo: "app",     servicio: "Aplicación Móvil",        fechaInicio: "2024-08-10", fechaEntrega: "2024-12-20", tecnologias: ["Flutter","Firebase"],           mensajeFinal: "" },
  { id: 3, clienteId: 1, cliente: "Carlos Méndez",  proyecto: "Landing Inicial",  tipo: "web",     servicio: "Landing Page",           fechaInicio: "2024-03-01", fechaEntrega: "2024-04-15", tecnologias: ["Next.js","Tailwind CSS"],        mensajeFinal: "Entregado con éxito. Gracias Carlos." },
];

export const PROYECTOS_CANCELADOS = [
  { id: 1, clienteId: 4, cliente: "María González", proyecto: "App Delivery",     tipo: "app",  servicio: "Aplicación Móvil",  fechaInicio: "2024-05-01", fechaCancelacion: "2024-07-10", tecnologias: ["React Native"], motivo: "Cambio de presupuesto por parte del cliente." },
  { id: 2, clienteId: 5, cliente: "Jorge Paredes",  proyecto: "Blog Corporativo", tipo: "web",  servicio: "Blog / Portal",     fechaInicio: "2024-09-01", fechaCancelacion: "2024-10-05", tecnologias: ["WordPress"],    motivo: "El cliente decidió pausar indefinidamente el proyecto." },
];
