// A URL do Render
const API_BASE_URL = "https://sosconnect.onrender.com";

// ── API ──────────────────────────────────────────────────────
export async function api(path, opts = {}) {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erro na requisição");
  return data;
}

// ── Time ─────────────────────────────────────────────────────
export function timeAgo(date) {
  const s = (Date.now() - new Date(date)) / 1000;
  if (s < 60) return "agora";
  if (s < 3600) return `${Math.floor(s / 60)}min atrás`;
  if (s < 86400) return `${Math.floor(s / 3600)}h atrás`;
  return `${Math.floor(s / 86400)}d atrás`;
}

// ── Badge configs ─────────────────────────────────────────────
export const SEVERITY = {
  critico: {
    label: "Crítico",
    color: "var(--red)",
    bg: "var(--red-bg)",
    border: "var(--red-border)",
  },
  alto: {
    label: "Alto",
    color: "var(--orange)",
    bg: "var(--orange-bg)",
    border: "var(--orange-border)",
  },
  medio: {
    label: "Médio",
    color: "var(--amber)",
    bg: "var(--amber-bg)",
    border: "var(--amber-border)",
  },
  baixo: {
    label: "Baixo",
    color: "var(--green)",
    bg: "var(--green-bg)",
    border: "var(--green-border)",
  },
  critica: {
    label: "Crítica",
    color: "var(--red)",
    bg: "var(--red-bg)",
    border: "var(--red-border)",
  },
  alta: {
    label: "Alta",
    color: "var(--orange)",
    bg: "var(--orange-bg)",
    border: "var(--orange-border)",
  },
  media: {
    label: "Média",
    color: "var(--amber)",
    bg: "var(--amber-bg)",
    border: "var(--amber-border)",
  },
  baixa: {
    label: "Baixa",
    color: "var(--green)",
    bg: "var(--green-bg)",
    border: "var(--green-border)",
  },
};

export const STATUS = {
  ativo: {
    label: "Ativo",
    color: "var(--blue)",
    bg: "var(--blue-bg)",
    border: "var(--blue-border)",
  },
  monitorando: {
    label: "Monitorando",
    color: "var(--amber)",
    bg: "var(--amber-bg)",
    border: "var(--amber-border)",
  },
  resolvido: {
    label: "Resolvido",
    color: "var(--green)",
    bg: "var(--green-bg)",
    border: "var(--green-border)",
  },
  pendente: {
    label: "Pendente",
    color: "var(--blue)",
    bg: "var(--blue-bg)",
    border: "var(--blue-border)",
  },
  em_atendimento: {
    label: "Em Atendimento",
    color: "var(--amber)",
    bg: "var(--amber-bg)",
    border: "var(--amber-border)",
  },
  atendido: {
    label: "Atendido",
    color: "var(--green)",
    bg: "var(--green-bg)",
    border: "var(--green-border)",
  },
  cancelado: {
    label: "Cancelado",
    color: "var(--gray)",
    bg: "var(--gray-bg)",
    border: "var(--gray-border)",
  },
  disponivel: {
    label: "Disponível",
    color: "var(--green)",
    bg: "var(--green-bg)",
    border: "var(--green-border)",
  },
  em_uso: {
    label: "Em Uso",
    color: "var(--amber)",
    bg: "var(--amber-bg)",
    border: "var(--amber-border)",
  },
  indisponivel: {
    label: "Indisponível",
    color: "var(--gray)",
    bg: "var(--gray-bg)",
    border: "var(--gray-border)",
  },
  lotado: {
    label: "Lotado",
    color: "var(--red)",
    bg: "var(--red-bg)",
    border: "var(--red-border)",
  },
  inativo: {
    label: "Inativo",
    color: "var(--gray)",
    bg: "var(--gray-bg)",
    border: "var(--gray-border)",
  },
};

export const NEED_EMOJI = {
  resgate: "🚒",
  abrigo: "🏠",
  alimento: "🍱",
  medicamento: "💊",
  agua: "💧",
  outro: "📦",
};
export const OFFER_EMOJI = {
  transporte: "🚗",
  abrigo: "🏠",
  alimento: "🍱",
  medicamento: "💊",
  voluntariado: "👥",
  doacao: "📦",
  outro: "📍",
};
export const POINT_EMOJI = {
  abrigo: "🏠",
  distribuicao: "📦",
  saude: "🏥",
  resgate: "🚒",
  outro: "📍",
};
