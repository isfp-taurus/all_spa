import { environment } from '@env/environment';

/**
 * ページ遷移処理（GET）
 * @param path パス
 * @param params パラメータ
 * @param target '_self' | '_blank'
 */
export function linkToPageGet(path: string, params?: { [key: string]: any }, target?: '_self' | '_blank') {
  let paramsGet = '';
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      paramsGet = `${paramsGet}=${params[key]}&`;
    }
  }
  const hrefLink = paramsGet ? `${convertToFullPath(path)}?${paramsGet}`.slice(0, -1) : convertToFullPath(path);
  if (target === '_blank') {
    window.open(hrefLink);
  } else {
    window.location.href = hrefLink;
  }
}

/**
 * ページ遷移処理（POST）
 * @param path パス
 * @param params パラメータ
 * @param target '_self' | '_blank'
 */
export function linkToPagePost(path: string, params?: { [key: string]: any }, target?: '_self' | '_blank') {
  const form = document.createElement('form');
  form.method = 'post';
  form.action = convertToFullPath(path);
  form.target = target || '_self';

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = params[key];
      form.appendChild(hiddenField);
    }
  }

  document.body.appendChild(form);
  form.submit();
}

export function convertToFullPath(path: string) {
  const isFullPath = path.includes('https:') || path.includes('http:');
  const origin = window.location.origin;
  const baseUrl = environment.spa.baseUrl;
  return isFullPath ? path : `${origin}${baseUrl}/${path}`;
}
