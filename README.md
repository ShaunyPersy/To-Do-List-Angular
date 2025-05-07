# Angular To-Do List App

This project is a simple and modern **to-do list application** built with **Angular** and **Firebase**. The app allows users to add, edit, delete, and manage their tasks through a clean and responsive web interface.

Tasks are stored and synchronized in real-time using Firebase, ensuring immediate updates across sessions. Firebase Authentication can also be integrated to support user login and personalized task lists.

## Features

- Add, edit, and delete to-do items
- Real-time data updates using Firebase
- Optional user authentication via Firebase Auth
- Clean and responsive UI built with Angular

## Technologies Used

- **Angular** – Front-end framework
- **Firebase** – For database and optional authentication
- **TypeScript** – Strongly typed JavaScript
- **RxJS** – For reactive programming and state management

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ShaunyPersy/To-Do-List-Angular.git
   cd todo-angular-firebase
   ```
2. **Install Dependencies**
   Replace the placeholder Firebase configuration in environment.ts with your own:
   ```bash
   npm install
   ```
3. **Firebase Setup (Optional)**
   ```bash
   export const environment = {
      production: false,
      firebase: {
        apiKey: "your-api-key",
        authDomain: "your-project-id.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project-id.appspot.com",
        messagingSenderId: "your-messaging-id",
        appId: "your-app-id"
      }
    };
   ```
   This is optional since it's currently linked to my personal firebase. This was done for grading purposes.
4. **Run locally**
   ```bash
   ng serve
   ```
   Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Deployment
To deploy with Firebase Hosting, do the following:
   ```bash
  ng build --prod
  firebase login
  firebase init
  firebase deploy
   ```
## Demo 
https://github.com/user-attachments/assets/fbe1dda3-7c73-4ed1-a890-cc0434afbaf6

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

