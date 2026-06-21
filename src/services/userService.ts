import { doc, getDoc, updateDoc } from "firebase/firestore";
import { PerfilUsuario } from "../types";
import { db } from "./firebase";

// Busca os dados cadastrais do usuário
export async function buscarPerfil(uid: string): Promise<PerfilUsuario | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as PerfilUsuario;
}

// Atualiza dados específicos do perfil (como renda ou meta de reserva)
export async function atualizarPerfil(uid: string, dados: Partial<PerfilUsuario>): Promise<void> {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, dados);
}