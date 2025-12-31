import { Component, inject, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
    selector: 'app-verify',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './verify.component.html',
    styleUrl: './verify.component.scss'
})

export class VerifyComponent implements OnInit{
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    loading = signal(true);
    success = signal(false);
    errorMessage = signal<string>('');

    ngOnInit(): void {
        const token = this.route.snapshot.queryParams['token'];

        

        if(!token){
            this.loading.set(false);
            this.errorMessage.set('No se proporcionó un token de verificación');
            return;
        }
        this.verifyAccount(token);
    }

    private verifyAccount(token: string): void{
        console.log('=== VERIFICANDO CUENTA ===');
  console.log('Token:', token);
  console.log('URL que se llamará:', `http://localhost:8080/api/auth/verify?token=${token}`);
  
       
       
        this.authService.verify(token).subscribe({
            next:(response)=> {
                this.loading.set(false);
                if(response.correct || response.status === 200){
                    this.success.set(true);
                }else{
                    this.errorMessage.set(response.errorMessage || 'Token inválido o expirado');
                }
            },
            error:(error)=>{


                 console.log('=== ERROR ===');
      console.log('Status:', error.status);
      console.log('Error completo:', error);
                this.loading.set(false);
                this.errorMessage.set(error.error?.errorMessage ||  'Error al verificar la cuenta' );
            }
        });
    }

    goToLogin(): void{
        this.router.navigate(['/auth/login'],{
            queryParams: {success: '¡Cuenta verificada! Ya puedes iniciar sesión.'}
        });

    }

}

