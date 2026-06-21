import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";
import { SobreAppModal } from "../../components/sobre-app-modal";
import { loginUsuario, traduzirErroFirebase } from "../../services/authService";
import { buscarPerfil } from "../../services/userService";
import { useUserStore } from "../../store/userStore";

const loginSchema = z.object({
  email: z.string().email("Insira um e-mail válido"),
  senha: z.string().min(1, "Informe sua senha"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [carregando, setCarregando] = useState(false);
  const [modalSobreVisivel, setModalSobreVisivel] = useState(false);
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  });

  async function handleLogin(data: LoginFormData) {
    setCarregando(true);
    try {
      const user = await loginUsuario(data.email.trim(), data.senha);

      // Atualiza a store imediatamente para evitar tela em branco/flicker
      // enquanto o listener global de auth ainda não disparou.
      useUserStore.getState().setFirebaseUser(user);

      try {
        const perfil = await buscarPerfil(user.uid);
        useUserStore.getState().setPerfil(perfil);
      } catch (e) {
        console.error("Erro ao buscar perfil:", e);
      }
      // A navegação para as tabs é feita automaticamente pelo RootLayout
      // ao detectar a mudança de firebaseUser.
    } catch (erro: any) {
      Alert.alert("Erro ao entrar", traduzirErroFirebase(erro.code));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView style={s.background} contentContainerStyle={[s.container, { paddingBottom: 24 + insets.bottom }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" translucent={true} />

      <View style={s.headerSecao}>
        <Image source={require("../../assets/logo.png")} style={s.logoImagem} resizeMode="contain" />
        <Text style={s.logoTexto}>Finanças<Text style={s.logoVerde}>App</Text></Text>
        <Text style={s.subtitulo}>Entre na sua conta para continuar organizando suas finanças.</Text>
      </View>

      <View style={s.cardFormulario}>
        <Text style={s.tituloForm}>Entrar</Text>

        <Text style={s.labelInput}>E-mail</Text>
        <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
          <TextInput placeholder="seu@email.com" placeholderTextColor="#9CA3AF" autoCapitalize="none" keyboardType="email-address" style={[s.input, errors.email && s.inputErro]} value={value} onChangeText={onChange} />
        )}/>
        {errors.email && <Text style={s.textoErro}>{errors.email.message}</Text>}

        <Text style={s.labelInput}>Senha</Text>
        <Controller control={control} name="senha" render={({ field: { onChange, value } }) => (
          <TextInput placeholder="Sua senha" placeholderTextColor="#9CA3AF" secureTextEntry autoCapitalize="none" style={[s.input, errors.senha && s.inputErro]} value={value} onChangeText={onChange} />
        )}/>
        {errors.senha && <Text style={s.textoErro}>{errors.senha.message}</Text>}

        <Pressable onPress={handleSubmit(handleLogin)} disabled={carregando} style={[s.botao, carregando && s.botaoDesativado]}>
          <Text style={s.textoBotao}>{carregando ? "Entrando..." : "Entrar"}</Text>
        </Pressable>

        <Link href="/(auth)/cadastro" asChild>
          <Pressable style={s.linkContainer}>
            <Text style={s.textoLink}>Não tem conta? <Text style={s.linkDestake}>Criar conta</Text></Text>
          </Pressable>
        </Link>
      </View>

      <Pressable onPress={() => setModalSobreVisivel(true)} style={s.linkSobre}>
        <Text style={s.textoLinkSobre}>Sobre o app</Text>
      </Pressable>

      <SobreAppModal visible={modalSobreVisivel} onClose={() => setModalSobreVisivel(false)} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#F8F9FA" },
  container: { padding: 24, justifyContent: "center", flexGrow: 1, gap: 20 },
  headerSecao: { alignItems: "center", marginTop: 20 },
  logoImagem: { width: 75, height: 75, marginBottom: -4 },
  logoTexto: { fontSize: 28, fontWeight: "800", color: "#111827", letterSpacing: -0.5 },
  logoVerde: { color: "#11C76F" },
  subtitulo: { fontSize: 13, color: "#6B7280", textAlign: "center", lineHeight: 18, marginTop: 6 },
  cardFormulario: { backgroundColor: "#FFFFFF", padding: 20, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", elevation: 2 },
  tituloForm: { fontSize: 18, fontWeight: "700", color: "#1F2937", marginBottom: 8 },
  labelInput: { fontSize: 13, fontWeight: "600", color: "#4B5563", marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 14, fontSize: 15, color: "#1F2937" },
  inputErro: { borderColor: "#EF4444" },
  textoErro: { color: "#EF4444", fontSize: 11, marginTop: 4, fontWeight: "500" },
  botao: { backgroundColor: "#11C76F", padding: 16, borderRadius: 14, alignItems: "center", marginTop: 22 },
  botaoDesativado: { backgroundColor: "#A7F3D0" },
  textoBotao: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  linkContainer: { marginTop: 16, alignItems: "center", paddingVertical: 4 },
  textoLink: { fontSize: 14, color: "#6B7280" },
  linkDestake: { color: "#11C76F", fontWeight: "600" },
  linkSobre: { marginTop: 24, alignItems: "center", paddingVertical: 8 },
  textoLinkSobre: { fontSize: 13, color: "#9CA3AF", fontWeight: "600", textDecorationLine: "underline" },
});
