import { Component } from '@angular/core';
import { Color } from '../models/color/color';
import { TodoService } from '../todo.service';
import { Observable, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  toggle: boolean = false;
  saved: boolean = false;

  defaultColor: Color = { defaultColor: 'yes', tMenu: '#588157', sMenu: '#C1D5A0', menuBG: '#FFFFFF', listBG: '#DAD7CD' };
  newColor: Color = { defaultColor: 'no', tMenu: '#588157', sMenu: '#C1D5A0', menuBG: '#FFFFFF', listBG: '#DAD7CD' };
  color: Color = new Color();

  checkedYes = false;
  checkedNo = false;

  messages: any[] = [];
  subscription: Subscription;
  colorSub!: Subscription;

  file!: File;

  constructor(private todoService: TodoService){
    this.subscription = this.todoService.onMessage().subscribe({
      next: (message) => {
        if (message) {
            this.messages.push(message);
    
            if (message.text == "color")
              this.onGetColor();
        } else {
            this.messages = [];
        }
      },
      error: error => {
        console.error("Error occurred:", error);
      }
    }); 
  }

  ngOnInit(): void {
    this.onGetColor();
  }

  ngOnDestroy(): void {
    if(this.colorSub)
      this.colorSub.unsubscribe();
  }

  onGetColor(): void {
    this.colorSub = this.todoService.getColor()
    .subscribe( color => {
      if(color){
        this.newColor = color;
        this.color = color; 
        this.setRadio();
        this.updateDynamicStyles();
      }
    });
  }

  showForm(toggle: number): void{
    this.toggle = (toggle) ? true : false;
  }

  setRadio(): void {
    if(this.newColor.defaultColor == "yes"){
      this.checkedYes = true;
      this.checkedNo = false;
    } else {
      this.checkedNo = true;
      this.checkedYes = false;

      this.showForm(1);
    }
  }

  saveColor(): void {
    this.saved = true;
    if(this.newColor.defaultColor == "yes"){
      this.todoService.addColor(this.defaultColor).subscribe({
        next: () => {
          this.onGetColor();
          this.todoService.sendMessage("color");
        }
      })
    } else {
      this.todoService.addColor(this.newColor).subscribe({
        next: () => {
          this.onGetColor();
          this.todoService.sendMessage("color");
        }
      })
    }
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if(!this.saved){
      return confirm("Do you want to discard thhe changes made?");
    }
    return true;
  }

  updateDynamicStyles(): void {
    document.documentElement.style.setProperty('--sMenu-color', this.color.sMenu);
    document.documentElement.style.setProperty('--tMenu-color', this.color.tMenu);
    document.documentElement.style.setProperty('--tMenu-hover-color', this.darkenColor(this.color.tMenu, 10));
    document.documentElement.style.setProperty('--listBG-color', this.color.listBG);
  }

  darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16),
          amt = Math.round(2.55 * percent),
          R = (num >> 16) - amt,
          G = (num >> 8 & 0x00FF) - amt,
          B = (num & 0x0000FF) - amt;
    return `#${((1 << 24) + (R < 255 ? R < 1 ? 0 : R : 255) * (1 << 16) + (G < 255 ? G < 1 ? 0 : G : 255) * (1 << 8) + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1).toUpperCase()}`;
  }

  selectImg(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files ? target.files[0] : null;

    if (file) {
      const filename = "background.png";
      const renamedFile = new File([file], filename, { type: file.type });
      this.todoService.uploadFile(renamedFile);
    }
  }
}
