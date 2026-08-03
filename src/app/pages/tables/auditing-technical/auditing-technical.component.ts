import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AvatarModule } from "primeng/avatar";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { FileUploadModule } from "primeng/fileupload";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { SplitButtonModule } from "primeng/splitbutton";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { TooltipModule } from "primeng/tooltip";



@Component({
    selector: 'app-auditing-technical',
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
        ToastModule,
        ProgressSpinnerModule,
        DialogModule,
        FileUploadModule,
        TableModule,
        CardModule,
        TooltipModule,
        SplitButtonModule
    ],
    templateUrl: './auditing-technical.component.html',
    styleUrls: ['./auditing-technical.component.sass'],
})
export class AuditingTechnicalComponent {
    
}