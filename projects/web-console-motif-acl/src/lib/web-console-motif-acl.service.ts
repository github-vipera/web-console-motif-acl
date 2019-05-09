import { NGXLogger } from 'ngx-logger';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MyselfService, Action } from '@wa-motif-open-api/auth-access-control-service'
//import { NGXLogger, EventBusService } from 'web-console-core';
import * as _ from 'lodash';

const LOG_TAG = '[MotifACLService]';

@Injectable({
    providedIn: 'root',
})
export class MotifACLService {

    private _actions: Array<Action>;
    private _permissions: Array<string> = [];
    private _permissionsLoaded:boolean = false;

    constructor(private logger: NGXLogger,
        private myselfService:MyselfService) {
    }

    /**
     * Remove all cached permissions
     */
    public flushPermissions():void{
        this.logger.debug(LOG_TAG, 'Flushing permissions.');
        this._actions = [];
        this._permissions = [];
        this._permissionsLoaded = false;
    }

    public reloadPermissions(): Observable<Array<string>> {
        this.logger.debug(LOG_TAG, 'reloadPermissions called.');
        this.flushPermissions();
        return new Observable((observer) => {
            this.myselfService.getMyselfActions().subscribe( (actions:Array<Action>) => {
                this.logger.debug(LOG_TAG, 'reloadPermissions results: ', actions);
                this._permissions = [];
                actions.forEach(action => {
                    this._permissions.push(action.name);
                });
                this._permissionsLoaded = true;
                observer.next(this._permissions);
                observer.complete();
            }, (error) => {
                this.logger.error(LOG_TAG, 'reloadPermissions error: ', error);
                this._permissionsLoaded = false;
                observer.error(error);
            });
        });
    }

    public getPermissions(): Observable<Array<string>> {
        if (this.permissionsLoaded){
            return new Observable((observer)=>{
                observer.next(this._permissions);
                observer.complete();
            });
        } else {
            return this.reloadPermissions();
        }
    }

    public get permissionsLoaded():boolean {
        return this._permissionsLoaded;
    }

    public getActions(): Observable<Array<Action>> {
        if (this.permissionsLoaded){
            return new Observable((observer)=>{
                observer.next(this._actions);
                observer.complete();
            });
        } else {
            return new Observable((observer) => {
                this.reloadPermissions().subscribe( (results)=>{
                    observer.next(this._actions);
                    observer.complete();
                }, (error)=>{
                    observer.error(error);
                })
            });
        }
    }

    /**
     * Does current user have permission to do something?
     *
     * @param permission
     */
    public can(action:string|string[]):Observable<boolean> {
        if (this.permissionsLoaded){
            return new Observable((observer)=>{
                observer.next(this.canCached(action));
                observer.complete();
            });
        } else {
            return new Observable((observer)=>{
                this.reloadPermissions().subscribe((results) => {
                    observer.next(this.canCached(action));
                    observer.complete();
                }, (error) => {
                    observer.error(error);
                });
            });
        }
    }

    private canCached(action:string|string[]):boolean {
        if (typeof action==='string'){
            return this.isAuthorized(action);
        } else {
            return this.isAuthorizedForList(action);
        }
    }

    private isAuthorized(action: string): boolean {
        return _.isEqual(_.intersection(this._permissions, [action]), [action]);
    }

    private isAuthorizedForList(actions: Array<string>): boolean {
        return _.isEqual(_.intersection(this._permissions, actions), actions);
    }



}
