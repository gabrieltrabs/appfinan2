import { User } from "firebase/auth";
import { create } from "zustand";
import { PerfilUsuario } from "../types";

interface UserState {
  firebaseUser: User | null;
  perfil: PerfilUsuario | null;
  carregando: boolean;
  hasSeenOnboarding: boolean;
  setFirebaseUser: (user: User | null) => void;
  setPerfil: (perfil: PerfilUsuario | null) => void;
  setCarregando: (valor: boolean) => void;
  setHasSeenOnboarding: (valor: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  firebaseUser: null,
  perfil: null,
  carregando: true,
  hasSeenOnboarding: false,
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setPerfil: (perfil) => set({ perfil }),
  setCarregando: (carregando) => set({ carregando }),
  setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
}));