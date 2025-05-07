export class Subtask {
    public id?: string;
    
    constructor(
        public name: string = '',
        public date: string = '',
        public status: string = '',
        public taskID: string = '',
    ) {}
}
