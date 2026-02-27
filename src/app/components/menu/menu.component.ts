import { Component, OnInit, computed, inject } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuService } from 'src/app/services/menu.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { LogbookService } from 'src/app/services/logbook.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    PanelMenuModule,
    DialogModule,
    DropdownModule,
    ProgressSpinnerModule
  ],
  // providers: [MessageService],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.sass']
})
export class MenuComponent implements OnInit {

  private readonly authService = inject(AuthService)
  private readonly menuService = inject(MenuService);
  private readonly logbookService = inject(LogbookService);
  private readonly utilsService = inject(UtilsService);

  toggle = computed(() => this.menuService.toggle());
  user_permissions: string[] = [];
  user_session: any;
  showGenerateReport: boolean = false;
  isLoading: boolean = false;
  optionsReport = [
    'Pdf', 'Excel'
  ];
  optionSelected = '';


  items = computed(() => {
    return [
      {
        label: 'Inicio',
        icon: 'pi pi-chart-pie',
        routerLink: ['dashboard'],
        command: () => { this.clickHiddenToggle(true) },
      },
      {
        label: 'Bitácoras',
        icon: 'pi pi-list-check',
        // visible: this.user_permissions?.includes('VENTAS'),
        command: () => { this.clickHiddenToggle(true) },
        items: [
          {
            label: 'Todas las bitácoras',
            icon: 'pi pi-list-check',
            // visible: this.user_permissions?.includes('VENTAS_VER_TODAS'),
            routerLink: ['tablero-bitacoras'],
            command: () => { this.clickHiddenToggle() }
          },
          {
            label: 'Nuevo registro de entrada',
            icon: 'pi pi-file-check',
            // visible: this.user_permissions?.includes('VENTAS_VER_TODAS'),
            routerLink: ['reporte-entrada'],
            command: () => { this.clickHiddenToggle() }
          },
          {
            label: 'Nuevo registro de salida',
            icon: 'pi pi-file-export',
            // visible: this.user_permissions?.includes('VENTAS_VER_TODAS'),
            routerLink: ['reporte-salida'],
            command: () => { this.clickHiddenToggle() }
          },
        ]
      },
      {
        label: 'Reportes',
        icon: 'pi pi-file',
        // visible: this.user_permissions?.includes('VENTAS'),
        command: () => { this.clickHiddenToggle(true) },
        items: [
          // {
          //   label: 'Listado de reportes',
          //   icon: 'pi pi-fw pi-table',
          //   // visible: this.user_permissions?.includes('VENTAS_VER_TODAS'),
          //   command: () => {
          //     this.clickHiddenToggle()
          //     this.showGenerateReport = true;
          //   }
          // },
          {
            label: 'Generar reportes',
            icon: 'pi pi-fw pi-table',
            // visible: this.user_permissions?.includes('VENTAS_VER_TODAS'),
            // routerLink: ['ventas'],
            command: () => {
              this.clickHiddenToggle()
              this.showGenerateReport = true;
            }
          }
          // {
          //   label: 'Nuevo registro de salida',
          //   icon: 'pi pi-fw pi-table',
          //   // visible: this.user_permissions?.includes('VENTAS_VER_TODAS'),
          //   routerLink: ['ventas'],
          //   command: () => { this.clickHiddenToggle()}
          // },
        ]
      },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  })

  ngOnInit() {
    const user: any = localStorage.getItem('user');
    // this.user_session = JSON.parse(decrypt(user));
    this.calculateUserPermissions();
  }

  clickHiddenToggle(flag?: boolean) {
    const screenWidth = window.innerWidth;

    if (screenWidth <= 600 && !flag) {
      this.menuService.changeToggle();
    } else if (screenWidth > 600 && !this.toggle()) {
      this.menuService.changeToggle();
    }


  }

  calculateUserPermissions() {
    // Lógica para calcular y retornar los permisos del usuario
    if (this.user_session && this.user_session?.groups) {

      const rolePermissionsMap: { [key: string]: string } = {
        'VENTAS': 'VENTAS',
        'GESTION-USUARIO': 'GESTION-USUARIO',
        'PROSPECCION': 'PROSPECCION',
        'OFERTA': 'OFERTA',
        'DIRECCION': 'DIRECCION',
        'CONDICIONES-COMERCIALES': 'CONDICIONES-COMERCIALES',
        'PRODUCTOS': 'PRODUCTOS',
        'ENTIDADES-EXTERNAS': 'ENTIDADES-EXTERNAS',
        'PROCESOS': 'PROCESOS',
        'SEGURIDAD': 'SEGURIDAD',
        'METRICAS': 'METRICAS'
      };

      for (let permisos of this.user_session.groups) {
        const roles = permisos.realmRoles;

        if (roles?.length > 0) {
          for (let rol of roles) {
            const uppercaseRol = rol.toUpperCase();

            // Iterar sobre las claves (prefijos) del objeto rolePermissionsMap
            for (let prefix in rolePermissionsMap) {
              if (uppercaseRol.startsWith(prefix) && !this.user_permissions.includes(rolePermissionsMap[prefix])) {
                this.user_permissions.push(rolePermissionsMap[prefix]);
              }
            }

            this.user_permissions.push(uppercaseRol);
          }
        }
      }

      // this.userService.user_permissions_signal.set(this.user_permissions)
    }

  }

  changeOptionReport(event: any) {
    this.optionSelected = event?.value;
  }

  generateReport() {
    this.showGenerateReport = false;
    this.isLoading = true;

    const isExcel = this.optionSelected === 'Excel';

    const request$ = isExcel
      ? this.logbookService.getGenerateReportExcel()
      : this.logbookService.getGenerateReportPdf();

    const defaultName = isExcel ? 'reporte_excel' : 'reporte_pdf';

    request$.subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.utilsService.downloadFile(response, defaultName);
      },
      error: () => {
        this.isLoading = false;
        this.utilsService.onError('Error al generar el archivo');
      }
    });
  }

  logout() {
    this.authService.logout()
  }

  toggleMenu() {
    this.menuService.changeToggle();
  }

  expandedSidenav() {
    if (!this.toggle()) {
      this.menuService.changeToggle();
    }
  }
}
