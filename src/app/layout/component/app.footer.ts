import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        hygienicflow by
        <a href="https://nodeang.com" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">nodeAng</a>
    </div>`
})
export class AppFooter {}
