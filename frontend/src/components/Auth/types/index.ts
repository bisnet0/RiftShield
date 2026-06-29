export interface AuthPayload {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  invite_code?: string;
}

export interface AuthResponse {
  user: any;
  token?: string;
}

export interface AuthFieldsProps {
  state: any;
  setters: any;
  actions: any;
}

export interface AuthToggleProps {
  isLogin: boolean;
  onToggle: () => void;
}
