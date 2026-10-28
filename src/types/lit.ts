import type { Chambre } from "./chambre";

export interface Lit {
    _id: string;
    numero:string;
    chambreId:Chambre | string;
    description?:string;
    actif?:boolean;
    anneeUniversitaireId?:string;
} 