import { Component, computed, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { DispatchService } from 'src/app/services/dispatch.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
    selector: 'app-dispatch-details-modal',
    standalone: true,
    imports: [
        CommonModule,
        DialogModule,
        ButtonModule,
        ProgressSpinnerModule,
        InputTextModule,
    ],
    templateUrl: './dispatch-details-modal.component.html',
    styleUrls: ['./dispatch-details-modal.component.sass']
})
export class DispatchDetailsModalComponent {
    @Input() showModal: any;    

    public readonly dispatchService = inject(DispatchService);
    public readonly utilsService = inject(UtilsService);

    dispatchSelected = computed(() => this.dispatchService.showModalSummary());

    recepcionImages = computed(() => 
        (this.dispatchSelected()?.images || []).filter(img => img.process === 'save_reception')
    );

    despachoImages = computed(() => 
        (this.dispatchSelected()?.images || []).filter(img => img.process === 'save_dispatch')
    );

    updateImages = computed(() => 
        (this.dispatchSelected()?.images || []).filter(img => img.process === 'update_dispatch')
    );

    showImagesModal(images: any) {
        this.utilsService.openImagesPreview(images);
    }

    closeModal() {
        this.dispatchService.closeSummary();
    }

}