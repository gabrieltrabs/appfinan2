import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp
} from "firebase/firestore";
import { Transacao } from "../types";
import { db } from "./firebase";

// Salva uma transação dentro da subcoleção do usuário logado
export async function criarTransacao(userId: string, transacao: Omit<Transacao, "id" | "data">) {
  const colRef = collection(db, "users", userId, "transactions");
  await addDoc(colRef, {
    ...transacao,
    data: serverTimestamp(), // Garante a data sincronizada pelo servidor do Firebase
  });
}

// Escuta as transações em tempo real
export function escutarTransacoes(userId: string, callback: (transacoes: Transacao[]) => void) {
  const colRef = collection(db, "users", userId, "transactions");
  const q = query(colRef, orderBy("data", "desc"));

  return onSnapshot(q, (snapshot) => {
    const transacoes: Transacao[] = [];
    snapshot.forEach((documento) => {
      const dados = documento.data();
      transacoes.push({
        id: documento.id,
        tipo: dados.tipo,
        valor: dados.valor,
        categoriaId: dados.categoriaId,
        classificacao: dados.classificacao,
        descricao: dados.descricao,
        data: dados.data?.toDate() ? dados.data.toDate() : new Date(), // Evita quebra antes do timestamp sincronizar
        metodoPagamento: dados.metodoPagamento,
        recorrente: dados.recorrente,
      });
    });
    callback(transacoes);
  });
}

// Remove uma transação específica
export async function deletarTransacao(userId: string, transacaoId: string) {
  const docRef = doc(db, "users", userId, "transactions", transacaoId);
  await deleteDoc(docRef);
}