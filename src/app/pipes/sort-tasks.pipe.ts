import { Pipe, PipeTransform } from '@angular/core';
import { Task } from '../models/Task/task';

@Pipe({
  name: 'sortTasks',
  standalone: true,
  pure: false
})
export class SortTasksPipe implements PipeTransform {

  transform(tasks: Task[], sortBy: string, order: string): Task[] {
    if (tasks.length === 1) {
      return tasks; 
    }

    switch(sortBy){
      case "date":
        tasks = this.sortDate(tasks);
        break;
      case "name":
        tasks = this.sortName(tasks);
        break;
      default:
        return tasks;
    }

    // desc
    if (order === 'desc') {
      return tasks.reverse();
    }

    return tasks;
  }

  private sortDate(tasks: Task[]): Task[] {
    tasks.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    return tasks;
  }

  private sortName(tasks: Task[]): Task[] {
    tasks.sort((a, b) => {
      return a.name.localeCompare(b.name)
    });

    return tasks;
  }
}
