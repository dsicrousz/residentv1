import { chambresApi } from "./api";
import type { Chambre } from "../types/chambre";

export const getChambres = async (anneeUniversitaireId: string): Promise<Chambre[]> => {
    return await chambresApi.get(`annee-universitaire/${anneeUniversitaireId}`).json();
}

export const getChambreById = async (id: string): Promise<Chambre> => {
    return await chambresApi.get(`${id}`).json();
}

export const getChambreByPavillonId = async (pavillonId: string): Promise<Chambre[]> => {
    return await chambresApi.get(`byPavillon/${pavillonId}`).json();
}

export const createChambre = async (data: Chambre): Promise<Chambre> => {
    return await chambresApi.post('', { json: data }).json();
}

export const updateChambre = async ({_id, ...data}: Chambre): Promise<Chambre> => {
    return await chambresApi.patch(`${_id}`, { json: data }).json();
}

export const deleteChambre = async (id: string): Promise<Chambre> => {
    return await chambresApi.delete(`${id}`).json();
}
