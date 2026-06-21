import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import * as z from "zod";
import { CATEGORIAS_PADRAO } from "../constants/categories";
import { criarTransacao } from "../services/transactionService";
import { useUserStore } from "../store/userStore";
import { Classificacao } from "../types";

const cadastroTransacaoSchema = z.object({
  descricao: z.string().min(3, "A descrição deve ter pelo menos 3 caracteres"),
  valor: z.string().refine((val) => !isNaN(Number(val.replace(",", "."))) && Number(val.replace(",", ".")) > 0, {
    message: "Insira um valor válido e maior que zero",
  }),
});

type TransacaoFormData = z.infer<typeof cadastroTransacaoSchema>;

export default function NovaTransacao() {
  const firebaseUser = useUserStore((state) => state.firebaseUser);
  const [tipo, setTipo] = useState<"receita" | "despesa">("despesa");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(CATEGORIAS_PADRAO[0]);
  const [subClassificacao, setSubClassificacao] = useState<"essencial" | "desejo">("essencial");
  const [carregando, setCarregando] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<TransacaoFormData>({
    resolver: zodResolver(cadastroTransacaoSchema),
    defaultValues: { descricao: "", valor: "" }
  });

  async function handleSalvar(data: TransacaoFormData) {
    if (!firebaseUser) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    if (categoriaSelecionada.nome === "Outros" && !subClassificacao) {
      Alert.alert("Atenção", "Por favor, selecione se este gasto é Essencial ou Desejo.");
      return;
    }

    setCarregando(true);
    try {
      const valorNum = Number(data.valor.replace(",", "."));
      // 🔧 CORRIGIDO: antes ia como "Receita", o que nunca batia com o filtro
      // "categoriaId === 'Reserva de Emergência'" usado no Home para somar a barra.
      // Receita Extra agora cai direto na Reserva de Emergência, como o modal de ajuda explica.
      const categoriaIdFinal = tipo === "receita" ? "Reserva de Emergência" : categoriaSelecionada.nome;
      
      let classificacaoFinal: Classificacao = tipo === "receita" ? "poupanca" : (categoriaSelecionada.classificacao as Classificacao);
      if (tipo === "despesa" && categoriaSelecionada.nome === "Outros") {
        classificacaoFinal = subClassificacao as Classificacao;
      }

      await criarTransacao(firebaseUser.uid, {
        tipo,
        valor: valorNum,
        descricao: data.descricao.trim(),
        categoriaId: categoriaIdFinal,
        classificacao: classificacaoFinal,
        metodoPagamento: "Dinheiro/Cartão",
        recorrente: false,
      });

      Alert.alert("Sucesso", "Transação registrada com sucesso!", [
        { text: "OK", onPress: () => { reset(); router.back(); } }
      ]);
    } catch (error) {
      Alert.alert("Erro ao salvar", "Não foi possível registrar a transação.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView style={s.background} contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" translucent={true} />
      
      <View style={s.headerSecao}>
        <Text style={s.titulo}>Nova transação</Text>
        <Text style={s.subtitulo}>Insira os dados do seu lançamento financeiro.</Text>
      </View>

      <View style={s.cardFormulario}>
        <Text style={s.labelInput}>Tipo de lançamento</Text>
        <View style={s.rowTipo}>
          <Pressable onPress={() => setTipo("despesa")} style={[s.botaoTipo, tipo === "despesa" && s.botaoDespesaAtivo]}>
            <Text style={[s.textoTipo, tipo === "despesa" && s.textoAtivoDespesa]}>Despesa</Text>
          </Pressable>
          <Pressable onPress={() => setTipo("receita")} style={[s.botaoTipo, tipo === "receita" && s.botaoReceitaAtivo]}>
            <Text style={[s.textoTipo, tipo === "receita" && s.textoAtivoReceita]}>Receita Extra</Text>
          </Pressable>
        </View>

        {/* 💡 NOVO: explica o "porquê" assim que Receita Extra é escolhida, igual ao modal da tela inicial */}
        {tipo === "receita" && (
          <View style={s.cardInfoReceitaExtra}>
            <Text style={s.txtInformativoReceita}>
              💰 <Text style={{ fontWeight: "700", color: "#065F46" }}>Como funciona:</Text> toda Receita Extra é direcionada automaticamente para a sua Reserva de Emergência (Poupança 20%) — não é preciso escolher categoria, é só preencher e confirmar.
            </Text>
          </View>
        )}

        <Text style={s.labelInput}>O que foi?</Text>
        <Controller control={control} name="descricao" render={({ field: { onChange, value } }) => (
          <TextInput placeholder={tipo === "despesa" ? "Ex: Supermercado" : "Ex: Freelance"} placeholderTextColor="#9CA3AF" style={[s.input, errors.descricao && s.inputErro]} value={value} onChangeText={onChange} />
        )}/>
        {errors.descricao && <Text style={s.textoErro}>{errors.descricao.message}</Text>}

        <Text style={s.labelInput}>Qual o valor?</Text>
        <Controller control={control} name="valor" render={({ field: { onChange, value } }) => (
          <TextInput placeholder="R$ 0,00" placeholderTextColor="#9CA3AF" keyboardType="decimal-pad" style={[s.input, errors.valor && s.inputErro]} value={value} onChangeText={onChange} />
        )}/>
        {errors.valor && <Text style={s.textoErro}>{errors.valor.message}</Text>}

        {tipo === "despesa" && (
          <View style={s.secaoCategorias}>
            <Text style={s.labelInput}>Escolha a categoria</Text>
            <View style={s.gridCategorias}>
              {CATEGORIAS_PADRAO.map((cat) => {
                const selecionada = categoriaSelecionada.nome === cat.nome;
                return (
                  <Pressable key={cat.nome} onPress={() => setCategoriaSelecionada(cat)} style={[s.cardCategoria, { backgroundColor: selecionada ? "#DCFCE7" : "#F9FAFB" }, selecionada && s.cardCategoriaSelecionado]}>
                    {/* 🔧 CORRIGIDO: nomes longos ("Alimentação", "Investimentos", "Reserva de Emergência")
                        quebravam no meio da palavra. Agora o texto encolhe para caber em até 2 linhas inteiras. */}
                    <Text
                      style={[s.textoCategoria, { color: selecionada ? "#11C76F" : "#4B5563" }, selecionada && { fontWeight: "700" }]}
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                    >
                      {cat.nome}
                    </Text>
                    <Text style={s.tagClassificacao}>{cat.classificacao === "dinamico" ? "Escolha" : cat.classificacao}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* AQUI ESTÁ A EXPLICAÇÃO DO INVESTIMENTO DE VOLTA */}
            {categoriaSelecionada.nome === "Investimentos" && (
              <View style={s.cardAlertaInvestimentoExplicacao}>
                <Text style={s.txtInformativo}>
                  ⚠️ <Text style={{ fontWeight: "700", color: "#B45309" }}>Investimento Financeiro vs Pessoal</Text>{"\n"}
                  • Use esta categoria se estiver comprando Ativos (Ações, Renda Fixa) para guardar patrimônio.{"\n"}
                  • Se o gasto for com Educação (Cursos, Faculdades, Livros), utilize a categoria "Outros" e classifique como Essencial ou Desejo.
                </Text>
              </View>
            )}

            {categoriaSelecionada.nome === "Outros" && (
              <View style={s.containerDinamicoOutros}>
                <Text style={s.labelSubClassificacao}>Como classificar esse gasto?</Text>
                <View style={s.rowSubClassificacao}>
                  <Pressable onPress={() => setSubClassificacao("essencial")} style={[s.botaoSub, subClassificacao === "essencial" && s.botaoSubEssencialAtivo]}>
                    <Text style={[s.txtSub, subClassificacao === "essencial" && s.txtSubAtivo]}>Essencial (50%)</Text>
                  </Pressable>
                  <Pressable onPress={() => setSubClassificacao("desejo")} style={[s.botaoSub, subClassificacao === "desejo" && s.botaoSubDesejoAtivo]}>
                    <Text style={[s.txtSub, subClassificacao === "desejo" && s.txtSubAtivo]}>Desejo (30%)</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={s.wrapperBotaoCentro}>
          <Pressable onPress={handleSubmit(handleSalvar)} disabled={carregando} style={s.botaoSalvar}>
            <Text style={s.textoBotaoSalvar}>{carregando ? "Salvando..." : "Confirmar Lançamento"}</Text>
          </Pressable>
        </View>

        <View style={s.wrapperBotaoCentro}>
          <Pressable onPress={() => router.back()} style={s.btnVoltarCompacto}>
            <Text style={s.textoLinkVoltar}>Voltar</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#F8F9FA" },
  container: { padding: 24, justifyContent: "center", flexGrow: 1, gap: 20 },
  headerSecao: { alignItems: "center", marginTop: 10 },
  titulo: { fontSize: 24, fontWeight: "800", color: "#1F2937" },
  subtitulo: { fontSize: 13, color: "#6B7280", textAlign: "center", marginTop: 4 },
  cardFormulario: { backgroundColor: "#FFFFFF", padding: 20, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", elevation: 2 },
  labelInput: { fontSize: 13, fontWeight: "600", color: "#4B5563", marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 14, fontSize: 15, color: "#1F2937" },
  inputErro: { borderColor: "#EF4444" },
  textoErro: { color: "#EF4444", fontSize: 11, marginTop: 4, fontWeight: "500" },
  rowTipo: { flexDirection: "row", gap: 12, marginBottom: 6 },
  botaoTipo: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", backgroundColor: "#F9FAFB" },
  botaoDespesaAtivo: { borderColor: "#EF4444", backgroundColor: "#FFFFFF" },
  botaoReceitaAtivo: { borderColor: "#11C76F", backgroundColor: "#FFFFFF" },
  textoTipo: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  textoAtivoDespesa: { color: "#EF4444", fontWeight: "700" },
  textoAtivoReceita: { color: "#11C76F", fontWeight: "700" },
  // 💡 NOVO: card explicativo da Receita Extra
  cardInfoReceitaExtra: { backgroundColor: "#ECFDF5", padding: 14, borderRadius: 12, marginTop: 4, marginBottom: 4, borderWidth: 1, borderColor: "#A7F3D0" },
  txtInformativoReceita: { fontSize: 12, color: "#4B5563", lineHeight: 18 },
  cardAlertaInvestimentoExplicacao: { backgroundColor: "#FFFBEB", padding: 14, borderRadius: 12, marginTop: 12, marginBottom: 4, borderWidth: 1, borderColor: "#FDE68A" },
  txtInformativo: { fontSize: 12, color: "#4B5563", lineHeight: 18 },
  secaoCategorias: { marginTop: 4 },
  gridCategorias: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 2 },
  // 🔧 CORRIGIDO: menos padding lateral + altura mínima fixa para caber 2 linhas sem "pular" o layout
  cardCategoria: { width: "31.3%", minHeight: 64, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 6, alignItems: "center", justifyContent: "center", gap: 2 },
  cardCategoriaSelecionado: { borderColor: "#11C76F" },
  // 🔧 CORRIGIDO: fonte um pouco menor como base (o adjustsFontSizeToFit ainda encolhe mais se precisar)
  textoCategoria: { fontSize: 12, textAlign: "center" },
  tagClassificacao: { fontSize: 9, color: "#9CA3AF", textTransform: "uppercase", fontWeight: "600", marginTop: 2 },
  containerDinamicoOutros: { marginTop: 14, backgroundColor: "#F9FAFB", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  labelSubClassificacao: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 10 },
  rowSubClassificacao: { flexDirection: "row", gap: 10 },
  botaoSub: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", backgroundColor: "#FFFFFF" },
  botaoSubEssencialAtivo: { backgroundColor: "#DBEAFE", borderColor: "#3B82F6" },
  botaoSubDesejoAtivo: { backgroundColor: "#F3E8FF", borderColor: "#8B5CF6" },
  txtSub: { fontSize: 13, color: "#4B5563", fontWeight: "600" },
  txtSubAtivo: { color: "#1F2937", fontWeight: "700" },
  wrapperBotaoCentro: { alignItems: "center", marginTop: 16 },
  botaoSalvar: { backgroundColor: "#11C76F", paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12 },
  textoBotaoSalvar: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  btnVoltarCompacto: { paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12, borderWidth: 1, borderColor: "#D1D5DB", backgroundColor: "#FFFFFF" },
  textoLinkVoltar: { fontSize: 14, color: "#6B7280", fontWeight: "700" }
});