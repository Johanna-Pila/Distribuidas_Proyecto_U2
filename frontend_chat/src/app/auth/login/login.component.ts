import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserModel } from 'src/app/models/UserModel';
import { UsersService } from 'src/app/services/users.service';
import { RegistroComponent } from '../registro/registro.component';
import { ChatsModel } from 'src/app/models/ChatsModel';
import { RoomsService } from 'src/app/services/rooms.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  hide = true;
  private listUsers: UserModel[] = [];
  private user: UserModel = new UserModel();
  userName: string | undefined;
  password: string | undefined;
  private connectedListUsers: UserModel[] = [];
  private userId: number | undefined;
  private listRooms: ChatsModel[] = [];



  constructor(
    private router: Router,
    private userService: UsersService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private roomsService: RoomsService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.findAllUsers().subscribe(data => {
      this.listUsers = data;
      console.log(this.listUsers);
    });
  }

  goToChat() {
    let auxUser: UserModel = new UserModel();
    if (this.verifyUser()) {
      this.router.navigate(['/home', this.user.id]);
      this.userService.findUserById(this.user.id).subscribe(data =>{
        auxUser=data;
        auxUser.state=true;
        //this.userService.saveUser(auxUser).subscribe(data => {});
        this.loadUsers();
        this.loadRooms();
        this.createRooms();
      });

    } else {
      this.snackBar.open("❌ Usuario o contraseña incorrecta", "Cerrar", {
        duration: 3000
      });
    }
  }

  createRooms() {
    let room: ChatsModel = new ChatsModel();
    room.user1 = this.userId;
    try {
      this.connectedListUsers.forEach((user: UserModel) => {
        room.user2 = user.id;
        if (this.verifyRooms(room.user2)) {
          this.roomsService.saveChats(room).subscribe({
            next: () => {
              console.log("Sala creada para el usuario con ID: ", user.id);
            },
            error: (error) => {
              console.log("Error al crear sala para el usuario con ID: ", user.id, error);
            }
          });
        }else{
          console.log("Ya existe la sala: ", room);
        }

      });
    } catch (error) {
      console.error(error);
    }

  }

  loadRooms() {
    this.roomsService.findAllChats().subscribe(data => {
      this.listRooms = data;
    });
  }

  verifyRooms(room: number | undefined): boolean {
    this.loadUsers();
    this.loadRooms();
    for (let i = 0; i < this.listRooms.length; i++) {
      if ((this.userId == this.listRooms[i].user1) || (this.userId == this.listRooms[i].user2)) {
        if( room == this.listRooms[i].user1 || room == this.listRooms[i].user2){
          return false;
        }
        
      }
    }
    return true;
  }

  verifyUser(): boolean {
    let name = this.userName;
    let password = this.password;
    for (let i = 0; i < this.listUsers.length; i++) {
      let decryptedPassword = this.decryptPassword(String(this.listUsers[i].password));
        if (name == this.listUsers[i].name && password == decryptedPassword) {
            this.user = this.listUsers[i];
            return true;
        }
    }
    return false;
}
  

  openSignIn(): void {
    const dialogRef = this.dialog.open(RegistroComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.loadUsers();
    });
  }

  decryptPassword(encryptedPassword: string): string {
    const decodedBytes = atob(encryptedPassword);
    return decodedBytes;
}

}
