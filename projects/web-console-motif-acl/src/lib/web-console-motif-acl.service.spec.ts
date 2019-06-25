import { TestBed, async, inject } from '@angular/core/testing';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService, WebConsoleConfig, NGXLogger, LoggerModule, NgxLoggerLevel, EventBusService } from 'web-console-core';
import * as _ from 'lodash';
import { MotifACLService } from './web-console-motif-acl.service';
import { TEST_BASE_PATH, TEST_OAUTH2_BASE_PATH, TEST_USERNAME, TEST_PASSWORD } from '../test.variables';
import { failTestWithError, failLogin } from '../test-helper';
import { PermissionsService, Configuration } from '@wa-motif-open-api/auth-access-control-service';

describe('MotiAclService', () => {
    let authService: AuthService;
    let service: MotifACLService;

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [
                NGXLogger,
                { provide: HTTP_INTERCEPTORS, useClass: AuthService, multi: true },
                { provide: WebConsoleConfig, useValue: new WebConsoleConfig('', '') }
            ],
            imports: [HttpClientModule, LoggerModule.forRoot({level: NgxLoggerLevel.DEBUG})]
        });

        const httpClient = TestBed.get(HttpClient);
        const logger: NGXLogger = TestBed.get(NGXLogger);
        authService = new AuthService(httpClient, TEST_OAUTH2_BASE_PATH, null, null, new EventBusService(logger), logger);
        const permissionsService = new PermissionsService(httpClient, TEST_BASE_PATH, new Configuration());
        service = new MotifACLService(logger, permissionsService);

        const p: Promise<any> = authService.login({ userName: TEST_USERNAME, password: TEST_PASSWORD }).toPromise();
        p.catch((error) => {
            failLogin(error);
        });
        return p;
    });

    beforeEach(() => {
    });

    afterEach(() => {
    });

    it(`should prepare stuff`,
      async(
        () => {
          service.reloadPermissions().subscribe(result => {
          }, error => {
            failTestWithError('should prepare stuff', error);
          });
      })
    );

    it(`should check permissions are loaded`,
      async(
        () => {
          expect(service.isPermissionsLoaded).toBeTruthy();
        }
      )
    );

    it(`should purge permissions`,
      async(
        () => {
          service.purgePermissions();
          expect(service.isPermissionsLoaded).toBeFalsy();
        }
      )
    );

    it(`should get permissions`,
      async(
        () => {
          service.getPermissions().subscribe(result => {
            expect(result.length).toBeGreaterThan(0);
          }, error => {
            failTestWithError('should get permissions', error);
          });
        }
      )
    );

    it(`should check if permission is available`,
      async(
        () => {
          service.can('com.vipera.osgi.foundation.scheduler.api.rest.SchedulerApi:READ:test').subscribe(result => {
            expect(result).toBeTruthy();
          }, error => {
            failTestWithError('should check if permission is available', error);
          });
        }
      )
    );

    it(`should check if a list of permissions is available`,
      async(
        () => {
          service.can(['com.vipera.osgi.foundation.scheduler.api.rest.SchedulerApi:READ:test',
                       'com.vipera.osgi.core.platform.api.rest.PerformanceApi:UPDATE:test',
                       'com.vipera.osgi.foundation.otp.api.rest.OtpApi:DELETE:test']).subscribe(result => {
            expect(result).toBeTruthy();
          }, error => {
            failTestWithError('should check if a list of permissions is available', error);
          });
        }
      )
    );

    it(`should check if permission is not available`,
      async(
        () => {
          service.can('com.vipera.osgi.foundation.scheduler.api.rest.NonExistentService:READ:test').subscribe(result => {
            expect(result).toBeFalsy();
          }, error => {
            failTestWithError('should check if permission is not available', error);
          });
        }
      )
    );

    it(`should check that a permission in a list of permissions is not available`,
      async(
        () => {
          service.can(['com.vipera.osgi.foundation.scheduler.api.rest.SchedulerApi:READ:test',
                       'com.vipera.osgi.core.platform.api.rest.PerformanceApi:UPDATE:test',
                       'com.vipera.osgi.foundation.otp.api.rest.UnexistentApi:DELETE:test']).subscribe(result => {
            expect(result).toBeFalsy();
          }, error => {
            failTestWithError('should check that a permission in a list of permissions is not available', error);
          });
        }
      )
    );

});
