import { equipementsApi } from "./api";
import type { Equipement } from "../types/equipement";

export const getEquipements = () => equipementsApi.get<Equipement[]>('').json();

export const getEquipementsById = (id: string) => equipementsApi.get<Equipement>(`${id}`).json();

export const getEquipementsByDossierId = (id: string) => equipementsApi.get<Equipement[]>(`byDossier/${id}`).json();

export const createEquipement = (equipement: Equipement) => equipementsApi.post<Equipement>('', {json: equipement}).json();

export const updateEquipement = (id: string, equipement: Equipement) => equipementsApi.put<Equipement>(`${id}`, {json: equipement}).json();

export const deleteEquipement = (id: string) => equipementsApi.delete<Equipement>(`${id}`).json();
