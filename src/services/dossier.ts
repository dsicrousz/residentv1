import { dossiersApi } from "./api";
import type { CreateDossier, Dossier, UpdateDossier } from "../types/dossier";

export const getDossiers = async (): Promise<Dossier[]> => {
    return await dossiersApi.get('').json();
}

export const getDossierById = async (id: string): Promise<Dossier> => {
    return await dossiersApi.get(`${id}`).json();
}

export const getDossierByChambreId = async (chambreId: string): Promise<Dossier[]> => {
    return await dossiersApi.get(`byChambre/${chambreId}`).json();
}

export const getDossierByEtudiantId = async (etudiantId: string): Promise<Dossier[]> => {
    return await dossiersApi.get(`byEtudiant/${etudiantId}`).json();
}

export const getDossierByAnneeUniversitaireId = async (anneeUniversitaireId: string): Promise<Dossier[]> => {
    return await dossiersApi.get(`byAnneeUniversitaire/${anneeUniversitaireId}`).json();
}

export const createDossier = async (data: CreateDossier): Promise<Dossier> => {
    return await dossiersApi.post('', { json: data }).json();
}

export const updateDossier = async ({_id, ...data}: UpdateDossier): Promise<Dossier> => {
    return await dossiersApi.patch(`${_id}`, { json: data }).json();
}

export const deleteDossier = async (id: string): Promise<Dossier> => {
    return await dossiersApi.delete(`${id}`).json();
}
