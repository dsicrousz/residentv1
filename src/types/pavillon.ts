import type { Campus } from "./campus";
import type { Chambre } from "./chambre";

export interface CreatePavillon {
    nom:string;
    campusId:string;
    campus:Campus;
    description?:string;
    type:string;
    chambres?:Chambre[];
    anneeUniversitaireId?: string;
}

export interface UpdatePavillon {
    _id?:string;
    nom?:string;
    campusId?:string;
    campus?:Campus;
    description?:string;    
    type?:string;
    chambres?:Chambre[];
    anneeUniversitaireId?: string;
}

export interface Pavillon {
    _id?: string;
    nom: string;
    campusId: Campus;
    campus?:Campus;
    description?: string;
    type:string;
    chambres?:Chambre[];
    anneeUniversitaireId?: string;
}
