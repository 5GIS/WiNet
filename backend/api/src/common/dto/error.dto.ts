export class ErrorDto {
  error!: string;
  message!: string;
  statusCode!: number;
  details?: string[];
}
