import { Component, EventEmitter, Input, Output } from '@angular/core';
import { List } from '../models/List/list';
import { Task } from '../models/Task/task';
import { Subtask } from '../models/subtask/subtask';
import { TodoService } from '../todo.service';
import { CommonModule } from '@angular/common';
import { Filter } from '../models/Filter/filter';
import { Color } from '../models/color/color';
import { Subscription } from 'rxjs';
import { HighlightOverdueDirective } from '../directives/highlight-overdue.directive';
import { SortTasksPipe } from '../pipes/sort-tasks.pipe';
import { Timestamp } from 'firebase/firestore'

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    HighlightOverdueDirective,
    SortTasksPipe
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {
  @Input() list: List = {name: '', filterID: ''};
  @Input() listBG: string = '#FFFF';
  @Output() selectEvent = new EventEmitter<string>();
  @Output() selectObjEvent = new EventEmitter<List>();


  tasks: Task[] = [];
  completedTasks: Task[] = [];
  taskIDs: string[] = [];

  subTasks: Subtask[] = [];

  filter: Filter = new Filter();

  hover: boolean = false;
  messages: any[] = [];

  order: string = 'asc';
  sort: string = 'date';

  filterSub!: Subscription;
  taskSub!: Subscription;
  subTaskSub!: Subscription;

  constructor(private todoService: TodoService) {
    this.todoService.onMessage().subscribe({
      next: (message) => {
        if (message) {
          if (message.text.startsWith('filter:')) {
            const [, order, sort] = message.text.split(':');
      
            this.order = order;
            this.sort = sort;
          }
        }
        else {
          this.messages = [];
        }
      }
    });
  }

  ngOnInit(): void {
    this.onGetTasks();
    this.onGetSubTasks();
    this.onGetFilter();
  }

  ngOnDestroy(): void {
    if(this.filterSub)
      this.filterSub.unsubscribe();
    
    this.taskSub.unsubscribe();

    if(this.subTaskSub)
      this.subTaskSub.unsubscribe();
  }

  onGetTasks(): void {
    this.taskSub = this.todoService.getTasks(this.list.id).subscribe({
      next: (response: Task[]) => {
        response.forEach((task) => {
          if(task.status == "uncompleted"){
            this.tasks.push(task);
          } else {
            this.completedTasks.push(task);
          }
        });
      }
    });
  }

  onGetSubTasks(): void {
    this.tasks.forEach((task) => {
      if (task.id) {
        this.taskIDs.push(task.id);
      }
    });
    this.subTaskSub = this.todoService.getSubTasks(this.taskIDs).subscribe({
      next: (response: Subtask[]) => {
        this.subTasks = response;
      }
    });
  }

  onGetFilter(): void{
    if(this.list.filterID){
      this.filterSub = this.todoService.getFilter(this.list.filterID)
      .subscribe( filter => {
        if(filter) {
          this.filter = filter;
        }
      });
    } else {
      this.filter = new Filter();
    }
  }
  
  selectListObj(): void {
    this.selectObjEvent.emit(this.list);
  }

  selectListID(): void {
    this.selectEvent.emit(this.list.id);
  }

  getHoverColor(): string {
    return this.darkenColor(this.filter.color, 10)
  }

  darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16),
          amt = Math.round(2.55 * percent),
          R = (num >> 16) - amt,
          G = (num >> 8 & 0x00FF) - amt,
          B = (num & 0x0000FF) - amt;
    return `#${((1 << 24) + (R < 255 ? R < 1 ? 0 : R : 255) * (1 << 16) + (G < 255 ? G < 1 ? 0 : G : 255) * (1 << 8) + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1).toUpperCase()}`;
  }

  statusTask(task: Task, status: string): void {
    task.status = status;

    this.todoService.statusTask(task).subscribe({
      next: (response) => {
        this.todoService.sendMessage("status");
      }
    });
  }

  statusSubTask(subTask: Subtask, status: string): void {
    subTask.status = status;

    this.todoService.statusSubTask(subTask).subscribe({
      next: (response) => {
        this.todoService.sendMessage("status");
      }
    });
  }

  deleteCompleted(): void {
    this.todoService.deleteCompleted(this.completedTasks).subscribe({
      next: (response) => {
        this.todoService.sendMessage("status");
      }
    });
  }
}
