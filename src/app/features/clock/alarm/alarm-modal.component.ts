import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, time } from 'ionicons/icons';

@Component({
  selector: 'app-alarm-modal',
  standalone: true,
  imports: [CommonModule, IonButton],
  template: `
    <div class="alarm-modal-content">
      <div class="alarm-header">
        <div class="alarm-icon">⏰</div>
        <h1>Alarm</h1>
      </div>
      
      <div class="alarm-time">{{ time }}</div>
      
      <div class="alarm-details">
        <div class="alarm-label">{{ label }}</div>
        <div class="alarm-sound">{{ sound.charAt(0).toUpperCase() + sound.slice(1) }} sound</div>
      </div>
      
      <div class="alarm-actions">
        <ion-button expand="block" size="large" fill="outline" (click)="snooze()">
          Snooze (1 min)
        </ion-button>
        <ion-button expand="block" size="large" (click)="dismiss()">
          Dismiss
        </ion-button>
      </div>
    </div>
  `,
  styles: [`
    .alarm-modal-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
      text-align: center;
    }
    
    .alarm-header {
      margin-bottom: 24px;
      
      .alarm-icon {
        font-size: 64px;
        margin-bottom: 16px;
        animation: ring 1s ease-in-out infinite;
      }
      
      h1 {
        font-size: 24px;
        font-weight: 600;
        color: white;
        margin: 0;
      }
    }
    
    .alarm-time {
      font-size: 72px;
      font-weight: 800;
      color: white;
      margin: 24px 0;
      letter-spacing: -2px;
      text-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    
    .alarm-details {
      margin-bottom: 40px;
      
      .alarm-label {
        font-size: 24px;
        font-weight: 600;
        color: white;
        margin-bottom: 8px;
      }
      
      .alarm-sound {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.8);
      }
    }
    
    .alarm-actions {
      width: 100%;
      max-width: 320px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      ion-button {
        --border-radius: 16px;
        --padding-top: 16px;
        --padding-bottom: 16px;
        font-weight: 600;
        font-size: 18px;
        
        &[fill="outline"] {
          --background: rgba(255, 255, 255, 0.2);
          --color: white;
          --border-color: white;
          --border-width: 2px;
          
          &:hover {
            --background: rgba(255, 255, 255, 0.3);
          }
        }
        
        &:not([fill="outline"]) {
          --background: white;
          --color: var(--ion-color-primary);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          
          &:hover {
            --background: rgba(255, 255, 255, 0.95);
          }
        }
      }
    }
    
    @keyframes ring {
      0%, 100% { transform: rotate(-10deg); }
      50% { transform: rotate(10deg); }
    }
  `]
})
export class AlarmModalComponent {
  @Input() time!: string;
  @Input() label!: string;
  @Input() sound!: string;

  constructor(private modalController: ModalController) {
    addIcons({ close, time });
  }

  snooze() {
    this.modalController.dismiss({ snooze: true });
  }

  dismiss() {
    this.modalController.dismiss({ snooze: false });
  }
}
