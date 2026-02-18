import { asyncSerializer, Serializer } from '../common';
import { anaBizContextInitialState } from './ana-biz-context.reducer';
import { AnaBizContextState } from './ana-biz-context.state';

export const anaBizContextStorageSerializer = asyncSerializer;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const anaBizContextStorageDeserializer = (rawObject: any) => {
  return {
    ...anaBizContextInitialState,
    ...rawObject,
  } as AnaBizContextState;
};

export const anaBizContextStorageSync: Serializer<AnaBizContextState> = {
  serialize: anaBizContextStorageSerializer,
  deserialize: anaBizContextStorageDeserializer,
};
