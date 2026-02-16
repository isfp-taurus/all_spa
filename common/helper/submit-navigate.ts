/**
 * 対象のURLにsubmit遷移する
 * @param url 対象のURL
 * @param param 遷移先に送るパラメータ（json）
 */
export function submitNavigate(url: string, param: any, method = 'post') {
  //フォームを作成する
  const form = document.createElement('form');
  form.method = method;
  form.action = url;
  //フォームのパラメータを埋め込む
  Object.keys(param).forEach((key) => {
    const append = document.createElement('input');
    append.type = 'hidden';
    append.name = key;
    append.value = param[key];
    form.appendChild(append);
  });
  document.body.appendChild(form);
  //フォームのサブミット処理
  form.submit();
}
