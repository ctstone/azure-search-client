export class SearchError extends Error {
  constructor(public method: string, public url: string, public httpStatus: number, message: string, public inner?: Error) {
    super(message);
    this.method = this.method.toUpperCase();
  }
}
