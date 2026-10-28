import { allocationMaterielApi } from "./api";
import type { CreateAllocationMateriel, UpdateAllocationMateriel } from "../types/allocation_materiel";
import type { AllocationMateriel } from "../types/allocation_materiel";

export const getAllocationMateriel = async (): Promise<AllocationMateriel[]> => {
    return await allocationMaterielApi.get('').json();
}

export const getAllocationDossierById = async (id: string): Promise<AllocationMateriel[]> => {
    return await allocationMaterielApi.get(`byDossier/${id}`).json();
}

export const getAllocationAnneeUniversitaireById = async (id: string): Promise<AllocationMateriel[]> => {
    return await allocationMaterielApi.get(`anneeUniversitaire/${id}`).json();
}

export const createAllocationMateriel = async (data: CreateAllocationMateriel): Promise<AllocationMateriel> => {
    return await allocationMaterielApi.post('', { json: data }).json();
}

export const updateAllocationMateriel = async (id: string, data: UpdateAllocationMateriel): Promise<AllocationMateriel> => {
    return await allocationMaterielApi.patch(`${id}`, { json: data }).json();
}

export const deleteAllocationMateriel = async (id: string): Promise<AllocationMateriel> => {
    return await allocationMaterielApi.delete(`${id}`).json();
}   