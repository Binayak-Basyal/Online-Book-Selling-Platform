import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { UsersComponent } from 'src/app/user/user-feature/messaging/users/users.component';
import { MessagingService } from 'src/app/services/messaging.service';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [RouterOutlet, UsersComponent],
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss']
})
export class MessagingComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messagingService: MessagingService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['receiver']) {
        this.messagingService.getConversationsList().subscribe(res => {
          const users = (res.data || []).map((item: any) => item.user);
          const targetUser = users.find((user: any) => user.email === params['receiver']);
          if (targetUser) {
            this.router.navigate(['conversation', targetUser.id], {
              relativeTo: this.route,
              queryParams: {
                sender: params['sender'],
                receiver: params['receiver'],
                receiverName: params['receiverName'] || 'Seller'
              }
            });
          } else {
            // Try to create a new conversation if not found
            this.messagingService.createConversationByEmail(params['receiver']).subscribe((newUser: any) => {
              const userId = newUser?.data?.id; // <-- fix here
              if (userId) {
                this.router.navigate(['conversation', userId], {
                  relativeTo: this.route,
                  queryParams: {
                    sender: params['sender'],
                    receiver: params['receiver'],
                    receiverName: params['receiverName'] || 'Seller'
                  }
                });
              } else {
                // handle error, user not found
              }
            });
          }
        });
      }
    });
  }
}
