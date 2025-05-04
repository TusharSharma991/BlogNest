import { Component, ElementRef, Inject, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { CommonService } from '../../common/common.service';
import { AccordionModule } from 'primeng/accordion';
import { TabViewModule } from 'primeng/tabview';
import { TextareaModule } from 'primeng/textarea';

import { Menu, MenuModule } from 'primeng/menu';

import { CommentThreadComponent } from '../comment-thread/comment-thread.component';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { catchError, map, Observable, of } from 'rxjs';
@Component({
  selector: 'app-blog-details',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    FormsModule,
    AccordionModule,
    TextareaModule,
    MenuModule,
  ],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.css'
})
export class BlogDetailsComponent {


  private cs = inject(CommonService);
  private snackBar = inject(MatSnackBar);

  currentUser : any;
  blog : any;
  comment : string = '';
  comments : any[] = [];
  additionalComment : string = '';
  isEditionalComment : boolean = false;
  activeCommentId: string | null = null;


  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';


  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.blog = data.blog;
  }


  ngOnInit(): void {


    let user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.currentUser = user.user;

    this.getComments();
  }


  postComment() {

    let obj = {
      content : this.comment,
      blog : this.blog._id,
    }


    this.cs.postWithAuth('comment/create', obj).subscribe(
      (data: any) => {
        if (data?.EncryptedResponse?.status_code === 201) {
          this.openSnackbar("comment posted successfully!");
          this.comment = '';
       
        } else if (data?.EncryptedResponse?.status_code === 400) {
          // Handle validation error (e.g., missing title or description)
          this.openSnackbar("Please fill all required fields.");
        } else if (data?.EncryptedResponse?.status_code === 401) {
          // Handle unauthorized error (e.g., invalid token or not logged in)
          this.openSnackbar("Unauthorized. Please login again.");
        } else if (data?.EncryptedResponse?.status_code === 500) {
          // Handle server error
          this.openSnackbar("Server error occurred. Please try again.");
        } else {
          // Handle unexpected error status
          this.openSnackbar("Unexpected error occurred.");
        }
      },
      (error) => {
        // Handle network or other errors
        console.error('Error during blog post submission:', error);
        this.openSnackbar("An error occurred. Please check your connection.");
      }
    );


  }


  getComments() {

      let blog = this.blog._id;
    

    this.cs.getWithAuth(`comment/getCommentsByBlogId/${blog}`).subscribe(
      (data: any) => {
        if (data?.EncryptedResponse?.status_code === 200) {

          const comments = data.EncryptedResponse.data;

          // Load avatars for each comment
          comments.forEach((comment: { user: { _id: string; }; avatar: string; }) => {
            this.getAvatar(comment.user._id).subscribe((url) => {
              comment.avatar = url || '../../../assets/maleAvatar.png';
            });
          });

          this.comments = comments;
         
        }  else {
          // Handle other error statuses
          // this.openSnackbar("Unexpected error occurred while fetching blogs.");
        }
      },
      (error) => {
        // Handle errors during the API call (e.g., network or server issues)
        console.error('Error during fetching blogs:', error);
        this.openSnackbar("An error occurred. Please check your connection.");
      }
    );
  }

  toggleAdditionalComment(commentId: string) {
    this.activeCommentId = this.activeCommentId === commentId ? null : commentId;
  }
  

  postAdditionalComment(commentId: string) {

    let obj = {
      content : this.additionalComment,
      blog : this.blog._id,
      parentComment : this.activeCommentId,
    }


    this.cs.postWithAuth('comment/create', obj).subscribe(
      (data: any) => {
        if (data?.EncryptedResponse?.status_code === 201) {
          this.openSnackbar("comment posted successfully!");
          this.additionalComment = '';
          this.activeCommentId = null;      
       
        } else if (data?.EncryptedResponse?.status_code === 400) {
          // Handle validation error (e.g., missing title or description)
          this.openSnackbar("Please fill all required fields.");
        } else if (data?.EncryptedResponse?.status_code === 401) {
          // Handle unauthorized error (e.g., invalid token or not logged in)
          this.openSnackbar("Unauthorized. Please login again.");
        } else if (data?.EncryptedResponse?.status_code === 500) {
          // Handle server error
          this.openSnackbar("Server error occurred. Please try again.");
        } else {
          // Handle unexpected error status
          this.openSnackbar("Unexpected error occurred.");
        }
      },
      (error) => {
        // Handle network or other errors
        console.error('Error during blog post submission:', error);
        this.openSnackbar("An error occurred. Please check your connection.");
      }
    );

  } 


  getAvatar(userId: string): Observable<string> {
    return this.cs.getWithAuth(`user/avatar/${userId}`).pipe(
      map((data: any) => {
        return data?.avatar?.full ? this.cs.baseURL + data.avatar.full : '';
      }),
      catchError(err => {
        // console.warn(`Error fetching avatar for ${userId}:`, err);
        return of(''); // fallback
      })
    );
  }
  


  openSnackbar(message: string) {
    this.snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 20000,
      panelClass: ['custom-snackbar']
    });
  }


}
