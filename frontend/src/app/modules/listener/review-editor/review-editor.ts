import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlbumService } from '../../../core/services/album';
import { ReviewService } from '../../../core/services/review';
import { AlbumDetail } from '../../../core/models/album.model';
import { MissionCompletedInfo } from '../../../core/models/review.model';

const MIN_CONTENT = 50;
const MAX_CONTENT = 2000;

@Component({
  selector: 'app-review-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './review-editor.html',
  styleUrl: './review-editor.scss',
})
export class ReviewEditor implements OnInit {
  // Estado en signals: la app corre Angular zoneless (sin zone.js), así
  // que mutar propiedades planas dentro de un .subscribe() no repinta
  // la vista. Ver notas en album-search.ts / album-detail.ts.
  album = signal<AlbumDetail | null>(null);
  loadingAlbum = signal(true);
  albumError = signal<string | null>(null);

  rating = signal(0);
  content = signal('');

  submitting = signal(false);
  submitError = signal<string | null>(null);
  missionCompleted = signal<MissionCompletedInfo | null>(null);
  justPublished = signal(false);

  readonly minContent = MIN_CONTENT;
  readonly maxContent = MAX_CONTENT;

  // true si el usuario ya tenía una reseña para este álbum (myReview
  // != null): en ese caso el submit hace PUT en vez de POST.
  isEditMode = computed(() => !!this.album()?.myReview);

  charCount = computed(() => this.content().length);

  canSubmit = computed(() => {
    const len = this.content().trim().length;
    return (
      this.rating() >= 1 &&
      this.rating() <= 5 &&
      len >= MIN_CONTENT &&
      this.content().length <= MAX_CONTENT &&
      !this.submitting()
    );
  });

  starLabel = computed(() => {
    const labels: Record<number, string> = {
      1: 'Muy malo (1/5)',
      2: 'Malo (2/5)',
      3: 'Regular (3/5)',
      4: 'Bueno (4/5)',
      5: 'Muy bueno (5/5)',
    };
    return labels[this.rating()] ?? 'Selecciona una calificación';
  });

  private spotifyAlbumId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private albumService: AlbumService,
    private reviewService: ReviewService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.albumError.set('No se especificó ningún álbum.');
      this.loadingAlbum.set(false);
      return;
    }
    this.spotifyAlbumId = id;
    this.loadAlbum(id);
  }

  private loadAlbum(id: string): void {
    this.loadingAlbum.set(true);
    this.albumError.set(null);

    this.albumService.getById(id).subscribe({
      next: (album) => {
        this.album.set(album);
        this.loadingAlbum.set(false);

        // Si ya existe una reseña mía, precargamos el formulario en
        // modo edición para no chocar con el 409 del contrato
        // ("ya existe reseña del usuario para ese álbum").
        if (album.myReview) {
          this.rating.set(album.myReview.rating ?? 0);
          this.content.set(album.myReview.content ?? '');
        }
      },
      error: (err) => {
        this.albumError.set(
          err?.name === 'TimeoutError'
            ? 'La carga está tardando demasiado. Intenta de nuevo.'
            : 'No pudimos cargar este álbum. Puede que ya no exista en Spotify.',
        );
        this.loadingAlbum.set(false);
      },
    });
  }

  selectStar(n: number): void {
    this.rating.set(n);
  }

  onContentInput(value: string): void {
    this.content.set(value);
  }

  submit(): void {
    if (!this.canSubmit()) return;
    const album = this.album();
    if (!album) return;

    this.submitting.set(true);
    this.submitError.set(null);

    if (this.isEditMode() && album.myReview) {
      this.reviewService.update(album.myReview.id, { rating: this.rating(), content: this.content() }).subscribe({
        next: () => {
          this.submitting.set(false);
          this.justPublished.set(true);
          this.goBackToAlbum();
        },
        error: (err) => this.handleSubmitError(err),
      });
      return;
    }

    this.reviewService
      .create({
        spotifyAlbumId: this.spotifyAlbumId,
        albumName: album.name,
        artistName: album.artist,
        coverUrl: album.coverUrl ?? '',
        rating: this.rating(),
        content: this.content(),
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.justPublished.set(true);
          if (res.missionCompleted) {
            this.missionCompleted.set(res.missionCompleted);
            // Dejamos ver el aviso de misión completada un momento
            // antes de volver al álbum.
            setTimeout(() => this.goBackToAlbum(), 1800);
          } else {
            this.goBackToAlbum();
          }
        },
        error: (err) => this.handleSubmitError(err),
      });
  }

  private handleSubmitError(err: any): void {
    this.submitting.set(false);
    if (err?.status === 409) {
      // Carrera rara: alguien más publicó desde otra pestaña justo
      // antes. Recargamos el álbum para caer en modo edición.
      this.submitError.set('Ya tienes una reseña para este álbum. Recargando para editarla…');
      this.loadAlbum(this.spotifyAlbumId);
      return;
    }
    if (err?.status === 400) {
      this.submitError.set(
        err?.error?.message ?? 'Revisa la calificación y el texto: hay datos inválidos.',
      );
      return;
    }
    this.submitError.set('No pudimos publicar tu reseña. Intenta de nuevo.');
  }

  cancel(): void {
    this.goBackToAlbum();
  }

  private goBackToAlbum(): void {
    this.router.navigate(['/listener/album', this.spotifyAlbumId]);
  }
}
