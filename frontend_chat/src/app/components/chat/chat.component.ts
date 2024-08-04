import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserModel } from 'src/app/models/UserModel';
import { ChatMessage } from 'src/app/models/chat-message';
import { ChatService } from 'src/app/services/chat.service';
import { RoomsService } from 'src/app/services/rooms.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @Input() roomId: number | undefined;

  messageInput: string = '';
  userId: string = "";
  messageList: any[] = [];
  user1: UserModel = new UserModel();
  user2: UserModel = new UserModel();
  showChatComponent: boolean = false;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private userService: UsersService,
    private roomService: RoomsService
  ) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.params["userId"];
    const roomIdString = this.roomId ? this.roomId.toString() : "0";
    console.log("SALA ROOM CREADA: ", roomIdString);
    this.chatService.joinRoom(roomIdString);
    this.listenerMessage();
    this.findUsers();
  }

  /*findUsers() {
    this.userService.findUserById(Number(this.userId)).subscribe(data => {
      this.user1 = data;
      this.roomService.findChatsById(this.roomId).subscribe(room => {
        const otherUserId = (this.user1.id == room.user1) ? room.user2 : room.user1;
        this.userService.findUserById(Number(otherUserId)).subscribe(user2Data => {
          this.user2 = user2Data;
        });
      });
    });
  }  */

  findUsers() {
    this.userService.findUserById(Number(this.userId)).subscribe(data => {
      this.user1 = data;
      console.log('User1:', this.user1); // <-- Añadir esta línea
      this.roomService.findChatsById(this.roomId).subscribe(room => {
        const otherUserId = (this.user1.id == room.user1) ? room.user2 : room.user1;
        this.userService.findUserById(Number(otherUserId)).subscribe(user2Data => {
          this.user2 = user2Data;
          console.log('User2:', this.user2); // <-- Añadir esta línea
        });
      });
    });
  }

  sendMessage() {
    const roomIdString = this.roomId ? this.roomId.toString() : "0";
    const chatMessage = {
      message: this.messageInput,
      user: this.userId
    } as ChatMessage;
    this.chatService.sendMessage(roomIdString, chatMessage);
    this.messageInput = '';
  }

  /*listenerMessage() {
    this.chatService.getMessageSubject().subscribe((messages: any) => {
      this.messageList = messages.map((item: any) => ({
        ...item,
        message_side: item.user === this.userId ? 'sender' : 'receiver'
      }));
    });
  }  */

  listenerMessage() {
    this.chatService.getMessageSubject().subscribe((messages: any) => {
      console.log('Received messages:', messages); // <-- Añadir esta línea
      this.messageList = messages.map((item: any) => ({
        ...item,
        message_side: item.user === this.userId ? 'sender' : 'receiver'
      }));
    });
  }
  closeChat(): void {
    this.showChatComponent = !this.showChatComponent;
  }
}
