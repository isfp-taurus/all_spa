import { DisplayInfoJSON } from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.state';
import { MasterStoreKey } from '@conf/asw-master.config';
import { LoadAswMasterInfo } from '@lib/interfaces';
import { FindMoreFlightsResponse } from 'src/sdk-search';

export const fmFCacheList = {
  AIRPORT_ALL: [
    {
      key: MasterStoreKey.Airport_All,
      fileName: 'Airport_All',
    },
  ],

  M_AIRLINE_I18N: [
    {
      key: MasterStoreKey.M_AIRLINE_I18N,
      fileName: 'm_airline_i18n/M_airline_i18n',
      isCurrentLang: true,
    },
  ],
};

export const LOAD_FMF_CACHE: LoadAswMasterInfo[] = [
  {
    key: MasterStoreKey.AirportI18n_SearchForAirportCode,
    fileName: 'AirportI18n_SearchForAirportCode',
    isCurrentLang: true,
  },
  {
    key: MasterStoreKey.AIRLINE_I18N_JOINALL,
    fileName: 'Airline_I18nJoinAll',
    isCurrentLang: true,
  },
];

export type DynamicParams = {
  // 複雑空席照会画面へ表示する有償の空席情報を取得するレスポンス型
  findMoreFlightsReply: FindMoreFlightsResponse;
  // 画面情報JSON
  pageContext: DisplayInfoJSON;
};
