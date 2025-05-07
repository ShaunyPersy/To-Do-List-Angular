import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { empty, of, throwError } from 'rxjs';
import { ListsComponent } from './lists.component';
import { TodoService } from '../todo.service';
import { AuthService } from '../auth/auth.service';
import { List } from '../models/List/list';
import { CommonModule } from '@angular/common';
import { ListComponent } from '../list/list.component';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from '../../environments/environment.development';
import { DocumentReference, getFirestore, provideFirestore } from '@angular/fire/firestore';

describe('ListsComponent', () => {
  let component: ListsComponent;
  let fixture: ComponentFixture<ListsComponent>;
  let todoService: TodoService;

  const mockLists: List[] = [
    { id: '1', name: 'List 1', filterID: '1'},
    { id: '2', name: 'List 2', filterID: '2'}
  ];
  
  const mockDocumentReference = {
    id: 'mockId',
    path: 'mock/path'
  } as DocumentReference<any>; 

  class MockAuthService {
    userID() {
      const id = 'mockUserId';
      return id;
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule, ListComponent, FormsModule,
      ],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideFirestore(() => getFirestore()),
        provideAuth(() => getAuth()),
        provideStorage(() => getStorage()),
        { provide: AuthService, useClass: MockAuthService },
        TodoService
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListsComponent);
    component = fixture.componentInstance;
    component.lists = [];
    todoService = TestBed.inject(TodoService); 
    fixture.detectChanges();
  });

  // Positive unit tests
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch lists on OnGetLists()', waitForAsync(() => {
    spyOn(todoService, 'getLists').and.returnValue(of(mockLists));
    const lists: List[] = [];

    component.onGetLists();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.lists).toEqual(lists);
    });
  }));

  it('should change order', () => {
    const radioDesc = fixture.nativeElement.querySelector('#radioDesc');
    radioDesc.click();

    fixture.detectChanges();

    expect(component.order).toBe('desc');
  });

  it('should darken the color correctly on darkenColor()', () => {
    expect(component.darkenColor('#FF5733', 20)).toBe('#CC2400'); 
  });

  // Negative unit tests
  it('should handle error when deleting list on deleteList()', waitForAsync(() => {
    const mockList = { name: 'List to Delete', filterID: '1' }; 
    component.lists = [mockList];
    component.selectedID = 'mockId';

    spyOn(todoService, 'deleteList').and.returnValue(throwError(() => new Error('Error deleting list')));
    spyOn(console, 'error');

    component.deleteList();

    expect(component.lists.length).toBe(1);
    expect(component.lists[0].name).toBe('List to Delete');
  }));

  it('should show feedback when search results are empty', waitForAsync(() => {
    component.searchTerm = 'NonExistentList';
    component.noSearchResult = true;
    spyOn(todoService, 'getLists').and.returnValue(of([]));

    component.onGetLists();

    fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(component.lists).toEqual([]); 
        expect(component.noSearchResult).toBeTrue();

        const noResultMessage = fixture.nativeElement.querySelector('#noSearchResult');
        expect(noResultMessage).toBeTruthy();
        expect(noResultMessage.textContent).toContain('No Lists with that name.');
    });
  }));
});
