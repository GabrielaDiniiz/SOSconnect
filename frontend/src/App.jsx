import { useState, useEffect, useCallback } from "react";
import "./index.css";
import {
  api,
  timeAgo,
  SEVERITY,
  STATUS,
  NEED_EMOJI,
  OFFER_EMOJI,
  POINT_EMOJI,
} from "./utils.js";
import {
  Badge,
  Modal,
  Field,
  Toasts,
  FilterBar,
  Empty,
  StatCard,
  Icon,
} from "./components.jsx";

// ════════════════════════════════════════════════════════════════
// TOAST HOOK
// ════════════════════════════════════════════════════════════════
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "ok") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return { toasts, toast: add };
}

// ════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════
// THEME HOOK
// ════════════════════════════════════════════════════════════════
function useTheme() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Ao carregar, verifica se há tema salvo ou a preferência do sistema
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initialTheme = savedTheme
      ? savedTheme
      : prefersDark
        ? "dark"
        : "light";

    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "dark" ? "light" : "dark";
      // Atualiza o HTML para o CSS aplicar as variáveis
      document.documentElement.setAttribute("data-theme", newTheme);
      // Salva no navegador para acessos futuros
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  }, []);

  return { theme, toggleTheme };
}

// DASHBOARD
// ════════════════════════════════════════════════════════════════
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const load = () =>
      api("/stats")
        .then((r) => setStats(r.data))
        .catch(() => {});
    load();
    api("/alerts?limit=4")
      .then((r) => setAlerts(r.data))
      .catch(() => {});
    api("/requests?urgency=critica&limit=4")
      .then((r) => setRequests(r.data))
      .catch(() => {});
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">SOS Connect</h1>
          <p className="page-sub">Monitoramento em tempo real</p>
        </div>
      </div>

      <div className="stats">
        <StatCard
          accent="var(--red)"
          num={stats?.alerts?.ativos}
          label="Alertas Ativos"
          sub={`${stats?.alerts?.criticos ?? 0} críticos`}
        />
        <StatCard
          accent="var(--orange)"
          num={stats?.requests?.pendentes}
          label="Pedidos Pendentes"
          sub={`${stats?.requests?.pessoas ?? 0} pessoas`}
        />
        <StatCard
          accent="var(--green)"
          num={stats?.points?.ativos}
          label="Pontos de Apoio"
          sub={
            stats?.points?.capacidade > 0
              ? `${stats.points.ocupacao}/${stats.points.capacidade} vagas`
              : "Sem limite"
          }
        />
        <StatCard
          accent="var(--blue)"
          num={stats?.offers?.disponiveis}
          label="Ofertas Disponíveis"
          sub={`${stats?.offers?.total ?? 0} total`}
        />
      </div>

      <div className="dash-cols">
        <div className="dash-section">
          <h3>⚠ Alertas recentes</h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {alerts.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                Nenhum alerta ativo.
              </p>
            ) : (
              alerts.map((a) => (
                <div key={a.id} className="card">
                  <div className="card-head">
                    <span className="card-title">{a.title}</span>
                    <Badge value={a.severity} map={SEVERITY} />
                  </div>
                  <div className="card-meta">
                    <span>
                      <Icon name="pin" size={12} /> {a.location}
                    </span>
                    <span>
                      <Icon name="clock" size={12} /> {timeAgo(a.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dash-section">
          <h3>🆘 Pedidos críticos</h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {requests.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                Nenhum pedido crítico.
              </p>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="card">
                  <div className="card-head">
                    <span className="card-title">
                      {NEED_EMOJI[r.need_type]} {r.name}
                    </span>
                    <Badge value={r.urgency} map={SEVERITY} />
                  </div>
                  <div className="card-meta">
                    <span>
                      <Icon name="pin" size={12} /> {r.location}
                    </span>
                    <span>
                      <Icon name="phone" size={12} /> {r.contact}
                    </span>
                    <span>
                      <Icon name="people" size={12} /> {r.people} pessoa(s)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ALERTS
// ════════════════════════════════════════════════════════════════
function Alerts({ toast }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api(`/alerts${filter ? `?status=${filter}` : ""}`);
      setItems(data);
    } catch (e) {
      toast(e.message, "err");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id, status) => {
    try {
      await api(`/alerts/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast("Status atualizado");
      load();
    } catch (e) {
      toast(e.message, "err");
    }
  };

  const remove = async (id) => {
    if (!confirm("Excluir este alerta?")) return;
    try {
      await api(`/alerts/${id}`, { method: "DELETE" });
      toast("Alerta excluído");
      load();
    } catch (e) {
      toast(e.message, "err");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    try {
      await api("/alerts", { method: "POST", body: JSON.stringify(body) });
      toast("Alerta registrado!");
      setOpen(false);
      e.target.reset();
      load();
    } catch (e) {
      toast(e.message, "err");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Alertas</h1>
          <p className="page-sub">Registre e monitore ocorrências</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          <Icon name="plus" size={15} /> Novo Alerta
        </button>
      </div>

      <FilterBar
        active={filter}
        onChange={setFilter}
        options={[
          { value: "", label: "Todos" },
          { value: "ativo", label: "Ativos" },
          { value: "monitorando", label: "Monitorando" },
          { value: "resolvido", label: "Resolvidos" },
        ]}
      />

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Carregando...</p>
      ) : (
        <div className="cards">
          {items.length === 0 ? (
            <Empty
              icon="⚠️"
              title="Nenhum alerta"
              desc="Registre o primeiro alerta acima."
            />
          ) : (
            items.map((a) => (
              <div key={a.id} className="card">
                <div className="card-head">
                  <span className="card-title">{a.title}</span>
                  <Badge value={a.severity} map={SEVERITY} />
                </div>
                <div className="card-meta">
                  <span>
                    <Icon name="pin" size={12} /> {a.location}
                  </span>
                  {a.reporter && (
                    <span>
                      <Icon name="people" size={12} /> {a.reporter}
                    </span>
                  )}
                  <span>
                    <Icon name="clock" size={12} /> {timeAgo(a.created_at)}
                  </span>
                </div>
                <p className="card-desc">{a.description}</p>
                <div className="card-foot">
                  <Badge value={a.status} />
                  {a.status !== "resolvido" && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setStatus(a.id, "monitorando")}
                    >
                      Monitorar
                    </button>
                  )}
                  {a.status !== "resolvido" && (
                    <button
                      className="btn btn-green btn-sm"
                      onClick={() => setStatus(a.id, "resolvido")}
                    >
                      Resolver
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: "var(--red)", marginLeft: "auto" }}
                    onClick={() => remove(a.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Novo Alerta">
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label="Título *" full>
              <input
                name="title"
                placeholder="Ex: Alagamento na Av. Central"
                required
              />
            </Field>
            <Field label="Severidade *">
              <select name="severity" required defaultValue="">
                <option value="" disabled>
                  Selecione...
                </option>
                <option value="baixo">🟢 Baixo</option>
                <option value="medio">🟡 Médio</option>
                <option value="alto">🟠 Alto</option>
                <option value="critico">🔴 Crítico</option>
              </select>
            </Field>
            <Field label="Responsável">
              <input name="reporter" placeholder="Nome ou órgão" />
            </Field>
            <Field label="Localização *" full>
              <input
                name="location"
                placeholder="Rua, bairro, cidade"
                required
              />
            </Field>
            <Field label="Descrição *" full>
              <textarea
                name="description"
                placeholder="Descreva a situação..."
                required
              />
            </Field>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Registrar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// HELP REQUESTS
// ════════════════════════════════════════════════════════════════
function HelpRequests({ toast }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api(
        `/requests${filter ? `?status=${filter}` : ""}`,
      );
      setItems(data);
    } catch (e) {
      toast(e.message, "err");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id, status) => {
    try {
      await api(`/requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast("Status atualizado");
      load();
    } catch (e) {
      toast(e.message, "err");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    body.people = Number(body.people) || 1;
    try {
      await api("/requests", { method: "POST", body: JSON.stringify(body) });
      toast("Pedido registrado! 💙");
      setOpen(false);
      e.target.reset();
      load();
    } catch (e) {
      toast(e.message, "err");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pedidos de Ajuda</h1>
          <p className="page-sub">Ordenados por urgência — críticos primeiro</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          <Icon name="plus" size={15} /> Pedir Ajuda
        </button>
      </div>

      <FilterBar
        active={filter}
        onChange={setFilter}
        options={[
          { value: "", label: "Todos" },
          { value: "pendente", label: "Pendentes" },
          { value: "em_atendimento", label: "Em Atendimento" },
          { value: "atendido", label: "Atendidos" },
        ]}
      />

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Carregando...</p>
      ) : (
        <div className="cards">
          {items.length === 0 ? (
            <Empty
              icon="🆘"
              title="Nenhum pedido"
              desc="Registre um pedido de ajuda acima."
            />
          ) : (
            items.map((r) => (
              <div key={r.id} className="card">
                <div className="card-head">
                  <span className="card-title">
                    {NEED_EMOJI[r.need_type]} {r.name}
                  </span>
                  <Badge value={r.urgency} map={SEVERITY} />
                </div>
                <div className="card-meta">
                  <span>
                    <Icon name="pin" size={12} /> {r.location}
                  </span>
                  <span>
                    <Icon name="phone" size={12} /> {r.contact}
                  </span>
                  <span>
                    <Icon name="people" size={12} /> {r.people} pessoa(s)
                  </span>
                  <span>
                    <Icon name="clock" size={12} /> {timeAgo(r.created_at)}
                  </span>
                </div>
                <p className="card-desc">{r.description}</p>
                <div className="card-foot">
                  <Badge value={r.status} />
                  {r.status === "pendente" && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setStatus(r.id, "em_atendimento")}
                    >
                      Atender
                    </button>
                  )}
                  {r.status === "em_atendimento" && (
                    <button
                      className="btn btn-green btn-sm"
                      onClick={() => setStatus(r.id, "atendido")}
                    >
                      Concluir
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Pedir Ajuda">
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label="Seu Nome *">
              <input name="name" required placeholder="Nome completo" />
            </Field>
            <Field label="Contato *">
              <input
                name="contact"
                required
                placeholder="WhatsApp / telefone"
              />
            </Field>
            <Field label="Tipo de Ajuda *">
              <select name="need_type" required defaultValue="">
                <option value="" disabled>
                  Selecione...
                </option>
                <option value="resgate">🚒 Resgate</option>
                <option value="abrigo">🏠 Abrigo</option>
                <option value="alimento">🍱 Alimento</option>
                <option value="medicamento">💊 Medicamento</option>
                <option value="agua">💧 Água</option>
                <option value="outro">📦 Outro</option>
              </select>
            </Field>
            <Field label="Urgência">
              <select name="urgency" defaultValue="media">
                <option value="baixa">🟢 Baixa</option>
                <option value="media">🟡 Média</option>
                <option value="alta">🟠 Alta</option>
                <option value="critica">🔴 Crítica</option>
              </select>
            </Field>
            <Field label="Localização *" full>
              <input
                name="location"
                required
                placeholder="Endereço com referência"
              />
            </Field>
            <Field label="Nº de Pessoas">
              <input type="number" name="people" min="1" defaultValue="1" />
            </Field>
            <Field label="Descrição *" full>
              <textarea
                name="description"
                required
                placeholder="Descreva sua situação..."
              />
            </Field>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Enviar Pedido
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SUPPORT POINTS
// ════════════════════════════════════════════════════════════════
function SupportPoints({ toast }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api(`/points${filter ? `?type=${filter}` : ""}`);
      setItems(data);
    } catch (e) {
      toast(e.message, "err");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    if (body.capacity) body.capacity = Number(body.capacity);
    try {
      await api("/points", { method: "POST", body: JSON.stringify(body) });
      toast("Ponto cadastrado!");
      setOpen(false);
      e.target.reset();
      load();
    } catch (e) {
      toast(e.message, "err");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pontos de Apoio</h1>
          <p className="page-sub">Abrigos, saúde, distribuição e resgate</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          <Icon name="plus" size={15} /> Cadastrar
        </button>
      </div>

      <FilterBar
        active={filter}
        onChange={setFilter}
        options={[
          { value: "", label: "Todos" },
          { value: "abrigo", label: "🏠 Abrigos" },
          { value: "distribuicao", label: "📦 Distribuição" },
          { value: "saude", label: "🏥 Saúde" },
          { value: "resgate", label: "🚒 Resgate" },
        ]}
      />

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Carregando...</p>
      ) : (
        <div className="cards">
          {items.length === 0 ? (
            <Empty
              icon="🏠"
              title="Nenhum ponto"
              desc="Cadastre um ponto de apoio acima."
            />
          ) : (
            items.map((p) => {
              const pct = p.capacity
                ? Math.min(100, Math.round((p.occupancy / p.capacity) * 100))
                : 0;
              const barColor =
                pct > 90
                  ? "var(--red)"
                  : pct > 60
                    ? "var(--amber)"
                    : "var(--green)";
              return (
                <div key={p.id} className="card">
                  <div className="card-head">
                    <span className="card-title">
                      {POINT_EMOJI[p.type]} {p.name}
                    </span>
                    <Badge value={p.status} />
                  </div>
                  <div className="card-meta">
                    <span>
                      <Icon name="pin" size={12} /> {p.location}
                    </span>
                    {p.contact && (
                      <span>
                        <Icon name="phone" size={12} /> {p.contact}
                      </span>
                    )}
                    {p.capacity && (
                      <span>
                        <Icon name="people" size={12} /> {p.occupancy}/
                        {p.capacity} vagas ({pct}%)
                      </span>
                    )}
                  </div>
                  {p.capacity > 0 && (
                    <div className="occ-bar">
                      <div
                        className="occ-fill"
                        style={{ width: `${pct}%`, background: barColor }}
                      />
                    </div>
                  )}
                  {p.resources?.length > 0 && (
                    <div className="tags">
                      {p.resources.map((r, i) => (
                        <span key={i} className="tag">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Ponto de Apoio">
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label="Nome *" full>
              <input name="name" required placeholder="Ex: Ginásio Municipal" />
            </Field>
            <Field label="Tipo *">
              <select name="type" required defaultValue="">
                <option value="" disabled>
                  Selecione...
                </option>
                <option value="abrigo">🏠 Abrigo</option>
                <option value="distribuicao">📦 Distribuição</option>
                <option value="saude">🏥 Saúde</option>
                <option value="resgate">🚒 Resgate</option>
                <option value="outro">📍 Outro</option>
              </select>
            </Field>
            <Field label="Capacidade">
              <input
                type="number"
                name="capacity"
                min="1"
                placeholder="Nº de vagas"
              />
            </Field>
            <Field label="Endereço *" full>
              <input name="location" required placeholder="Endereço completo" />
            </Field>
            <Field label="Contato">
              <input name="contact" placeholder="Telefone" />
            </Field>
            <Field label="Recursos (vírgula)">
              <input name="resources" placeholder="água, médico, roupas" />
            </Field>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Cadastrar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// HELP OFFERS
// ════════════════════════════════════════════════════════════════
function HelpOffers({ toast }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api(
        `/offers${filter ? `?offer_type=${filter}` : ""}`,
      );
      setItems(data);
    } catch (e) {
      toast(e.message, "err");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id, status) => {
    try {
      await api(`/offers/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast("Status atualizado");
      load();
    } catch (e) {
      toast(e.message, "err");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    try {
      await api("/offers", { method: "POST", body: JSON.stringify(body) });
      toast("Oferta registrada! Obrigado 💙");
      setOpen(false);
      e.target.reset();
      load();
    } catch (e) {
      toast(e.message, "err");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ofertas de Ajuda</h1>
          <p className="page-sub">Voluntários e recursos disponíveis</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          <Icon name="plus" size={15} /> Oferecer Ajuda
        </button>
      </div>

      <FilterBar
        active={filter}
        onChange={setFilter}
        options={[
          { value: "", label: "Todos" },
          { value: "transporte", label: "🚗 Transporte" },
          { value: "abrigo", label: "🏠 Abrigo" },
          { value: "alimento", label: "🍱 Alimento" },
          { value: "voluntariado", label: "👥 Voluntariado" },
        ]}
      />

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Carregando...</p>
      ) : (
        <div className="cards">
          {items.length === 0 ? (
            <Empty
              icon="🤝"
              title="Nenhuma oferta"
              desc="Seja o primeiro a oferecer ajuda."
            />
          ) : (
            items.map((o) => (
              <div key={o.id} className="card">
                <div className="card-head">
                  <span className="card-title">
                    {OFFER_EMOJI[o.offer_type]} {o.name}
                  </span>
                  <Badge value={o.status} />
                </div>
                <div className="card-meta">
                  <span>
                    <Icon name="pin" size={12} /> {o.location}
                  </span>
                  <span>
                    <Icon name="phone" size={12} /> {o.contact}
                  </span>
                  {o.availability && (
                    <span>
                      <Icon name="clock" size={12} /> {o.availability}
                    </span>
                  )}
                </div>
                <p className="card-desc">{o.description}</p>
                <div className="card-foot">
                  {o.status === "disponivel" && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setStatus(o.id, "em_uso")}
                    >
                      Usar
                    </button>
                  )}
                  {o.status === "em_uso" && (
                    <button
                      className="btn btn-green btn-sm"
                      onClick={() => setStatus(o.id, "disponivel")}
                    >
                      Liberar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Oferecer Ajuda">
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label="Seu Nome *">
              <input name="name" required placeholder="Nome" />
            </Field>
            <Field label="Contato *">
              <input
                name="contact"
                required
                placeholder="WhatsApp / telefone"
              />
            </Field>
            <Field label="Tipo *">
              <select name="offer_type" required defaultValue="">
                <option value="" disabled>
                  Selecione...
                </option>
                <option value="transporte">🚗 Transporte</option>
                <option value="abrigo">🏠 Abrigo</option>
                <option value="alimento">🍱 Alimento</option>
                <option value="medicamento">💊 Medicamento</option>
                <option value="voluntariado">👥 Voluntariado</option>
                <option value="doacao">📦 Doação</option>
                <option value="outro">📍 Outro</option>
              </select>
            </Field>
            <Field label="Disponibilidade">
              <input name="availability" placeholder="Ex: fins de semana" />
            </Field>
            <Field label="Localização *" full>
              <input name="location" required placeholder="Bairro / cidade" />
            </Field>
            <Field label="Descrição *" full>
              <textarea
                name="description"
                required
                placeholder="Como você pode ajudar?"
              />
            </Field>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Oferecer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "alerts", label: "Alertas", icon: "alert" },
  { id: "requests", label: "Pedidos de Ajuda", icon: "sos" },
  { id: "points", label: "Pontos de Apoio", icon: "shelter" },
  { id: "offers", label: "Ofertas de Ajuda", icon: "hand" },
];

const PAGES = {
  dashboard: Dashboard,
  alerts: Alerts,
  requests: HelpRequests,
  points: SupportPoints,
  offers: HelpOffers,
};

function Sidebar({ tab, onTab }) {
  return (
    <aside className="sidebar">
      <span className="nav-label">Menu</span>
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`nav-btn${tab === t.id ? " active" : ""}`}
          onClick={() => onTab(t.id)}
        >
          <Icon name={t.icon} size={17} className="nav-icon" />
          {t.label}
        </button>
      ))}
    </aside>
  );
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [drawer, setDrawer] = useState(false);
  const { toasts, toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const Page = PAGES[tab];
  const changeTab = (id) => {
    setTab(id);
    setDrawer(false);
  };

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button className="hamburger" onClick={() => setDrawer(true)}>
            <Icon name="menu" size={18} />
          </button>
          <span className="header-logo">
            SOS<span>connect</span>
          </span>
        </div>
        <div
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
        ></div>
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm"
          title="Alternar tema"
          style={{ fontSize: "1.2rem", padding: "0.25rem 0.5rem" }}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <div className="header-status">
          <div className="dot" /> SISTEMA ATIVO
        </div>
      </header>

      {/* Sidebar desktop */}
      <Sidebar tab={tab} onTab={changeTab} />

      {/* Mobile drawer */}
      <div className={`mobile-drawer${drawer ? " open" : ""}`}>
        <div className="drawer-overlay" onClick={() => setDrawer(false)} />
        <div className="drawer-panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <span className="header-logo" style={{ fontSize: "1.5rem" }}>
              SOS<span style={{ color: "var(--red)" }}>connect</span>
            </span>
            <button className="modal-close" onClick={() => setDrawer(false)}>
              ✕
            </button>
          </div>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`nav-btn${tab === t.id ? " active" : ""}`}
              onClick={() => changeTab(t.id)}
            >
              <Icon name={t.icon} size={17} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="main">
        <Page toast={toast} />
      </main>

      <Toasts items={toasts} />
    </div>
  );
}
