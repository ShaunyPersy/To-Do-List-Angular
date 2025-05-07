import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlightOverdue]',
  standalone: true
})
export class HighlightOverdueDirective {
  @Input() dueDate: string = '';
  constructor(private ref: ElementRef, private renderer: Renderer2) { }

  ngOnInit() : void {
    var currentDate = new Date();
    var taskDueDate = new Date(this.dueDate);

    if (taskDueDate < currentDate) {
      this.renderer.setStyle(this.ref.nativeElement, 'color', 'red');
    }
  }
}
