import { MotifAclDirective } from './web-console-motif-acl.directive';
import { NgModule } from '@angular/core';
import { MotifACLService } from './web-console-motif-acl.service';
import { WebAdminMotifACLGuard } from './web-console-motif-acl.guard';

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
        MotifACLService, WebAdminMotifACLGuard
    ]
  })
  export class MotifACLModule { }



