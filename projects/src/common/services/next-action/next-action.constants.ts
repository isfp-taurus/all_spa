import { ErrorCodeConstants } from '@conf/app.constants';

export const ORDERS_GET_E_TICKET_ITINERARY_RECEIPT_POST_ERROR_MAP: Record<string, string> = {
  /** "EBAZ000147”(指定航空券/EMD情報なしエラー) => "E0353"(指定した航空券が存在なしエラー、クーポンステータスが取り扱い不可である旨) */
  [ErrorCodeConstants.ERROR_CODES.EBAZ000147]: 'E0353',
  /** "EBAZ000163”(取扱不可クーポンステータスエラー) => "E0353"(指定した航空券が存在なしエラー、クーポンステータスが取り扱い不可である旨) */
  [ErrorCodeConstants.ERROR_CODES.EBAZ000163]: 'E0353',
};

export const ORDERS_GET_EMD_PASSENGER_RECEIPT_POST_ERROR_MAP: Record<string, string> = {
  /** "EBAZ000195”(指定EMD情報なしエラー) => "E0355"(指定した航空券が存在しなしエラー、取扱不可クーポンステータスエラー旨) */
  [ErrorCodeConstants.ERROR_CODES.EBAZ000195]: 'E0355',
  /** "EBAZ000163”(取扱不可クーポンステータスエラー) => "E0355"(指定した航空券が存在しなしエラー、取扱不可クーポンステータスエラー旨) */
  [ErrorCodeConstants.ERROR_CODES.EBAZ000163]: 'E0355',
};

export const ROUTING_SCREEN = {
  'S01-P010': 'booking-search',
  'E02-P030': 'involuntary-review',
  'E02-P010': 'involuntary-flight-search',
  'R01-P083': 'biz-payment-input',
  'R01-P080': 'payment-input',
  'C01-P010': 'checkin-search',
  'S05-P040': 'anabiz-usage-statement-select',
  'E04-P010': 'upgrade-flight-select',
  'S03-P010': 'seatmap',
  'S06-P020': 'yamato-baggage-guidance',
  'S02-P011': 'my-car-valet-input',
  'S06-P010': 'duty-free-preorder-guidance',
  'S02-P013': 'junior-pilot-input',
  'S05-P031': 'emd-select',
};

export enum NextActionTypeEnum {
  Service = 'SERVICE',
  EmailAddressRegistration = 'EMAIL_ADDRESS_REGISTRATION',
  Acknowledge = 'ACKNOWLEDGE',
  SelfReaccomodation = 'SELF_REACCOMODATION',
  Ticketing = 'TICKETING',
  Payment = 'PAYMENT',
  OnlineCheckIn = 'ONLINE_CHECKIN',
  PassengerInput = 'PASSENGER_INPUT',
  EticketAndEmd = 'ETICKET_AND_EMD',
  Upgrade = 'UPGRADE',
  BaggageRule = 'BAGGAGE_RULE',
  Lounge = 'LOUNGE',
  FirstBaggage = 'FIRST_BAGGAGE',
  Meal = 'MEAL',
  AdvancedSeatRequest = 'ADVANCED_SEAT_REQUEST',
  YamatoBaggage = 'YAMATO_BAGGAGE',
  MyCarValet = 'MY_CAR_VALET',
  DutyFreePreorder = 'DUTY_FREE_PRE_ORDER',
  Anabiz = 'ANABIZ',
  JuniorPilot = 'JUNIOR_PILOT',
}
