import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'
import { WebConsoleComponent, WebConsoleCoreModule, AuthGuard } from 'web-console-core'
import { WebConsoleLoginModule, WebConsoleLoginComponent } from 'web-console-login'
import { LoggerModule, NGXLogger, NgxLoggerLevel } from 'web-console-core'
import { WC_API_BASE_PATH, WC_OAUTH_BASE_PATH } from 'web-console-core'
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: WebConsoleLoginComponent },
  { path: 'dashboard', component: WebConsoleComponent, canActivate: [AuthGuard] }
];


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    LoggerModule.forRoot({serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.OFF}),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    WebConsoleCoreModule.withConfig({loginRoute:"login",dashboardRoute:"dashboard"}),
    WebConsoleLoginModule
  ],
  providers: [
    { provide: WC_API_BASE_PATH, useValue: environment.API_BASE_PATH },
    { provide: WC_OAUTH_BASE_PATH, useValue: environment.OAUTH_BAS_PATH },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
