/* MODELO do Contrato de Licenca de Uso do sistema Gestao e Controle (G-Tech), pdfmake.
   Marca G-Tech (produto de software) -- nunca CS. Cores das propostas G-Tech
   (gerar_pdfs.py da Gas Moraes): marrom escuro + laranja.
   Decisoes do Gary (06/10/2026): contratada = empresa da G-Tech (CNPJ); 5 dias de
   tolerancia antes do bloqueio; sem fidelidade; 3 dispositivos inclusos, +20% por
   adicional (licenca-por-maquina, 29/09), contagem de celular/tablet fica para aditivo.
   Reaproveita de contrato-modelo.js: rt, extensoReais, reais, cpfCnpjFmt, prenderTitulos. */

// Pedido do Gary (06/10/2026): so a razao social. CNPJ e endereco, quando
// existirem, entram aqui e saem na Clausula 1a; na ASSINATURA vai so o nome.
const GTECH = {
  marca: 'G-TECH', frase: 'Tecnologia para o seu negócio',
  razao: 'G-TECH TECNOLOGIA LTDA', cnpj: '', endereco: '',
  curto: 'G-Tech',
};
const gtechCompleta = () => !!GTECH.razao;

const GT_ESC = '#2B2420', GT_LAR = '#C2680F', GT_CINZA = '#5F6368', GT_CLARO = '#F6EFE7', GT_LINHA = '#E2D6C8';

const gP = (t, extra = {}) => ({ text: rt(t), style: 'p', ...extra });
const gH1 = t => ({ text: t, style: 'h1', headlineLevel: 1 });
const gLISTA = itens => ({ ul: itens.map(i => ({ text: rt(i), style: 'li' })), margin: [0, 0, 0, 6] });
function gTAB(cab, linhas, larg) {
  const body = [];
  if (cab) body.push(cab.map(c => ({ text: c, bold: true, color: '#fff', fillColor: GT_ESC, fontSize: 9.5 })));
  linhas.forEach((l, i) => body.push(l.map((c, j) => ({ text: rt(c), fontSize: 9.5,
    fillColor: !cab && j === 0 ? GT_CLARO : (cab && i % 2 ? GT_CLARO : null), bold: !cab && j === 0 }))));
  return { table: { widths: larg, body, headerRows: cab ? 1 : 0, dontBreakRows: true },
    layout: { hLineColor: GT_LINHA, vLineColor: GT_LINHA, hLineWidth: () => 0.5, vLineWidth: () => 0.5,
      paddingLeft: () => 6, paddingRight: () => 6, paddingTop: () => 4, paddingBottom: () => 4 },
    margin: [0, 2, 0, 8] };
}
const gCAIXA = (tit, txt) => ({ table: { widths: ['*'], body: [[{ stack: [{ text: tit, bold: true, color: GT_ESC }, { text: rt(txt) }],
  fillColor: GT_CLARO, margin: [6, 4, 6, 4] }]] },
  layout: { hLineWidth: () => 0, vLineWidth: i => i === 0 ? 3 : 0, vLineColor: () => GT_LAR }, margin: [0, 4, 0, 8] });

// O que o sistema faz, por segmento. So o que existe hoje no Gestao e Controle.
const MODULOS = {
  comercio: ['Frente de caixa com emissão de **NFC-e**, inclusive em contingência quando a internet cai.',
    'Emissão de **NF-e** (modelo 55).', 'Cadastro de produtos com a tributação atual e a da **Reforma Tributária** (IBS e CBS).',
    'Entrada de mercadorias pelo **XML da nota do fornecedor** e controle de estoque.',
    'Caixa do dia, contas a pagar e a receber e fluxo de caixa.', 'Relatórios de vendas, margem, curva ABC e vendas x compras.'],
  oficina: ['**Ordens de serviço** com orçamento, peças, mão de obra e acompanhamento do veículo.',
    'Emissão de **NFS-e** (Prefeitura de Belém) e de **NF-e** das peças.',
    'Cadastro de clientes e veículos, com histórico por placa.', 'Contas a receber, caixa e relatórios de faturamento.'],
  clinica: ['**Agenda** de atendimentos por profissional, com recepção e prontuário.',
    'Emissão de **NFS-e** (Prefeitura de Belém).', 'Recebimentos por convênio e particular.',
    'Relatórios de produção por profissional, convênios e procedimentos.'],
};
const SEGMENTOS = { comercio: 'Comércio', oficina: 'Oficina mecânica', clinica: 'Clínica / consultório' };

function montarContratoSistema(d) {
  const pr = GTECH;
  const mensal = Number(d.mensalidade), anual = Number(d.anual || 0);
  const pct = Number(d.pctAdicional);
  const c = [];

  // capa
  c.push({ stack: [
    { text: pr.marca, fontSize: 26, bold: true, color: GT_ESC, alignment: 'center', margin: [0, 50, 0, 6] },
    { text: pr.frase, fontSize: 14, italics: true, color: GT_CINZA, alignment: 'center' },
    { canvas: [{ type: 'rect', x: 0, y: 0, w: 488, h: 1.6, color: GT_LAR }], margin: [0, 18, 0, 0] },
    { text: 'CONTRATO DE LICENÇA DE USO', fontSize: 20, bold: true, color: GT_ESC, alignment: 'center', margin: [0, 44, 0, 4] },
    { text: 'SISTEMA GESTÃO E CONTROLE', fontSize: 20, bold: true, color: GT_LAR, alignment: 'center' },
    { text: `Segmento: ${SEGMENTOS[d.segmento]}`, fontSize: 11, alignment: 'center', margin: [0, 40, 0, 0] },
    { text: 'CONTRATANTE', fontSize: 8, bold: true, color: '#777', alignment: 'center', margin: [0, 70, 0, 4] },
    { text: d.razao, fontSize: 13, bold: true, color: GT_ESC, alignment: 'center' },
    d.fantasia ? { text: `"${d.fantasia}"`, fontSize: 10, italics: true, color: GT_CINZA, alignment: 'center', margin: [0, 2, 0, 0] } : '',
    { text: `CNPJ: ${cpfCnpjFmt(d.cnpj)}${d.cidade ? '  |  ' + d.cidade : ''}`, fontSize: 9, color: GT_CINZA, alignment: 'center', margin: [0, 2, 0, 0] },
    { text: `Belém/PA, ${d.emissaoMes}`, fontSize: 9, color: '#777', alignment: 'center', margin: [0, 90, 0, 0] },
  ], pageBreak: 'after' });

  c.push(gH1('Cláusula 1ª — Das partes'));
  c.push(gP(`**${pr.razao}**${pr.cnpj ? `, inscrita no CNPJ ${pr.cnpj}` : ''}${pr.endereco ? `, com sede na ${pr.endereco}` : ''}, desenvolvedora do sistema ` +
    '**Gestão e Controle**, doravante denominada **CONTRATADA**.'));
  const dados = [['CONTRATANTE', d.razao]];
  if (d.fantasia) dados.push(['Nome fantasia', d.fantasia]);
  dados.push(['CNPJ', cpfCnpjFmt(d.cnpj)]);
  if (d.endereco) dados.push(['Endereço', d.endereco]);
  dados.push(['Responsável', `${d.responsavel}${d.responsavelCpf ? ' · CPF ' + cpfCnpjFmt(d.responsavelCpf) : ''}`]);
  c.push(gTAB(null, dados, [110, '*']));

  c.push(gH1('Cláusula 2ª — Do objeto'));
  c.push(gP('2.1 A CONTRATADA concede ao CONTRATANTE **licença de uso**, não exclusiva e intransferível, do sistema ' +
    '**Gestão e Controle**, na forma de assinatura: o sistema funciona em nuvem, com hospedagem, atualizações e suporte ' +
    'incluídos na mensalidade.'));
  c.push(gP(`2.2 Para o segmento **${SEGMENTOS[d.segmento]}**, a licença compreende:`));
  c.push(gLISTA(MODULOS[d.segmento]));
  c.push(gP('2.3 Novas funções criadas pela CONTRATADA para o segmento entram na licença sem custo. Módulos vendidos à ' +
    'parte (por exemplo, a TV de preços) só fazem parte deste contrato quando contratados por escrito.'));

  c.push(gH1('Cláusula 3ª — Dos dispositivos'));
  c.push(gP(`3.1 A licença permite o uso do sistema em até **${d.maquinas} (${extensoNum(d.maquinas)}) dispositivos** ` +
    'do CONTRATANTE ao mesmo tempo, com quantos usuários forem necessários.'));
  c.push(gP(`3.2 Cada dispositivo acima desse número acrescenta **${pct}%** à mensalidade base. Exemplo: com ` +
    `${d.maquinas + 1} dispositivos, a mensalidade de ${reais(mensal)} passa a ${reais(mensal * (1 + pct / 100))}.`));
  c.push(gP('3.3 O sistema registra os dispositivos em uso, e o CONTRATANTE pode pedir a qualquer momento a lista e a ' +
    'desativação de um dispositivo que não usa mais. A forma de contar celulares e tablets poderá ser definida em aditivo.'));

  if (d.implantacao) {
    c.push(gH1('Cláusula 4ª — Da implantação'));
    c.push(gP(`A CONTRATADA fará a **implantação assistida**, por **${reais(d.valorImplantacao)}** ` +
      `(${extensoReais(Number(d.valorImplantacao))}), pagos uma única vez, compreendendo:`));
    c.push(gLISTA(['instalação do sistema nos dispositivos do CONTRATANTE e configuração inicial da empresa;',
      'cadastro inicial de produtos, serviços e clientes, ou importação dos dados do sistema anterior quando ' +
      'tecnicamente possível;', 'configuração da emissão de notas fiscais com o certificado digital do CONTRATANTE;',
      'treinamento dos usuários indicados pelo CONTRATANTE.']));
  }
  const n = d.implantacao ? 5 : 4; // numeracao das clausulas seguintes
  const cl = k => `Cláusula ${n + k}ª`;

  const linhasPreco = [];
  if (d.plano === 'anual') {
    linhasPreco.push(['**Plano**', `**Anual — ${reais(anual)}** (${extensoReais(anual)}), pago à vista, por 12 meses de uso`]);
    linhasPreco.push(['Renovação', 'A cada 12 meses, pelo valor anual vigente']);
  } else {
    linhasPreco.push(['**Mensalidade**', `**${reais(mensal)}** (${extensoReais(mensal)})`]);
    linhasPreco.push(['Vencimento', `Dia **${d.dia}** de cada mês`]);
  }
  linhasPreco.push(['Forma de pagamento', 'PIX, transferência ou depósito bancário']);
  linhasPreco.push(['Atraso', `Multa de ${d.multa}% e juros de ${d.juros}% ao mês, proporcionais aos dias de atraso`]);
  linhasPreco.push(['Reajuste', 'Anual, em janeiro, pela variação do **IPCA** dos 12 meses anteriores, sem necessidade de aditivo']);
  c.push({ stack: [gH1(`${cl(0)} — Do preço e do pagamento`), gTAB(['Item', 'Condição'], linhasPreco, [110, '*'])], unbreakable: true });

  c.push(gH1(`${cl(1)} — Do atraso e da suspensão do acesso`));
  c.push(gLISTA([
    'O sistema avisa o CONTRATANTE, na própria tela, da mensalidade vencida.',
    `Passados **${d.tolerancia} (${extensoNum(d.tolerancia)}) dias** do vencimento sem pagamento, o acesso pode ser suspenso ` +
    'até a regularização.',
    '**A suspensão não apaga nenhum dado.** O acesso volta em até 1 (um) dia útil depois de confirmado o pagamento.',
    'Se houver notas fiscais emitidas em contingência ainda não transmitidas, a CONTRATADA libera, a pedido do ' +
    'CONTRATANTE, o acesso necessário para transmiti-las, para não deixá-lo em falta com o fisco.']));

  c.push(gH1(`${cl(2)} — Do suporte e das atualizações`));
  c.push(gLISTA([
    'Suporte por **WhatsApp** e acesso remoto, em horário comercial, prestado por quem desenvolve o sistema.',
    'Atualizações automáticas, sem custo, inclusive as exigidas por mudança de leiaute da SEFAZ, da Prefeitura ou da ' +
    'Reforma Tributária.',
    'Manutenções programadas que interrompam o uso serão avisadas com antecedência e feitas, sempre que possível, fora ' +
    'do horário comercial.']));
  c.push(gCAIXA('Disponibilidade', 'A CONTRATADA emprega os meios razoáveis para manter o sistema disponível, mas não ' +
    'garante funcionamento ininterrupto: o sistema depende de internet, de servidores de terceiros e dos sistemas da ' +
    'SEFAZ e da Prefeitura. Para a queda de internet no balcão, a NFC-e tem emissão em contingência.'));

  c.push(gH1(`${cl(3)} — Das obrigações do CONTRATANTE`));
  c.push(gLISTA([
    'Pagar a mensalidade nas datas e condições deste contrato.',
    'Manter internet e computadores compatíveis com o sistema (Windows 10 ou superior).',
    'Manter válido o **certificado digital A1** da empresa e os códigos exigidos pela SEFAZ para a emissão de notas.',
    'Responder pelos dados cadastrados, em especial a **tributação dos produtos e serviços** (NCM, CFOP, CST, alíquotas), ' +
    'que deve ser conferida pelo seu contador.',
    'Guardar as senhas, não compartilhar o acesso com pessoas de fora da empresa e avisar de imediato qualquer uso indevido.',
    'Não copiar, alterar, descompilar ou ceder o sistema a terceiros.']));

  c.push(gH1(`${cl(4)} — Das responsabilidades`));
  c.push(gP(`${n + 4}.1 A CONTRATADA responde pelo funcionamento do sistema conforme este contrato e corrige, sem custo, ` +
    'os defeitos que forem encontrados.'));
  c.push(gP(`${n + 4}.2 A CONTRATADA não responde por multas, impostos ou prejuízos decorrentes de:`));
  c.push(gLISTA(['tributação, preços ou dados cadastrados pelo CONTRATANTE ou por quem ele indicar;',
    'indisponibilidade da internet do CONTRATANTE ou dos sistemas da SEFAZ, da Prefeitura e de outros órgãos;',
    'uso do sistema em desacordo com as orientações da CONTRATADA;', 'caso fortuito ou força maior.']));
  c.push(gP(`${n + 4}.3 Em qualquer caso, a responsabilidade da CONTRATADA fica limitada ao total pago pelo CONTRATANTE ` +
    'nos 12 (doze) meses anteriores ao fato.'));

  c.push(gH1(`${cl(5)} — Dos dados e da proteção de dados`));
  c.push(gLISTA([
    '**Os dados lançados no sistema pertencem ao CONTRATANTE.** A CONTRATADA trata esses dados somente para prestar o ' +
    'serviço, como operadora, nos termos da Lei nº 13.709/2018 (LGPD).',
    'Os dados ficam em servidores de nuvem contratados pela CONTRATADA, com acesso restrito por usuário e senha e ' +
    'separados por empresa.',
    'O certificado digital do CONTRATANTE é usado somente para assinar os documentos fiscais da própria empresa.',
    'As partes mantêm sigilo sobre as informações a que tiverem acesso, inclusive após o fim do contrato.']));

  c.push(gH1(`${cl(6)} — Da propriedade do sistema`));
  c.push(gP('O sistema Gestão e Controle, seu código, telas e marca pertencem à CONTRATADA. Este contrato concede apenas o ' +
    'direito de uso durante a sua vigência e não transfere a propriedade do software.'));

  c.push(gH1(`${cl(7)} — Da vigência e do cancelamento`));
  const resc = ['O contrato vigora por **prazo indeterminado**, a partir do aceite, **sem prazo mínimo de permanência**.',
    'Qualquer das partes pode encerrá-lo, sem multa, com aviso de **30 (trinta) dias**, por escrito, e-mail ou WhatsApp. ' +
    'No período do aviso, o sistema e a mensalidade continuam.'];
  if (d.plano === 'anual') resc.push('No plano anual, o cancelamento vale ao fim do período já pago, **sem devolução** ' +
    'proporcional.');
  resc.push('No encerramento, a CONTRATADA entrega ao CONTRATANTE, em até 30 (trinta) dias, os **XML das notas fiscais** ' +
    'e a exportação dos cadastros. A guarda dos documentos fiscais pelo prazo legal é obrigação do CONTRATANTE.');
  c.push(gLISTA(resc));

  c.push(gH1(`${cl(8)} — Das disposições gerais`));
  c.push(gLISTA(['Este documento substitui qualquer acordo anterior entre as partes sobre o mesmo objeto.',
    'Alterações serão feitas por escrito, inclusive por meio eletrônico, ressalvado o reajuste anual.',
    'A tolerância com o descumprimento de qualquer cláusula não significa renúncia ao direito de exigi-la.',
    'As partes admitem a **assinatura eletrônica** deste documento, nos termos da Lei nº 14.063/2020.']));

  c.push(gH1(`${cl(9)} — Do foro`));
  c.push(gP(`Fica eleito o foro da Comarca de ${d.foro} para resolver qualquer questão decorrente deste contrato, depois de ` +
    'esgotada a tentativa de solução amigável.'));

  if (d.eletronica) {
    c.push({ stack: [gH1('Aceite'),
      gP('O aceite é feito por **assinatura eletrônica do CONTRATANTE**. A data, a hora, o endereço IP, a identificação do ' +
        'documento e a assinatura ficam registrados na página final deste arquivo.'),
      gTAB(null, [['CONTRATADA', pr.razao], ['Emitido em', `Belém/PA, ${d.emissao}`],
        ['CONTRATANTE', `${d.razao} — ${d.responsavel}`]], [110, '*'])], unbreakable: true });
  } else {
    const linha = '_______________________________________';
    c.push({ stack: [gH1('Aceite'),
      gP('Estando de acordo, as partes assinam abaixo.'),
      gP('Belém/PA, ______ de ______________________ de ______.', { margin: [0, 6, 0, 40] }),
      { columns: [
        { stack: [linha, { text: 'CONTRATANTE', bold: true }, d.razao, d.responsavel], alignment: 'center', fontSize: 9.5 },
        { stack: [linha, { text: 'CONTRATADA', bold: true }, pr.razao], alignment: 'center', fontSize: 9.5 },
      ], columnGap: 20 }], unbreakable: true });
  }

  return {
    pageSize: 'A4', pageMargins: [56, 52, 56, 52], content: prenderTitulos(c),
    info: { title: `Contrato de Licença de Uso — Gestão e Controle — ${d.fantasia || d.razao}`, author: pr.curto },
    defaultStyle: { fontSize: 10.5, lineHeight: 1.25, color: '#222' },
    styles: {
      h1: { fontSize: 14, bold: true, color: GT_ESC, margin: [0, 10, 0, 5] },
      p: { alignment: 'justify', margin: [0, 0, 0, 5] },
      li: { alignment: 'justify', margin: [0, 0, 0, 2] },
    },
    header: (pag) => pag === 1 ? null : {
      margin: [56, 22, 56, 0], stack: [
        { columns: [{ text: 'G-TECH · Gestão e Controle', bold: true, fontSize: 8, color: GT_ESC },
          { text: 'Contrato de Licença de Uso', fontSize: 8, color: GT_CINZA, alignment: 'right' }] },
        { canvas: [{ type: 'rect', x: 0, y: 3, w: 483, h: 0.8, color: GT_LAR }] }] },
    footer: (pag, tot) => pag === 1 ? null : {
      margin: [56, 14, 56, 0], columns: [
        { text: `${d.fantasia || d.razao} · CNPJ ${cpfCnpjFmt(d.cnpj)}`, fontSize: 8, color: GT_CINZA },
        { text: `página ${pag - 1} de ${tot - 1}`, fontSize: 8, color: GT_CINZA, alignment: 'right' }] },
  };
}

function extensoNum(n) {
  return ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze',
    'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte'][n] ?? String(n);
}

function gerarContratoSistemaBytes(d) {
  return new Promise((ok, falha) => {
    try { pdfMake.createPdf(montarContratoSistema(d)).getBuffer(b => ok(new Uint8Array(b))); } catch (e) { falha(e); }
  });
}
