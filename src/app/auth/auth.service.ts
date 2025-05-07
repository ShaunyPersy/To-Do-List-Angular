import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Subject, Observable, map } from 'rxjs';
import { DocumentReference, Firestore, doc } from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';
import { Admin } from '../models/Admin/admin';
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token: string | null = null;
  subject = new Subject<any>();

  constructor(private router: Router, private auth: Auth, private db: Firestore) {
    if(localStorage.getItem('token')){
      this.token = localStorage.getItem('token');

    if(this.auth.currentUser?.uid)
      localStorage.setItem('userID', this.auth.currentUser.uid);

    }
   }

  signUp(email: string, passwd: string): Promise<string> {
    return createUserWithEmailAndPassword(this.auth, email, passwd)
      .catch(error => {
        console.log(error);
        return error;
      })
      .then(() => {
        return 'success';
      })
  }

  login(email: string, passwd: string){
    return signInWithEmailAndPassword(this.auth, email, passwd)
    .then(() => {
      return this.auth.currentUser?.getIdToken()
        .then((token: string) => {
            this.token = token;
            localStorage.setItem('token', token);

            if(this.auth.currentUser){
              localStorage.setItem('userID', this.auth.currentUser.uid);
            }
            
            this.sendMessage('login');
            return true;
        });
    })
    .catch(
      error => {
        console.log(error);
        return false;
      }
    )
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    this.router.navigate(['login']);
  }

  isLoggedIn(): boolean {
    return this.token != null;
  }

  userID(): string | null {
    return localStorage.getItem('userID')
  }

  getAdmin(): Observable<Admin | undefined> {
    const userID = this.userID();
    console.log(userID);
    return docData<Admin>(
      doc(this.db, '/administrators/' + userID) as DocumentReference<Admin>
    );
  }

  async isEmailUsed(email: string) {
    const auth = getAuth();
    console.log(`Checking existence of email: ${email}`);
    try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        return signInMethods.length > 0;
    } catch (error) {
        console.error("Error checking email:", error);
        return false; 
    }
  }

  sendMessage(message: string){
    this.subject.next({text: message});
  }

  clearMessage() {
    this.subject.next(null);
  }

  onMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
