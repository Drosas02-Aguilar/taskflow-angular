import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from '@angular/router';
import { AuthService } from "../../core/services/auth.service";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})

export class DashboardComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

get username(): string | null{
    return this.authService.username;
}

get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  logout(): void{
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

}
