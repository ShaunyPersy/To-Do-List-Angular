export class Task {
    public id?: string;
    constructor(
        public name: string = '',
        public date: string = '',
        public status: string = '',
        public listID: string = '',
    ) {}
}
