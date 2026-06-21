import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { observarAuth } from "../services/authService";
import { buscarPerfil } from "../services/userService";
import { useUserStore } from "../store/userStore";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  const firebaseUser = useUserStore((state) => state.firebaseUser);
  const carregandoAuth = useUserStore((state) => state.carregando);
  const hasSeenOnboarding = useUserStore((state) => state.hasSeenOnboarding);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        const hasSeen = await AsyncStorage.getItem("@hasSeenOnboarding");
        useUserStore.getState().setHasSeenOnboarding(hasSeen === "true");
      } catch (e) {
        console.error(e);
      } finally {
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  // 🔑 Listener global do Firebase: mantém a store sincronizada com a sessão
  // real (login, logout E restauração automática de sessão ao abrir o app).
  // Sem isso, a store nunca sabia que o usuário já estava logado.
  useEffect(() => {
    const unsubscribe = observarAuth(async (user) => {
      useUserStore.getState().setFirebaseUser(user);

      if (user) {
        try {
          const perfil = await buscarPerfil(user.uid);
          useUserStore.getState().setPerfil(perfil);
        } catch (e) {
          console.error("Erro ao buscar perfil:", e);
        }
      } else {
        useUserStore.getState().setPerfil(null);
      }

      useUserStore.getState().setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Espera tanto a checagem do onboarding quanto a primeira resposta
    // do Firebase sobre o estado de autenticação antes de redirecionar.
    if (!isReady || carregandoAuth) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    // 1. Se NÃO viu o onboarding, força ir para lá
    if (!hasSeenOnboarding) {
      if (!inOnboarding) router.replace("/onboarding");
      return;
    }

    // 2. Se JÁ viu o onboarding, verificamos a autenticação:
    if (!firebaseUser) {
      // Se não tem usuário logado, garante que ele vá para o LOGIN
      if (!inAuthGroup) {
        router.replace("/(auth)");
      }
    } else {
      // Se TEM usuário, garante que ele vá para as TABS
      if (inAuthGroup || inOnboarding) {
        router.replace("/(tabs)");
      }
    }
  }, [firebaseUser, segments, isReady, hasSeenOnboarding, carregandoAuth]);

  if (!isReady || carregandoAuth) return <View />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}