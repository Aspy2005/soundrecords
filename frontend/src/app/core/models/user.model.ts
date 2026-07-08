/**
 * Coincide con la tabla USERS del diagrama ER.
 * NOTA: `country` se usa en el formulario de Perfil (Configuración) y en el
 * contrato de API (PUT /api/users/me), pero NO existe como columna en el
 * diagrama ER provisto. Se deja como campo opcional del lado del frontend;
 * hay que decidir con el equipo de backend si se agrega la columna a USERS
 * o si se elimina el campo del formulario.
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'LISTENER' | 'ARTIST' | 'ADMIN';
  points: number;
  level: string;
  isPremium?: boolean;
  photoUrl?: string;
  bio?: string;
  country?: string; // ⚠️ no existe en el ER actual, ver nota arriba
  spotifyLinked?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserProfilePublic {
  id: string;
  username: string;
  bio: string;
  photoUrl: string;
  level: string;
  followersCount: number;
  followingCount: number;
  reviewsCount: number;
  isFollowedByMe: boolean;
}

export interface PrivacyPreferences {
  publicProfile: boolean;
  showLists: boolean;
  showLikes: boolean;
  emailNotifications: boolean;
}

export interface FollowResponse {
  following: boolean;
  followersCount: number;
}