export interface AnneeParams {
    // annee universitaire
    anneeUniversitaireId:string;

    // id de la session pedagogique
    pedagogique_session:string;

    // pourcentage la codification pédagogique globale
    pedagogique:number;

    // pourcentage la codification sociale globale
    social:number;

    // pourcentage la codification en licence 1 sur le pourcentage pedagogique
    licence1:number;

    // pourcentage la codification en licence 2 sur le pourcentage pedagogique
    licence2:number;

    // pourcentage la codification en licence 3 sur le pourcentage pedagogique
    licence3:number;

    // pourcentage la codification en master 1 sur le pourcentage pedagogique
    master1:number;

    // pourcentage la codification en master 2 sur le pourcentage pedagogique
    master2:number;

    // pourcentage la codification en amicale sur le pourcentage social
    amicale:number;

    // pourcentage la codification en interne sur le pourcentage social
    interne:number;

    // pourcentage la codification en autre sur le pourcentage social
    autre:number;

    // pourcentage la codification en etranger sur le pourcentage social
    etranger:number;

    // pourcentage la codification en depot sur le pourcentage social
    depot:number; 
}


export interface SessionEtudiant {
    // id de la session
    _id:string;

    // nom de la session
    nom:string;

    // etat de la session
    active:boolean;
}
