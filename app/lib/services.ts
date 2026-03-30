import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, orderBy, serverTimestamp,
  limit, writeBatch, where, setDoc,
} from "firebase/firestore";
import { db, storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// ─── CLIENTES ────────────────────────────────────────────────────────────────
export async function getClientes() {
  const snap = await getDocs(query(collection(db, "clientes"), orderBy("creadoEn", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addCliente(data: Record<string, unknown>) {
  return addDoc(collection(db, "clientes"), { ...data, creadoEn: serverTimestamp() });
}

export async function updateCliente(id: string, data: Record<string, unknown>) {
  return updateDoc(doc(db, "clientes", id), data);
}

export async function deleteCliente(id: string) {
  return deleteDoc(doc(db, "clientes", id));
}

// ─── PEDIDOS ─────────────────────────────────────────────────────────────────
export async function getPedidos() {
  const snap = await getDocs(query(collection(db, "pedidos"), orderBy("creadoEn", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addPedido(data: Record<string, unknown>) {
  return addDoc(collection(db, "pedidos"), { ...data, creadoEn: serverTimestamp() });
}

export async function updatePedido(id: string, data: Record<string, unknown>) {
  return updateDoc(doc(db, "pedidos", id), data);
}

export async function deletePedido(id: string) {
  return deleteDoc(doc(db, "pedidos", id));
}

// ─── PROYECTOS CONCLUIDOS ─────────────────────────────────────────────────────
export async function getProyectosConcluidos() {
  const snap = await getDocs(query(collection(db, "proyectos-concluidos"), orderBy("creadoEn", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addProyectoConcluido(data: Record<string, unknown>) {
  return addDoc(collection(db, "proyectos-concluidos"), { ...data, creadoEn: serverTimestamp() });
}

export async function updateProyectoConcluido(id: string, data: Record<string, unknown>) {
  return updateDoc(doc(db, "proyectos-concluidos", id), data);
}

// ─── PROYECTOS CANCELADOS ─────────────────────────────────────────────────────
export async function getProyectosCancelados() {
  const snap = await getDocs(query(collection(db, "proyectos-cancelados"), orderBy("creadoEn", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addProyectoCancelado(data: Record<string, unknown>) {
  return addDoc(collection(db, "proyectos-cancelados"), { ...data, creadoEn: serverTimestamp() });
}

export async function updateProyectoCancelado(id: string, data: Record<string, unknown>) {
  return updateDoc(doc(db, "proyectos-cancelados", id), data);
}

// Crea o sobreescribe el cancelado usando el pedidoId como doc ID (evita duplicados)
export async function syncPedidoCancelado(pedidoId: string, data: Record<string, unknown>) {
  return setDoc(doc(db, "proyectos-cancelados", pedidoId), {
    ...data,
    pedidoId,
    creadoEn: serverTimestamp(),
  });
}

// Crea o sobreescribe el concluido usando el pedidoId como doc ID (evita duplicados)
export async function syncPedidoConcluido(pedidoId: string, data: Record<string, unknown>) {
  return setDoc(doc(db, "proyectos-concluidos", pedidoId), {
    ...data,
    pedidoId,
    creadoEn: serverTimestamp(),
  });
}

export async function removeProyectoCancelado(pedidoId: string) {
  try { await deleteDoc(doc(db, "proyectos-cancelados", pedidoId)); } catch { /* no existía */ }
}

export async function removeProyectoConcluido(pedidoId: string) {
  try { await deleteDoc(doc(db, "proyectos-concluidos", pedidoId)); } catch { /* no existía */ }
}

// ─── MENSAJES ─────────────────────────────────────────────────────────────────
export async function getMensajes(clienteId: string) {
  const snap = await getDocs(query(collection(db, `mensajes/${clienteId}/chat`), orderBy("creadoEn", "asc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addMensaje(clienteId: string, data: Record<string, unknown>) {
  return addDoc(collection(db, `mensajes/${clienteId}/chat`), { ...data, creadoEn: serverTimestamp() });
}

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
export async function getConfiguracion() {
  const snap = await getDoc(doc(db, "configuracion", "perfil"));
  return snap.exists() ? snap.data() : null;
}

export async function saveConfiguracion(data: Record<string, unknown>) {
  return setDoc(doc(db, "configuracion", "perfil"), data);
}

// ─── CV / CURRICULUM ──────────────────────────────────────────────────────────
export async function uploadCV(file: File): Promise<{ url: string; nombre: string }> {
  const storageRef = ref(storage, `cv/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, nombre: file.name };
}

export async function deleteCV(nombre: string): Promise<void> {
  const storageRef = ref(storage, `cv/${nombre}`);
  await deleteObject(storageRef);
}

// ─── COMPROBANTES DE PAGO (Cloudinary) ───────────────────────────────────────
export async function uploadComprobante(file: File): Promise<{ url: string; nombre: string }> {
  const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset!);
  formData.append("folder", "comprobantes");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Error al subir a Cloudinary");
  const data = await res.json();
  return { url: data.secure_url, nombre: data.public_id };
}

// ─── NOTIFICACIONES ───────────────────────────────────────────────────────────
export async function getNotificaciones() {
  const snap = await getDocs(
    query(collection(db, "notificaciones"), orderBy("creadoEn", "desc"), limit(30))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addNotificacion(data: Record<string, unknown>) {
  return addDoc(collection(db, "notificaciones"), { ...data, leida: false, creadoEn: serverTimestamp() });
}

export async function marcarTodasLeidas() {
  const snap = await getDocs(
    query(collection(db, "notificaciones"), where("leida", "==", false))
  );
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.update(d.ref, { leida: true }));
  return batch.commit();
}

export async function limpiarNotificaciones() {
  const snap = await getDocs(query(collection(db, "notificaciones"), orderBy("creadoEn", "desc")));
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  return batch.commit();
}
