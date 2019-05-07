import { Observable } from 'rxjs/Observable';
import { Directive, ElementRef, OnInit, OnDestroy, Input, Query } from '@angular/core';
import * as _ from 'lodash';
import { MotifACLService } from './ngx-motif-acl.service';

const LOG_TAG = "[AclDirective] ";

@Directive({
    selector: '[motif-acl]'
})
export class AclDirective implements OnInit, OnDestroy {

    @Input("motif-acl") actionList: Array<string> = [];
    @Input("motif-acl-hidden") aclHidden: boolean = false; //hide the element (it will be only disabled if false)

    private _observer: MutationObserver;
    private _changesLock: boolean;

    constructor(private domElement: ElementRef, private aclService:MotifACLService) {
    }

    ngOnInit(): void {
        this.observeForChanges();
        this.processNodes();
    }

    private observeForChanges() {
        console.trace(LOG_TAG + "observeForChanges called");
        this._observer = new MutationObserver((mutations) => {
            if (!this._changesLock) {
                this.processNodes();
                //console.trace(LOG_TAG + "Mutations: ", mutations);
            }
        });

        this._observer.observe(this.domElement.nativeElement, {
            childList: true,
            subtree: true
        });
    }

    private processNodes() {
        this._changesLock = true;

        this.can().subscribe((can:boolean)=>{
          if (!can){
            this.domElement.nativeElement.setAttribute("acl-disabled", true);
            this.domElement.nativeElement.setAttribute("disabled", "");
            if (this.aclHidden){
                this.domElement.nativeElement.style.display = "none";
            }
            this.disableInputs();
            this._changesLock = false;
          }
        }, (error) =>{
          console.error(LOG_TAG + "ProcessNodes error: ", error);
          this._changesLock = false;
        });
        console.trace(LOG_TAG + "Directive called for ", this.domElement);
        console.trace(LOG_TAG + "ActionList:", this.actionList);
    }

    disableInputs() {
        this.disableForSelector("input");
        this.disableForSelector("button");
        this.disableForSelector("label");
        this.disableForSelector("kendo-combobox");
        this.disableForSelector("kendo-dropdownlist");
    }

    disableForSelector(selector: string) {
        let children = this.domElement.nativeElement.querySelectorAll(selector);
        console.trace(LOG_TAG + "disableForSelector " + selector + " :", children);
        children.forEach(childElement => {
            childElement.setAttribute("disabled", "");
            childElement.setAttribute("acl-disabled", true);
            if (this.aclHidden){
                childElement.style.display = "none";
            }
        });
    }

    ngOnDestroy(): void {
    }

    private can(): Observable<boolean> {
      return this.aclService.can(this.actionList);
    }

}

