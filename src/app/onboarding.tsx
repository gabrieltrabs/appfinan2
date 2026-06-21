import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Animated, FlatList, Pressable, StatusBar, StyleSheet, Text, useWindowDimensions, View, ViewToken } from "react-native";
import { useUserStore } from "../store/userStore";

const SLIDES = [
  { id: "1", title: "Bem-vindo ao\nFinançasApp", description: "Organize sua vida financeira com o método 50/30/20.", icon: "account-balance-wallet", color: "#11C76F" },
  { id: "2", title: "A Regra de Ouro", description: "Dividimos sua renda:\n• 50% Essencial\n• 30% Desejos\n• 20% Futuro", icon: "pie-chart", color: "#3B82F6" },
  { id: "3", title: "Sua Segurança", description: "Focamos na Reserva de Emergência. Objetivo: 6 meses do seu custo de vida.", icon: "security", color: "#10B981" },
  { id: "4", title: "Tudo Pronto?", description: "Controle total da sua liberdade financeira começa agora!", icon: "rocket-launch", color: "#8B5CF6" },
];

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  async function finalizarOnboarding() {
    try {
      await AsyncStorage.setItem("@hasSeenOnboarding", "true");
      // Atualiza a store ANTES de navegar — é essa flag que o RootLayout
      // consulta para decidir se deixa o usuário saiu do onboarding.
      // Sem isso, o _layout via a flag antiga (ainda "false") e mandava
      // de volta pro onboarding, causando o looping.
      useUserStore.getState().setHasSeenOnboarding(true);
      router.replace("/(auth)");
    } catch (err) {
      console.log("Erro ao salvar onboarding", err);
    }
  }

  // Antes, este botão tinha textos diferentes por slide ("Pular para o
  // Login" / "Começar Agora") mas sempre fazia a MESMA coisa: encerrar
  // o onboarding direto, em qualquer slide. Não dava pra avançar tocando
  // nele — só arrastando manualmente. Agora ele avança slide a slide, e
  // só finaliza de fato no último, que é o comportamento esperado.
  function handleBotaoPrincipal() {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      finalizarOnboarding();
    }
  }

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={[s.slide, { width }]}>
      <View style={[s.iconContainer, { backgroundColor: item.color + "20" }]}>
        <MaterialIcons name={item.icon as any} size={80} color={item.color} />
      </View>
      <View style={s.textContainer}>
        <Text style={s.title}>{item.title}</Text>
        <Text style={s.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />
      <Pressable onPress={finalizarOnboarding} style={s.skipButton}><Text style={s.skipText}>Pular</Text></Pressable>
      <FlatList
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />
      <View style={s.footer}>
        <View style={s.paginator}>
          {SLIDES.map((_, i) => <View style={[s.dot, { backgroundColor: i === currentIndex ? "#11C76F" : "#D1D5DB" }]} key={i.toString()} />)}
        </View>
        <Pressable onPress={handleBotaoPrincipal} style={[s.mainButton, { backgroundColor: SLIDES[currentIndex].color }]}>
          <Text style={s.mainButtonText}>{currentIndex === SLIDES.length - 1 ? "Começar Agora" : "Próximo"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  skipButton: { position: "absolute", top: 60, right: 30, zIndex: 10 },
  skipText: { fontSize: 16, color: "#9CA3AF", fontWeight: "600" },
  slide: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  iconContainer: { width: 160, height: 160, borderRadius: 80, alignItems: "center", justifyContent: "center", marginBottom: 40 },
  textContainer: { alignItems: "center" },
  title: { fontSize: 28, fontWeight: "800", color: "#1F2937", textAlign: "center", marginBottom: 20 },
  description: { fontSize: 16, color: "#6B7280", textAlign: "center", lineHeight: 24, paddingHorizontal: 20 },
  footer: { paddingHorizontal: 40, paddingBottom: 50 },
  paginator: { flexDirection: "row", height: 64, justifyContent: "center", alignItems: "center" },
  dot: { height: 10, width: 10, borderRadius: 5, marginHorizontal: 8 },
  mainButton: { paddingVertical: 16, borderRadius: 16, alignItems: "center", justifyContent: "center", elevation: 3 },
  mainButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});