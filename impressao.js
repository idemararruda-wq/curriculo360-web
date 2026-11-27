function openPrintWindow(title) {
  const tab = window.open('about:blank', '_blank');
  if (!tab) {
    window.alert('Permita pop-ups para abrir a impressão.');
    return null;
  }
  tab.opener = null;
  const doc = tab.document;
  doc.documentElement.lang = 'pt-BR';
  doc.title = title;
  doc.body.replaceChildren();
  const style = doc.createElement('style');
  style.textContent = `
    body { color: #171717; font: 15px/1.5 system-ui, sans-serif; max-width: 760px; margin: 28px auto; padding: 0 18px; }
    h1 { font-size: 25px; margin: 12px 0; }
    dt { font-weight: 700; margin-top: 9px; }
    dd { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
    dl div { break-inside: avoid; }
    button, a { font: inherit; }
    @page { size: A4; margin: 15mm; }
    @media print { body { margin: 0; max-width: none; padding: 0; } .print-controls { display: none; } }
  `;
  doc.head.append(style);
  appendText(doc.body, 'p', 'Currículo360 · Uso interno da equipe');
  appendText(doc.body, 'h1', title);
  return tab;
}

function appendText(parent, tag, value) {
  const element = parent.ownerDocument.createElement(tag);
  element.textContent = value;
  parent.append(element);
  return element;
}

export function printRecord(title, fields) {
  const tab = openPrintWindow(title);
  if (!tab) return;
  const doc = tab.document;
  const control = appendText(doc.body, 'button', 'Imprimir / salvar em PDF');
  control.className = 'print-controls';
  control.onclick = () => tab.print();
  const list = doc.createElement('dl');
  for (const [label, value] of fields) {
    if (value == null || value === '') continue;
    const field = doc.createElement('div');
    appendText(field, 'dt', label);
    appendText(field, 'dd', String(value));
    list.append(field);
  }
  doc.body.append(list);
  tab.focus();
  tab.requestAnimationFrame(() => tab.print());
}

export async function printResume(db, path) {
  const tab = openPrintWindow('Imprimir currículo original');
  if (!tab) return;
  const doc = tab.document;
  const info = appendText(doc.body, 'p', 'Preparando acesso ao currículo privado…');
  const docx = /\.docx$/i.test(path);
  try {
    const bucket = db.storage.from('curriculos-privados');
    const { data, error } = await bucket.createSignedUrl(path, 180, docx ? { download: 'curriculo.docx' } : {});
    if (error || !data?.signedUrl) throw new Error('Arquivo indisponível');
    if (tab.closed) return;
    info.textContent = docx
      ? 'Baixe o DOCX, abra no Word ou LibreOffice e use a opção Imprimir do editor.'
      : 'Abra o PDF e use o botão da impressora no visualizador do navegador.';
    const link = appendText(doc.body, 'a', docx ? 'Baixar currículo em DOCX' : 'Abrir PDF para imprimir');
    link.href = data.signedUrl;
    link.rel = 'noreferrer';
    appendText(doc.body, 'p', 'Se o link expirar, volte à ficha e clique em Imprimir currículo novamente.');
  } catch {
    if (!tab.closed) info.textContent = 'Não foi possível abrir o currículo. Volte à ficha e tente novamente.';
  }
}
