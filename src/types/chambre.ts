import type { Pavillon } from "./pavillon";
import type { Lit } from "./lit";

export interface Chambre {
    _id?: string;
    nom:string;
    pavillonId:Pavillon | string;
    pavillon?:Pavillon;
    places:number;
    anneeUniversitaireId?: string;
    lits?:Lit[];
}

export interface CreateChambre {
    nom:string;
    pavillonId:string;
    places?:number;
    anneeUniversitaireId?: string;
    lits?:Lit[];   
}

export interface UpdateChambre {
    _id?: string;
    nom?:string;
    pavillonId?:string;
    places?:number;
    anneeUniversitaireId?: string;
    lits?:Lit[];   
}
    