import { Component, Inject, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    AvatarModule,
    InputTextModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass'],
})
export class HeaderComponent implements OnInit{
  private readonly menuService = inject(MenuService);

  user:any;
  theme_selection: boolean = false;
  iconTheme: string = 'pi pi-sun'
  screenWidth: any = window.innerWidth;

  constructor(@Inject(DOCUMENT) private document: Document){}


  ngOnInit(){


  }

  // changeThemeColor() {
  //   const theme_local_storage = localStorage.getItem('theme');
  //   let theme: string = '';

  //   if (theme_local_storage) {
  //     this.theme_selection =  theme_local_storage === 'dark' ? false : true;
  //     theme = this.theme_selection ? 'dark' : 'light';
  //   }
    
  //   this.iconTheme = this.theme_selection ? 'pi pi-moon' : 'pi pi-sun';
  //   localStorage.setItem('theme', theme);
  //   this.changeThemeLara(theme);

  // }

  // changeThemeLara(theme: string) {
  //   let themeLink = this.document.getElementById('app-theme') as HTMLLinkElement;
  //   themeLink.href = 'lara-' + theme + '-blue' + '.css';
  // }

  toggleMenu() {
    this.menuService.changeToggle();
  }
}
