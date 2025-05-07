import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from '../list/list.component';
import { Subtask } from '../models/subtask/subtask';
import { List } from '../models/List/list';
import { Filter } from '../models/Filter/filter';
import { Task } from '../models/Task/task';
import { TodoService } from '../todo.service';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, Params, NavigationEnd } from '@angular/router';
import { Color } from '../models/color/color';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [CommonModule, ListComponent, FormsModule],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.css',
  providers: [TodoService]
})
export class ListsComponent implements OnInit{
  counter: number = 0;
  searchTerm: string = '';
  noSearchResult: boolean = false;

  lists: List[] = [];
  filters: Filter[] = [];

  newList: List = new List();
  newSubTasks: Subtask[] = [];
  newTask: Task =  new Task('', '', 'uncompleted', '');

  selectedID: string = '';
  selectedList: List = new List;
  selectedTasks: Task[] = [];
  selectedSubTasks: Subtask[] = [];
  selectedFilter: string = '';

  color: Color = new Color();

  order: string = 'asc';
  sort: string = 'date';

  messages: any[] = [];
  subscription: Subscription;
  listSub!: Subscription;
  colorSub!: Subscription;
  filterSub!: Subscription;

  constructor(
    private todoService: TodoService, 
    private router: Router, 
    private route: ActivatedRoute,) 
  {
    this.subscription = this.todoService.onMessage().subscribe({
      next: (message) => {
        if (message) {
            this.messages.push(message);
    
            switch(message.text) {
              case "filter":
                this.onGetFilters();
                break;
              case "color":
                this.onGetColors();
                break;
              case "status":
                this.onGetLists();
                break;
            }

        } else {
            this.messages = [];
        }
      },
      error: error => {
        console.error("Error occurred:", error);
      }
    }); 

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.router.url === '/home') {
          this.selectedFilter = '';
          this.onGetLists();
        } else {
          this.route.firstChild?.params.subscribe((params: any) => {
            if (params['filterID']) {
              this.selectedFilter = params['filterID'];
              this.onGetLists();
            }
          });
        }
      }
    });
  }

  ngOnInit(): void {
    this.onGetLists();
    this.onGetFilters();
    this.onGetColors();

    var modalElement = document.getElementById('modalNewTask');
    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.resetModal();
      });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.listSub)
      this.listSub.unsubscribe();
    
    if (this.colorSub)
      this.colorSub.unsubscribe();

    if (this.filterSub)
      this.filterSub.unsubscribe();
  }

  onGetColors(): void {
    this.colorSub = this.todoService.getColor().subscribe( color => {
      if(color){
        this.color = color;
        this.updateDynamicStyles();
      }
    });
  }

  onGetLists(): void {
    this.listSub = this.todoService.getLists(this.searchTerm, this.selectedFilter).subscribe({
      next: (lists) => {
        if(lists){
          this.lists = lists;

          if(this.searchTerm)
            this.noSearchResult = false;
        } else {
          this.lists = [];

          if(this.searchTerm)
            this.noSearchResult = true;
        }
      },
      error: (error) => {
        console.log("Error fetching lists: ", error);
        this.lists = [];
      }
    });
  }
  
  onGetFilters(): void {
    this.filterSub = this.todoService.getFilters().subscribe({
      next: (filters) => {
        if(filters){
          this.filters = filters;
        }
      },
      error: (error) => {
        console.log("Error fetching filters: ", error);
      }
    })
  }

  onSelectEvent(id: string): void {
    this.selectedID = id;
  }

  onSelectObjEvent(list: List): void {
    this.selectedList = list
  }

  resetModal(): void {
    this.newSubTasks = [];
    this.counter = 0;
    this.newList = { name: '', filterID: ''};
  
    var inputs = document.querySelectorAll<HTMLInputElement>('#modalNewTask input[type="text"], #modalNewTask input[type="date"]');
    inputs.forEach(input => input.value = '');
  }

  addSubTask(): void {
    var sub = new Subtask('', '', 'uncompleted', '');
    this.newSubTasks.push(sub);

    this.counter++;
  }

  delSubTask(index: number): void{
    this.newSubTasks.splice(index, 1);

    this.counter--;
  }

  toggle(toggle : number, i : number) : void {
    var date = document.getElementById('date' + i);
    
    if(date){
      date.style.display = (toggle) ? 'block' : 'none';
    }
  }

  saveList() : void {
    this.todoService.addList(this.newList).subscribe({
      next: () => {
        this.onGetLists();
      },
      error: (error) => {
        console.log("Error saving list:", error)
      }
    });

    this.newList = new List();
  }

  saveTask(): void {
    this.newTask.listID = this.selectedID

    this.todoService.addTask(this.newTask).subscribe({
      next: (response) => {
        const taskID = response.id;

        this.newSubTasks.forEach((subTask) => {
          if(taskID){
            subTask.taskID = taskID;
          }
        })

        if(this.newSubTasks.length == 0){
          this.onGetLists();
        } else {
          this.todoService.addSubTask(this.newSubTasks).subscribe({
            next: (response) => {
              this.onGetLists();
            }
          });
        }
      },
      error: (error) => {
        console.error("Error saving task and subtasks: ", error);
      }
    });
  }

  editList(): void {
    this.todoService.editList(this.selectedList).subscribe({
      next: () => {
        this.onGetLists();
      },
      error: (error) => {
        console.error("Error editing list:", error);
      }
    });
  }

  deleteList(): void {
    this.todoService.deleteList(this.selectedID!).subscribe({
      next: () => {
        this.onGetLists();
      },
      error: (error) => {
        console.error("Error deleting list:", error);
      }
    });
  }

  onFilterChange(): void {
    this.todoService.onFilterChange(this.order, this.sort);
  }

  updateDynamicStyles(): void {
    document.documentElement.style.setProperty('--tmenu-color', this.color.tMenu);
    document.documentElement.style.setProperty('--tmenu-hover-color', this.darkenColor(this.color.tMenu, 10));
    document.documentElement.style.setProperty('--smenu-color', this.color.sMenu);
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
}
