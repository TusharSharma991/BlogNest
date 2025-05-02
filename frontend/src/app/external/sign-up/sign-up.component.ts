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

import { CommonModule } from '@angular/common';
import { CommonService } from '../../common/common.service';


@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, InputTextModule,PasswordModule ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cs = inject(CommonService);

  signUpForm: FormGroup;
  error : string = '';

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';


  constructor(private fb: FormBuilder) {
    this.signUpForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  onSubmit() {
    this.error = '';

    if(!this.signUpForm.valid) {
      this.error = 'Please fill all values!';
      return;
    }

    const userData = this.signUpForm.value;
  
    // Check email format
    if (!this.isValidEmail(userData.email)) {
      this.error = 'Please enter a valid email address!';
      return;
    }

    // Check password length
    if (userData.password.length < 6) {
      this.error = 'Password length must be atleast 6 digits!';
      return;
    }
  
  
    // Check password match
    if (userData.password !== userData.confirmPassword) {
      this.error = 'Password and Confirm Password do not match!';
      return;
    }
  
    const obj = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      name: userData.name,
    };
  
    this.cs.postWithAuth('user/register', obj).subscribe((data: any) => {
      if (data?.EncryptedResponse?.status_code === 200) {
       
        this.router.navigate(['/login']);
        this.showSnackbar('Registration done successsfully!');



      } else if (data?.EncryptedResponse?.status_code === 409) {
        this.error = data.EncryptedResponse.message;
        
      }
    });
  }
  
  
  isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }
  
  isValidPhone(phone: string): boolean {
    const phonePattern = /^[0-9]{10}$/; // basic 10-digit number
    return phonePattern.test(phone);
  }
  
  

  showSnackbar(message: string) {
    this.snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2000,
      panelClass: ['custom-snackbar']
    });
  }
  



  login() {
    this.router.navigate(['/login']);
  }

}
