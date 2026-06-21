import { MaterialIcons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface SobreAppModalProps {
  visible: boolean;
  onClose: () => void;
}

// Reaproveita as mesmas explicações do onboarding, mas como conteúdo
// consultável a qualquer momento (login, perfil) — já que o onboarding
// em si só aparece uma vez, na primeira abertura do app.
export function SobreAppModal({ visible, onClose }: SobreAppModalProps) {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={s.headerRow}>
              <MaterialIcons name="account-balance-wallet" size={24} color="#11C76F" />
              <Text style={s.titulo}>Sobre o FinançasApp</Text>
            </View>

            <Text style={s.intro}>
              O app te ajuda a organizar sua vida financeira usando o método 50/30/20, uma forma simples de dividir sua renda mensal.
            </Text>

            <View style={s.item}>
              <View style={[s.badge, { backgroundColor: "#DBEAFE" }]}>
                <Text style={[s.badgeTexto, { color: "#1D4ED8" }]}>50% ESSENCIAL</Text>
              </View>
              <Text style={s.itemTexto}>Gastos fixos do dia a dia: moradia, contas, alimentação, transporte.</Text>
            </View>

            <View style={s.item}>
              <View style={[s.badge, { backgroundColor: "#FEF3C7" }]}>
                <Text style={[s.badgeTexto, { color: "#B45309" }]}>30% DESEJOS</Text>
              </View>
              <Text style={s.itemTexto}>Lazer, compras e tudo que melhora sua qualidade de vida sem ser essencial.</Text>
            </View>

            <View style={s.item}>
              <View style={[s.badge, { backgroundColor: "#D1FAE5" }]}>
                <Text style={[s.badgeTexto, { color: "#065F46" }]}>20% FUTURO</Text>
              </View>
              <Text style={s.itemTexto}>
                Poupança e Reserva de Emergência — a meta é acumular 6 meses do seu custo de vida, pra te proteger de imprevistos.
              </Text>
            </View>

            <Text style={s.rodape}>
              Você registra suas transações classificando cada uma nessas categorias, e o app acompanha automaticamente se você está dentro do plano.
            </Text>

            <Pressable onPress={onClose} style={s.botaoFechar}>
              <Text style={s.textoBotaoFechar}>Entendi</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)", justifyContent: "center", alignItems: "center", padding: 24 },
  card: { backgroundColor: "#FFFFFF", width: "100%", maxHeight: "80%", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  titulo: { fontSize: 18, fontWeight: "800", color: "#1F2937" },
  intro: { fontSize: 14, color: "#4B5563", lineHeight: 20, marginBottom: 16 },
  item: { marginBottom: 14, gap: 6 },
  badge: { alignSelf: "flex-start", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  badgeTexto: { fontSize: 11, fontWeight: "700" },
  itemTexto: { fontSize: 13, color: "#6B7280", lineHeight: 18 },
  rodape: { fontSize: 13, color: "#6B7280", lineHeight: 18, marginTop: 4, marginBottom: 16, fontStyle: "italic" },
  botaoFechar: { backgroundColor: "#11C76F", padding: 14, borderRadius: 12, alignItems: "center" },
  textoBotaoFechar: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
});
