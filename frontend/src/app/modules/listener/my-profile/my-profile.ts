import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { UserService } from '../../../core/services/user';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-profile.html',
  styleUrls: ['./my-profile.scss'],
})
export class MyProfileComponent implements OnInit {
  user: any = null;
  loading: boolean = true;

  selectedTab: 'reviews' | 'lists' | 'likes' = 'reviews';

  stats = {
    reviews: 0,
    followers: 0,
    following: 0,
    rating: 0,
  };

  badges = [
    { icon: '🎵', name: 'Primera Reseña' },
    { icon: '🔥', name: '50 Reseñas' },
    { icon: '❤️', name: '100 Likes' },
    { icon: '🎯', name: 'Crítica Precisa' },
  ];

  reviews: any[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (currentUser) => {
        this.user = currentUser;
        this.loading = false;

        // El endpoint /api/auth/me no trae followersCount/followingCount/reviewsCount,
        // así que pedimos el perfil público del propio usuario (GET /api/users/{id})
        // para completar las estadísticas mostradas en la cabecera.
        if (currentUser?.id) {
          this.userService.getPublicProfile(currentUser.id).subscribe({
            next: (profile) => {
              this.stats = {
                reviews: profile.reviewsCount,
                followers: profile.followersCount,
                following: profile.followingCount,
                rating: this.stats.rating, // no viene en este endpoint; se deja como estaba
              };
            },
            error: () => {
              // si falla, se mantienen las estadísticas en 0 sin romper la vista
            }
          });
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get levelProgressPercent(): number {
    if (!this.user?.points || !this.user?.nextLevel) return 0;
    return Math.min(100, Math.round((this.user.points / this.user.nextLevel) * 100));
  }

  selectTab(tab: 'reviews' | 'lists' | 'likes'): void {
    this.selectedTab = tab;
  }


  
}