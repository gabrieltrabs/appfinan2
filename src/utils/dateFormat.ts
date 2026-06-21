// Funções centralizadas de formatação de data/hora em pt-BR.
// Evitam depender de toLocaleString/Intl, que tem suporte inconsistente
// entre engines do React Native (Hermes/JSC) dependendo da plataforma.

const MESES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function formatarHora(data: Date): string {
  return `${pad2(data.getHours())}:${pad2(data.getMinutes())}`;
}

export function ehMesmoDia(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

// Últimos 7 dias corridos, hoje incluso
export function estaNaUltimaSemana(data: Date, referencia: Date = new Date()): boolean {
  const inicio = new Date(referencia);
  inicio.setDate(inicio.getDate() - 6);
  inicio.setHours(0, 0, 0, 0);
  return data >= inicio && data <= referencia;
}

// Usado na Home (lista "Atividades do período"): "Hoje, 16:20" · "Ontem, 14:32" · "12 Jun, 09:15"
export function formatarDataCurta(data: Date): string {
  const agora = new Date();
  const hora = formatarHora(data);

  if (ehMesmoDia(data, agora)) return `Hoje, ${hora}`;

  const ontem = new Date(agora);
  ontem.setDate(ontem.getDate() - 1);
  if (ehMesmoDia(data, ontem)) return `Ontem, ${hora}`;

  return `${data.getDate()} ${MESES_ABREV[data.getMonth()]}, ${hora}`;
}

// Usado no Extrato (detalhe de cada lançamento): "21/06 às 16:20"
export function formatarDataCompleta(data: Date): string {
  return `${pad2(data.getDate())}/${pad2(data.getMonth() + 1)} às ${formatarHora(data)}`;
}

// Badge "Jun / 2026" usado na Home (card Planejamento 50/30/20)
export function formatarMesAnoBadge(data: Date): string {
  return `${MESES_ABREV[data.getMonth()]} / ${data.getFullYear()}`;
}

// Seletor de mês do Extrato: "Jun de 2026"
export function formatarMesAnoExtenso(data: Date): string {
  return `${MESES_ABREV[data.getMonth()]} de ${data.getFullYear()}`;
}