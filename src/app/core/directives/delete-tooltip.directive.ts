import { Directive, ElementRef, HostListener, Input, Renderer2, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appDeleteTooltip]',
  standalone: true
})
export class DeleteTooltipDirective implements OnDestroy {
  @Input('appDeleteTooltip') status!: string;

  private tooltipEl: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    // Force the host trash button to act as a relative anchor point
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.show();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.hide();
  }

  private show() {
    this.hide(); // Erase any lingering instances first

    // 1. Create a floating tooltip element container layout block
    this.tooltipEl = this.renderer.createElement('div');
    
    // Applying CSS properties to float above the trash button container block
    this.renderer.setStyle(this.tooltipEl, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipEl, 'bottom', '125%'); // Positions directly above the button
    this.renderer.setStyle(this.tooltipEl, 'left', '50%');
    this.renderer.setStyle(this.tooltipEl, 'transform', 'translateX(-50%)'); // Centers horizontally
    this.renderer.setStyle(this.tooltipEl, 'z-index', '9999');
    this.renderer.setStyle(this.tooltipEl, 'pointer-events', 'none'); // Prevents mouse hover stuttering

    const isHardDelete = this.status === 'DRAFT' || this.status === 'PENDING_APPROVAL';
    
    // 2. Select HTML templates explicitly depending on the status state
    if (isHardDelete) {
      this.tooltipEl!.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; color: #f87171; background-color: #1e293b; padding: 6px 12px; border-radius: 4px; font-size: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); white-space: nowrap;">
          <i class="pi pi-exclamation-triangle" style="color: #ef4444; font-size: 11px;"></i>
          <span>This order is in <strong>${this.status}</strong> status. It will be <strong>permanently removed</strong>.</span>
        </div>`;
    } else {
      this.tooltipEl!.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; color: #fbbf24; background-color: #1e293b; padding: 6px 12px; border-radius: 4px; font-size: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); white-space: nowrap;">
          <i class="pi pi-info-circle" style="color: #f59e0b; font-size: 11px;"></i>
          <span>This order is active. It will be marked as <strong>CANCELLED</strong> and inventory will revert.</span>
        </div>`;
    }

    // 3. Inject directly into the host button element space instead of the body root layout
    this.renderer.appendChild(this.el.nativeElement, this.tooltipEl);
  }

  private hide() {
    if (this.tooltipEl) {
      this.renderer.removeChild(this.el.nativeElement, this.tooltipEl);
      this.tooltipEl = null;
    }
  }

  ngOnDestroy() {
    this.hide(); // Clear memory on grid unmount updates
  }
}
