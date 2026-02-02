import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "src/app/components/header/header.component";
import { MenuService } from 'src/app/services/menu.service';
import { MenuComponent } from "src/app/components/menu/menu.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    AvatarModule,
    InputTextModule,
    RouterOutlet,
    HeaderComponent,
    MenuComponent
],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.sass'],
})
export class LayoutComponent {

  toggle = computed(() => this.menuService.toggle());

  constructor(private menuService: MenuService) {}

}
