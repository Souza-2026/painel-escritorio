// GERADO por scripts/gerar_interpretador_web.mjs -- nao editar aqui.
// Le a mensagem que o Gary dita ao robo e separa cliente, pedido, prazo e quem
// resolve. Sem IA na v1: as frases seguem um formato combinado (06/10/2026):
//
//     clint quer ferias da olaild para dia 10/10 cleusa
//     ^^^^^ cliente no COMECO                    ^^^^^^ quem resolve
//
// Funcao pura, sem banco e sem rede, para poder ser testada fora do Supabase
// (`node teste_interpretar.ts`).

                                                                       
                                                                      

                            
                          
                                                                                  
                       
                             
                                     
                    
  

/** minusculas, sem acento, sem pontuacao, espacos simples. */
export function normalizar(s        )         {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9/ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Palavras que nao identificam ninguem: "JD RICARDO COM. E SERV. AUTOMOTIVOS
// LTDA" tem de ser achado por "jd ricardo", nao por "ltda".
const GENERICAS = new Set([
  "ltda", "me", "epp", "eireli", "com", "comercio", "serv", "servicos", "de",
  "da", "do", "e", "frios", "representacoes", "automotivos", "carnes",
]);

function chavesDoCliente(c         )           {
  const nome = normalizar(c.nome.replace(/\(.*?\)/g, " "));
  const util = nome.split(" ").filter((p) => !GENERICAS.has(p)).join(" ");
  return [...new Set([nome, util, ...c.apelidos.map(normalizar)])].filter(Boolean);
}

function distancia(a        , b        )         {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return d[a.length][b.length];
}

/** Cliente pelo COMECO da frase; devolve quantas palavras ele ocupou. */
function acharCliente(palavras          , clientes           ) {
  let melhor                                   = null;
  for (const c of clientes) {
    for (const k of chavesDoCliente(c)) {
      const kp = k.split(" ");
      if (kp.length > palavras.length) continue;
      if (kp.every((p, i) => p === palavras[i]) && (!melhor || kp.length > melhor.n)) {
        melhor = { c, n: kp.length };
      }
    }
  }
  if (melhor) return { cliente: melhor.c, palavras: melhor.n, sugestoes: []              };

  // Erro de ditado ("klint", "santa fé" virando "santafe"): tolera 1 letra em
  // chave curta e 2 em chave longa, mas so aceita se UM cliente ficar perto.
  const notas                                         = [];
  for (const c of clientes) {
    let m                                  = null;
    for (const k of chavesDoCliente(c)) {
      const n = k.split(" ").length;
      const trecho = palavras.slice(0, n).join(" ");
      const dd = distancia(trecho, k);
      if (!m || dd < m.d) m = { d: dd, n };
    }
    if (m) notas.push({ c, ...m });
  }
  notas.sort((a, b) => a.d - b.d);
  const tolerancia = (palavras[0] ?? "").length <= 4 ? 1 : 2;
  const perto = notas.filter((x) => x.d <= tolerancia);
  if (perto.length === 1) return { cliente: perto[0].c, palavras: perto[0].n, sugestoes: [] };
  return { cliente: null, palavras: 0, sugestoes: notas.slice(0, 5).map((x) => x.c) };
}

const SEMANA = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

function iso(d      )         {
  return d.toISOString().slice(0, 10);
}

/** Prazo: 10/10, 10/10/2026, dia 15, hoje, amanha, sexta. `hoje` e AAAA-MM-DD. */
export function acharPrazo(texto        , hoje        )                {
  const base = new Date(hoje + "T12:00:00Z");
  const t = normalizar(texto);

  const dm = t.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (dm) {
    const dia = +dm[1], mes = +dm[2];
    let ano = dm[3] ? +dm[3] : base.getUTCFullYear();
    if (ano < 100) ano += 2000;
    if (dia < 1 || dia > 31 || mes < 1 || mes > 12) return null;
    let d = new Date(Date.UTC(ano, mes - 1, dia, 12));
    // "05/01" ditado em dezembro e janeiro que vem, nao o que passou.
    if (!dm[3] && d.getTime() < base.getTime() - 60 * 86400e3) {
      d = new Date(Date.UTC(ano + 1, mes - 1, dia, 12));
    }
    return iso(d);
  }

  const diaN = t.match(/\bdia (\d{1,2})\b/);
  if (diaN) {
    const dia = +diaN[1];
    if (dia < 1 || dia > 31) return null;
    let d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), dia, 12));
    if (d.getTime() < base.getTime()) {
      d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, dia, 12));
    }
    return iso(d);
  }

  if (/\bhoje\b/.test(t)) return hoje;
  if (/\bamanha\b/.test(t)) return iso(new Date(base.getTime() + 86400e3));

  for (let i = 0; i < 7; i++) {
    // "segunda via do DAS" nao e segunda-feira
    if (new RegExp(`\\b${SEMANA[i]}( feira)?\\b(?! via\\b)`).test(t)) {
      const falta = ((i - base.getUTCDay()) + 7) % 7 || 7;
      return iso(new Date(base.getTime() + falta * 86400e3));
    }
  }
  return null;
}

/**
 * Quem resolve. Nome da equipe em qualquer ponto ("cleusa", "admir"), MENOS
 * "eu", que so vale como ultima palavra: "quer que eu mande o DAS" nao e o
 * Gary se atribuindo a tarefa.
 */
function acharResponsavel(palavras          , equipe          ) {
  const ultima = palavras.length - 1;
  for (let i = ultima; i >= 0; i--) {
    for (const m of equipe) {
      for (const a of m.apelidos.map(normalizar)) {
        if (a === "eu" && i !== ultima) continue;
        if (palavras[i] === a) return { membro: m, indice: i };
      }
    }
  }
  return null;
}

export function interpretar(
  mensagem        ,
  clientes           ,
  equipe          ,
  hoje        ,
)               {
  // Palavras ORIGINAIS (com acento) e normalizadas andam juntas, para a
  // descricao guardar o que o Gary escreveu.
  const originais = mensagem.trim().split(/\s+/).filter(Boolean);
  const norm = originais.map(normalizar);

  const c = acharCliente(norm, clientes);
  let resto = originais.slice(c.palavras);
  let restoNorm = norm.slice(c.palavras);

  const r = acharResponsavel(restoNorm, equipe);
  if (r) {
    resto = resto.filter((_, i) => i !== r.indice);
    restoNorm = restoNorm.filter((_, i) => i !== r.indice);
    // "... para cleusa" -> tira o "para" que sobrou no fim
    if (r.indice === restoNorm.length && /^(para|pra|pro|com)$/.test(restoNorm.at(-1) ?? "")) {
      resto = resto.slice(0, -1);
    }
  }

  let descricao = resto.join(" ").replace(/^[,.;:\-–\s]+|[,.;:\-–\s]+$/g, "");
  if (descricao) descricao = descricao[0].toUpperCase() + descricao.slice(1);

  return {
    cliente: c.cliente,
    sugestoes: c.sugestoes,
    responsavel: r?.membro ?? null,
    prazo: acharPrazo(descricao, hoje),
    descricao: descricao || mensagem.trim(),
  };
}
