import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core'; 
import { defaultDispPassengerName, getPassengerLabel } from '@common/helper';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import {
PaymentDetailsBreakdownItemData, 
initPaymentDetailsBreakdownItemData,
} from ' /payment-details-breakdown-item.state';
import { StaticMsgPipe } from '@lib/pipes';

/**
* 支払情報詳細モーダル下部内訳部分
*/
@Component ({
selector: 'asw-payment-details-breakdown-item',
templateUrl: '/payment-details-breakdown-item.component.html',
changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PaymentDetailsBreakdownItemComponent extends SupportComponent {
constructor( 
private _common: CommonLibService,
public changeDetectorRef: ChangeDetectorRef, 
private _staticMsg: StaticMsgPipe
){
super(_common);
}

@Input()
set data(value: PaymentDetailsBreakdownItemData) {
this._data = value;
this.refresh();
}
get data(): PaymentDetailsBreakdownItemData {
return this._data;
}
public _data: PaymentDetailsBreakdownItemData = initPaymentDetailsBreakdownItemData();

/** 呼ひ出し元にてngForで付与したindex */
@Input() index = 0;

@Input()
get isCanada(): boolean {
return this._isCanada;
}
set isCanada(value: boolean) {
this._isCanada = value;
this.changeDetectorRef.markForCheck();
}
public _isCanada = true;

@Input()
get isMalaysia(): boolean {
return this._isMalaysia;
}
set isMalaysia(value: boolean) {
this._isMalaysia = value;
this.changeDetectorRef.markForCheck();
}
public _isMalaysia = true;

// 税金マスタから取得した文言
@Input() mTaxMsgs: { [key: string]: string } = {};

public dispName = '';
public type = 'm_static_message-label.adult';
public taxes: Array<{ name: string; value: number }> = [{ name: '税金', value: 100 }];
public ancillaryTaxes: Array<{ name: string; value: number }> = [{ name: '税金', value: 100 }];

init(): void {}

reload(): void {}

destroy(): void {}

/**
* 設定值の初期化
*/
public refresh() {
    if (this.data.names){
        this.dispName = defaultDispPassengerName(this.data.names ?? {});
    } else {
        this. dispName = this._staticMsg.transform('label.passenger.n', { '0': this.data.id });
    }
    this.type = getPassengerLabel(this.data.type);

    this.taxes = this.data.ticketPricesTaxes.map((tax) =>{
        return {
            name: tax.name,//税金コード＝当該税金.codeとなる税金情報.税金名称
            value: tax.value,
        };
    });
    
    this.changeDetectorRef.markForCheck();
    }
}