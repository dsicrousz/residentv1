import { campusApi } from "./api";
import type { CreateCampus, UpdateCampus } from "../types/campus";
import type { Campus } from "../types/campus";

export const getCampus = async (anneeUniversitaireId: string): Promise<Campus[]> => {
    return await campusApi.get(`annee-universitaire/${anneeUniversitaireId}`).json();
}

export const getCampusById = async (id: string): Promise<Campus> => {
    return await campusApi.get(`${id}`).json();
}

export const createCampus = async (data: CreateCampus): Promise<Campus> => {
    return await campusApi.post('', { json: data }).json();
}

export const updateCampus = async ({_id, ...data}: UpdateCampus): Promise<Campus> => {
    return await campusApi.patch(`${_id}`, { json: data }).json();
}
    
export const deleteCampus = async (id: string): Promise<Campus> => {
    return await campusApi.delete(`${id}`).json();
}
