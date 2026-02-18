import { environment } from '@env/environment';

// APIレスポンス変数名生成
export function createResponseName(url: string, method: string, res: any): string {
  // サンプル
  // if(url === "https://www.ana.co.jp/" && method === "post"){
  //   return `AAA_${res.cartId}`
  // }
  // サンプル(環境差異対応)
  // if(url === `${environment.api.baseUrl}${environment.api.app.initialization}/initialization` && method === "POST"){
  //   return `initialization`
  // }
  if (url.includes(environment.api.baseUrl)) {
    const reqArr = url.split('/');
    let replyKey = reqArr[reqArr.length - 1];
    switch (replyKey) {
      case 'favorite':
        return getReplyName('favorite');
      case 'history':
        return getReplyName('history');
      case 'history-favorite':
        return getReplyName('historyFavorite');
      case 'roundtrip-fpp':
        return getReplyName('roundtripFpp');
      case 'waitlist':
        return getReplyName('waitlist');
      case 'delete-prebooked-order':
        return getReplyName('deletePrebookedOrder');
      case 'create-cart':
        return getReplyName('createCart');
      case 'update-air-offer':
        return getReplyName('updateAirOffer');
      case 'roundtrip-owd':
        return getReplyName('roundtripOwd');
      case 'upgrade-availability':
        return getReplyName('upgradeAvailability');
      case 'upgrade-waitlist':
        return getReplyName('upgradeWaitlist');
      case 'complex-calendar':
        return getReplyName('complexCalendar');
      case 'complex-trip':
        return getReplyName('complexTrip');
      case 'find-more-flights':
        return getReplyName('findMoreFlights');
      case 'delete':
        return getReplyName('delete');
      case 'get-member-information':
        return getReplyName('getMemberInformation');
      case 'change-office-and-lang':
        return getReplyName('changeOfficeAndLang');
      case 'captcha-authentication-status':
        return getReplyName('captchaAuthenticationStatus');
      case 'captcha-authentication':
        return getReplyName('captchaAuthentication');
      case 'aswbe-anabiz-logout':
        return getReplyName('aswbeAnabizLogout');
      case 'initialize-goshokai-net':
        return getReplyName('initializeGoshokaiNet');
      case 'get-order':
        return getReplyName('getOrder');
      case 'fare-conditions':
        return getReplyName('fare-conditions');
      case 'inflight-meal':
        return getReplyName('inflightMeal');
      case 'get-cart':
        return getReplyName('getCart');
      case 'get-plans':
        return getReplyName('getPlans');
      default:
        break;
    }
  }
  return '';
}

export function getReplyName(replyName: string) {
  const replyAswName = `${replyName}Reply`;
  if (!(window as any).Asw.ApiReplyOutput[replyAswName]) {
    return replyAswName;
  }
  const apiReplyOutputKeyArray = Object.keys((window as any).Asw.ApiReplyOutput);
  if (apiReplyOutputKeyArray.length === 0) {
    return replyAswName;
  } else {
    const replyNumber = apiReplyOutputKeyArray.filter((reply) => {
      return reply.includes(replyAswName);
    }).length;
    return replyNumber === 0 ? replyAswName : `${replyName}Reply-${replyNumber}`;
  }
}
