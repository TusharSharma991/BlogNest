import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  group,
  query
} from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [
    trigger('routeAnimations', [
      transition((fromState, toState) => {
        return fromState !== toState;
      }, [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
          }),
        ], { optional: true }),
  
        query(':enter', [
          style({ transform: 'translateX({{ enterX }})', opacity: 0 }),
        ], { optional: true }),
  
        group([
          query(':leave', [
            animate('300ms ease-out', style({ transform: 'translateX({{ leaveX }})', opacity: 0 }))
          ], { optional: true }),
          query(':enter', [
            animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
          ], { optional: true })
        ])
      ], { params: { enterX: '100%', leaveX: '-100%' } })
    ])
  ]
  
  
})
export class AppComponent {
  title = 'frontend';

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'] || null;
  }
  
}
