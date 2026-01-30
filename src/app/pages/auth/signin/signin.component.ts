import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ToastModule,
    DividerModule,
    FormsModule,
  ],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.sass'],
  
})
export class SigninComponent implements OnInit {

  

  constructor(
    
  ) {}


  ngOnInit(){
    
  }

  ngOnDestroy() {

  }

  

}
