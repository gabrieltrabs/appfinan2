import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  rendaMensal: number;
}

export async function cadastrarUsuario({ nome, email, senha, rendaMensal }: DadosCadastro) {
  const credencial = await createUserWithEmailAndPassword(auth, email, senha);
  const uid = credencial.user.uid;

  await setDoc(doc(db, "users", uid), {
    nome,
    email,
    rendaMensal,
    metaReservaEmergencia: 6,
    dataCadastro: serverTimestamp(),
  });

  return credencial.user;
}

export async function loginUsuario(email: string, senha: string) {
  const credencial = await signInWithEmailAndPassword(auth, email, senha);
  return credencial.user;
}

export async function logoutUsuario() {
  await signOut(auth);
}

export function observarAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function traduzirErroFirebase(codigo: string): string {
  const mapa: Record<string, string> = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/email-already-in-use": "Esse e-mail já está cadastrado.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  };
  return mapa[codigo] ?? "Algo deu errado. Tente novamente.";
}