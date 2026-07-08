import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FollowResponse, PrivacyPreferences, UserProfilePublic } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  // GET /api/users/{id} - perfil público de cualquier usuario (incluye stats e isFollowedByMe)
  getPublicProfile(id: string): Observable<UserProfilePublic> {
    return this.http.get<UserProfilePublic>(`${this.baseUrl}/${id}`);
  }

  updateProfile(profileData: { username: string; bio: string; photoUrl: string; country: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/me`, profileData); // PUT /api/users/me [cite: 371]
  }

  updateCredentials(credentialsData: { email: string; newPassword?: string }): Observable<any> {
    return this.http.patch(`${this.baseUrl}/me/credentials`, credentialsData); // PATCH /api/users/me/credentials [cite: 373]
  }

  updatePrivacy(privacyData: PrivacyPreferences): Observable<any> {
    return this.http.patch(`${this.baseUrl}/me/privacy`, privacyData); // PATCH /api/users/me/privacy [cite: 381]
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/me`); // DELETE /api/users/me [cite: 375]
  }

  // POST /api/users/{id}/follow - seguir a un usuario o artista
  follow(id: string): Observable<FollowResponse> {
    return this.http.post<FollowResponse>(`${this.baseUrl}/${id}/follow`, {});
  }

  // DELETE /api/users/{id}/follow - dejar de seguir
  unfollow(id: string): Observable<FollowResponse> {
    return this.http.delete<FollowResponse>(`${this.baseUrl}/${id}/follow`);
  }
}