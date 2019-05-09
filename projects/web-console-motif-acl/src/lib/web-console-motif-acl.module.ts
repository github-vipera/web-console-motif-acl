import { MotifAclDirective } from './web-console-motif-acl.directive';
import { NgModule } from '@angular/core';
import { MotifACLService } from './ngx-motif-acl.service';

@NgModule({
    imports: [
    ],
    entryComponents:[
    ],
    declarations: [
      MotifAclDirective
    ],
    exports: [ MotifAclDirective ],
    providers: [
        MotifACLService
    ]
  })
  export class MotifACLModule { }



