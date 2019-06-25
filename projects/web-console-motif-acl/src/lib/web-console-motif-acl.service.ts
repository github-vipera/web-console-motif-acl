import { NGXLogger } from 'ngx-logger';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PermissionsService, Permission } from '@wa-motif-open-api/auth-access-control-service';
//import { NGXLogger, EventBusService } from 'web-console-core';
import * as _ from 'lodash';

const LOG_TAG = '[MotifACLService]';

@Injectable({
    providedIn: 'root',
})
export class MotifACLService {

    private permissions: Array<Permission> = [];
    private permissionsLoaded = false;

    constructor(private logger: NGXLogger,
                private permissionsService: PermissionsService) {
    }

    /**
     * Remove all cached permissions
     */
    public purgePermissions(): void {
        this.logger.debug(LOG_TAG, 'Purging permissions.');
        this.permissions = [];
        this.permissionsLoaded = false;
    }

    public reloadPermissions(): Observable<Array<Permission>> {
        this.logger.debug(LOG_TAG, 'reloadPermissions called.');
        this.purgePermissions();
        return new Observable((observer) => {
            this.permissionsService.getMyselfPermissions().subscribe( (permissions: Array<Permission>) => {
                this.logger.debug(LOG_TAG, 'reloadPermissions results: ', permissions);
                this.permissions = permissions;
                this.permissionsLoaded = true;
                observer.next(permissions);
                observer.complete();
            }, (error) => {
                this.logger.error(LOG_TAG, 'reloadPermissions error: ', error);
                this.permissionsLoaded = false;
                observer.error(error);
            });
        });
    }

    public getPermissions(): Observable<Array<Permission>> {
        if (this.permissionsLoaded) {
            return new Observable((observer) => {
                observer.next(this.permissions);
                observer.complete();
            });
        } else {
            return this.reloadPermissions();
        }
    }

    public get isPermissionsLoaded(): boolean {
        return this.permissionsLoaded;
    }

    /**
     * Does current user have permission to do something?
     */
    public can(permission: string|string[]): Observable<boolean> {
        if (this.permissionsLoaded){
            return new Observable((observer) => {
                observer.next(this.canCached(permission));
                observer.complete();
            });
        } else {
            return new Observable((observer) => {
                this.reloadPermissions().subscribe((results) => {
                    observer.next(this.canCached(permission));
                    observer.complete();
                }, (error) => {
                    observer.error(error);
                });
            });
        }
    }

    private canCached(permission: string|string[]): boolean {
        if (typeof permission === 'string') {
            return this.isAuthorized(permission);
        } else {
            return this.isAuthorizedForList(permission);
        }
    }

    private isAuthorized(permission: string): boolean {
      const permissionParts: Array<string> = _.split(permission, ':');
      const component = permissionParts[0];
      const action = permissionParts[1];
      const target = permissionParts[2];
      return _.some(this.permissions, (p: Permission) => {
        return ((p.component === component || p.component === '*') &&
                (p.action === action || p.action === '*') &&
                (p.target === target || p.target === '*'));
      });
    }

    private isAuthorizedForList(permissions: Array<string>): boolean {
      return _.every(permissions, (permission: string) => this.isAuthorized(permission));
    }
}
