import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  inject,
  signal
} from '@angular/core';

function darkenColor(hex: string, percent: number): string {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return (
    '#' +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}

@Component({
  selector: 'app-folder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './folder.component.html',
  styleUrl: './folder.component.scss'
})
export class FolderComponent implements OnDestroy {
  private readonly ngZone = inject(NgZone);
  private paperMoveRaf = 0;

  @Input() color = '#5227FF';
  @Input() size = 1;
  @Input() className = '';
  /** Contenu optionnel sur chaque feuille (max 3) */
  @Input() items: (string | null)[] = [];
  /**
   * Si défini, l’ouverture est pilotée par le parent (ex. hub multi-étapes).
   * Sinon le composant gère son propre état.
   */
  @Input() controlledOpen: boolean | undefined = undefined;
  /** Émis quand `controlledOpen` est défini et que l’utilisateur clique pour ouvrir/fermer */
  @Output() openChange = new EventEmitter<boolean>();
  /** Si false, le dossier est décoratif (pas de clic / focus) */
  @Input() interactive = true;

  readonly maxItems = 3;

  readonly folderOpen = signal(false);
  readonly paperOffsets = signal<{ x: number; y: number }[]>(
    Array.from({ length: this.maxItems }, () => ({ x: 0, y: 0 }))
  );

  get papers(): (string | null)[] {
    const p = this.items.slice(0, this.maxItems);
    while (p.length < this.maxItems) {
      p.push(null);
    }
    return p;
  }

  get folderBackColor(): string {
    return darkenColor(this.color, 0.08);
  }

  get paper1(): string {
    return darkenColor('#ffffff', 0.1);
  }

  get paper2(): string {
    return darkenColor('#ffffff', 0.05);
  }

  get paper3(): string {
    return '#ffffff';
  }

  /** État affiché : parent ou signal interne */
  isOpen(): boolean {
    return this.controlledOpen !== undefined
      ? this.controlledOpen
      : this.folderOpen();
  }

  get folderStyle(): Record<string, string> {
    return {
      '--folder-color': this.color,
      '--folder-back-color': this.folderBackColor,
      '--paper-1': this.paper1,
      '--paper-2': this.paper2,
      '--paper-3': this.paper3
    };
  }

  paperStyle(index: number): Record<string, string> {
    if (!this.isOpen()) {
      return {};
    }
    const o = this.paperOffsets()[index];
    return {
      '--magnet-x': `${o?.x ?? 0}px`,
      '--magnet-y': `${o?.y ?? 0}px`
    };
  }

  toggleOpen(): void {
    if (!this.interactive) {
      return;
    }
    if (this.controlledOpen !== undefined) {
      this.openChange.emit(!this.controlledOpen);
      return;
    }
    const next = !this.folderOpen();
    this.folderOpen.set(next);
    if (!next) {
      this.paperOffsets.set(
        Array.from({ length: this.maxItems }, () => ({ x: 0, y: 0 }))
      );
    }
  }

  onPaperMouseMove(event: MouseEvent, index: number): void {
    if (!this.interactive || !this.isOpen()) {
      return;
    }
    const el = event.currentTarget as HTMLElement;
    cancelAnimationFrame(this.paperMoveRaf);
    this.paperMoveRaf = requestAnimationFrame(() => {
      this.paperMoveRaf = 0;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const offsetX = (event.clientX - centerX) * 0.15;
      const offsetY = (event.clientY - centerY) * 0.15;
      this.ngZone.run(() => {
        this.paperOffsets.update((prev) => {
          const next = [...prev];
          next[index] = { x: offsetX, y: offsetY };
          return next;
        });
      });
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.paperMoveRaf);
  }

  onPaperMouseLeave(index: number): void {
    this.paperOffsets.update((prev) => {
      const next = [...prev];
      next[index] = { x: 0, y: 0 };
      return next;
    });
  }
}
