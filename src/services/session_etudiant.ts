import type { SessionEtudiant } from "../types/annee_params";
import { sessionEtudiantApi } from "./api";


export const getSessionsEtudiant = (): Promise<SessionEtudiant[]> => sessionEtudiantApi.get(``).json();
