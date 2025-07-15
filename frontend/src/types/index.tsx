export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface ApiError {
  message: string;
  status: number;
}

