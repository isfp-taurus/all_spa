import { SupportClass } from '@lib/components/support-class';
import { Injectable } from '@angular/core';
import { DataServiceInterface } from './interface.state';
import { CommonLibService } from '@lib/services';
import {
  CabinClassSelectorModalService,
  CabinClassSelectorOutput,
  FareTypeModalOutput,
  FareTypeSelectorModalService,
} from '@common/components';

@Injectable()
export class ComplexFlightAvailabilityEventService extends SupportClass implements DataServiceInterface {
  protected $CabinClassModal = 'ComplexFlightAvailabilityCabinClassModal' as const;
  protected $FareTypeOption = 'ComplexFlightAvailabilityFareTypeOption' as const;

  public eventsList: Array<string> = [];

  constructor(
    protected _common: CommonLibService,
    protected _cabinClassSelectorModalService: CabinClassSelectorModalService,
    private _fareTypeSelectorModalService: FareTypeSelectorModalService
  ) {
    super();
    this.createEventsList();
  }

  destroy() {
    this.removeAllSubscription();
  }

  // "$"から始まるpropertyをリスト化
  public createEventsList() {
    const propertiesList: string[] = Object.keys(this);
    this.eventsList = propertiesList.filter((name: string) => name.startsWith('$'));
  }

  // remove subscription
  public removeAllSubscription() {
    this.eventsList.forEach((name: string) => this.deleteSubscription(name));
  }

  // キャビンモーダルが値を返した時のハンドル
  public cabinClassModalListener(callback: (value: string) => void) {
    this.subscribeService(
      this.$CabinClassModal,
      this._cabinClassSelectorModalService.asObservableSubject(),
      (data: CabinClassSelectorOutput) => {
        callback(data.cabinClassType);
      }
    );
  }

  // 運賃オプションが値を返したときのハンドル
  public fareTypeOptionModalListener(callback: (value: string) => void) {
    this.subscribeService(
      this.$FareTypeOption,
      this._fareTypeSelectorModalService.asObservableSubject(),
      (data: FareTypeModalOutput) => {
        callback(data.selectedFareType ?? '');
      }
    );
  }
}
