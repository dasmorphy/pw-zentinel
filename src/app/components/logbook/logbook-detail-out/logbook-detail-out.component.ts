import { CommonModule } from "@angular/common";
import { Component, computed, inject, Input, OnDestroy, OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AvatarModule } from "primeng/avatar";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { EventSourceService } from "src/app/services/event-source.service";
import { LogbookService } from "src/app/services/logbook.service";
import { UtilsService } from "src/app/services/utils.service";
import { LogBookDetailsModalComponent } from "../../modals/logbook-details-modal/logbook-details-modal.component";
import { filter, Subscription } from "rxjs";
import { AuthService } from "src/app/services/auth.service";

@Component({
    selector: 'app-logbook-detail-out',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        AvatarModule,
        InputTextModule,
        DropdownModule,
        InputNumberModule,
        FormsModule,
        ReactiveFormsModule,
        ProgressSpinnerModule,
        DialogModule,
    ],
    templateUrl: './logbook-detail-out.component.html',
    styleUrls: ['./logbook-detail-out.component.sass'],
})

export class LogbookDetailOutComponent {
    @Input() logbookData: any = null;
    
}