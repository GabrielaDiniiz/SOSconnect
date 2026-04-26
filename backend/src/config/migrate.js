require("dotenv").config();
const pool = require("./db");

const schema = `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  CREATE TABLE IF NOT EXISTS alerts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    severity    VARCHAR(10) NOT NULL CHECK (severity IN ('baixo','medio','alto','critico')),
    location    VARCHAR(255) NOT NULL,
    reporter    VARCHAR(100),
    status      VARCHAR(15) NOT NULL DEFAULT 'ativo'
                  CHECK (status IN ('ativo','monitorando','resolvido')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS help_requests (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(100) NOT NULL,
    contact      VARCHAR(100) NOT NULL,
    location     VARCHAR(255) NOT NULL,
    need_type    VARCHAR(20) NOT NULL
                   CHECK (need_type IN ('resgate','abrigo','alimento','medicamento','agua','outro')),
    urgency      VARCHAR(10) NOT NULL DEFAULT 'media'
                   CHECK (urgency IN ('baixa','media','alta','critica')),
    people       INTEGER DEFAULT 1,
    description  TEXT NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'pendente'
                   CHECK (status IN ('pendente','em_atendimento','atendido','cancelado')),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS support_points (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(200) NOT NULL,
    type         VARCHAR(20) NOT NULL
                   CHECK (type IN ('abrigo','distribuicao','saude','resgate','outro')),
    location     VARCHAR(255) NOT NULL,
    contact      VARCHAR(100),
    capacity     INTEGER,
    occupancy    INTEGER DEFAULT 0,
    resources    TEXT[],
    status       VARCHAR(10) NOT NULL DEFAULT 'ativo'
                   CHECK (status IN ('ativo','lotado','inativo')),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS help_offers (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(100) NOT NULL,
    contact      VARCHAR(100) NOT NULL,
    location     VARCHAR(255) NOT NULL,
    offer_type   VARCHAR(20) NOT NULL
                   CHECK (offer_type IN ('transporte','abrigo','alimento','medicamento','voluntariado','doacao','outro')),
    description  TEXT NOT NULL,
    availability VARCHAR(100),
    status       VARCHAR(15) NOT NULL DEFAULT 'disponivel'
                   CHECK (status IN ('disponivel','em_uso','indisponivel')),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE OR REPLACE FUNCTION touch_updated_at()
  RETURNS TRIGGER LANGUAGE plpgsql AS $$
  BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
  $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_alerts_updated')
    THEN CREATE TRIGGER trg_alerts_updated BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION touch_updated_at(); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_requests_updated')
    THEN CREATE TRIGGER trg_requests_updated BEFORE UPDATE ON help_requests FOR EACH ROW EXECUTE FUNCTION touch_updated_at(); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_points_updated')
    THEN CREATE TRIGGER trg_points_updated BEFORE UPDATE ON support_points FOR EACH ROW EXECUTE FUNCTION touch_updated_at(); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_offers_updated')
    THEN CREATE TRIGGER trg_offers_updated BEFORE UPDATE ON help_offers FOR EACH ROW EXECUTE FUNCTION touch_updated_at(); END IF;
  END $$;

  CREATE INDEX IF NOT EXISTS idx_alerts_status   ON alerts(status);
  CREATE INDEX IF NOT EXISTS idx_requests_status ON help_requests(status);
  CREATE INDEX IF NOT EXISTS idx_requests_urgency ON help_requests(urgency);
  CREATE INDEX IF NOT EXISTS idx_points_type     ON support_points(type);
  CREATE INDEX IF NOT EXISTS idx_offers_status   ON help_offers(status);
`;

const seeds = `
  INSERT INTO alerts (title, description, severity, location, reporter, status) VALUES
    ('Alagamento Av. Paulista','Água acima de 1 metro. Trânsito bloqueado nos dois sentidos.','alto','Av. Paulista, 1000, São Paulo','Defesa Civil SP','ativo'),
    ('Risco de deslizamento','Encosta instável após 48h de chuva. Evacuação em curso.','critico','Morro do Alemão, Zona Norte','Bombeiros','ativo'),
    ('Rio transbordou','Nível 2,3m acima do normal. Bairros ribeirinhos em alerta máximo.','alto','Margem do Rio Tietê','INMET','monitorando')
  ON CONFLICT DO NOTHING;

  INSERT INTO support_points (name, type, location, contact, capacity, occupancy, resources, status) VALUES
    ('Ginásio Municipal Centro','abrigo','Rua das Flores, 100','(11) 3000-0001',300,127,ARRAY['alimentação','colchões','banheiros','médico'],'ativo'),
    ('Igreja São Francisco','abrigo','Praça Central, s/n','(11) 99000-0002',150,89,ARRAY['alimentação','roupas'],'ativo'),
    ('UBS Jardim América','saude','Av. da Saúde, 50','(11) 3000-0010',NULL,NULL,ARRAY['atendimento médico','medicamentos','primeiros socorros'],'ativo'),
    ('Posto de Distribuição Norte','distribuicao','Rua A, 200 - Bairro Norte','(11) 99000-0020',NULL,NULL,ARRAY['água','alimentos','roupas','cobertores'],'ativo')
  ON CONFLICT DO NOTHING;
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("🔄 Criando tabelas...");
    await client.query(schema);
    console.log("🌱 Inserindo dados iniciais...");
    await client.query(seeds);
    console.log("✅ Banco configurado com sucesso!");
  } catch (err) {
    console.error("❌ Erro:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
