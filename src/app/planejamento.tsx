import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function MetasEDicas() {
  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.botaoVoltar}>
          <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={s.titulo}>Metas e Dicas</Text>
      </View>

      {/* ORIENTAÇÃO DE META ATUAL */}
      <View style={s.cardMissao}>
        <View style={s.badgeMissao}>
          <Text style={s.labelMissao}>💡 SUGESTÃO DE META</Text>
        </View>
        <Text style={s.tituloMissao}>Sua Reserva de Emergência</Text>
        <Text style={s.descMissao}>Nossa recomendação para o seu perfil é focar em acumular o equivalente a 6 meses dos seus gastos essenciais para sua segurança.</Text>
        
        <View style={s.containerProgresso}>
          <View style={s.barraProgressoFundo}>
            <View style={[s.barraProgressoFrente, { width: '35%' }]} />
          </View>
          <Text style={s.statusMissao}>Seu progresso atual: 35%</Text>
        </View>
      </View>

      {/* DIRECIONAMENTO E DIRETRIZES CLARAS */}
      <Text style={s.secaoTitulo}>Diretrizes do seu Perfil</Text>
      
      <View style={s.cardDirecao}>
        <View style={[s.iconCircle, { backgroundColor: '#D1FAE5' }]}>
          <MaterialIcons name="lightbulb" size={22} color="#11C76F" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.direcaoTitulo}>Como agir com os "Desejos"</Text>
          <Text style={s.direcaoDesc}>Sua renda aponta que gastos com lazer devem seguir o limite de 30%. Tente priorizar o que é essencial neste mês.</Text>
        </View>
      </View>

      <View style={s.cardDirecao}>
        <View style={[s.iconCircle, { backgroundColor: '#DBEAFE' }]}>
          <MaterialIcons name="gavel" size={22} color="#3B82F6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.direcaoTitulo}>Regra de Ouro do Cartão</Text>
          <Text style={s.direcaoDesc}>Use o cartão de crédito apenas como ferramenta de pagamento, nunca como extensão do salário. Evite parcelamentos longos.</Text>
        </View>
      </View>

      {/* CAROUSEL DE DICAS RÁPIDAS */}
      <Text style={s.secaoTitulo}>Dicas Práticas para o Dia a Dia</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, marginBottom: 20 }}>
        <View style={s.dicaCard}>
          <Text style={s.dicaEmoji}>📉</Text>
          <Text style={s.dicaCardTitulo}>Corte Fixo</Text>
          <Text style={s.dicaTexto}>Negocie seus planos de internet e assinaturas de streaming paradas.</Text>
        </View>
        
        <View style={s.dicaCard}>
          <Text style={s.dicaEmoji}>⏱️</Text>
          <Text style={s.dicaCardTitulo}>Regra das 24h</Text>
          <Text style={s.dicaTexto}>Antes de uma compra supérflua, espere um dia. A urgência costuma sumir.</Text>
        </View>
      </ScrollView>

      <Pressable onPress={() => router.back()} style={s.botaoFinal}>
        <Text style={s.botaoFinalTexto}>Entendido, voltar ao início</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  botaoVoltar: { padding: 8, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  titulo: { fontSize: 22, fontWeight: "bold", color: "#1F2937" },
  
  cardMissao: { backgroundColor: "#1F2937", padding: 20, borderRadius: 24, marginBottom: 28 },
  badgeMissao: { backgroundColor: "rgba(17, 199, 111, 0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  labelMissao: { color: "#11C76F", fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  tituloMissao: { color: "#FFF", fontSize: 18, fontWeight: "bold", marginTop: 12 },
  descMissao: { color: "#9CA3AF", fontSize: 13, marginTop: 6, lineHeight: 18 },
  containerProgresso: { marginTop: 18 },
  barraProgressoFundo: { height: 6, backgroundColor: "#374151", borderRadius: 3 },
  barraProgressoFrente: { height: 6, backgroundColor: "#11C76F", borderRadius: 3 },
  statusMissao: { color: "#11C76F", fontSize: 12, fontWeight: "700", marginTop: 8, textAlign: 'right' },

  secaoTitulo: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginBottom: 14, marginTop: 10 },
  cardDirecao: { flexDirection: 'row', backgroundColor: "#FFF", padding: 16, borderRadius: 16, gap: 14, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  iconCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center" },
  direcaoTitulo: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
  direcaoDesc: { fontSize: 13, color: "#6B7280", marginTop: 4, lineHeight: 18 },

  dicaCard: { width: 170, backgroundColor: "#FFF", padding: 16, borderRadius: 18, marginRight: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  dicaEmoji: { fontSize: 22, marginBottom: 8 },
  dicaCardTitulo: { fontSize: 14, fontWeight: "700", color: "#1F2937", marginBottom: 4 },
  dicaTexto: { fontSize: 12, color: "#6B7280", lineHeight: 16 },

  botaoFinal: { backgroundColor: "#11C76F", padding: 16, borderRadius: 16, alignItems: "center", marginTop: 10 },
  botaoFinalTexto: { color: "#FFF", fontWeight: "700", fontSize: 15 }
});