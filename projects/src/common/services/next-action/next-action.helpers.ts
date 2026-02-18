import { Params } from '@angular/router';
import { environment } from '@env/environment';

export const showPdfInNewWindow = (pdfBase64str: string, pdfName: string, pdfWindow: WindowProxy | null) => {
  if (pdfWindow) {
    renderPdfViewToDocument(pdfBase64str, pdfWindow.document, pdfName);
  }
};

export const renderPdfViewToDocument = (pdfBase64str: string, document: Document, pdfName: string) => {
  var pdfBinary = atob(pdfBase64str);
  var pdfBuffer = new Uint8Array(pdfBinary.length);
  for (let i = 0; i < pdfBinary.length; i++) {
    pdfBuffer[i] = pdfBinary.charCodeAt(i);
  }

  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);

  const embedDom = createEmbedNode(url);
  document.title = pdfName;
  document.body.append(embedDom);

  function createEmbedNode(url: string) {
    const node = document.createElement('embed');
    node.src = `${url}#toolbar=1`;
    node.style.width = '100vw';
    node.style.height = '100vh';
    return node;
  }
};

export const navigateAnotherApp = (app: string, destination: string, params?: Params) => {
  let url = `${window.location.origin}${environment.spa.baseUrl}${app}/${destination}`;

  if (params) {
    url += '?' + new URLSearchParams(params).toString();
  }
  window.location.href = url;
};

export const navigateAnotherMethodPost = (app: string, destination: string, params?: Params) => {
  const url = `${window.location.origin}${environment.spa.baseUrl}${app}/${destination}`;
  var form = document.createElement('form');
  form.target = '_self';
  form.method = 'POST';
  form.action = url;

  for (const [key, value] of Object.entries(params ?? {})) {
    const input = document.createElement('input');
    if (value) {
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }
  }

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

export const downloadPDF = (base64str: string, pdfName: string) => {
  const byteCharacters = atob(base64str);
  const byteArray = Array.from(byteCharacters, (char) => char.charCodeAt(0));
  const blob = new Blob([new Uint8Array(byteArray)], { type: 'application/pdf' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = pdfName;
  link.click();
  link.remove();
};

export const getCurrentApplication = () => {
  const baseUrl = environment.spa.baseUrl;
  const pathName = location.pathname;
  return {
    isServicing: pathName.includes(baseUrl + environment.spa.app.srv),
    isExchange: pathName.includes(baseUrl + environment.spa.app.exc),
    isCheckIn: pathName.includes(baseUrl + environment.spa.app.cki),
    isReservation: pathName.includes(baseUrl + environment.spa.app.res),
  };
};
