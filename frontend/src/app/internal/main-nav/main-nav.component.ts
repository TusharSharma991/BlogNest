import { Component, ElementRef, Inject, inject, OnInit, Renderer2, ViewChild } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-nav',
  imports: [RouterOutlet],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.css'
})
export class MainNavComponent {
  private router = inject(Router);

  ngOnInit() {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (!currentUser) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login'])
  }

}
