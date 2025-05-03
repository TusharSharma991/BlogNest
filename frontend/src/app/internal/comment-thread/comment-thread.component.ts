import { Component, Input } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-comment-thread',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, InputTextarea, ButtonModule, CommonModule],
  templateUrl: './comment-thread.component.html',
  styleUrls: ['./comment-thread.component.css']
})
export class CommentThreadComponent {
  @Input() comment: any;
  @Input() activeCommentId: string | null = null;
  @Input() additionalComment: string = '';

  @Input() toggleAdditionalComment!: (id: string) => void;
  @Input() postAdditionalComment!: (id: string) => void;
}
