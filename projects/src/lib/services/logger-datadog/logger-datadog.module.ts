import { ModuleWithProviders, NgModule } from '@angular/core';
import { DataDogCustomConfig, DATADOG_LOGS_TOKEN } from './logger-datadog.config';
import { LoggerDatadogService } from './logger-datadog.service';

/**
 * ログ出力Module
 * - `forRoot()`時に指定するConfigは{@link DataDogCustomConfig}を参照
 */
@NgModule({
  providers: [
    {
      provide: DATADOG_LOGS_TOKEN,
      useValue: {},
    },
    LoggerDatadogService,
  ],
})
export class LoggerDatadogServiceModule {
  public static forRoot(
    configurationFactory: () => Partial<DataDogCustomConfig>
  ): ModuleWithProviders<LoggerDatadogServiceModule> {
    return {
      ngModule: LoggerDatadogServiceModule,
      providers: [{ provide: DATADOG_LOGS_TOKEN, useFactory: configurationFactory }],
    };
  }
}
