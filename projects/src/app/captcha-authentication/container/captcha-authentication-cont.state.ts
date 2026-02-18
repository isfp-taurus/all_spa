import { BehaviorSubject } from 'rxjs';

export interface GetCaptchaAuthenticationRequest {
  originLocationCode: string;
  destinationLocationCode: string;
}
export interface GetCaptchaAuthenticationResponse {
  authenticationStatus?: string | undefined;
  authenticationStatusReason?: string | null;
  isCookieAuthorized?: boolean;
  clientIpAddress?: string;
}

export interface ReCAPTCHA {
  url: string;
  render: string;
  hl: string;
  sitekey: string;
}

/**
 * 言語コード変換マスタ定義
 */
export interface LangCodeConvert {
  lang: string;
  locale: string;
  dxapi: string;
  mail: string;
  meta: string;
  adobe_analytics: string;
  recaptcha: string;
  asw_content_url: string;
  iata: string;
  display_oder: string;
  sort_name: string;
  lang_type: string;
  date_display_order: string;
  ap_prt_id_hpbp: string;
  traveler_input_order_type: string;
}

export interface CaptchaAuthenticationDynamicParams {
  // 画像認証要否取得API応答
  captchaAuthenticationStatusReply?: GetCaptchaAuthenticationResponse;
}
export function defaultCaptchaAuthenticationDynamicParams(): CaptchaAuthenticationDynamicParams {
  return {
    captchaAuthenticationStatusReply: undefined,
  };
}

export const dynamicSubject = new BehaviorSubject<CaptchaAuthenticationDynamicParams>(
  defaultCaptchaAuthenticationDynamicParams()
);
