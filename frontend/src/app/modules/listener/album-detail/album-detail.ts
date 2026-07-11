import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlbumService } from '../../../core/services/album';
import { ReviewService } from '../../../core/services/review';
import { AlbumDetail as AlbumDetailModel } from '../../../core/models/album.model';
import { Review } from '../../../core/models/review.model';
import { ReviewCard } from '../../../shared/review-card/review-card';
import { StarRating } from '../../../shared/star-rating/star-rating';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReviewCard, StarRating],
  templateUrl: './album-detail.html',
  styleUrl: './album-detail.scss',
})
export class AlbumDetail implements OnInit, OnDestroy {
  album: AlbumDetailModel | null = null;
  reviews: Review[] = [];
  averageRating = 0;
  totalReviews = 0;

  loadingAlbum = true;
  loadingReviews = true;
  albumError: string | null = null;

  private paramsSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private albumService: AlbumService,
    private reviewService: ReviewService,
  ) {}

  ngOnInit(): void {
    // paramMap por si algún día se navega de un álbum a otro sin
    // recrear el componente (p. ej. desde tracklist de otra vista).
    this.paramsSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) this.loadAlbum(id);
    });
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
  }

  private loadAlbum(spotifyAlbumId: string): void {
    this.loadingAlbum = true;
    this.loadingReviews = true;
    this.albumError = null;
    this.album = null;
    this.reviews = [];

    this.albumService.getById(spotifyAlbumId).subscribe({
      next: (album) => {
        this.album = album;
        this.loadingAlbum = false;
      },
      error: () => {
        this.albumError = 'No pudimos cargar este álbum. Puede que ya no exista en Spotify.';
        this.loadingAlbum = false;
      },
    });

    this.reviewService.getAlbumReviews(spotifyAlbumId).subscribe({
      next: (res) => {
        this.reviews = res.reviews;
        this.averageRating = res.averageRating;
        this.totalReviews = res.totalReviews;
        this.loadingReviews = false;
      },
      error: () => {
        // Si esto falla igual mostramos el álbum; simplemente la
        // sección de reseñas queda vacía.
        this.loadingReviews = false;
      },
    });
  }

  get tracklist(): string[] {
    return this.album?.tracklist ?? [];
  }

  get formattedRating(): string {
    const rating = this.album?.platformRating ?? this.averageRating;
    return rating ? rating.toFixed(1) : '—';
  }
}