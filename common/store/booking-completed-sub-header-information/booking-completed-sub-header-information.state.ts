/**
 * BookingCompletedSubHeaderInformation model
 */
export interface BookingCompletedSubHeaderInformationModel {
  displayTitle: string;
  isBreadcrumbDisplay: boolean;
}

/**
 *  model details
 */
export interface BookingCompletedSubHeaderInformationStateDetails extends BookingCompletedSubHeaderInformationModel {}

/**
 * BookingCompletedSubHeaderInformation store state
 */
export interface BookingCompletedSubHeaderInformationState extends BookingCompletedSubHeaderInformationStateDetails {}

/**
 * Name of the BookingCompletedSubHeaderInformation Store
 */
export const BOOKING_COMPLETED_SUB_HEADER_INFORMATION_STORE_NAME = 'bookingCompletedSubHeaderInformation';

/**
 * BookingCompletedSubHeaderInformation Store Interface
 */
export interface BookingCompletedSubHeaderInformationStore {
  /** BookingCompletedSubHeaderInformation state */
  [BOOKING_COMPLETED_SUB_HEADER_INFORMATION_STORE_NAME]: BookingCompletedSubHeaderInformationState;
}
