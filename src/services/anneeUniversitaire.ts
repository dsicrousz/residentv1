import { anneeUniversitaireApi } from "./api";
import type { AnneeUniversitaire, Importations, Results } from "../types/annee_universitaire";
import type { Statistiques } from "../types/statistiques";

export const getAnneeUniversitaires = async (): Promise<AnneeUniversitaire[]> => {
    return await anneeUniversitaireApi.get('').json();
}

export const getAnneeUniversitaireActive = async (): Promise<AnneeUniversitaire> => {
    return await anneeUniversitaireApi.get('active').json();
}

export const getAnneeUniversitaireById = async (id: string): Promise<AnneeUniversitaire> => {
    return await anneeUniversitaireApi.get(`${id}`).json();
}

export const createAnneeUniversitaire = async (data: AnneeUniversitaire): Promise<AnneeUniversitaire> => {
    return await anneeUniversitaireApi.post('', { json: data }).json();
}

export const Import = async (data: Importations) => {
    return await anneeUniversitaireApi.post('import', { json: data }).json();
}

export const updateAnneeUniversitaire = async ({_id, ...data}: AnneeUniversitaire): Promise<AnneeUniversitaire> => {
    return await anneeUniversitaireApi.patch(`${_id}`, { json: data }).json();
}

export const deleteAnneeUniversitaire = async (id: string): Promise<AnneeUniversitaire> => {
    return await anneeUniversitaireApi.delete(`${id}`).json();
}

export const getStatsByAnneeUniversitaireId = async (id: string): Promise<Statistiques> => {
    return await anneeUniversitaireApi.get(`statistiques/${id}`).json();
}


export const getAnneeUniversitaireResults = async (id: string): Promise<Results> => {
    return await anneeUniversitaireApi.get(`results/${id}`).json();
}



