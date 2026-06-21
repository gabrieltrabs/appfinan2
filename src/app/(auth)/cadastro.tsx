import { MaterialIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";
import { cadastrarUsuario, traduzirErroFirebase } from "../../services/authService";
import { useUserStore } from "../../store/userStore";

const cadastroSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Insira um e-mail válido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  renda: z.string().refine((val) => {
    const formatado = val.replace(",", ".");
    return !isNaN(Number(formatado)) && Number(formatado) > 0;
  }, {
    message: "A renda deve ser um número positivo",
  }),
});

type CadastroFormData = z.infer<typeof cadastroSchema>;

export default function Cadastro() {
  const [carregando, setCarregando] = useState(false);
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, formState: { errors } } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { nome: "", email: "", senha: "", renda: "" }
  });

  async function handleCadastro(data: CadastroFormData) {
    setCarregando(true);
    try {
      const rendaNum = Number(data.renda.replace(",", "."));
      const usuario = await cadastrarUsuario({
        nome: data.nome.trim(),
        email: data.email.trim(),
        senha: data.senha,
        rendaMensal: rendaNum,
      });

      // Atualiza a store imediatamente com os dados já conhecidos,
      // sem depender só do listener global (evita corrida com o Firestore).
      useUserStore.getState().setFirebaseUser(usuario);
      useUserStore.getState().setPerfil({
        nome: data.nome.trim(),
        email: data.email.trim(),
        rendaMensal: rendaNum,
        metaReservaEmergencia: 6,
      });
      // A navegação para as tabs é feita automaticamente pelo RootLayout
      // ao detectar a mudança de firebaseUser.
    } catch (erro: any) {
      Alert.alert("Erro ao cadastrar", traduzirErroFirebase(erro.code));
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
        <Text style={s.subtitulo}>Crie sua conta e comece a organizar suas finanças hoje.</Text>
      </View>

      <View style={s.cardFormulario}>
        <Text style={s.tituloForm}>Criar sua conta</Text>
        
        <Text style={s.labelInput}>Seu nome completo</Text>
        <Controller control={control} name="nome" render={({ field: { onChange, value } }) => (
          <TextInput placeholder="Ex: Luiz Eduardo" placeholderTextColor="#9CA3AF" style={[s.input, errors.nome && s.inputErro]} value={value} onChangeText={onChange} />
        )}/>
        {errors.nome && <Text style={s.textoErro}>{errors.nome.message}</Text>}

        <Text style={s.labelInput}>E-mail</Text>
        <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
          <TextInput placeholder="seu@email.com" placeholderTextColor="#9CA3AF" autoCapitalize="none" keyboardType="email-address" style={[s.input, errors.email && s.inputErro]} value={value} onChangeText={onChange} />
        )}/>
        {errors.email && <Text style={s.textoErro}>{errors.email.message}</Text>}

        <Text style={s.labelInput}>Senha</Text>
        <Controller control={control} name="senha" render={({ field: { onChange, value } }) => (
          <TextInput placeholder="Mínimo 6 caracteres" placeholderTextColor="#9CA3AF" secureTextEntry autoCapitalize="none" style={[s.input, errors.senha && s.inputErro]} value={value} onChangeText={onChange} />
        )}/>
        {errors.senha && <Text style={s.textoErro}>{errors.senha.message}</Text>}

        <Text style={s.labelInput}>Renda mensal líquida (R$)</Text>
        <Controller control={control} name="renda" render={({ field: { onChange, value } }) => (
          <TextInput placeholder="Ex: 3500,00" placeholderTextColor="#9CA3AF" keyboardType="decimal-pad" style={[s.input, errors.renda && s.inputErro]} value={value} onChangeText={onChange} />
        )}/>
        {errors.renda && <Text style={s.textoErro}>{errors.renda.message}</Text>}

        {/* 💡 CARD DE EDUCAÇÃO DO USUÁRIO NO CADASTRO */}
        <View style={s.cardReservaExplicativo}>
          <View style={s.rowHeaderExplicativo}>
            <MaterialIcons name="security" size={18} color="#059669" />
            <Text style={s.tituloExplicativo}>Proteção Financeira</Text>
          </View>
          <Text style={s.textoExplicativo}>
            O app reserva automaticamente 20% da sua renda mensal para sua Reserva de Segurança, visando acumular 6 meses do seu custo de vida.
          </Text>
        </View>

        <Pressable onPress={handleSubmit(handleCadastro)} disabled={carregando} style={[s.botao, carregando && s.botaoDesativado]}>
          <Text style={s.textoBotao}>{carregando ? "Criando conta..." : "Finalizar Cadastro"}</Text>
        </Pressable>

        <Link href="/(auth)" asChild>
          <Pressable style={s.linkContainer}>
            <Text style={s.textoLink}>Já possui cadastro? <Text style={s.linkDestake}>Entrar</Text></Text>
          </Pressable>
        </Link>
      </View>
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
  
  // Estilos do novo card educativo
  cardReservaExplicativo: { backgroundColor: "#ECFDF5", padding: 14, borderRadius: 12, marginTop: 16, borderWidth: 1, borderColor: "#A7F3D0" },
  rowHeaderExplicativo: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  tituloExplicativo: { fontSize: 13, fontWeight: "700", color: "#065F46" },
  textoExplicativo: { fontSize: 12, color: "#064E3B", lineHeight: 16 },
  
  botao: { backgroundColor: "#11C76F", padding: 16, borderRadius: 14, alignItems: "center", marginTop: 22 },
  botaoDesativado: { backgroundColor: "#A7F3D0" },
  textoBotao: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  linkContainer: { marginTop: 16, alignItems: "center", paddingVertical: 4 },
  textoLink: { fontSize: 14, color: "#6B7280" },
  linkDestake: { color: "#11C76F", fontWeight: "600" }
});