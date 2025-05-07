import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListsComponent } from './lists/lists.component';
import { FiltersComponent } from './filters/filters.component';
import { LoginComponent } from './auth/login/login.component';
import { RouterModule } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Filter } from './models/Filter/filter';
import { TodoService } from './todo.service';
import { Color } from './models/color/color';
import { Observable, of, Subscription } from 'rxjs';
import { RegisterComponent } from './auth/register/register.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ListsComponent, FiltersComponent, LoginComponent, RegisterComponent, PageNotFoundComponent, RouterModule, CommonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'project';
  filters: Filter[] = [];
  color: Color = new Color()

  route: string = '';
  useNavBar: boolean = true;
  isAdmin: boolean = false;

  messages: any[] = [];
  subscription: Subscription;
  loginSub: Subscription;
  adminSub!: Subscription;
  colorSub!: Subscription;
  filterSub!: Subscription;

  constructor(
    private todoService: TodoService, 
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {

        this.route = event.url.slice(1);

        if(this.route.startsWith("home") || this.route == "settings" || this.route== "filters"){
          this.useNavBar = true;
        } else {
          this.useNavBar = false;
        }
      });
      
      this.subscription = this.todoService.onMessage().subscribe({
        next: (message) => {
          if (message) {
              this.messages.push(message);
      
              if(message.text == "filter"){
                this.onGetFilters();
              } else if (message.text == "color"){
                this.onGetColors();
              } else if (message.text.startsWith('image:')){
                this.onGetImage();
              }
          } else {
              this.messages = [];
          }
        },
        error: error => {
          console.error("Error occurred:", error);
        }
      }); 

      this.loginSub = this.authService.onMessage().subscribe({
        next: (message) => {
          if (message && message.text === "login") {
            this.onGetAdmin();
            this.onGetFilters();
          }
        }
      }); 
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.loginSub.unsubscribe();
    this.adminSub.unsubscribe();
    this.isAdmin = false;

    if(this.colorSub)
    this.colorSub.unsubscribe();

    if(this.filterSub)
      this.filterSub.unsubscribe();
  }

  ngOnInit(): void {
    this.onGetAdmin();
    this.onGetFilters();
    this.onGetColors();
    this.onGetImage();
  }

  onGetAdmin(): void {
    this.adminSub = this.authService.getAdmin()
    .subscribe( admin => {
      this.isAdmin = admin ? true : false;
      console.log(this.isAdmin);
    });
  }

  onGetImage(): void {
    this.todoService.getFileUrl()
      .then(
      (url) => {
        document.documentElement.style.setProperty('--background-image', `url('${url}')`);
      },
      (error) => {
        console.error("Error fetching file:", error);
      }
    );
  }


  onGetFilters(): void {
    this.filterSub = this.todoService.getFilters().subscribe({
      next: (filters) => {
        this.filters = filters ? filters : [];
      }
    })
  }

  onGetColors(): void {
    this.colorSub = this.todoService.getColor()
    .subscribe( color => {
      if(color){
        this.color = color;
        this.updateDynamicStyles();
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.isAdmin = false;

    if (this.adminSub) {
      this.adminSub.unsubscribe();
    }
  }

  updateDynamicStyles(): void {
    document.documentElement.style.setProperty('--tmenu-color', this.color.tMenu);
    document.documentElement.style.setProperty('--tmenu-hover-color', this.darkenColor(this.color.tMenu, 10));
    document.documentElement.style.setProperty('--smenu-color', this.color.sMenu);
    document.documentElement.style.setProperty('--smenu-hover-color', this.darkenColor(this.color.sMenu, 10));
    document.documentElement.style.setProperty('--menuBG-color', this.color.menuBG);
  }

  darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16),
          amt = Math.round(2.55 * percent),
          R = (num >> 16) - amt,
          G = (num >> 8 & 0x00FF) - amt,
          B = (num & 0x0000FF) - amt;
    return `#${((1 << 24) + (R < 255 ? R < 1 ? 0 : R : 255) * (1 << 16) + (G < 255 ? G < 1 ? 0 : G : 255) * (1 << 8) + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1).toUpperCase()}`;
  }

}
