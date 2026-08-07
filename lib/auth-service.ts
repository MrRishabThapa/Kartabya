import { api } from "./api";

export async function signup(email: string, password: string, name: string) {
  return api.post("/api/v1/auth/signup", {
    email,
    password,
   
  });
}

export async function login(email: string, password: string) {
  return api.post("/api/v1/auth/login", { email, password });
}

export async function getMe() {
  return api.get("/api/v1/auth/me");
}

export async function logout() {
  return api.post("/api/v1/auth/logout");
}
