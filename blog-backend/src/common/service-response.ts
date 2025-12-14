export class ServiceResponse<T> {
  value: T | null;
  success: boolean;
  errorMessage: string | null;

  private constructor(value: T | null, errorMessage: string | null) {
    this.value = value;
    this.errorMessage = errorMessage;
    this.success = errorMessage === null || errorMessage === undefined || errorMessage === '';
  }

  static ok<T>(value: T): ServiceResponse<T> {
    return new ServiceResponse<T>(value, null);
  }

  static fail<T>(errorMessage: string): ServiceResponse<T> {
    return new ServiceResponse<T>(null, errorMessage);
  }
}