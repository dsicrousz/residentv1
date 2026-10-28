export interface Campus {
    _id?: string;
    nom:string;
    adresse?:string;
    latitude?:string;
    longitude?:string;
    anneeUniversitaireId?: string;
}

export interface CreateCampus {
    nom:string;
    adresse?:string;
    latitude?:string;
    longitude?:string;
    anneeUniversitaireId?: string;
}

export interface UpdateCampus {
    _id?: string;
    nom?:string;
    adresse?:string;
    latitude?:string;
    longitude?:string;
    anneeUniversitaireId?: string;
}
