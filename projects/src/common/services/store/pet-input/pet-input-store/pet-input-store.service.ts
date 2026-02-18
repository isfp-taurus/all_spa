/**
 * ペットらくのり画面 store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {
  PetInputModel,
  PetInputState,
  PetInputStore,
  resetPetInput,
  selectPetInputState,
  setPetInput,
  updatePetInput,
} from '@common/store/pet-input';

/**
 * store情報
 * @param PetInputData @see PetInputState
 */
@Injectable()
export class PetInputStoreService extends SupportClass {
  private _PetInput$: Observable<PetInputState>;
  private _PetInputData: PetInputState = {
    requestIds: [],
    cartId: '',
    travelers: [],
    representativeTravelerId: '',
    petDetails: [],
    registeredPetDetails: [],
    maxCageSize: '',
    maxCageWeight: '',
  };
  get PetInputData() {
    return this._PetInputData;
  }

  set PetInputData(petInputState: PetInputState) {
    this._PetInputData = petInputState;
  }

  constructor(private _store: Store<PetInputStore>) {
    super();
    this._PetInput$ = this._store.pipe(
      select(selectPetInputState),
      filter((data) => !!data)
    );
    this.subscribeService('PetInputStoreService PetInputObservable', this._PetInput$, (state) => {
      this._PetInputData = state;
      this.deleteSubscription('PetInputStoreService PetInputObservable');
    });
  }

  destroy() {}

  public getPetInput$() {
    return this._PetInput$;
  }

  public setPetInput(petInputInformation: PetInputModel): void {
    this._store.dispatch(setPetInput(petInputInformation));
  }

  public updatePetInput(petInputInformation: PetInputModel): void {
    this._store.dispatch(updatePetInput(petInputInformation));
  }

  public resetPetInput(): void {
    this._store.dispatch(resetPetInput());
  }
}
