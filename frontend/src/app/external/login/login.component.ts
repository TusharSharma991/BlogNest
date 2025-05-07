import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Router } from '@angular/router';
import { Component, ElementRef, Inject, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';


import { CommonService } from '../../common/common.service';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputTextModule, PasswordModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;


  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cs = inject(CommonService);

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }


  ngOnInit(): void {

    this.wakeUp();
  }

  onSubmit() {
    if (!this.loginForm.valid) {
      this.showSnackbar("Please fill all the values!");
      return;
    }
  
    const obj = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };
  
    this.cs.login(obj.username, obj.password).subscribe((res) => {
      const encryptedRes = res?.EncryptedResponse;
    
      if (encryptedRes?.status_code === 200) {
        const token = encryptedRes.data.token;
        const user = encryptedRes.data.user;
    
        localStorage.setItem('currentUser', JSON.stringify({ token, user }));

        this.showSnackbar("Login Successfull!");

        this.router.navigate(['/dashboard']);
    
      } else if (encryptedRes?.status_code === 404) {
        this.showSnackbar('Invalid Credentials!');
      } else {
        this.showSnackbar('Something went wrong!');
      }
    });
    
  }


  wakeUp() {
    this.cs.wakeUp().subscribe(
      (data: any) => {
        if (data?.EncryptedResponse?.status_code === 200) {

         
         
        }  else {
          // Handle other error statuses
          // this.openSnackbar("Unexpected error occurred while fetching blogs.");
        }
      },
    );
  }
  


  showSnackbar(message: string) {
    this.snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2000,
      panelClass: ['custom-snackbar']
    });
  }



  signUp() {
    this.router.navigate(['/signUp']);
  }

}
