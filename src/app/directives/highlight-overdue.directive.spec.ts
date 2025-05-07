import { ElementRef, Renderer2 } from '@angular/core';
import { HighlightOverdueDirective } from './highlight-overdue.directive';

describe('HighlightOverdueDirective', () => {
  let directive: HighlightOverdueDirective;
  let mockElementRef: ElementRef;
  let mockRenderer: Renderer2;

  beforeEach(() => {
    mockElementRef = new ElementRef(document.createElement('div'));
    mockRenderer = jasmine.createSpyObj('Renderer2', ['setStyle']);
    directive = new HighlightOverdueDirective(mockElementRef, mockRenderer);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
});
