import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SobreAppModal } from "../../components/sobre-app-modal";
import { logoutUsuario } from "../../services/authService";
import { useUserStore } from "../../store/userStore";

export default function Perfil() {
  const router = useRouter();
  const perfil = useUserStore((state) => state.perfil);
  const firebaseUser = useUserStore((state) => state.firebaseUser);
  const [modalSobreVisivel, setModalSobreVisivel] = useState(false);

  async function handleLogout() {
    Alert.alert("Encerrar sessão", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await logoutUsuario();
            useUserStore.getState().setFirebaseUser(null);
            useUserStore.getState().setPerfil(null);
            router.replace("/(auth)");
          } catch (e) {
            Alert.alert("Erro", "Não foi possível sair.");
          }
        },
      },
    ]);
  }

  function handleAlterarFoto() {
    Alert.alert("Alterar Foto", "Escolha uma opção:", [
      { text: "Tirar Foto", onPress: () => {} },
      { text: "Escolher da Galeria", onPress: () => {} },
      { text: "Cancelar", style: "cancel" }
    ]);
  }

  return (
    <View style={s.background}>
      <StatusBar barStyle="light-content" backgroundColor="#11C76F" />
      
      <ScrollView contentContainerStyle={s.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={s.topoVerdeHeader}>
          <Text style={s.tituloBranco}>Seu Perfil</Text>
        </View>

        <View style={s.containerConteudo}>
          
          <View style={s.cardFotoPerfil}>
            <Pressable onPress={handleAlterarFoto} style={s.avatarContainer}>
              <View style={s.circuloAvatarVazio}>
                <Text style={s.avatarLetra}>{perfil?.nome?.charAt(0).toUpperCase() ?? "?"}</Text>
              </View>
              <View style={s.badgeEditarFoto}>
                <MaterialIcons name="photo-camera" size={12} color="#FFFFFF" />
              </View>
            </Pressable>

            <Text style={s.txtNomeUsuario}>{perfil?.nome ?? "Usuário"}</Text>
            <Text style={s.txtEmailUsuario}>{firebaseUser?.email || "seuemail@teste.com"}</Text>
          </View>

          <View style={s.cardInfoData}>
            <Text style={s.labelInfoSub}>RENDA MENSAL CADASTRADA</Text>
            <Text style={s.valorInfoRenda}>
              R$ {perfil?.rendaMensal ? perfil.rendaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "0,00"}
            </Text>
          </View>

          <View style={s.cardInfoData}>
            <Text style={s.labelInfoSub}>META DE RESERVA DE SEGURANÇA</Text>
            <Text style={s.valorInfoRenda}>{perfil?.metaReservaEmergencia ?? 6} meses</Text>
          </View>

          <Pressable onPress={() => setModalSobreVisivel(true)} style={s.cardSobreApp}>
            <View style={s.rowSobreApp}>
              <MaterialIcons name="info-outline" size={20} color="#4B5563" />
              <Text style={s.txtSobreApp}>Sobre o app</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
          </Pressable>

          {/* 💡 ESTILO NOVO: Botão de Sair mais elegante */}
          <View style={s.wrapperBotaoCentro}>
            <Pressable onPress={handleLogout} style={s.btnSairConta}>
              <MaterialIcons name="logout" size={18} color="#EF4444" />
              <Text style={s.txtSairConta}>Encerrar sessão</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>

      <SobreAppModal visible={modalSobreVisivel} onClose={() => setModalSobreVisivel(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#F4F6F9" },
  scrollContainer: { flexGrow: 1, paddingBottom: 40 },
  topoVerdeHeader: { backgroundColor: "#11C76F", paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 60, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  tituloBranco: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  containerConteudo: { paddingHorizontal: 16, marginTop: -32, gap: 14 },
  cardFotoPerfil: { backgroundColor: "#FFFFFF", padding: 24, borderRadius: 20, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", elevation: 3 },
  avatarContainer: { width: 80, height: 80, marginBottom: 12, position: 'relative' },
  circuloAvatarVazio: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#11C76F", justifyContent: "center", alignItems: "center" },
  badgeEditarFoto: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#11C76F", width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#FFFFFF" },
  avatarLetra: { color: "#FFFFFF", fontSize: 32, fontWeight: "bold" },
  txtNomeUsuario: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  txtEmailUsuario: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  cardInfoData: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  labelInfoSub: { fontSize: 9, fontWeight: "700", color: "#9CA3AF", letterSpacing: 0.5 },
  valorInfoRenda: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginTop: 6 },

  cardSobreApp: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowSobreApp: { flexDirection: "row", alignItems: "center", gap: 10 },
  txtSobreApp: { fontSize: 14, fontWeight: "600", color: "#374151" },
  
  wrapperBotaoCentro: { alignItems: "center", marginTop: 12 },
  
  // Estilização Premium do botão Sair
  btnSairConta: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 8,
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: "#FEE2E2", 
    backgroundColor: "#FEF2F2" 
  },
  txtSairConta: { 
    color: "#EF4444", 
    fontSize: 14, 
    fontWeight: "700" 
  }
});