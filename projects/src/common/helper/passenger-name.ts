import { Traveler } from 'src/sdk-reservation';
import { defaultDispPassengerName } from './conditions';

/**
 * 搭乗者姓名取得処理
 * @param pax
 * @returns 姓名登録済みの場合、フォーマット後姓名。未登録の場合undefined
 */
export function getPaxName(pax: Traveler): string | undefined {
  const name = pax.names?.[0];
  const isNameRegistered = name?.firstName && name.lastName;
  return isNameRegistered ? defaultDispPassengerName(name) : undefined;
}
