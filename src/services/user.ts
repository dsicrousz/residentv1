import { usersApi } from "./api";
import type { LoginUser, CreateUser, User, LoginResponse,UpdateUser } from "../types/user";

// Fonction pour créer un utilisateur avec Better Auth
export const createUser = async (data: CreateUser): Promise<User> => {
    return await usersApi.post('', { json: data }).json();
};

export const getUser = async (id: string): Promise<User> => {
    return await usersApi.get(`${id}`).json();
}

export const getUsers = async (): Promise<User[]> => {
    return await usersApi.get('').json();
}

export const updateUser = async (id:string,data:UpdateUser): Promise<User> => {
    return await usersApi.patch(`${id}`, { json: data }).json();
}

export const deleteUser = async (id: string): Promise<void> => {
    await usersApi.delete(`${id}`);
}


export const login = async (data: LoginUser): Promise<LoginResponse> => {
    return await usersApi.post('login', { json: data }).json();
};
    