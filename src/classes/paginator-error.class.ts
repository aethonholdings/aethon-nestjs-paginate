export class PaginatorError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PaginatorError";
    }
}