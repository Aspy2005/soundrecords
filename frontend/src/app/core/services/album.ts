import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlbumDetail, AlbumSearchResponse } from '../models/album.model';

/**
 * Todas las rutas requieren JWT (según el contrato), el token se agrega
 * automáticamente por jwtInterceptor a cualquier request cuya URL
 * contenga "/api/".
 */
@Injectable({
  providedIn: 'root',
})
export class AlbumService {
  private baseUrl = 'http://localhost:8080/api/spotify';

  constructor(private http: HttpClient) {}

  // GET /api/spotify/search?q={query}&genre={genre}&year={year}
  search(query: string, genre?: string, year?: string): Observable<AlbumSearchResponse> {
    let params = new HttpParams().set('q', query);
    if (genre) params = params.set('genre', genre);
    if (year) params = params.set('year', year);

    return this.http.get<AlbumSearchResponse>(`${this.baseUrl}/search`, { params });
  }

  // GET /api/spotify/albums/{spotifyAlbumId}
  getById(spotifyAlbumId: string): Observable<AlbumDetail> {
    return this.http.get<AlbumDetail>(`${this.baseUrl}/albums/${spotifyAlbumId}`);
  }
}