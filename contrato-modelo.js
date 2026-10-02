/* MODELO de Proposta e Contrato de Prestacao de Servicos Contabeis da CS (pdfmake).
   Fonte do texto: Propostas\contrato_cs.py (Mercantil do Visinho, 02/10/2026), que juntou o escopo
   detalhado da proposta com as clausulas do modelo de contrato da CS (dez/2025), ja corrigido
   (sem a Lei 9.494/97; DEFIS no Simples; aviso de 30 dias corridos; vigencia no aceite).
   O escopo muda pelo regime e pelas opcoes marcadas no painel. */

const PRESTADORES = {
  CS: {
    marca: 'CS ASSESSORIA CONTÁBIL', frase: 'Planejamento e Consultoria Tributária',
    razao: 'CS CONTABIL CONSULTORIA', cnpj: '33.089.139/0001-02',
    endereco: 'Rua Treze de Maio, nº 477, sala 1402, bairro Campina, Belém/PA',
    curto: 'CS Contabil Consultoria',
  },
};

const AZUL = '#1b2a4a', DOURADO = '#b8863b', CINZA = '#555555', FUNDO = '#F3F5F9', BORDA = '#D5DBE6';

/* ---------------- valor por extenso (reais) ---------------- */
function extensoReais(valor) {
  const U = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze',
    'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const D = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const C = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos',
    'oitocentos', 'novecentos'];
  const ate999 = n => {
    if (n === 100) return 'cem';
    const c = Math.floor(n / 100), r = n % 100, p = [];
    if (c) p.push(C[c]);
    if (r) p.push(r < 20 ? U[r] : D[Math.floor(r / 10)] + (r % 10 ? ' e ' + U[r % 10] : ''));
    return p.join(' e ');
  };
  const inteiro = Math.floor(valor + 1e-9), cent = Math.round((valor - inteiro) * 100);
  const mil = Math.floor(inteiro / 1000), resto = inteiro % 1000, partes = [];
  if (mil) partes.push(mil === 1 ? 'mil' : ate999(mil) + ' mil');
  if (resto) partes.push(ate999(resto));
  let txt = partes.length ? partes.join(resto && (resto < 100 || resto % 100 === 0) ? ' e ' : ' ') : '';
  if (inteiro) txt += inteiro === 1 ? ' real' : (inteiro % 1000000 === 0 ? ' de reais' : ' reais');
  if (cent) txt += (inteiro ? ' e ' : '') + ate999(cent) + (cent === 1 ? ' centavo' : ' centavos');
  return txt || 'zero real';
}
const reais = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function cpfCnpjFmt(c) {
  const d = String(c || '').replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return c || '';
}

/* ---------------- blocos de texto ---------------- */
// Texto com **negrito** -> array de trechos do pdfmake
function rt(t) {
  return String(t).split(/(\*\*[^*]+\*\*)/).filter(Boolean)
    .map(p => p.startsWith('**') ? { text: p.slice(2, -2), bold: true } : p);
}
const P = (t, extra = {}) => ({ text: rt(t), style: 'p', ...extra });
const H1 = t => ({ text: t, style: 'h1', headlineLevel: 1 });
const H2 = t => ({ text: t, style: 'h2', headlineLevel: 1 });
const LISTA = itens => ({ ul: itens.map(i => ({ text: rt(i), style: 'li' })), margin: [0, 0, 0, 6] });
function TAB(cab, linhas, larg) {
  const body = [];
  if (cab) body.push(cab.map(c => ({ text: c, bold: true, color: '#fff', fillColor: AZUL, fontSize: 9.5 })));
  linhas.forEach((l, i) => body.push(l.map((c, j) => ({ text: rt(c), fontSize: 9.5,
    fillColor: !cab && j === 0 ? FUNDO : (cab && i % 2 ? FUNDO : null), bold: !cab && j === 0 }))));
  return { table: { widths: larg, body, headerRows: cab ? 1 : 0, dontBreakRows: true },
    layout: { hLineColor: BORDA, vLineColor: BORDA, hLineWidth: () => 0.5, vLineWidth: () => 0.5,
      paddingLeft: () => 6, paddingRight: () => 6, paddingTop: () => 4, paddingBottom: () => 4 },
    margin: [0, 2, 0, 8] };
}
const CAIXA = (tit, txt) => ({ table: { widths: ['*'], body: [[{ stack: [{ text: tit, bold: true, color: AZUL }, { text: rt(txt) }],
  fillColor: FUNDO, margin: [6, 4, 6, 4] }]] },
  layout: { hLineWidth: () => 0, vLineWidth: i => i === 0 ? 3 : 0, vLineColor: () => DOURADO }, margin: [0, 4, 0, 8] });

/* ---------------- escopo pelo regime ---------------- */
function escopoFiscal(d) {
  const it = [];
  if (d.regime === 'Simples Nacional') {
    it.push('Apuração mensal do **Simples Nacional** (PGDAS-D) e emissão da guia DAS, com a **segregação das receitas** ' +
      'sujeitas à substituição tributária do ICMS e à tributação monofásica de PIS e COFINS, quando houver, o que evita ' +
      'pagar duas vezes o mesmo imposto dentro do DAS.');
    it.push('Entrega anual da **DEFIS** (Declaração de Informações Socioeconômicas e Fiscais do Simples Nacional).');
    it.push('Acompanhamento do **limite de faturamento** do Simples Nacional e do sublimite estadual, com aviso antecipado ' +
      'ao CONTRATANTE.');
  } else if (d.regime === 'MEI') {
    it.push('Emissão mensal do **DAS-MEI** e entrega anual da **DASN-SIMEI**.');
    it.push('Acompanhamento do limite de faturamento do MEI, com aviso antecipado para a mudança de enquadramento.');
  } else {
    it.push(`Apuração do **IRPJ e da CSLL** pelo **${d.regime}** e emissão das guias.`);
    it.push('Apuração mensal de **PIS e COFINS**, emissão das guias e entrega da **EFD-Contribuições**.');
    it.push('Apuração e transmissão da **DCTFWeb** e da **EFD-Reinf**.');
  }
  if (d.icmsSt) it.push('Conferência das notas fiscais de compra (arquivos XML) e do **ICMS por substituição tributária e ' +
    'antecipação** exigido pela SEFA-PA nas aquisições, com emissão das guias estaduais devidas.');
  it.push('Escrituração dos livros fiscais e entrega das **obrigações acessórias** estaduais e municipais aplicáveis à empresa.');
  if (d.transicaoMei) it.push('Providências decorrentes da **passagem de MEI para Microempresa**.');
  it.push('Monitoramento mensal da situação fiscal: **certidões negativas** federal, estadual, municipal, trabalhista e do ' +
    'FGTS, caixa postal do e-CAC e domicílio tributário eletrônico da SEFA-PA.');
  it.push('Orientação sobre emissão de notas fiscais, cadastro tributário de produtos e serviços e sobre a **Reforma ' +
    'Tributária** (IBS e CBS) durante o período de transição iniciado em 2026.');
  it.push('Atendimento a intimações e diligências rotineiras da Receita Federal, da SEFA-PA e da Prefeitura relacionadas ' +
    'aos serviços deste contrato.');
  return it;
}
function escopoContabil(d) {
  const it = ['**Escrituração contábil** mensal com base nos documentos fornecidos, com emissão dos livros Diário e Razão e ' +
    'balancetes.', 'Conciliação das contas de bancos, caixa, fornecedores e clientes.',
    'Elaboração do **Balanço Patrimonial** e da **Demonstração do Resultado do Exercício (DRE)** anuais.'];
  if (d.regime === 'Lucro Presumido' || d.regime === 'Lucro Real')
    it.push('Entrega da **ECD** (Escrituração Contábil Digital) e da **ECF** (Escrituração Contábil Fiscal).');
  it.push('Controle da **distribuição de lucros** aos sócios ou ao titular, com base contábil que comprova o lucro isento ' +
    'do Imposto de Renda.');
  it.push('Relatório gerencial com faturamento mensal, evolução das vendas e carga tributária do período.');
  it.push('Guarda e organização digital dos documentos contábeis e fiscais recebidos.');
  return it;
}
const ESCOPO_DP = ['Processamento da **folha de pagamento** mensal, recibos de salário e adiantamentos.',
  'Envio dos eventos ao **eSocial**, apuração e transmissão da **DCTFWeb** e emissão das guias de **INSS** e do **FGTS Digital**.',
  'Cálculo e documentação de **férias**, **13º salário** e afastamentos.',
  'Pró-labore ou retirada do titular, quando houver, com o respectivo recolhimento ao INSS.',
  'Controle de vencimentos de contrato de experiência e de férias, com aviso antecipado.',
  'Orientação sobre a legislação trabalhista e a convenção coletiva aplicável.'];

/* ---------------- documento ---------------- */
function montarContrato(d) {
  const pr = PRESTADORES[d.prestador || 'CS'];
  const hon = Number(d.honorario);
  const exemplo = reais(Math.round(hon * 1.0637 * 100) / 100);
  const c = [];

  // capa (padrao CS)
  c.push({ stack: [
    { text: pr.marca, fontSize: 21.6, bold: true, color: AZUL, alignment: 'center', margin: [0, 50, 0, 6] },
    { text: pr.frase, fontSize: 16.2, italics: true, color: CINZA, alignment: 'center' },
    { canvas: [{ type: 'rect', x: 0, y: 0, w: 488, h: 1.4, color: DOURADO }], margin: [0, 18, 0, 0] },
    { text: 'PROPOSTA E CONTRATO DE', fontSize: 20, bold: true, color: AZUL, alignment: 'center', margin: [0, 44, 0, 4] },
    { text: 'SERVIÇOS CONTÁBEIS', fontSize: 20, bold: true, color: DOURADO, alignment: 'center' },
    { text: d.dp ? 'Área Fiscal  ·  Área Contábil  ·  Departamento Pessoal' : 'Área Fiscal  ·  Área Contábil',
      fontSize: 11, alignment: 'center', margin: [0, 44, 0, 0] },
    { text: 'PROPOSTA APRESENTADA A', fontSize: 8, bold: true, color: '#777', alignment: 'center', margin: [0, 70, 0, 4] },
    { text: d.razao, fontSize: 13, bold: true, color: AZUL, alignment: 'center' },
    d.fantasia ? { text: `"${d.fantasia}"`, fontSize: 10, italics: true, color: CINZA, alignment: 'center', margin: [0, 2, 0, 0] } : '',
    { text: `CNPJ: ${cpfCnpjFmt(d.cnpj)}${d.cidade ? '  |  ' + d.cidade : ''}`, fontSize: 9, color: CINZA, alignment: 'center', margin: [0, 2, 0, 0] },
    { text: `Belém/PA, ${d.emissaoMes}`, fontSize: 9, color: '#777', alignment: 'center', margin: [0, 90, 0, 0] },
  ], pageBreak: 'after' });

  c.push(H1('Apresentação'));
  c.push(P(`A **CS Assessoria Contábil** apresenta ${d.fantasia ? 'ao **' + d.fantasia + '**' : 'à **' + d.razao + '**'} ` +
    'esta proposta, que reúne em um único documento o escopo dos serviços e as condições do contrato. Com o aceite, ela ' +
    'passa a valer como contrato de prestação de serviços entre as partes.'));
  c.push(P('O objetivo é que o empresário se dedique ao negócio enquanto o escritório garante que impostos, declarações e ' +
    'obrigações com empregados sejam cumpridos no prazo, pelo menor custo tributário que a lei permite e com a documentação ' +
    'organizada para qualquer fiscalização, banco ou financiamento.'));

  c.push(H1('Cláusula 1ª — Das partes'));
  c.push(P(`**${pr.razao}**, inscrita no CNPJ ${pr.cnpj}, com sede na ${pr.endereco}, doravante denominada **CONTRATADA**.`));
  const dados = [['CONTRATANTE', d.razao]];
  if (d.fantasia) dados.push(['Nome fantasia', d.fantasia]);
  dados.push(['CNPJ', cpfCnpjFmt(d.cnpj)]);
  if (d.natureza) dados.push(['Natureza e porte', d.natureza]);
  if (d.atividade) dados.push(['Atividade principal', d.atividade]);
  dados.push(['Regime tributário', d.regime]);
  if (d.endereco) dados.push(['Endereço', d.endereco]);
  dados.push(['Responsável', `${d.responsavel}${d.responsavelCpf ? ' · CPF ' + cpfCnpjFmt(d.responsavelCpf) : ''}`]);
  c.push(TAB(null, dados, [110, '*']));

  c.push(H1('Cláusula 2ª — Do objeto e do escopo dos serviços'));
  c.push(P('A CONTRATADA prestará, de forma contínua, os serviços abaixo, observadas a legislação federal, a do Estado do ' +
    'Pará e a do Município do estabelecimento, as Normas Brasileiras de Contabilidade e as normas do Conselho Regional de ' +
    'Contabilidade.'));
  let n = 1;
  c.push(H2(`2.${n++} Área Fiscal e Tributária`)); c.push(LISTA(escopoFiscal(d)));
  c.push(H2(`2.${n++} Área Contábil`)); c.push(LISTA(escopoContabil(d)));
  if (d.dp) { c.push(H2(`2.${n++} Departamento Pessoal e Recursos Humanos`)); c.push(LISTA(ESCOPO_DP)); }
  c.push(CAIXA('Atendimento', 'Atendimento por WhatsApp e presencial em horário comercial. Pedidos são registrados e ' +
    'acompanhados até a conclusão, com prazo informado ao CONTRATANTE.'));

  c.push(H1('Cláusula 3ª — Dos serviços extraordinários'));
  if (d.extras && d.extras.length) {
    c.push(P('Os serviços abaixo não fazem parte do honorário mensal e são cobrados à parte:'));
    c.push(TAB(['Serviço', 'Valor'], d.extras.map(e => [e.nome, reais(e.preco)]), ['*', 90]));
  }
  c.push(P('Outros serviços fora do escopo — consultoria especializada, pareceres técnicos, defesas e recursos em processos ' +
    'administrativos ou judiciais, perícias e análises gerenciais especiais — dependem de **solicitação do CONTRATANTE, ' +
    'orçamento prévio da CONTRATADA e aprovação por escrito** antes da execução, inclusive por WhatsApp ou e-mail.'));

  c.push({ stack: [H1('Cláusula 4ª — Dos honorários, do pagamento e do reajuste'),
    TAB(['Item', 'Condição'], [
      ['**Honorário mensal**', `**${reais(hon)}** (${extensoReais(hon)})`],
      ['Vencimento', `Dia **${d.dia}** de cada mês, referente aos serviços do mês anterior`],
      ['Forma de pagamento', 'Depósito, transferência bancária, PIX ou espécie'],
      ['Atraso', `Multa de ${d.multa}% e juros de ${d.juros}% ao mês, proporcionais aos dias de atraso`],
      ['Reajuste', 'Anual, em janeiro, no mesmo percentual de reajuste do **salário mínimo nacional**, sem necessidade de aditivo'],
    ], [110, '*'])], unbreakable: true });
  c.push(P(`Exemplo: se o salário mínimo for reajustado em 6,37%, o honorário de ${reais(hon)} passa a ${exemplo}. O valor ` +
    'foi dimensionado para o volume atual de documentos e de empregados; mudança relevante desse volume, de regime ' +
    'tributário ou de atividade permite a revisão do honorário de comum acordo.', { italics: false }));

  c.push(H1('Cláusula 5ª — Das obrigações da CONTRATADA'));
  c.push(LISTA([
    'Executar os serviços com competência técnica, pontualidade e ética, observando as normas do Conselho Regional de Contabilidade.',
    'Cumprir os prazos legais de entrega de declarações, guias e demonstrações, e entregar as guias de pagamento com ' +
    'antecedência mínima de 2 (dois) dias úteis do vencimento, desde que os documentos tenham sido recebidos no prazo.',
    'Manter o CONTRATANTE informado sobre obrigações, vencimentos e mudanças na legislação que o afetem.',
    'Manter organizados os documentos recebidos e os softwares e certificados do escritório atualizados.',
    'Representar o CONTRATANTE perante a Receita Federal, a SEFA-PA e a Prefeitura nos atos de rotina relacionados aos ' +
    'serviços deste contrato.']));

  c.push(H1('Cláusula 6ª — Das obrigações do CONTRATANTE'));
  const obr = ['Pagar os honorários nas datas e condições deste contrato.',
    'Enviar até o **dia 5 de cada mês** a movimentação do mês anterior: notas fiscais de compra e venda, extratos ' +
    'bancários, comprovantes de despesas e demais documentos.'];
  if (d.dp) obr.push('Informar até o **dia 25** faltas, horas extras, adiantamentos e demais ocorrências da folha do mês, e ' +
    'comunicar **admissões com 2 (dois) dias úteis de antecedência** do início do trabalho.');
  obr.push('Pagar as guias de tributos nos vencimentos.',
    'Comunicar de imediato qualquer mudança de endereço, atividade, sócios, representantes ou forma de operar.',
    'Manter válido o **certificado digital** da empresa e fornecer as procurações e acessos necessários aos portais dos ' +
    'órgãos públicos e aos sistemas da empresa.',
    'Responder pela veracidade e integridade dos documentos e informações fornecidos.');
  c.push(LISTA(obr));

  c.push(H1('Cláusula 7ª — Das responsabilidades'));
  c.push(P('7.1 A CONTRATADA responde por erros ou omissões decorrentes de negligência, imprudência ou imperícia na execução ' +
    'dos serviços, pela inobservância das normas contábeis e fiscais e pela divulgação indevida de informações do CONTRATANTE.'));
  c.push(P('7.2 A CONTRATADA não responde por multas, juros, penalidades ou prejuízos decorrentes de:'));
  c.push(LISTA(['documentos ou informações entregues fora do prazo, incompletos ou incorretos pelo CONTRATANTE;',
    'guias não pagas ou pagas com atraso pelo CONTRATANTE;', 'decisões comerciais ou administrativas tomadas pelo CONTRATANTE;',
    'falhas ou indisponibilidade de sistemas de órgãos públicos e de terceiros, caso fortuito ou força maior.']));

  c.push(H1('Cláusula 8ª — Do sigilo e da proteção de dados'));
  c.push(P('As partes manterão sigilo sobre todas as informações financeiras, contábeis, comerciais e pessoais a que tiverem ' +
    'acesso, inclusive após o término do contrato. O sigilo não se aplica às informações exigidas por lei, por ordem judicial ' +
    'ou por autoridade fiscal no exercício de suas funções. Os dados pessoais do CONTRATANTE, de seus sócios e empregados ' +
    'serão tratados somente para a execução deste contrato e o cumprimento de obrigações legais, nos termos da Lei nº ' +
    '13.709/2018 (LGPD).'));

  c.push(H1('Cláusula 9ª — Das despesas'));
  c.push(P('Correm por conta da CONTRATADA os softwares, a infraestrutura e os recursos necessários à execução dos serviços. ' +
    'Taxas e emolumentos de órgãos públicos (Junta Comercial, Prefeitura, cartórios), viagens solicitadas pelo CONTRATANTE e ' +
    'contratação de terceiros a seu pedido são pagos pelo CONTRATANTE, mediante autorização prévia.'));

  c.push(H1('Cláusula 10ª — Da vigência e da rescisão'));
  c.push(LISTA(['O contrato vigora por **prazo indeterminado**, a partir da data do aceite.',
    'Qualquer das partes pode encerrá-lo, sem multa, mediante aviso com **30 (trinta) dias** de antecedência, entregue ' +
    'pessoalmente, por e-mail, carta ou **WhatsApp**. No período do aviso os serviços e os honorários continuam devidos.',
    'No encerramento, a CONTRATADA entrega os documentos e arquivos do CONTRATANTE, presta as informações necessárias ao ' +
    'novo contador e conclui as obrigações do período em que prestou os serviços, em até 30 (trinta) dias.',
    'Atraso no pagamento superior a **60 (sessenta) dias** permite à CONTRATADA suspender os serviços ou encerrar o contrato ' +
    'mediante notificação, sem prejuízo da cobrança dos valores devidos.']));

  c.push(H1('Cláusula 11ª — Das disposições gerais'));
  c.push(LISTA(['Este documento substitui qualquer acordo anterior entre as partes sobre o mesmo objeto.',
    'Alterações serão feitas por escrito, inclusive por meio eletrônico, com o aceite das duas partes, ressalvado o reajuste ' +
    'anual previsto na Cláusula 4ª.', 'A tolerância com o descumprimento de qualquer cláusula não significa renúncia ao direito de exigi-la.',
    'A nulidade de uma cláusula não afeta as demais.',
    'As partes admitem a **assinatura eletrônica** deste documento, nos termos da Lei nº 14.063/2020.']));

  c.push(H1('Cláusula 12ª — Do foro'));
  c.push(P(`Fica eleito o foro da Comarca de ${d.foro} para resolver qualquer questão decorrente deste contrato, depois de ` +
    'esgotada a tentativa de solução amigável entre as partes.'));

  c.push(H1('Validade da proposta'));
  c.push(P('Esta proposta é válida por **15 (quinze) dias** a contar da data de emissão.'));

  if (d.eletronica) {
    c.push({ stack: [H1('Aceite'),
      P('O aceite é feito por **assinatura eletrônica do CONTRATANTE**. A data, a hora, o endereço IP, a identificação do ' +
        'documento e a assinatura ficam registrados na página final deste arquivo. Com o aceite, este documento passa a valer ' +
        'como contrato de prestação de serviços entre as partes.'),
      TAB(null, [['CONTRATADA', `${pr.curto} · CNPJ ${pr.cnpj}`], ['Emitida em', `Belém/PA, ${d.emissao}`],
        ['CONTRATANTE', `${d.razao} — ${d.responsavel}`]], [110, '*'])], unbreakable: true });
  } else {
    const linha = '_______________________________________';
    c.push({ stack: [H1('Aceite'),
      P('Estando de acordo, as partes assinam abaixo, e este documento passa a valer como contrato de prestação de serviços.'),
      P('Belém/PA, ______ de ______________________ de ______.', { margin: [0, 6, 0, 40] }),
      { columns: [
        { stack: [linha, { text: 'CONTRATANTE', bold: true }, d.razao, d.responsavel], alignment: 'center', fontSize: 9.5 },
        { stack: [linha, { text: 'CONTRATADA', bold: true }, pr.curto, 'CNPJ ' + pr.cnpj], alignment: 'center', fontSize: 9.5 },
      ], columnGap: 20 }], unbreakable: true });
  }

  return {
    pageSize: 'A4', pageMargins: [56, 52, 56, 52], content: prenderTitulos(c),
    // titulo nunca fica sozinho no pe da pagina
    info: { title: `Proposta e Contrato de Serviços Contábeis — ${d.fantasia || d.razao}`, author: pr.curto },
    defaultStyle: { fontSize: 10.5, lineHeight: 1.25, color: '#222' },
    styles: {
      h1: { fontSize: 14, bold: true, color: AZUL, margin: [0, 10, 0, 5] },
      h2: { fontSize: 11.5, bold: true, color: DOURADO, margin: [0, 6, 0, 3] },
      p: { alignment: 'justify', margin: [0, 0, 0, 5] },
      li: { alignment: 'justify', margin: [0, 0, 0, 2] },
    },
    header: (pag) => pag === 1 ? null : {
      margin: [56, 22, 56, 0], stack: [
        { columns: [{ text: pr.marca, bold: true, fontSize: 8, color: AZUL },
          { text: 'Proposta e Contrato de Serviços Contábeis', fontSize: 8, color: CINZA, alignment: 'right' }] },
        { canvas: [{ type: 'rect', x: 0, y: 3, w: 483, h: 0.8, color: DOURADO }] }] },
    footer: (pag, tot) => pag === 1 ? null : {
      margin: [56, 14, 56, 0], columns: [
        { text: `${d.fantasia || d.razao} · CNPJ ${cpfCnpjFmt(d.cnpj)}`, fontSize: 8, color: CINZA },
        { text: `página ${pag - 1} de ${tot - 1}`, fontSize: 8, color: CINZA, alignment: 'right' }] },
  };
}

// Titulo nunca fica sozinho no pe da pagina: vai junto com o trecho seguinte
// (paragrafo, tabela ou lista curta). Lista longa pode quebrar, entao o titulo segue com ela.
function prenderTitulos(c) {
  const out = [];
  for (let i = 0; i < c.length; i++) {
    const at = c[i], prox = c[i + 1];
    const curto = prox && (!prox.ul || prox.ul.length <= 4) && !prox.pageBreak;
    if (at && at.headlineLevel === 1 && curto) { out.push({ stack: [at, prox], unbreakable: true }); i++; }
    else if (at && at.headlineLevel === 1 && prox && prox.ul) {
      // lista longa: o titulo leva o primeiro item; o resto da lista continua normalmente
      out.push({ stack: [at, { ul: prox.ul.slice(0, 1), margin: [0, 0, 0, 0] }], unbreakable: true });
      out.push({ ...prox, ul: prox.ul.slice(1) }); i++;
    } else out.push(at);
  }
  return out;
}

function gerarContratoBytes(d) {
  return new Promise((ok, falha) => {
    try { pdfMake.createPdf(montarContrato(d)).getBuffer(b => ok(new Uint8Array(b))); } catch (e) { falha(e); }
  });
}
