import { etudiantsApi } from "./api";
import type { Etudiant } from "../types/etudiant";

export const getEtudiants = async (): Promise<Etudiant[]> => {
    return await etudiantsApi.get('').json();
}

export const getEtudiantById = async (id: string): Promise<Etudiant> => {
    return await etudiantsApi.get(`${id}`).json();
}

export const getEtudiantByNcs = async (ncs: string): Promise<Etudiant> => {
    return await etudiantsApi.get(`ncs/${ncs}`).json();
}



