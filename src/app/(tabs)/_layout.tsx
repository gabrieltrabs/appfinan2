import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StatusBar, View } from "react-native";

export default function TabLayout() {
  const ICON_SIZE = 24;

  return (
    <>
      {/* Integração Total do Topo: StatusBar Imersivo Verde */}
      <StatusBar barStyle="light-content" backgroundColor="#11C76F" translucent={true} />
      
      {/* Ajuste de Preenchimento do Topo para telas com Notch no Android */}
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#11C76F' }} />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#11C76F", 
          tabBarInactiveTintColor: "#4B5563", 
          
          tabBarStyle: {
            backgroundColor: "#F3F4F6", 
            borderTopWidth: 0, // Remove a borda seca antiga para focar no arredondamento limpo
            
            // Altura segura mantida para vencer os botões nativos
            height: Platform.OS === "ios" ? 105 : 124, 
            paddingTop: 16,
            paddingBottom: Platform.OS === "ios" ? 40 : 54, 
            
            // DESIGN PICPAY: Cantos superiores lindamente arredondados
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            
            // Sombra leve para destacar os cantos arredondados do fundo off-white do app
            elevation: 10,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
          },
          
          // Aproxima o ícone do texto diminuindo margens e subindo o alinhamento
          tabBarIconStyle: {
            marginBottom: -2,
          },
          
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
            marginTop: 2, // Traz o texto para mais perto do ícone
          },
          
          freezeOnBlur: true, 
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Início",
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="home" size={ICON_SIZE} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="extrato"
          options={{
            title: "Extrato",
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="receipt" size={ICON_SIZE} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="perfil"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="person" size={ICON_SIZE} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}