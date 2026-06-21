import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { deletarTransacao, escutarTransacoes } from "../../services/transactionService";
import { useUserStore } from "../../store/userStore";
import { Transacao } from "../../types";
import { formatarDataCurta, formatarMesAnoBadge } from "../../utils/dateFormat";

export default function Home() {
  const router = useRouter();
  const firebaseUser = useUserStore((state) => state.firebaseUser);
  const perfil = useUserStore((state) => state.perfil);
  const userRenda = perfil?.rendaMensal || 0; 

  // 🔧 Badge "Jun / 2026" agora usa a data real, centralizada em utils/dateFormat
  const mesAtualLabel = formatarMesAnoBadge(new Date());

  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [totalEssencial, setTotalEssencial] = useState(0);
  const [totalDesejos, setTotalDesejos] = useState(0);
  const [totalPoupanca, setTotalPoupanca] = useState(0);
  const [reservaAcumulada, setReservaAcumulada] = useState(0);
  
  const [limiteDisponivel, setLimiteDisponivel] = useState(0); 
  const [totalGastoMes, setTotalGastoMes] = useState(0);
  const [scoreFinanceiro, setScoreFinanceiro] = useState(70);

  // 💡 Estados para controlar a exibição dos novos Modais Customizados
  const [modalScoreVisivel, setModalScoreVisivel] = useState(false);
  const [modalReservaVisivel, setModalReservaVisivel] = useState(false);

  const tetoEssencial = userRenda * 0.5;
  const tetoDesejos = userRenda * 0.3;
  const tetoPoupanca = userRenda * 0.2;
  const metaReservaGeral = tetoEssencial * 6; 

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setTransacoes([]);
      return;
    }

    const unsubscribe = escutarTransacoes(firebaseUser.uid, (lista) => {
      setTransacoes(lista);

      const agora = new Date();
      const movimentacoesMes = lista.filter((t) => {
        if (!t.data) return false;
        const dataT = t.data instanceof Date ? t.data : new Date(t.data);
        return dataT.getMonth() === agora.getMonth() && dataT.getFullYear() === agora.getFullYear();
      });

      let essencial = 0;
      let desejos = 0;
      let poupanca = 0;
      let reserva = 0;
      let gastoMes = 0;

      movimentacoesMes.forEach((t) => {
        const classe = (t.classificacao || "").toLowerCase().trim();
        
        if (t.tipo === "despesa") {
          gastoMes += t.valor;
          if (classe === "essencial") essencial += t.valor;
          if (classe === "desejo") desejos += t.valor;
        }
        
        if (classe === "poupanca") {
          poupanca += t.valor;
          if (t.categoriaId === "Reserva de Emergência") {
            reserva += t.valor;
          }
        }
      });

      setTotalEssencial(essencial);
      setTotalDesejos(desejos);
      setTotalPoupanca(poupanca);
      setReservaAcumulada(reserva);
      setTotalGastoMes(gastoMes);
      setLimiteDisponivel(userRenda - gastoMes);

      if (essencial > tetoEssencial || desejos > tetoDesejos) {
        setScoreFinanceiro(42); 
      } else if (essencial > (tetoEssencial * 0.8) || desejos > (tetoDesejos * 0.8)) {
        setScoreFinanceiro(68);
      } else if (gastoMes > 0) {
        setScoreFinanceiro(88);
      } else {
        setScoreFinanceiro(70);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [firebaseUser, userRenda]);

  async function handleDeletar(id: string) {
    if (!firebaseUser?.uid) return;

    Alert.alert("Excluir", "Deseja excluir este lançamento?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: async () => await deletarTransacao(firebaseUser.uid, id) }
    ]);
  }

  const pctEssencial = Math.min(Math.round((totalEssencial / tetoEssencial) * 100), 100) || 0;
  const pctDesejos = Math.min(Math.round((totalDesejos / tetoDesejos) * 100), 100) || 0;
  const pctPoupanca = Math.min(Math.round((totalPoupanca / tetoPoupanca) * 100), 100) || 0;
  const pctReserva = Math.min(Math.round((reservaAcumulada / metaReservaGeral) * 100), 100) || 0;

  return (
    <View style={s.background}>
      <StatusBar barStyle="light-content" backgroundColor="#11C76F" />
      
      <ScrollView contentContainerStyle={s.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={s.topoVerdeFundo}>
          <View style={s.cardSaldoFlutuante}>
            <Text style={s.txtOla}>Olá, {perfil?.nome || "Usuário"} 👋</Text>
            
            <Text style={s.txtLabelSaldo}>ORÇAMENTO DISPONÍVEL NO MÊS</Text>
            <Text style={s.txtValorSaldo}>R$ {limiteDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text>
            
            <View style={s.divisorCardSaldo} />
            
            <View style={s.rowResumoSaldos}>
              <View>
                <Text style={s.labelMiniResumo}>GASTO TOTAL DO MÊS</Text>
                <Text style={s.valorMiniResumo}>R$ {totalGastoMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text>
              </View>
              
              {/* 💡 MODIFICADO: Agora abre o modal customizado e lindão */}
              <Pressable onPress={() => setModalScoreVisivel(true)} style={s.btnScoreContainer}>
                <Text style={s.labelMiniResumoRight}>SAÚDE GERAL ℹ️</Text>
                <Text style={[s.valorScoreGreen, { color: scoreFinanceiro > 50 ? "#A7F3D0" : "#FCA5A5" }]}>
                  {scoreFinanceiro} <Text style={s.txtPts}>pts</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={s.containerConteudo}>
          {/* CARD DA RESERVA DE EMERGÊNCIA */}
          <View style={s.cardReserva}>
            <View style={s.reservaHeader}>
              {/* 💡 MODIFICADO: Agora abre o modal customizado da reserva */}
              <Pressable onPress={() => setModalReservaVisivel(true)} style={s.rowTituloReservaInfo}>
                <Text style={s.reservaTitulo}>Reserva de Emergência Geral</Text>
                <MaterialIcons name="info-outline" size={16} color="#9CA3AF" />
              </Pressable>
              
              <Text style={s.reservaMeta}>
                <Text style={s.reservaValorAtual}>{tetoEssencial > 0 ? (reservaAcumulada / tetoEssencial).toFixed(1) : "0.0"}</Text> / 6 meses
              </Text>
            </View>

            <View style={s.barraProgressoFundo}>
              <View style={[s.barraProgressoPreenchimento, { width: `${pctReserva}%` }]} />
            </View>

            <Text style={s.reservaSubtexto}>
              Sua meta ideal é <Text style={{ fontWeight: "700", color: "#1F2937" }}>R$ {metaReservaGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text> (6 meses de proteção). Para alimentar esta barra, use o botão abaixo e classifique como <Text style={{ fontWeight: "600" }}>Poupança ➔ Reserva de Emergência</Text>.
            </Text>
          </View>

          {/* BOTÃO REGISTRAR TRANSAÇÃO PROPORCIONAL */}
          <View style={s.wrapperBotaoCentro}>
            <Pressable onPress={() => router.push("/nova-transacao")} style={s.botaoRegistrar}>
              <Text style={s.textoBotaoRegistrar}>Registrar nova transação</Text>
            </Pressable>
          </View>

          {/* SEÇÃO PLANEJAMENTO FINANCEIRO */}
          <View style={s.headerEstatisticas}>
            <Text style={s.tituloSecao}>Planejamento 50/30/20</Text>
            <View style={s.badgeMesSelector}>
              <Text style={s.txtBadgeMes}>{mesAtualLabel}</Text>
            </View>
          </View>

          {/* CARD ESSENCIAL */}
          <View style={s.cardProgressoItem}>
            <View style={s.rowProgressoHeader}>
              <View style={s.rowPilarTituloContainer}>
                <View style={[s.bolaNativa, { backgroundColor: "#3B82F6" }]} />
                <Text style={s.txtPilarNome}>Essencial (50%)</Text>
              </View>
              <Text style={s.txtPilarValores}>R$ {totalEssencial.toLocaleString("pt-BR")} <Text style={s.txtMax}>/ R$ {tetoEssencial.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text></Text>
            </View>
            <View style={s.barraFundo}>
              <View style={[s.barraPreenchimento, { width: `${pctEssencial}%`, backgroundColor: "#3B82F6" }]} />
            </View>
            <View style={s.rowProgressoFooter}>
              <Text style={s.txtPctUsado}>{pctEssencial}% do limite usado</Text>
              <Text style={[s.txtStatusFeedback, { color: "#10B981" }]}>Sob Controle</Text>
            </View>
          </View>

          {/* CARD DESEJOS */}
          <View style={s.cardProgressoItem}>
            <View style={s.rowProgressoHeader}>
              <View style={s.rowPilarTituloContainer}>
                <View style={[s.bolaNativa, { backgroundColor: "#8B5CF6" }]} />
                <Text style={s.txtPilarNome}>Desejos (30%)</Text>
              </View>
              <Text style={s.txtPilarValores}>R$ {totalDesejos.toLocaleString("pt-BR")} <Text style={s.txtMax}>/ R$ {tetoDesejos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text></Text>
            </View>
            <View style={s.barraFundo}>
              <View style={[s.barraPreenchimento, { width: `${pctDesejos}%`, backgroundColor: "#8B5CF6" }]} />
            </View>
            <View style={s.rowProgressoFooter}>
              <Text style={s.txtPctUsado}>{pctDesejos}% do limite usado</Text>
              <Text style={[s.txtStatusFeedback, { color: "#10B981" }]}>Sob Controle</Text>
            </View>
          </View>

          {/* CARD POUPANÇA */}
          <View style={s.cardProgressoItem}>
            <View style={s.rowProgressoHeader}>
              <View style={s.rowPilarTituloContainer}>
                <View style={[s.bolaNativa, { backgroundColor: "#10B981" }]} />
                <Text style={s.txtPilarNome}>Poupança (20%)</Text>
              </View>
              <Text style={s.txtPilarValores}>R$ {totalPoupanca.toLocaleString("pt-BR")} <Text style={s.txtMax}>/ R$ {tetoPoupanca.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text></Text>
            </View>
            <View style={s.barraFundo}>
              <View style={[s.barraPreenchimento, { width: `${pctPoupanca}%`, backgroundColor: "#10B981" }]} />
            </View>
            <View style={s.rowProgressoFooter}>
              <Text style={s.txtPctUsado}>{pctPoupanca}% do limite usado</Text>
              <Text style={[s.txtStatusFeedback, { color: "#10B981" }]}>Sob Controle</Text>
            </View>
          </View>

          {/* SEÇÃO ATIVIDADES DO PERÍODO */}
          <View style={s.secaoLancamentos}>
            <View style={s.headerLancamentos}>
              <Text style={s.tituloSecao}>Atividades do período</Text>
              {transacoes.length > 0 && (
                <Text style={s.txtContadorLancamentos}>{transacoes.length} itens</Text>
              )}
            </View>

            {transacoes.length === 0 ? (
              <View style={s.cardListaVazia}>
                <Text style={s.txtListaVazia}>Nenhuma movimentação registrada neste mês.</Text>
              </View>
            ) : (
              transacoes.map((item) => {
                const ehDespesa = item.tipo === "despesa";
                const dataItem = item.data instanceof Date ? item.data : new Date(item.data);
                return (
                  <View key={item.id} style={s.cardLancamentoItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.txtLancamentoDesc}>{item.descricao}</Text>
                      <Text style={s.txtLancamentoCat}>{item.categoriaId} • <Text style={{ textTransform: 'capitalize' }}>{item.classificacao}</Text></Text>
                      <Text style={s.txtLancamentoData}>{formatarDataCurta(dataItem)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={[s.txtLancamentoValor, { color: ehDespesa ? "#EF4444" : "#11C76F" }]}>
                        {ehDespesa ? "-" : "+"} R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </Text>
                      <Pressable onPress={() => handleDeletar(item.id)} style={{ padding: 4 }}>
                        <MaterialIcons name="close" size={18} color="#9CA3AF" />
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}
          </View>

        </View>
      </ScrollView>

      {/* ======================================================================= */}
      {/* 👑 NOVO: MODAL CUSTOMIZADO E ELEGANTE DO SCORE FINANCEIRO */}
      {/* ======================================================================= */}
      <Modal animationType="fade" transparent={true} visible={modalScoreVisivel} onRequestClose={() => setModalScoreVisivel(false)}>
        <View style={s.modalOverlayFundo}>
          <View style={s.modalCardConteudo}>
            <View style={s.modalHeaderRow}>
              <MaterialIcons name="analytics" size={24} color="#11C76F" />
              <Text style={s.modalTituloText}>Saúde Financeira</Text>
            </View>
            
            <Text style={s.modalTextoIntro}>
              Sua pontuação atual é de <Text style={{ fontWeight: "700", color: "#11C76F" }}>{scoreFinanceiro} pontos</Text>. Ela avalia sua aderência real ao método 50/30/20 baseado no seu orçamento de R$ {userRenda.toLocaleString("pt-BR")}:
            </Text>

            {/* Bloco Meta Bom */}
            <View style={s.modalItemPilar}>
              <View style={[s.modalBadgePilar, { backgroundColor: "#D1FAE5" }]}>
                <Text style={{ color: "#065F46", fontSize: 11, fontWeight: "700" }}>BOM (80-100 pts)</Text>
              </View>
              <Text style={s.modalItemPilarTexto}>
                Seus gastos essenciais estão sob controle abaixo de R$ {tetoEssencial.toLocaleString("pt-BR")} e desejos abaixo de R$ {tetoDesejos.toLocaleString("pt-BR")}.
              </Text>
            </View>

            {/* Bloco Meta Alerta */}
            <View style={s.modalItemPilar}>
              <View style={[s.modalBadgePilar, { backgroundColor: "#FEE2E2" }]}>
                <Text style={{ color: "#991B1B", fontSize: 11, fontWeight: "700" }}>ALERTA (0-50 pts)</Text>
              </View>
              <Text style={s.modalItemPilarTexto}>
                Você ultrapassou o teto recomendado de segurança para alguma das categorias deste mês. É hora de segurar as despesas!
              </Text>
            </View>

            <Pressable onPress={() => setModalScoreVisivel(false)} style={s.modalBotaoFechar}>
              <Text style={s.modalTextoBotaoFechar}>Entendi</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ======================================================================= */}
      {/* 👑 MODAL CUSTOMIZADO DA RESERVA DE EMERGÊNCIA (texto corrigido) */}
      {/* ======================================================================= */}
      <Modal animationType="fade" transparent={true} visible={modalReservaVisivel} onRequestClose={() => setModalReservaVisivel(false)}>
        <View style={s.modalOverlayFundo}>
          <View style={s.modalCardConteudo}>
            <View style={s.modalHeaderRow}>
              <MaterialIcons name="security" size={24} color="#11C76F" />
              <Text style={s.modalTituloText}>Reserva de Segurança</Text>
            </View>
            
            <Text style={s.modalTextoIntro}>
              Para fazer essa barra de progresso subir e proteger o seu futuro, faça o seguinte lançamento:
            </Text>

            {/* Caminho direto: Receita Extra não tem etapa de classificação/categoria */}
            <View style={s.modalCardInstrucaoPassos}>
              <Text style={s.txtModalPassoItem}>1️⃣ Clique em <Text style={{ fontWeight: "700" }}>'Registrar nova transação'</Text>.</Text>
              <Text style={s.txtModalPassoItem}>2️⃣ Selecione a opção <Text style={{ fontWeight: "700", color: "#11C76F" }}>'Receita Extra'</Text>.</Text>
              <Text style={s.txtModalPassoItem}>3️⃣ Preencha a descrição e o valor e confirme — é direto, sem precisar escolher classificação ou categoria.</Text>
            </View>

            {/* Caminho alternativo: via Despesa, que ainda exige escolher a categoria */}
            <Text style={s.modalTextoAlternativo}>
              Prefere lançar pelo lado da <Text style={{ fontWeight: "700" }}>Despesa</Text>? Escolha a categoria <Text style={{ fontWeight: "700", color: "#10B981" }}>'Reserva de Emergência'</Text> — ela já vem classificada como Poupança (20%) automaticamente.
            </Text>

            <Pressable onPress={() => setModalReservaVisivel(false)} style={s.modalBotaoFechar}>
              <Text style={s.modalTextoBotaoFechar}>Fechar Ajuda</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const s = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#F4F6F9" },
  scrollContainer: { flexGrow: 1, paddingBottom: 40 },
  topoVerdeFundo: { backgroundColor: "#11C76F", paddingTop: Platform.OS === "ios" ? 20 : 12, paddingBottom: 70, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  cardSaldoFlutuante: { backgroundColor: "#0CA65B", padding: 20, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5, marginTop: 10 },
  txtOla: { fontSize: 15, fontWeight: "600", color: "#E0F2FE", marginBottom: 14 },
  txtLabelSaldo: { fontSize: 10, fontWeight: "700", color: "#A7F3D0", letterSpacing: 0.5 },
  txtValorSaldo: { fontSize: 32, fontWeight: "700", color: "#FFFFFF", marginTop: 4, letterSpacing: -0.5 },
  divisorCardSaldo: { height: 1, backgroundColor: "#098A4A", marginVertical: 14 },
  rowResumoSaldos: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  labelMiniResumo: { fontSize: 9, fontWeight: "700", color: "#A7F3D0", letterSpacing: 0.3 },
  labelMiniResumoRight: { fontSize: 9, fontWeight: "700", color: "#A7F3D0", letterSpacing: 0.3, textAlign: "right" },
  valorMiniResumo: { fontSize: 13, fontWeight: "700", color: "#FFFFFF", marginTop: 2 },
  btnScoreContainer: { alignItems: "flex-end", paddingVertical: 2, paddingLeft: 10 },
  valorScoreGreen: { fontSize: 18, fontWeight: "800", marginTop: 1 },
  txtPts: { fontSize: 11, color: "#E0F2FE", fontWeight: "500" },
  containerConteudo: { paddingHorizontal: 16, marginTop: -50, gap: 14 },
  cardReserva: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  reservaHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  rowTituloReservaInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  reservaTitulo: { fontSize: 14, fontWeight: "700", color: "#1F2937" },
  reservaMeta: { fontSize: 12, color: "#9CA3AF" },
  reservaValorAtual: { color: "#11C76F", fontWeight: "700" },
  barraProgressoFundo: { height: 8, backgroundColor: "#E5E7EB", borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  barraProgressoPreenchimento: { height: "100%", backgroundColor: "#11C76F", borderRadius: 4 },
  reservaSubtexto: { fontSize: 12, color: "#6B7280", fontWeight: "500", lineHeight: 16 },
  
  wrapperBotaoCentro: { alignItems: "center", marginVertical: 4 },
  botaoRegistrar: { backgroundColor: "#11C76F", paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12 },
  textoBotaoRegistrar: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  
  headerEstatisticas: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6, marginBottom: 2 },
  tituloSecao: { fontSize: 15, fontWeight: "700", color: "#4B5563" },
  badgeMesSelector: { backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  txtBadgeMes: { fontSize: 12, fontWeight: "600", color: "#4B5563" },
  
  cardProgressoItem: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  rowProgressoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  rowPilarTituloContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  bolaNativa: { width: 10, height: 10, borderRadius: 5 }, 
  txtPilarNome: { fontSize: 14, fontWeight: "600", color: "#374151" },
  txtPilarValores: { fontSize: 14, fontWeight: "700", color: "#1F2937" },
  txtMax: { color: "#9CA3AF", fontWeight: "500", fontSize: 12 },
  barraFundo: { height: 6, backgroundColor: "#E5E7EB", borderRadius: 3, overflow: "hidden", marginBottom: 8 },
  barraPreenchimento: { height: "100%", borderRadius: 3 },
  rowProgressoFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  txtPctUsado: { fontSize: 12, color: "#9CA3AF" },
  txtStatusFeedback: { fontSize: 12, fontWeight: "600" },
  secaoLancamentos: { marginTop: 4 },
  headerLancamentos: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, minHeight: 22 },
  txtContadorLancamentos: { fontSize: 12, color: "#9CA3AF" },
  cardLancamentoItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FFFFFF", padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 8 },
  cardListaVazia: { backgroundColor: "#FFFFFF", padding: 24, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", justifyContent: "center" },
  txtListaVazia: { color: "#9CA3AF", fontStyle: "italic", fontSize: 13, textAlign: "center" },
  txtLancamentoDesc: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  txtLancamentoCat: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  txtLancamentoData: { fontSize: 10, color: "#C0C7D1", marginTop: 2 },
  txtLancamentoValor: { fontSize: 14, fontWeight: "700" },

  // 👑 ESTILOS DOS NOVOS MODAIS PREMIUM CUSTOMIZADOS
  modalOverlayFundo: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalCardConteudo: { backgroundColor: "#FFFFFF", width: "100%", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10 },
  modalHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  modalTituloText: { fontSize: 18, fontWeight: "800", color: "#1F2937" },
  modalTextoIntro: { fontSize: 14, color: "#4B5563", lineHeight: 20, marginBottom: 16 },
  modalItemPilar: { marginBottom: 14, gap: 6 },
  modalBadgePilar: { alignSelf: "flex-start", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  modalItemPilarTexto: { fontSize: 13, color: "#6B7280", lineHeight: 18 },
  modalBotaoFechar: { backgroundColor: "#11C76F", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 12 },
  modalTextoBotaoFechar: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  modalCardInstrucaoPassos: { backgroundColor: "#F9FAFB", padding: 16, borderRadius: 16, gap: 10, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  txtModalPassoItem: { fontSize: 13, color: "#4B5563", lineHeight: 18 },
  modalTextoAlternativo: { fontSize: 12, color: "#6B7280", lineHeight: 17, fontStyle: "italic", marginBottom: 4 }
});