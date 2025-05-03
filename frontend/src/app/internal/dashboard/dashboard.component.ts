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
import { InputTextarea } from 'primeng/inputtextarea';

import { Menu, MenuModule } from 'primeng/menu';


import { ImageCropperComponent } from 'ngx-image-cropper';
import { ImageCroppedEvent } from 'ngx-image-cropper';

import { MatMenuModule } from '@angular/material/menu';
import { BlogDetailsComponent } from '../blog-details/blog-details.component';

import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-dashboard',
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
    MenuModule,
    InputTextModule,
    ImageCropperComponent,
    MatMenuModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {


  private cs = inject(CommonService);
  private snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);

  blogForm!: FormGroup;
  displayDialog: boolean = false;
  blogs: any[] = [];
  currentUser : any;

  selectedFilter: number = 0; // 0 = All, 1 = My Blogs


  imageChangedEvent: any = '';
  croppedImage: string = '';
  showCropper = false;
  userAvatarUrl : any;
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedBlog: any;

  menuItems = [
    { label: 'Edit', icon: 'pi pi-pencil', command: () => this.editBlog(this.selectedBlog) }
  ];


  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  isEditBlog: boolean = false;



  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {


    let user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.currentUser = user.user;

    // Initialize the form
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
    });

    this.getBlogs();
    this.getAvatar();
    

  }


  openCreateBlogDialog() {
    this.blogForm.reset();
    this.displayDialog = true;
  }

  onSubmit() {
    if (this.blogForm.valid) {
      const blogData = this.blogForm.value;

      this.cs.postWithAuth('blog/create', blogData).subscribe(
        (data: any) => {
          if (data?.EncryptedResponse?.status_code === 201) {
            this.openSnackbar("Blog posted successfully!");
            this.onCancel();
            this.filterBlogs(this.selectedFilter);
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
    } else {
      // Handle form validation errors (fields not filled correctly)
      this.openSnackbar("Please complete the form correctly before submitting.");
    }
  }

  getBlogs() {
    this.cs.getWithAuth('blog/getBlogs').subscribe({
      next: (data: any) => {
        if (data?.EncryptedResponse?.status_code === 200) {
          const blogs = data.EncryptedResponse.data;
  
          this.blogs = blogs.map((blog: any) => {
            const avatar = blog.createdBy?.avatar?.icon
              ? this.cs.baseURL + blog.createdBy.avatar.icon
              : '../../../assets/maleAvatar.png';
            return { ...blog, avatarUrl: avatar };
          });
        }
      },
      error: (err) => {
        console.error('Error fetching blogs:', err);
      }
    });
  }
  
  updateBlog() {

    let obj = {
      blog_id : this.selectedBlog._id,
      updatedData : this.blogForm.value,
    }

    
    this.cs.postWithAuth('blog/updateById', obj).subscribe(
      (data: any) => {
        if (data?.EncryptedResponse?.status_code === 200) {
          this.openSnackbar("Blog updated successfully!");
          this.onCancel();
          this.filterBlogs(1);
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


  getMyBlogs() {

    this.blogs = [];

    this.cs.getWithAuth('blog/getMyBlogs').subscribe(
      (data: any) => {
        if (data?.EncryptedResponse?.status_code === 200) {
          const blogs = data.EncryptedResponse.data;
  
          this.blogs = blogs.map((blog: any) => {
            const avatar = blog.createdBy?.avatar?.icon
              ? this.cs.baseURL + blog.createdBy.avatar.icon
              : '../../../assets/maleAvatar.png';
            return { ...blog, avatarUrl: avatar };
          });
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


  filterBlogs(filter: number) {
    this.selectedFilter = filter;
  
    if (filter === 0) {
      this.getBlogs();
    } else {
      this.getMyBlogs();
    }
  }

  openMenu(event: MouseEvent, blogId: string, menu: Menu) {
    // this.selectedBlogId = blogId;
  
    setTimeout(() => {
      menu.toggle(event); // ensure it's a MouseEvent
    }, 0);
  }
  
  


  editBlog(blog: any) {
    // Implement your blog edit logic here
    console.log("Edit blog with ID:", blog);

    this.selectedBlog = blog;

    this.blogForm.patchValue({
      title: blog.title,
      description: blog.description
    });

    this.isEditBlog = true;
    
    this.displayDialog = true;


  }
  

  // Close the dialog without saving
  onCancel() {
    this.displayDialog = false;
    this.blogForm.reset();
  }


  viewDetails(blog : any) {
    this.dialog.open(BlogDetailsComponent, {
      data: {
        blog: blog,
      },
      width: "800px",
      height: "fit-content",
      maxWidth: "90vw",
      maxHeight: "90vh",
      panelClass: 'custom-dialog-css'
    });
  }



  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        this.imageChangedEvent = event;
        this.showCropper = true;
      } else {
        alert('Please select a valid image.');
      }
    }
  }

  onImageCropped(event: ImageCroppedEvent): void {
    
    if (event?.blob) {
      // Convert the blob to base64
      this.blobToBase64(event.blob).then((base64: string) => {
        this.croppedImage = base64;
       
      }).catch(error => {
        console.error("Error converting blob to base64: ", error);
      });
    } else {
      console.warn("No blob found in cropped event.");
    }
  }
  
  // Helper function to convert Blob to Base64
  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);  // Convert the blob to base64
    });
  }
  
  

  

  saveCroppedImage(): void {
    if (!this.croppedImage) {
      console.warn("No cropped image to upload.");
      return;
    }
  
    const formData = new FormData();
    formData.append("avatar", this.base64ToFile(this.croppedImage, 'avatar.png'));
  
    this.cs.postFileWithAuth('user/uploadAvatar', formData).subscribe((data : any) => {
      if (data?.EncryptedResponse?.status_code === 200) {

        this.showCropper = false;
        this.getAvatar();
        this.openSnackbar("Image Uploaded Successfully!");
      } else {
        this.openSnackbar("Something went wrong!");
      }

    }, (error: any) => {
      console.error('Error uploading image:', error);
    });
  }
  
  
  
  
  private base64ToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
  
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
  
    return new File([u8arr], filename, { type: mime });
  }

  
  private resetFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }


  cancelCrop(): void {
    this.showCropper = false;
    this.croppedImage = '';
    this.imageChangedEvent = '';
    this.resetFileInput();
  }


  getIcon() {
    const userId = this.currentUser._id;
  
    this.cs.getWithAuth(`user/avatar/${userId}`).subscribe({
      next: (data: any) => {

        if (data?.avatar?.icon) {
          this.userAvatarUrl = this.cs.baseURL + data.avatar.full;

        } else {
          this.userAvatarUrl = ''; // fallback will be used in HTML
        }
      },
      error: (err) => {
        console.warn('Error fetching avatar:', err);
        this.userAvatarUrl = ''; // fallback will be used
      }
    });
  }

  getAvatar() {
    const userId = this.currentUser._id;
  
    this.cs.getWithAuth(`user/avatar/${userId}`).subscribe({
      next: (data: any) => {

        if (data?.avatar?.full) {
          this.userAvatarUrl = this.cs.baseURL + data.avatar.full;

        } else {
          this.userAvatarUrl = ''; // fallback will be used in HTML
        }
      },
      error: (err) => {
        console.warn('Error fetching avatar:', err);
        this.userAvatarUrl = ''; // fallback will be used
      }
    });
  }
  


  openSnackbar(message: string) {
    this.snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2000,
      panelClass: ['custom-snackbar']
    });
  }


}
