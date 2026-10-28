import { litApi } from "./api";
import type { Lit } from "../types/lit";

export const getLits = (anneeUniversitaireId: string) => litApi.get<Lit[]>(`annee-universitaire/${anneeUniversitaireId}`).json();

export const getLitById = (id: string) => litApi.get<Lit>(`${id}`).json();

export const getLitsByChambreId = (chambreId: string) => litApi.get<Lit[]>(`by_chambre/${chambreId}`).json();

export const createLit = (lit: Lit) => litApi.post('', {json: lit}).json();

export const updateLit = (id: string, lit: Lit) => litApi.put(`${id}`, {json: lit}).json();

export const deleteLit = (id: string) => litApi.delete(`${id}`).json();
