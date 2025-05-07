import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Filter } from '../models/Filter/filter';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
})
export class FilterComponent {
  @Input() filter: Filter = {name: '', color: ''};
  @Output() selectEvent = new EventEmitter<string>();
  @Output() selectObjEvent = new EventEmitter<Filter>();

  selectFilterID(): void {
    this.selectEvent.emit(this.filter.id);
  }

  selectFilterObj(): void{
    this.selectObjEvent.emit(this.filter);
  }
}
