export interface Result<T = any> {
  correct: boolean;
  status: number;
  errorMessage?: string;
  object?: T;
  objects?: T[];
}

export interface LoginResponse {
  token: string;
  username: string;
  idUsuario: number;
}