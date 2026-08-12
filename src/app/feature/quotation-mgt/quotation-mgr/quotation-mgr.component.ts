import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NgxPermissionsModule } from 'ngx-permissions';
import { firstValueFrom, Subscription } from 'rxjs';

import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { AuthService } from '../../../core/services/auth.service';
import { QuotationService } from '../../../core/services/quotation.service';
import { IQuotation, IQuotationItem, QuotationStatus } from '../../../core/models/quotation.model';

import { QuotationFormComponent } from '../quotation-form/quotation-form.component';
import { QuotationGridComponent } from '../quotation-grid/quotation-grid.component';

import { RfqConversionService } from '../../../core/services/rfq-conversion.service';
import { DashboardTabService } from '../../../core/services/dashboard-tab.service';

@Component({
  selector: 'app-quotation-mgr',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ButtonModule,
    NgxPermissionsModule,
    QuotationFormComponent,
    QuotationGridComponent
  ],
  providers: [MessageService],
  templateUrl: './quotation-mgr.component.html',
  styleUrl: './quotation-mgr.component.scss'
})
export class QuotationMgrComponent implements OnInit {
  // 🌟 Add this @Input property at the top of your QuotationMgrComponent class
  @Input() isPortalContext: boolean = false;
  readonly FormOpMode = FormOpMode;
  tenantId!: number;
  clientId!: number;
  @Input() currentCustomerId!:number; //Note: Purposely we have taken this additional variable, 
  //                                    //clientId is for loggend users clientid bcos  this.clientId = this.authServ.getClientId()!; 
                                        // and currentCustomerId is for Admin may be viewing profiletabs, and its passed from clientProfileTabs of customer module
                                        //if clientId exists we need to ignore currentCustomerId
   private conversionSub!: Subscription;
  
   quotations: IQuotation[] = [];
  currOpMode: FormOpMode = FormOpMode.View;
  selectedQuotation: any = null;

  private authServ = inject(AuthService);
  private quotationService = inject(QuotationService);
  private rfqConversionService=inject(RfqConversionService);
  private messageService = inject(MessageService);
  private dashboardTabService=inject(DashboardTabService)
  private cd = inject(ChangeDetectorRef);

  constructor(){
    console.log('cQuotationMgrComponent instance created in memory');
    
  }
  ngOnInit(): void {
    this.tenantId = this.authServ.getTenantId()!;
    this.clientId = this.authServ.getClientId()!;
    this.loadQuotationsList();
    
    // Sync with fallback structural mode trackers if existing in session scopes
    const savedMode = localStorage.getItem('currOpMode') as FormOpMode;
    if (savedMode && savedMode === FormOpMode.View) {
      this.currOpMode = FormOpMode.View;
    }

 console.log('2. QuotationMgr: Initialized and reading cached stream state.')
      this.conversionSub =this.rfqConversionService.convertRfq$
.subscribe(async rfq => {

    if (!rfq) {
        return;
    }

    try {

        const quotation =
            await firstValueFrom(
                this.quotationService
                    .convertRFQToQuotation(rfq.id)
            );

        this.currOpMode = FormOpMode.Update;
console.log('seletdquotation:',this.selectedQuotation);

        this.selectedQuotation = quotation;

      // this.activeTabIndex = 1;
this.dashboardTabService.activate("Quotations"); this.currOpMode=FormOpMode.Update;

        this.loadQuotationsList();

    }
    catch(ex){

        console.error(ex);

    }

});

  }


  //pending:i think its notinuse
  private mapRfqToQuotationWorkflow(rfqRecord: any): void {
    // 2. Map structure safely (preventing undefined/null breaks)
    const mappedQuotation: Partial<IQuotation> = {
      tenantId: rfqRecord.tenantId,
      clientId: rfqRecord.clientId,
      clientName: rfqRecord.clientName || 'RFQ Client Workspace', // Fallback or lookup fallback
      status: QuotationStatus.DRAFT, // Always initialize conversions as raw editable drafts
      version: 1,
      isActive: true,
      remarksNotes: `Converted from RFQ Number: ${rfqRecord.clientRFQNumber}.\nClient Notes: ${rfqRecord.clientNotes || 'None'}`,
      totalAmount: Number(rfqRecord.totalAmount) || 0,
      
      // 3. Map line-item children arrays cleanly
      items: (rfqRecord.items || []).map((rfqItem: any) => {
        return {
          productId: rfqItem.productId,
          productVariantId: rfqItem.productVariantId,
          prodName: rfqItem.prodName,
          sku: rfqItem.sku,
          quantity: Number(rfqItem.quantity) || 0,
          
          // Inject mandatory quotation specific default fallbacks 
          unit: 'Pcs', 
          price: 0.00, // Left zeroed out for wholesaler estimation entry
          gstPercentage: 0.00,
          discount: 0.00,
          totalItemAmount: 0.00,
          description: null,
          targetPrice: null,
          appliedLineDiscountId: null,
          customAttributes: null
        } as IQuotationItem;
      })
    };

    // 4. Force state variables into standard creation flow context
    this.selectedQuotation = mappedQuotation;

    console.log('.....now selectedQuotation: ',this.selectedQuotation);
    
    
    // Explicitly set to creation mode instead of FormOpMode.Update!
    // This targets your application POST endpoint rather than PUT endpoint
    this.currOpMode = FormOpMode.Add; 
    localStorage.setItem('currOpMode', this.currOpMode);
    
    // 5. If your internal entry sub-component wraps an Angular FormGroup, 
    // patch the control values directly here right after rendering:
    // this.quotationForm.patchValue(this.selectedQuotation);

    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.conversionSub) this.conversionSub.unsubscribe();
  }


  async loadQuotationsList(): Promise<void> {
    try {
      // 1. Identify user context from authentication tokens
      this.tenantId = this.authServ.getTenantId()!;
      this.clientId = this.authServ.getClientId()!;
      
      // 2. Safely assume if clientId exists and user is in ClientPortal, restrict lookup data scope.
      // If Admin is logged in, authServ.getClientId() should return null/undefined/0.
      var searchClientId = this.clientId ? this.clientId : undefined;
      
      //if not logged in users clientId, then only for for currentCustomerId
      if(!this.clientId){
        searchClientId=this.currentCustomerId;
      }
  console.log('isPortalContext is:',this.isPortalContext);
      // 3. Request tailored payload from backend
      this.quotations = await firstValueFrom(
        this.quotationService.getQuotations(this.tenantId, searchClientId, this.isPortalContext)
      );
      
      this.cd.detectChanges();
    } catch (err: any) {
      this.showToast('error', 'Execution Error', err.message || 'Failed loading profiles.');
    }
  }

  onAddTriggered(): void {
    this.selectedQuotation = null;
    this.currOpMode = FormOpMode.Add;
    localStorage.setItem('currOpMode', this.currOpMode);
    this.cd.detectChanges();
  }

  onEditTriggered(record: any): void {
    this.selectedQuotation = record;
    // 🌟 INTERCEPT STATE MACHINE MODE HERE:
    this.currOpMode = this.isPortalContext ? FormOpMode.PortalNegotiation : FormOpMode.Update;
    localStorage.setItem('currOpMode', this.currOpMode);
    this.cd.detectChanges();
  }

  onOperationCancelled(): void {
    this.currOpMode = FormOpMode.View;
    localStorage.setItem('currOpMode', this.currOpMode);
    this.selectedQuotation = null;
    this.cd.detectChanges();
  }

  async onOperationSaved(message: string): Promise<void> {
    this.showToast('success', 'Success', message);
    this.currOpMode = FormOpMode.View;
    localStorage.setItem('currOpMode', this.currOpMode);
    this.selectedQuotation = null;
    await this.loadQuotationsList();
  }

async handleFinalize(submissionPayload: any): Promise<void> {

    try {

        let targetId = submissionPayload.id;

        // Save current changes first
        if (
            this.currOpMode === FormOpMode.Update &&
            targetId
        ) {

            await firstValueFrom(
                this.quotationService.updateQuotation(
                    targetId,
                    submissionPayload
                )
            );

        } else if (!targetId) {

            const freshQuote =
                await firstValueFrom(
                    this.quotationService.createQuotationClean(
                        submissionPayload
                    )
                );

            targetId = freshQuote.id;
        }

        // Finalize = Submit for Approval
        // DRAFT -> PENDING_APPROVAL
        await firstValueFrom(
            this.quotationService.submitQuotationForApproval(
                targetId
            )
        );

        this.showToast(
            'success',
            'Submitted for Approval',
            'Quotation has been successfully submitted for approval.'
        );

        this.currOpMode = FormOpMode.View;

        this.loadQuotationsList();

    } catch (error: any) {

        this.showToast(
            'error',
            'Submission Failed',
            error.message ||
            'Could not submit quotation for approval.'
        );
    }
}

// ==========================================
// 2. HANDLE APPROVAL PIPELINE
// ==========================================
async handleApprove(quoteId: number): Promise<void> {
  try {
    // Progress quote status to APPROVED (No stock calculations)
    await firstValueFrom(
      this.quotationService.approveQuotation(quoteId)
    );

    this.showToast('success', 'Approved', 'Quotation verified and marked as ready for conversion.');
    this.currOpMode = FormOpMode.View;
    this.loadQuotationsList(); // Refresh data grid
  } catch (error: any) {
    this.showToast('error', 'Approval Failed', error.message || 'Could not complete the quotation approval pipeline.');
  }
}


// ==========================================
// 2. HANDLE SEND PIPELINE
// ==========================================
async handleSend(quoteId: number): Promise<void> {
  try {
    // Progress quote status to APPROVED (No stock calculations)
    await firstValueFrom(
      this.quotationService.sendQuotation(quoteId)
    );

    this.showToast('success', 'Sent', 'Quotation sent');
    this.currOpMode = FormOpMode.View;
    this.loadQuotationsList(); // Refresh data grid
  } catch (error: any) {
    this.showToast('error', 'Approval Failed', error.message || 'Could not complete the quotation approval pipeline.');
  }
}


  showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}
