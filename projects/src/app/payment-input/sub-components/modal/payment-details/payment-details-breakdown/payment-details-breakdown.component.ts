import {
    AfterViewInit, 
    ChangeDetectionStrategy, 
    ChangeDetectorRef, 
    Component, 
    ElementRef,
    Input, 
    Viewchild,
    } from '@angular/core';
    import { SupportComponent } from '@lib/components/support-class'; 
    import { CommonLibService } from '@lib/services' ; 
    import { PaymentDetailsBreakdownItemData } from '/payment-details-breakdown-item/payment-details-breakdown-item.state';
    
    /**
    * 支払情報詳細モーダル下部内訳部分
    */
    @Component ({
    selector: 'asw-payment-details-breakdown',
    templateUrl: './payment-details-breakdown. component.html', 
    changeDetection: ChangeDetectionStrategy.OnPush,
    })
    export class PaymentDetailsBreakdownComponent extends SupportComponent implements AfterViewInit {
    constructor(private _common: CommonLibService, public changeDetectorRef: ChangeDetectorRef) {
    super(_common);
    }
    
    @Viewchild( 'detailPanel') detailPanel?: ElementRef;
    
    @Input()
    set data(value: Array<PaymentDetailsBreakdownItemData >) {
    this._data = value;
    this.refresh();
    }
    get data(): Array<PaymentDetailsBreakdownItemData> {
    return this._data;
    }
    public _data: Array<PaymentDetailsBreakdownItemData> = [];

    @Input()
    get isCanada(): boolean {
    return this._isCanada;
    }
    set isCanada(value: boolean) {
    this._isCanada = value;
    this.refresh();
    }
    public _isCanada = true;

    @Input()
    get isMalaysia(): boolean {
    return this._isMalaysia;
    }
    set isMalaysia(value: boolean) {
    this._isMalaysia = value;
    this.refresh();
    }
    public _isMalaysia = true;

    @Input () mTaxMsgs: { [key: string]: string } = {};

    init(): void {}

    reload(): void {}

    destroy(): void {
    this.deleteSubscription( 'BlocksliderComponentResize');
    }

    ngAfterViewInit(): void {
    if (this.detailPanel) {
    this.resizeobserver.observe(this.detailPanel.nativeElement);
    }
    }

    public maxScroll = 0;
    public isScroll = false;
    public isScrollRight = false;
    public isScrollLeft = false;
    public resizeobserver = new ResizeObserver(() => {
        if (this.detailPanel){
            this.maxScroll =
        (this.detailPanel.nativeElement.scrollwidth ?? 0) - (this.detailPanel.nativeElement.clientwidth ?? 0);
        this.refresh();
        }
    });

    /**
    *設定値の初期化
    */
    public refresh() {
    this.isScroll = 0 < this.maxScroll;
    this.isScrollRight = this.isScroll && (this.detailPanel?.nativeElement.scrollLeft ?? 0) < this.maxScroll;
    this.isScrollLeft = this.isScroll && (this.detailPanel?.nativeElement.scrollLeft ?? 0) !== 0;
    this. changeDetectorRef.detectChanges () ;
    }

    scrollLeft(){
    if (this.detailPanel) {
    if (this.detailPanel.nativeElement.scrollLeft < 300) {
    this.detailPanel.nativeElement.scrollLeft = 0;
    } else {
    this.detailPanel.nativeElement.scrollLeft -= 300;
    }
    this.refresh();
    }
    }

    scrollRight(){
    if (this.detailPanel){
    if (this.maxScroll < this.detailPanel.nativeElement.scrollLeft + 300) {
    this.detailPanel.nativeElement.scrollLeft = this.maxScroll;
    } else {
    this.detailPanel.nativeElement.scrollLeft += 300;
    }
    this.refresh();
    }
    }

}