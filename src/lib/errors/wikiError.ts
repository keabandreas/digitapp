export class WikiError extends Error {
    constructor(
      message: string,
      public status?: number,
      public info?: any
    ) {
      super(message);
      this.name = 'WikiError';
      // This is needed for instanceof to work properly
      Object.setPrototypeOf(this, WikiError.prototype);
    }
  }