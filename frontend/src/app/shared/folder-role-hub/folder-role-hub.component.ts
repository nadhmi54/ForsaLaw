import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { FolderComponent } from '../folder/folder.component';

export type FolderHubView =
  | 'closed'
  | 'role_pick'
  | 'client_guides'
  | 'avocat_guides';

@Component({
  selector: 'app-folder-role-hub',
  standalone: true,
  imports: [CommonModule, FolderComponent],
  templateUrl: './folder-role-hub.component.html',
  styleUrl: './folder-role-hub.component.scss'
})
export class FolderRoleHubComponent {
  @Input() color = '#5227FF';
  /** 1.5 évite un débordement visuel trop fort (le conteneur réserve l’espace via --folder-scale) */
  @Input() size = 1.5;
  @Input() className = '';
  /** Dossier principal : feuilles vides (le choix se fait en dessous) */
  @Input() mainItems: (string | null)[] = [];
  @Input() clientGuides: string[] = [];
  @Input() avocatGuides: string[] = [];
  @Input() clientFolderColor = '#2563EB';
  @Input() avocatFolderColor = '#6D28D9';

  readonly view = signal<FolderHubView>('closed');

  mainOpen(): boolean {
    return this.view() !== 'closed';
  }

  onMainOpenChange(open: boolean): void {
    if (open) {
      this.view.set('role_pick');
    } else {
      this.view.set('closed');
    }
  }

  openClientGuides(): void {
    this.view.set('client_guides');
  }

  openAvocatGuides(): void {
    this.view.set('avocat_guides');
  }

  backToRolePick(): void {
    this.view.set('role_pick');
  }

  hintText(): string {
    switch (this.view()) {
      case 'closed':
        return 'Cliquez sur le dossier pour ouvrir le choix Client / Avocat.';
      case 'role_pick':
        return 'Les deux dossiers sont au-dessus : cliquez sur Client ou Avocat, ou refermez le dossier principal.';
      case 'client_guides':
        return 'Résumé de l’espace clients — retour pour choisir un autre rôle.';
      case 'avocat_guides':
        return 'Résumé de l’espace avocats — retour pour choisir un autre rôle.';
      default:
        return '';
    }
  }
}
