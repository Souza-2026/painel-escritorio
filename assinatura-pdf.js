/* Gera a via assinada: o PDF original + uma pagina de registro da assinatura eletronica.
   Usado pela pagina do cliente (assinar.html) e pelo painel (index.html). Precisa do pdf-lib. */
async function sha256Hex(bytes) {
  const h = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function cpfFormatado(c) {
  const d = String(c || '').replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return d;
}

function dataHoraBelem(iso) {
  return new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Belem', dateStyle: 'long', timeStyle: 'medium' }) + ' (horário de Belém)';
}

async function gerarViaAssinada(pdfBytes, doc, token) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const pdf = await PDFDocument.load(pdfBytes);
  const fonte = await pdf.embedFont(StandardFonts.Helvetica);
  const negrito = await pdf.embedFont(StandardFonts.HelveticaBold);
  const azul = rgb(0.106, 0.165, 0.29), cinza = rgb(0.33, 0.33, 0.33);
  const pg = pdf.addPage([595.28, 841.89]);
  const W = pg.getWidth();
  let y = 790;
  const linha = (rotulo, valor, tam = 10.5) => {
    pg.drawText(rotulo, { x: 56, y, size: 9, font: negrito, color: cinza });
    const partes = quebrar(String(valor || '—'), fonte, tam, W - 56 - 200);
    partes.forEach((p, i) => pg.drawText(p, { x: 200, y: y - i * (tam + 3), size: tam, font: fonte, color: rgb(0.1, 0.1, 0.1) }));
    y -= Math.max(1, partes.length) * (tam + 3) + 9;
  };
  pg.drawText('REGISTRO DE ASSINATURA ELETRÔNICA', { x: 56, y, size: 15, font: negrito, color: azul });
  y -= 18;
  pg.drawRectangle({ x: 56, y, width: W - 112, height: 1.2, color: rgb(0.72, 0.53, 0.23) });
  y -= 26;
  linha('Documento', doc.titulo);
  linha('Emitido por', doc.emissor);
  linha('Assinado por', doc.assinado_nome);
  linha('CPF/CNPJ', cpfFormatado(doc.assinado_cpf));
  if (doc.assinado_opcao) linha('Opção escolhida', doc.assinado_opcao);
  linha('Data e hora', dataHoraBelem(doc.assinado_em));
  linha('Endereço IP', doc.assinado_ip || 'não informado');
  linha('Código do documento', token);
  linha('SHA-256 do original', doc.arquivo_sha256, 8.5);
  y -= 6;
  pg.drawText('Assinatura', { x: 56, y, size: 9, font: negrito, color: cinza });
  if (doc.assinatura_png) {
    const img = await pdf.embedPng(doc.assinatura_png);
    const larg = 260, alt = larg * img.height / img.width;
    pg.drawRectangle({ x: 200, y: y - alt - 8, width: larg + 16, height: alt + 16, borderColor: rgb(0.8, 0.82, 0.86), borderWidth: 0.8 });
    pg.drawImage(img, { x: 208, y: y - alt, width: larg, height: alt });
    y -= alt + 40;
  }
  const nota = 'Assinatura eletrônica simples, nos termos da Lei nº 14.063/2020 e da MP nº 2.200-2/2001 (art. 10, § 2º), ' +
    'admitida entre as partes que a aceitam. O signatário visualizou o documento identificado pelo código SHA-256 acima, ' +
    'declarou ter lido e concordado com seu conteúdo e assinou de próprio punho na tela do dispositivo. Qualquer alteração ' +
    'no documento original produz outro código SHA-256 e invalida este registro.';
  quebrar(nota, fonte, 9, W - 112).forEach(p => { pg.drawText(p, { x: 56, y, size: 9, font: fonte, color: cinza }); y -= 12.5; });
  return await pdf.save();
}

function quebrar(texto, fonte, tam, largura) {
  const palavras = texto.split(/\s+/), linhas = [];
  let atual = '';
  for (const p of palavras) {
    const tenta = atual ? atual + ' ' + p : p;
    if (fonte.widthOfTextAtSize(tenta, tam) > largura && atual) { linhas.push(atual); atual = p; }
    else atual = tenta;
  }
  if (atual) linhas.push(atual);
  // palavra sozinha maior que a largura (o hash): corta em pedacos
  return linhas.flatMap(l => {
    if (fonte.widthOfTextAtSize(l, tam) <= largura) return [l];
    const out = []; let s = '';
    for (const ch of l) { if (fonte.widthOfTextAtSize(s + ch, tam) > largura) { out.push(s); s = ch; } else s += ch; }
    if (s) out.push(s);
    return out;
  });
}

function baixarArquivo(bytes, nome) {
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
