/**
 * 機内サービスツールチップアイコン用画像タグ
 * ※キーの数字はM_SERVICE_CONTENTSのSERVICE_TYPEに対応
 * ※Wi-Fiはツールチップ表示しないため別扱い
 */
export const serviceTooltipImgs: { [key: string]: string } = {
  '1': '<img src="assets/images/icon_lounge_primary_28.svg" alt="{{0}}" width="24" height="24" />',
  '2': '<img src="assets/images/icon_seat_primary_28.svg" alt="{{0}}" width="24" height="24" />',
  '3': '<img src="assets/images/icon_meal_primary_28.svg" alt="{{0}}" width="24" height="24" />',
  M: '<img src="assets/images/icon_meal_primary_28.svg" alt="{{0}}" width="24" height="24" />',
  R: '<img src="assets/images/icon_meal_primary_28.svg" alt="{{0}}" width="24" height="24" />',
  S: '<img src="assets/images/icon_cakes_primary_24.svg" alt="{{0}}" width="24" height="24" />',
  N: '<img src="assets/images/icon_drink_primary_24.svg" alt="{{0}}" width="24" height="24" />',
  other: '<img src="assets/images/icon_meal_primary_28.svg" alt="{{0}}" width="24" height="24" />',
  '4': '<img src="assets/images/icon_entertainment_primary_28.svg" alt="{{0}}" width="24" height="24" />',
  '5': '<img src="assets/images/icon_shopping_primary_28.svg" alt="{{0}}" width="24" height="24" />',
  '6': '<img src="assets/images/icon_amenity_primary_28.svg" alt="{{0}}" width="24" height="24" />',
};

/**
 * 機内サービスツールチップアイコン用alt文言キー
 * ※キーの数字はM_SERVICE_CONTENTSのSERVICE_TYPEに対応
 * ※キーのアルファベットはserviceTypeに対応
 */
export const serviceTooltipImgAlts: { [key: string]: string } = {
  '1': 'alt.lounge',
  '2': 'alt.seat',
  '3': 'alt.dirnk',
  M: 'alt.meal',
  R: 'alt.lightMeal',
  S: 'alt.tea',
  N: 'alt.noMeal',
  other: 'alt.meal',
  '4': 'alt.entertainment',
  '5': 'alt.shopping',
  '6': 'alt.amenities',
};

/**
 * 日中韓言語Set
 */
export const cjkLangSet = new Set<string>(['cn', 'tw', 'hk', 'ja', 'ko']);
