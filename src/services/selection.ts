/* eslint-disable @typescript-eslint/no-explicit-any */
import { selectionApi } from "./api";


export interface Inscrit {
    _id: string;
    nom: string;
    prenom: string;
    genre: string;
    ncs: string;
    avatar: string;
    is_codified: boolean;
    nationalite: string;
    formation: { _id: string };
    
  }

export interface Selection {
    _id: string;
    nom: string;
    prenom: string;
    genre: string;
    ncs: string;
    inscription: any;
    avatar: string;
    nationalite: string;
    
  }

  export type Results = {
    diff: Inscrit[];
    selectionnees: Selection[];
  }

export const getSelectionsBySessionAndFormation = async (anneeUniversitaireId: string, formationId: string): Promise<Results> => {
    return await selectionApi.get(`bysessionandformation/${anneeUniversitaireId}/${formationId}`).json();
}

export const getSelectionsSocialeByAnneeUniversitaireId = async (anneeUniversitaireId: string): Promise<Results> => {
    return await selectionApi.get(`sociale/selection/${anneeUniversitaireId}`).json();
}

export const getSelectionsBySession = async (anneeUniversitaireId: string): Promise<any[]> => {
    return await selectionApi.get(`bysession/${anneeUniversitaireId}`).json();
}


export const getSelectionsPedagogiqueBySession = async (anneeUniversitaireId: string): Promise<{formations: any[], selectionnees: any[]}> => {
    return await selectionApi.get(`pedagogique/bysession/${anneeUniversitaireId}`).json();
}

export const getSelectionsSocialeBySession = async (anneeUniversitaireId: string): Promise<{formations: any[], selectionnees: any[]}> => {
    return await selectionApi.get(`sociale/bysession/${anneeUniversitaireId}`).json();
}

export const getSelectionById = async (id: string) => {
    return await selectionApi.get(`${id}`).json();
}

export const getSelectionByCampusId = async (campusId: string) => {
    return await selectionApi.get(`byCampus/${campusId}`).json();
}

export const createSelection = async (data: any) => {
    return await selectionApi.post('', { json: data }).json();
}

export const updateSelection = async ({_id, ...data}: any) => {
    return await selectionApi.patch(`${_id}`, { json: data }).json();
}

export const deleteSelection = async (id: string) => {
    return await selectionApi.delete(`${id}`).json();
}
