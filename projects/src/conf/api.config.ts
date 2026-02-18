import { Configuration as AmcmemberConf } from 'src/sdk-amcmember';
import { Configuration as AuthorizationConf } from 'src/sdk-authorization';
import { Configuration as InitializationConf } from 'src/sdk-initialization';
import { Configuration as UserConf } from 'src/sdk-user';
import { Configuration as SearchConf } from 'src/sdk-search';
import { Configuration as ReservationConf } from 'src/sdk-reservation';
import { Configuration as ServicingConf } from 'src/sdk-servicing';
import { Configuration as SysdateConf } from 'src/sdk-sysdate';
import { Configuration as MemberConf } from 'src/sdk-member';
import { Configuration as roundTripConf } from 'src/app/roundtrip-flight-availability-domestic/common/sdk';
import { Configuration as CreditConf } from 'src/sdk-credit';
import { environment } from '@env/environment';

export const apiAmcmemberFactory = () => {
  return new AmcmemberConf({
    basePath: `${environment.api.baseUrl}${environment.api.app.amcmember}`,
  });
};

export const apiAuthorizationFactory = () => {
  return new AuthorizationConf({
    basePath: `${environment.api.baseUrl}${environment.api.app.authorization}`,
  });
};

export const apiInitializationFactory = () => {
  return new InitializationConf({
    basePath: `${environment.api.baseUrl}${environment.api.app.initialization}`,
  });
};

export const apiUserFactory = () => {
  return new UserConf({
    basePath: `${environment.api.baseUrl}${environment.api.app.user}`,
  });
};

export const apiSearchFactory = () => {
  return new SearchConf({
    basePath: `${environment.api.baseUrl}${environment.api.app.search}`,
  });
};

export const apiReservationFactory = () => {
  return new ReservationConf({
    basePath: `${environment.api.baseUrl}${environment.api.app.reservation}`,
  });
};

export const apiServicingFactory = () => {
  return new ServicingConf({
    basePath: `${environment.api.baseUrl}${environment.api.app.servicing}`,
  });
};

export const apiSysdateFactory = () => {
  return new SysdateConf({
    basePath: `${environment.api.baseUrl}${environment.api.app.sysdate}`,
  });
};

export const apiMemberFactory = () => {
  return new MemberConf({
    basePath: `${environment.api.baseUrl}${environment.api.app.member}`,
  });
};

// TODO: CTC FT打鍵用のための一時的な改修 (search最新版連携待ち)
export const roundTripFactory = () => {
  return new roundTripConf({
    basePath: `${environment.api.baseUrl}${environment.api.app.search}`,
  });
};

export const apiCreditFactory = () => {
  return new CreditConf({
    basePath: `${environment.api.baseUrl}${environment.api.app.credit}`,
  });
};
