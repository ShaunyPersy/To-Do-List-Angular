import { Injectable } from '@angular/core';
import { List } from './models/List/list';
import { Task } from './models/Task/task';
import { Filter } from './models/Filter/filter';
import { Observable, map, forkJoin, Subject, switchMap, concatMap, catchError, from, of} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Subtask } from './models/subtask/subtask';
import { Color } from './models/color/color';
import { Firestore, collection, collectionData, CollectionReference, addDoc, DocumentReference, doc } from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';
import { query, updateDoc, where, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { AuthService } from './auth/auth.service';
import { ref, uploadBytesResumable, Storage } from '@angular/fire/storage';
import { getDownloadURL } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})

export class TodoService {
  constructor(
    private db: Firestore,
    private authService: AuthService,
    private storage: Storage,
  ) {}

  subject = new Subject<any>();

  getLists(searchTerm: string, filterID: string): Observable<List[] | undefined> {
    const userID = this.authService.userID();
    const listCollection = collection(this.db, 'lists') as CollectionReference<List>;

    const constraints: any[] = [where("userID", "==", userID)];

    if (searchTerm) {
        constraints.push(where("name", "==", searchTerm));
    }

    if (filterID) {
      constraints.push(where("filterID", "==", filterID));
    }

    const listQuery = query(listCollection, ...constraints);

    return from(getDocs(listQuery)).pipe(
        map(snapshot => {
            if (snapshot.empty) {
                return undefined;
            } else {
                const listData: List[] = snapshot.docs.map(doc => ({
                    id: doc.id, 
                    ...doc.data() as List
                }));
                return listData;
            }
        }),
        catchError(error => {
          console.error("catchError");
            console.error("Error fetching lists:", error);
            return of(undefined);
        })
    );
}

  getTasks(listID?: string): Observable<Task[]> {
    const tasksCollection = collection(this.db, 'tasks') as CollectionReference<Task>;
    const tasksQuery = query(tasksCollection, where("listID", "==", listID));
  
    return collectionData<Task>(tasksQuery, { idField: 'id' });
  }

  getSubTasks(taskIDs: string[]): Observable<Subtask[]> {
    return collectionData<Subtask> (
      collection(this.db, 'subtasks') as CollectionReference<Subtask>,
      {idField: 'id'}
    );
  }

  getFilters(): Observable<Filter[] | undefined> {
    const userID = this.authService.userID();
    const filterCollection = collection(this.db, 'filters') as CollectionReference<Filter>;
    const filterQuery = query(filterCollection, where("userID", "==", userID));
  
    return from(getDocs(filterQuery)).pipe(
      concatMap(snapshot => {
        if (snapshot.empty) {
          return [undefined];
        } else {
          const filterData: Filter[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as Filter
          }));
          return [filterData];
        }
      })
    );
  }

  getFilter(id: string): Observable<Filter | undefined> {
    return docData<Filter>(
      doc(this.db, '/filters/' + id) as DocumentReference<Filter>
    );
  }

  //Normaal voor elke user, maar voor dit project enkel voor admin
  getColor(): Observable<Color | undefined> {
    return docData<Color>(
      doc(this.db, '/colors/1') as DocumentReference<Color>
    );
  }


  addList(list: List) {
    const listCollection = collection(this.db, 'lists');
    const userID = this.authService.userID();
    const plainList = Object.assign({}, { filterID: list.filterID, name: list.name, userID: userID });
  
    return from(addDoc(listCollection, plainList));
  }

  addFilter(filter: any) {
    const filterCollection = collection(this.db, 'filters');
    const userID = this.authService.userID();
    const plainList = Object.assign({}, { name: filter.name, color: filter.color, userID: userID });

    return from(addDoc(filterCollection, plainList));
  }

  addColor(color: any){
    const colorRef= doc(this.db, 'colors/1') as DocumentReference<Color>;
    return from(updateDoc(colorRef, color));
  } 

  addTask(task: Task) {
    const tasksCollection = collection(this.db, 'tasks');
    const plainList = Object.assign({}, { name: task.name, date: task.date, listID: task.listID, status: task.status });
  
    return from(addDoc(tasksCollection, plainList)).pipe( 
      map((docRef) => {
        const id = docRef.id;
        return { id, task };
      })
    );
  }

  addSubTask(subTasks: Subtask[]) {
    const subTasksCollection = collection(this.db, 'subtasks');
    const requests: Observable<any>[] = [];

    subTasks.forEach((subTask) => {
      const plainList = Object.assign({}, { name: subTask.name, date: subTask.date, taskID: subTask.taskID, status: subTask.status });
      const addObservable = from(addDoc(subTasksCollection, plainList));
      requests.push(addObservable);
    })
  
    return forkJoin(requests);
  }

  editList(list: any){
    const listRef = doc(this.db, 'lists/' + list.id) as DocumentReference<List>
    return from(updateDoc(listRef, list));
  }

  editFilter(filter: any){
    const filterRef = doc(this.db, 'filters/' + filter.id) as DocumentReference<Filter>
    return from(updateDoc(filterRef, filter));
  }

  //subscribe deleted enkel list & task, maar subtask niet
  deleteList(id: string) {
    const listDocRef = doc(this.db, 'lists', id);
    const tasksCollection = collection(this.db, 'tasks');

    const tasksQuery = query(tasksCollection, where("listID", "==", id));
  
    return collectionData<any>(tasksQuery, { idField: 'id' }).pipe(
      concatMap(tasks => {
        if (tasks.length === 0) {
          return from(deleteDoc(listDocRef));
        } else {
          const deleteRequests = tasks.map(task => this.deleteTaskWithSubtasks(task.id));
          
          return forkJoin(deleteRequests).pipe(
            concatMap(() => from(deleteDoc(listDocRef)))
          );
        }
      }),
      catchError(error => {
        console.error('Error deleting list:', error);
        return of(null);
      })
    );
}

  deleteTaskWithSubtasks(taskId: string | undefined): Observable<any> {
    if (!taskId) {
        console.error('taskId is undefined');
        return of(null);
    }

    const taskDocRef = doc(this.db, 'tasks', taskId); 
    const subTasksCollection = collection(this.db, 'subtasks');

    const subtasksQuery = query(subTasksCollection, where('taskID', '==', taskId));

    return from(getDocs(subtasksQuery)).pipe(
        concatMap(snapshot => {
            if (snapshot.empty) {
              return from(deleteDoc(taskDocRef));
            } 

            const deleteSubtaskRequests = snapshot.docs.map(subtaskDoc => {
                return from(deleteDoc(doc(subTasksCollection, subtaskDoc.id)));
            });

            return forkJoin(deleteSubtaskRequests).pipe(
                concatMap(() => from(deleteDoc(taskDocRef)))
            );
        }),
        catchError(error => {
            console.error('Error deleting task with subtasks:', error);
            return of(null);
        })
    );
  }


  deleteCompleted(tasks: Task[]): Observable<any> {
      return from(tasks).pipe(
        concatMap(task => this.deleteTaskWithSubtasks(task.id)),
        catchError(error => {
          console.error('Error deleting completed tasks:', error);
          return of(null);
        })
      );
  }
  
  deleteFilter(id: string): Observable<any>{
    const filterRef = doc(this.db, 'filters/' + id) as DocumentReference<Filter>
    return from(deleteDoc(filterRef));
  }

  statusTask(task: any){
    const taskRef = doc(this.db, 'tasks/' + task.id) as DocumentReference<Task>;
    return from(updateDoc(taskRef, task));
  }

  statusSubTask(subTask: any){
    const subtaskRef = doc(this.db, 'subtasks/' + subTask.id) as DocumentReference<Task>;
    return from(updateDoc(subtaskRef, subTask));
  }

  async uploadFile(file: File){
    const storageRef = ref(this.storage, "background.png");
    const task = uploadBytesResumable(storageRef, file);
    await task;
    const url = await getDownloadURL(storageRef);
    this.sendMessage(`image:${url}`);
  }

  getFileUrl(): Promise<string> {
    const storageRef = ref(this.storage, "background.png");
    return getDownloadURL(storageRef);
  }

  //subject
  sendMessage(message: string){
    this.subject.next({text: message});
  }

  clearMessage() {
    this.subject.next(null);
  }

  onMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  onFilterChange(order: string, sort: string): void {
    this.sendMessage(`filter:${order}:${sort}`);
  }
}
