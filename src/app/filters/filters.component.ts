import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Filter } from '../models/Filter/filter';
import { FilterComponent } from '../filter/filter.component';
import { TodoService } from '../todo.service';
import { FormsModule } from '@angular/forms';
import { Color } from '../models/color/color';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FilterComponent, FormsModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent {
  filters: Filter[] = [];  
  newFilter: Filter = new Filter();

  selectedID: string = '';
  selectedFilter: Filter = new Filter;

  messages: any[] = [];
  subscription: Subscription;
  filterSub!: Subscription;

  color: Color = new Color();
  
  constructor(private todoService: TodoService){
    this.subscription = this.todoService.onMessage().subscribe({
      next: (message) => {
        if (message) {
            this.messages.push(message);
    
            if(message.text == "filter"){
              this.onGetFilters();
            }
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
    var modalElement = document.getElementById('modalNewFilter');
    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.resetModal();
      });
    }
    
    this.onGetFilters();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if(this.filterSub){
      this.filterSub.unsubscribe();
    }
  }

  resetModal(): void {
    this.newFilter = { name: '', color: ''};
  
    var inputs = document.querySelectorAll<HTMLInputElement>('#modalNewFilter input[type="text"], #modalNewFilter input[type="color"]');
    inputs.forEach(input => input.value = '');
  }

  onGetFilters(): void {
    this.filterSub = this.todoService.getFilters()
    .subscribe( filters => {
        if(filters){
          this.filters = filters;
        }
    });
  }

  onSelectEvent(id: string): void {
    this.selectedID = id;
  }

  onSelectObjEvent(filter: Filter): void {
    this.selectedFilter = filter;
  }

  saveFilter(): void {
    this.todoService.addFilter(this.newFilter).subscribe({
      next: (response) => {
        this.onGetFilters();
        this.todoService.sendMessage("filter")
      }
    });
  }

  editFilter(): void {
    this.todoService.editFilter(this.selectedFilter).subscribe({
      next: (response) => {
        this.onGetFilters();
        this.todoService.sendMessage("filter");
      }
    });
  }

  deleteFilter(): void {
    this.todoService.deleteFilter(this.selectedID).subscribe({
      next: (response) => {
        this.onGetFilters();
        this.todoService.sendMessage("filter");
      }
    });
  }
}
