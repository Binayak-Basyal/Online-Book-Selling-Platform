import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessagingService } from '../../../../services/messaging.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  originalUsers: any[] = [];
  loading = true;
  selectedUserId: number | null = null;
  userSearchForm: FormGroup;

  constructor(
    private messagingService: MessagingService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.userSearchForm = this.fb.group({
      search: ['']
    }
    )
  }
  onSubmit() {
    const searchTerm = this.userSearchForm.get('search')?.value;
    this.searchUsers(searchTerm);
  }

  ngOnInit(): void {
    this.messagingService.getConversationsList().subscribe(res => {
      this.originalUsers = (res.data || []).map((item: any) => item.user);
      this.users = [...this.originalUsers];
      this.loading = false;
    });

    // Handle query parameters to auto-select user
    this.route.queryParams.subscribe(params => {
      if (params['receiver']) {
        // Find and select the user based on email
        setTimeout(() => {
          const targetUser = this.users.find(user => user.email === params['receiver']);
          if (targetUser) {
            this.openConversation(targetUser);
          }
        }, 500); // Wait for users to load
      }
    });
  }

  openConversation(user: any) {
    this.selectedUserId = user.id;
    this.router.navigate(['conversation', user.id], { relativeTo: this.route.parent });
  }

  private searchUsers(searchTerm: string) {

    if (!searchTerm) {
      this.users = this.originalUsers
      return;
    }
    searchTerm = searchTerm.toLowerCase();
    this.users = this.originalUsers.filter(user => 
      user.full_name?.toLowerCase().includes(searchTerm)
    );
  }
}

