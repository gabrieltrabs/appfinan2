import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { escutarTransacoes } from "../../services/transactionService";
import { useUserStore } from "../../store/userStore";
import { Transacao } from "../../types";
import { ehMesmoDia, estaNaUltimaSemana, formatarDataCompleta, formatarMesAnoExtenso } from "../../utils/dateFormat";

export default function ExtratoDetalhado() {
  const firebaseUser = useUserStore((state) => state.firebaseUser);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  
  // Estados de Filtros e Navegação
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "receita" | "despesa">("todos");
  const [pilarFiltro, setPilarFiltro] = useState<"todos" | "essencial" | "desejo" | "poupanca">("todos");
  
  // Estado para controlar o mês exibido
  const [dataFiltro, setDataFiltro] = useState<Date>(new Date());

  // 💡 NOVO: filtro rápido de período, só faz sentido dentro do mês atual
  const [periodoFiltro, setPeriodoFiltro] = useState<"mes" | "semana" | "hoje">("mes");

  useEffect(() => {
    if (!firebaseUser) return;
    return escutarTransacoes(firebaseUser.uid, setTransacoes);
  }, [firebaseUser]);

  function handleMesAnterior() {
    setPeriodoFiltro("mes");
    setDataFiltro((prev) => {
      const novaData = new Date(prev);
      novaData.setMonth(novaData.getMonth() - 1);
      return novaData;
    });
  }

  function handleMesSeguinte() {
    setPeriodoFiltro("mes");
    setDataFiltro((prev) => {
      const novaData = new Date(prev);
      novaData.setMonth(novaData.getMonth() + 1);
      return novaData;
    });
  }

  const hoje = new Date();
  const estaNoMesAtual = dataFiltro.getMonth() === hoje.getMonth() && dataFiltro.getFullYear() === hoje.getFullYear();

  const transacoesFiltradas = transacoes.filter((t) => {
    // 🔧 CORRIGIDO: o filtro lia "(t as any).createdAt", campo que não existe na Transacao.
    // O campo real é "data" (já chega como Date pronto, via transactionService).
    // Antes disso, TODA transação caía no fallback "new Date()" e era tratada como "hoje",
    // então o filtro por mês nunca funcionava de verdade.
    if (!t.data) return false;
    const dataTransacao = t.data instanceof Date ? t.data : new Date(t.data);
    if (isNaN(dataTransacao.getTime())) return false;

    const mesmoMes = dataTransacao.getMonth() === dataFiltro.getMonth();
    const mesmoAno = dataTransacao.getFullYear() === dataFiltro.getFullYear();

    if (!mesmoMes || !mesmoAno) return false;

    // 💡 NOVO: refina dentro do mês atual por "Hoje" / "Esta semana"
    if (estaNoMesAtual && periodoFiltro === "hoje" && !ehMesmoDia(dataTransacao, hoje)) return false;
    if (estaNoMesAtual && periodoFiltro === "semana" && !estaNaUltimaSemana(dataTransacao, hoje)) return false;

    const bateTipo = tipoFiltro === "todos" || t.tipo === tipoFiltro;
    
    const classe = (t.classificacao || "").toLowerCase().trim();
    const batePilar = pilarFiltro === "todos" || classe === pilarFiltro;

    return bateTipo && batePilar;
  });

  const mesAnoTexto = formatarMesAnoExtenso(dataFiltro);

  return (
    <View style={s.background}>
      <StatusBar barStyle="light-content" backgroundColor="#11C76F" />
      
      <ScrollView contentContainerStyle={s.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* CABEÇALHO VERDE ARREDONDADO NA BASE */}
        <View style={s.topoVerdeHeader}>
          <Text style={s.tituloBranco}>Extrato Detalhado</Text>
          <Text style={s.subtituloBranco}>Controle de movimentações por período</Text>
        </View>

        <View style={s.containerConteudo}>
          
          {/* SELETOR DE MÊS DINÂMICO */}
          <View style={s.cardMes}>
            <Pressable onPress={handleMesAnterior} style={s.setaMes}>
              <MaterialIcons name="chevron-left" size={24} color="#1F2937" />
            </Pressable>
            
            <Text style={s.txtMes}>{mesAnoTexto}</Text>
            
            <Pressable onPress={handleMesSeguinte} style={s.setaMes}>
              <MaterialIcons name="chevron-right" size={24} color="#1F2937" />
            </Pressable>
          </View>

          {/* 💡 NOVO: FILTRO RÁPIDO DE PERÍODO — só aparece quando o mês exibido é o atual */}
          {estaNoMesAtual && (
            <View style={s.rowPeriodoRapido}>
              <Pressable onPress={() => setPeriodoFiltro("mes")} style={[s.chipPeriodo, periodoFiltro === "mes" && s.chipPeriodoAtivo]}>
                <Text style={[s.txtChipPeriodo, periodoFiltro === "mes" && s.txtChipPeriodoAtivo]}>Mês inteiro</Text>
              </Pressable>
              <Pressable onPress={() => setPeriodoFiltro("semana")} style={[s.chipPeriodo, periodoFiltro === "semana" && s.chipPeriodoAtivo]}>
                <Text style={[s.txtChipPeriodo, periodoFiltro === "semana" && s.txtChipPeriodoAtivo]}>Esta semana</Text>
              </Pressable>
              <Pressable onPress={() => setPeriodoFiltro("hoje")} style={[s.chipPeriodo, periodoFiltro === "hoje" && s.chipPeriodoAtivo]}>
                <Text style={[s.txtChipPeriodo, periodoFiltro === "hoje" && s.txtChipPeriodoAtivo]}>Hoje</Text>
              </Pressable>
            </View>
          )}

          {/* FILTRO 1: TIPO DE TRANSAÇÃO */}
          <View style={s.rowFiltrosPrincipais}>
            <Pressable onPress={() => setTipoFiltro("todos")} style={[s.botaoFiltro, tipoFiltro === "todos" && s.botaoFiltroAtivo]}>
              <Text style={[s.txtFiltro, tipoFiltro === "todos" && s.txtFiltroAtivo]}>Todos</Text>
            </Pressable>
            <Pressable onPress={() => setTipoFiltro("receita")} style={[s.botaoFiltro, tipoFiltro === "receita" && s.botaoFiltroAtivo]}>
              <Text style={[s.txtFiltro, tipoFiltro === "receita" && s.txtFiltroAtivo]}>Receitas</Text>
            </Pressable>
            <Pressable onPress={() => setTipoFiltro("despesa")} style={[s.botaoFiltro, tipoFiltro === "despesa" && s.botaoFiltroAtivo]}>
              <Text style={[s.txtFiltro, tipoFiltro === "despesa" && s.txtFiltroAtivo]}>Despesas</Text>
            </Pressable>
          </View>

          {/* FILTRO 2: PILAR DO ORÇAMENTO */}
          <View style={s.containerPilares}>
            <Pressable onPress={() => setPilarFiltro("todos")} style={[s.badgePilar, pilarFiltro === "todos" && s.badgePilarTodosAtivo]}>
              <Text style={[s.txtPilar, s.txtColorTodos, pilarFiltro === "todos" && s.sTxtColorTodosAtivo]}>Todos Pilares</Text>
            </Pressable>

            <Pressable onPress={() => setPilarFiltro("essencial")} style={[s.badgePilar, pilarFiltro === "essencial" && s.badgePilarEssencialAtivo]}>
              <View style={[s.dotPilar, { backgroundColor: "#3B82F6" }]} />
              <Text style={[s.txtPilar, s.txtColorEssencial, pilarFiltro === "essencial" && s.txtAtivoGeral]}>Essencial</Text>
            </Pressable>

            <Pressable onPress={() => setPilarFiltro("desejo")} style={[s.badgePilar, pilarFiltro === "desejo" && s.badgePilarDesejoAtivo]}>
              <View style={[s.dotPilar, { backgroundColor: "#8B5CF6" }]} />
              <Text style={[s.txtPilar, s.txtColorDesejo, pilarFiltro === "desejo" && s.txtAtivoGeral]}>Desejos</Text>
            </Pressable>

            <Pressable onPress={() => setPilarFiltro("poupanca")} style={[s.badgePilar, pilarFiltro === "poupanca" && s.badgePilarPoupancaAtivo]}>
              <View style={[s.dotPilar, { backgroundColor: "#10B981" }]} />
              <Text style={[s.txtPilar, s.txtColorPoupanca, pilarFiltro === "poupanca" && s.txtAtivoGeral]}>Poupança</Text>
            </Pressable>
          </View>

          {/* LISTAGEM DE LANÇAMENTOS */}
          <View style={s.containerLista}>
            {transacoesFiltradas.length === 0 ? (
              <View style={s.cardVazio}>
                <MaterialIcons name="search-off" size={48} color="#9CA3AF" />
                <Text style={s.txtVazio}>Nenhum lançamento encontrado para os filtros selecionados.</Text>
              </View>
            ) : (
              transacoesFiltradas.map((item) => {
                const ehDespesa = item.tipo === "despesa";
                const dataItem = item.data instanceof Date ? item.data : new Date(item.data);
                let corPilarIndicator = "#3B82F6"; 
                if (item.classificacao === "desejo") corPilarIndicator = "#8B5CF6";
                if (item.classificacao === "poupanca") corPilarIndicator = "#10B981";

                return (
                  <View key={item.id} style={s.cardTransacaoItem}>
                    <View style={[s.circuloIcone, { backgroundColor: ehDespesa ? '#FEE2E2' : '#DCFCE7' }]}>
                      <MaterialIcons name={ehDespesa ? "arrow-outward" : "arrow-downward"} size={20} color={ehDespesa ? "#EF4444" : "#11C76F"} />
                    </View>
                    
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={s.itemDescricao}>{item.descricao}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Text style={s.itemCategoria}>{item.categoriaId}</Text>
                        <Text style={{ color: '#D1D5DB', fontSize: 10 }}>•</Text>
                        <Text style={[s.tagPilarLinha, { color: corPilarIndicator }]}>{item.classificacao}</Text>
                      </View>
                      <Text style={s.itemDataHora}>{formatarDataCompleta(dataItem)}</Text>
                    </View>

                    <Text style={[s.itemValor, { color: ehDespesa ? '#EF4444' : '#11C76F' }]}>
                      {ehDespesa ? '-' : '+'} R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                );
              })
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#F4F6F9" },
  scrollContainer: { flexGrow: 1, paddingBottom: 60 },
  
  // 💡 Modificado: Agora possui bordas arredondadas idênticas à Home
  topoVerdeHeader: { backgroundColor: "#11C76F", paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 50, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  tituloBranco: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  subtituloBranco: { fontSize: 13, color: "#D1FAE5", marginTop: 2 },
  
  containerConteudo: { marginTop: -24, gap: 14 },

  cardMes: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 16, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
  setaMes: { backgroundColor: '#F3F4F6', padding: 6, borderRadius: 8 },
  txtMes: { fontSize: 15, fontWeight: '700', color: '#1F2937', textTransform: 'capitalize' },

  // 💡 NOVO: chips de período rápido (Mês inteiro / Esta semana / Hoje)
  rowPeriodoRapido: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  chipPeriodo: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#FFFFFF' },
  chipPeriodoAtivo: { backgroundColor: '#ECFDF5', borderColor: '#11C76F' },
  txtChipPeriodo: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  txtChipPeriodoAtivo: { color: '#11C76F', fontWeight: '700' },
  
  rowFiltrosPrincipais: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  botaoFiltro: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#FFFFFF' },
  botaoFiltroAtivo: { backgroundColor: '#11C76F', borderColor: '#11C76F' },
  txtFiltro: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  txtFiltroAtivo: { color: '#FFFFFF', fontWeight: '700' },
  
  containerPilares: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 16 },
  badgePilar: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 6 },
  dotPilar: { width: 8, height: 8, borderRadius: 4 },
  
  badgePilarTodosAtivo: { backgroundColor: '#4B5563', borderColor: '#4B5563' },
  badgePilarEssencialAtivo: { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' },
  badgePilarDesejoAtivo: { backgroundColor: '#F3E8FF', borderColor: '#8B5CF6' },
  badgePilarPoupancaAtivo: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
  
  txtPilar: { fontSize: 12, fontWeight: '600' },
  txtColorTodos: { color: '#4B5563' },
  txtColorEssencial: { color: '#1E40AF' },
  txtColorDesejo: { color: '#5B21B6' },
  txtColorPoupanca: { color: '#065F46' },
  txtAtivoGeral: { fontWeight: '700' },
  sTxtColorTodosAtivo: { color: '#FFFFFF', fontWeight: '700' },

  containerLista: { paddingHorizontal: 16, gap: 8 },
  cardTransacaoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  circuloIcone: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  itemDescricao: { fontWeight: '600', color: '#1F2937', fontSize: 15 },
  itemCategoria: { fontSize: 12, color: '#9CA3AF', textTransform: 'capitalize' },
  tagPilarLinha: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  itemDataHora: { fontSize: 11, color: '#B0B7C3', marginTop: 3 },
  itemValor: { fontWeight: '700', fontSize: 15 },
  
  cardVazio: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', padding: 32, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#D1D5DB' },
  txtVazio: { color: '#9CA3AF', textAlign: 'center', fontSize: 13, marginTop: 8, paddingHorizontal: 20 }
});