import { pavilionsApi } from "./api";
import type { CreatePavillon, Pavillon, UpdatePavillon } from "../types/pavillon";

export const getPavillons = async (anneeUniversitaireId: string): Promise<Pavillon[]> => {
    return await pavilionsApi.get(`annee-universitaire/${anneeUniversitaireId}`).json();
}

export const getPavillonById = async (id: string): Promise<Pavillon> => {
    return await pavilionsApi.get(`${id}`).json();
}

export const getPavillonByCampusId = async (campusId: string): Promise<Pavillon[]> => {
    return await pavilionsApi.get(`byCampus/${campusId}`).json();
}

export const createPavillon = async (data: CreatePavillon): Promise<Pavillon> => {
    return await pavilionsApi.post('', { json: data }).json();
}

export const updatePavillon = async ({_id, ...data}: UpdatePavillon): Promise<Pavillon> => {
    return await pavilionsApi.patch(`${_id}`, { json: data }).json();
}

export const deletePavillon = async (id: string): Promise<Pavillon> => {
    return await pavilionsApi.delete(`${id}`).json();
}
