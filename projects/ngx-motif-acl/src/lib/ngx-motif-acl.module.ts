import { AclDirective } from './ngx-motif-acl.directive';
import { NgModule } from '@angular/core';
import { MotifACLService } from './ngx-motif-acl.service';

@NgModule({
    imports: [
    ],
    entryComponents:[
    ],
    declarations: [
        AclDirective
    ],
    exports: [ AclDirective ],
    providers: [
        MotifACLService
    ]
  })
  export class MotifACLModule { }



