import { Component, type OnInit } from '@angular/core';

@Component({
  selector: 'app-layout-page',
  standalone: false,
  templateUrl: 'layoutPage.component.html',
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class LayoutPageComponent implements OnInit {

  ngOnInit(): void { }

}
