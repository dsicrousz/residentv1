import type { AnneeParams } from "../types/annee_params";
import { anneeParamsApi } from "./api";

export const getAnneeParamsByAnneeUniversitaireId    = (anneeUniversitaireId:string): Promise<AnneeParams> => anneeParamsApi.get(`byanneeUniversitaireId/${anneeUniversitaireId}`).json();

export const createAnneeParams = (anneeParams: AnneeParams) => anneeParamsApi.post('', {json:anneeParams}).json();

export const updateAnneeParams = (id:string,anneeParams: AnneeParams) => anneeParamsApi.patch(`${id}`, {json:anneeParams}).json();

export const deleteAnneeParams = (id:string) => anneeParamsApi.delete(`${id}`).json();
