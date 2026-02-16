import { deepCopy } from '@common/helper';
import { ComplexRequest } from 'src/sdk-search';
import { ComplexFlightAvailabilityStoreService } from '../service/store.service';

// ストアで取得する
export const fetchComplexRequestData = async (
  store?: ComplexFlightAvailabilityStoreService
): Promise<ComplexRequest> => {
  return deepCopy(store?.fetchFlightConditionData() as ComplexRequest);
};
