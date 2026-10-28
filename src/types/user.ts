export interface User {
    _id?: string;
    prenom: string;
    nom: string;
    email: string;
    password?: string;
    role: string[];
    isActif: boolean;
}

export interface CreateUser {
    prenom: string;
    nom: string;
    email: string;
    password: string;
}

export interface UpdateUser {
    prenom?: string;
    nom?: string;
    email?: string;
    password?: string;
    role?: string[];
    isActif?: boolean;
}

export interface LoginUser {
    username: string;
    password: string;
}

export interface LoginResponse {
    id: string;
    token: string;
}

