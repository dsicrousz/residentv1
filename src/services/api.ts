import ky from 'ky';

const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = localStorage.getItem('resident_auth');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_, __, response) => {
        if (response.status === 401 || response.status === 440) {
          localStorage.removeItem('resident_auth');
          localStorage.removeItem('resident_auth_type');
          localStorage.removeItem('resident_auth_state');
          if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
            window.location.href = '/login';
          }
        }
      },
    ],
  },
});

export const usersApi = api.extend((options) => ({ prefixUrl: `${options.prefixUrl}/user` }));
export const anneeUniversitaireApi = api.extend((options) => ({ prefixUrl: `${options.prefixUrl}/annee-universitaire` }));
export const campusApi = api.extend((options) => ({ prefixUrl: `${options.prefixUrl}/campus` }));
export const pavilionsApi = api.extend((options) => ({ prefixUrl: `${options.prefixUrl}/pavillon` }));
export const chambresApi = api.extend((options) => ({ prefixUrl: `${options.prefixUrl}/chambre` }));
export const etudiantsApi = api.extend((options) => ({ prefixUrl: `${options.prefixUrl}/etudiant` }));
export const dossiersApi = api.extend((options) => ({ prefixUrl: `${options.prefixUrl}/dossier` }));
export const payementsApi = api.extend((options) => ({ prefixUrl: `${options.prefixUrl}/payement` }));
export const allocationMaterielApi = api.extend((options) => ({ prefixUrl: `${options.prefixUrl}/allocation` }));
export const equipementsApi = api.extend((options) => ({ prefixUrl: `${options.prefixUrl}/equipement` }));
export const anneeParamsApi = api.extend((options) => ({ prefixUrl: `${options.prefixUrl}/annee-parametre` }));
export const sessionEtudiantApi = api.extend((options) => ({ prefixUrl: `${options.prefixUrl}/session_etudiant` }));
export const selectionApi = api.extend((options) => ({ prefixUrl: `${options.prefixUrl}/selectionne` }));
export const formationApi = api.extend((options) => ({ prefixUrl: `${options.prefixUrl}/formation` }));
export const litApi = api.extend((options) => ({ prefixUrl: `${options.prefixUrl}/lit` }));
