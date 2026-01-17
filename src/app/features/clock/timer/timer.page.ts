import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonInput,IonIcon, IonModal, IonHeader, IonToolbar, IonTitle, Platform, AlertController } from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/shared/services/header.service';
import { addIcons } from 'ionicons';
import { play, pause, refresh, stop, add , timerOutline} from 'ionicons/icons';
import { LocalNotifications, ActionPerformed } from '@capacitor/local-notifications';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.page.html',
  styleUrls: ['./timer.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonInput, IonIcon, IonModal, IonHeader, IonToolbar, IonTitle]
})
export class TimerPage implements OnInit, OnDestroy {
  totalTime = 0;
  remainingTime = 0;
  display = '00:00';
  isRunning = false;
  isFinished = false;
  circumference = 2 * Math.PI * 96;
  dashOffset = this.circumference;
  hours = 0;
  minutes = 0;
  seconds = 0;
  isModalOpen = false;
  modalHours: number | null = null;
  modalMinutes: number | null = null;
  modalSeconds: number | null = null;
  private interval: any;
  private audio: HTMLAudioElement | null = null;

  constructor(
    private headerService: HeaderService,
    private platform: Platform,
    private alertController: AlertController
  ) {
    addIcons({ play, pause, refresh, stop, add, timerOutline });
  }

  async ngOnInit() {
    this.headerService.updateHeaderData({
      title: 'Timer',
      subtitle: 'Countdown timer',
      image: 'timer-outline',
      imageType: 'icon',
      showBack: true,
      showMenu: true,
      backNavigationUrl: '/workspace/clock'
    });

    if (this.platform.is('capacitor')) {
      await LocalNotifications.requestPermissions();
      
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: 'TIMER_ACTIONS',
            actions: [
              {
                id: 'dismiss',
                title: 'Dismiss'
              }
            ]
          }
        ]
      });

      LocalNotifications.addListener('localNotificationActionPerformed', (action: ActionPerformed) => {
        this.clear();
      });
    }
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
    this.stopSound();
    if (this.platform.is('capacitor')) {
      LocalNotifications.removeAllListeners();
    }
  }

  setTimerFromInputs() {
    if (this.hours > 0 || this.minutes > 0 || this.seconds > 0) {
      this.setTimer(this.hours, this.minutes, this.seconds);
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  setTimerFromModal() {
    const hours = this.modalHours || 0;
    const minutes = this.modalMinutes || 0;
    const seconds = this.modalSeconds || 0;
    if (hours > 0 || minutes > 0 || seconds > 0) {
      this.setTimer(hours, minutes, seconds);
      this.modalHours = null;
      this.modalMinutes = null;
      this.modalSeconds = null;
      this.closeModal();
    }
  }

  validateInput(field: string) {
    if (field === 'hours') {
      this.modalHours = Math.max(0, Math.min(99, this.modalHours || 0));
    } else if (field === 'minutes') {
      this.modalMinutes = Math.max(0, Math.min(99, this.modalMinutes || 0));
    } else if (field === 'seconds') {
      this.modalSeconds = Math.max(0, Math.min(99, this.modalSeconds || 0));
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }

  onInput(event: any, field: string) {
    let value = event.target.value;
    if (value.length > 2) {
      value = value.slice(0, 2);
      event.target.value = value;
    }
    
    const numValue = parseInt(value) || 0;
    if (field === 'hours') {
      this.modalHours = Math.min(99, numValue);
    } else if (field === 'minutes') {
      this.modalMinutes = Math.min(99, numValue);
    } else if (field === 'seconds') {
      this.modalSeconds = Math.min(99, numValue);
    }
  }

  setTimer(hours: number, minutes: number, seconds: number) {
    this.totalTime = (hours * 3600) + (minutes * 60) + seconds;
    this.remainingTime = this.totalTime;
    this.isFinished = false;
    this.updateDisplay();
  }

  getStatusLabel(): string {
    if (this.isFinished) return 'Finished';
    if (this.isRunning) return 'Running';
    if (this.totalTime > 0) return 'Paused';
    return 'Set Timer';
  }

  start() {
    if (this.remainingTime > 0 && !this.isRunning) {
      this.isRunning = true;
      this.interval = setInterval(() => {
        this.remainingTime--;
        this.updateDisplay();
        
        if (this.remainingTime <= 0) {
          this.finish();
        }
      }, 1000);
    }
  }

  pause() {
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  reset() {
    this.pause();
    this.remainingTime = this.totalTime;
    this.isFinished = false;
    this.updateDisplay();
  }

  clear() {
    this.pause();
    this.totalTime = 0;
    this.remainingTime = 0;
    this.isFinished = false;
    this.display = '00:00';
    this.dashOffset = this.circumference;
    this.stopSound();
  }

  private async finish() {
    this.isRunning = false;
    this.isFinished = true;
    this.remainingTime = 0;
    this.updateDisplay();
    if (this.interval) clearInterval(this.interval);
    
    this.playSound();
    await this.showNotification();
  }

  private playSound() {
    this.audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvzn0pBSh+zPDajzsKElyx6OyrWBUIQ5zd8sFuJAUuhM/z24k2CBdju+zooVARC0yl4fG5ZRwFNo3V7859KQUofsz');
    this.audio.loop = true;
    this.audio.play().catch(e => console.log('Audio play failed:', e));
  }

  private stopSound() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }

  private async showNotification() {
    if (this.platform.is('capacitor')) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Timer Complete!',
            body: 'Your countdown timer has finished.',
            id: 1,
            sound: 'default',
            actionTypeId: 'TIMER_ACTIONS',
            extra: null,
            ongoing: true
          }
        ]
      });
    } else {
      const alert = await this.alertController.create({
        header: 'Timer Complete!',
        message: 'Your countdown timer has finished.',
        buttons: [
          {
            text: 'Dismiss',
            handler: () => {
              this.clear();
            }
          }
        ],
        backdropDismiss: false
      });
      await alert.present();
    }
  }

  private updateDisplay() {
    const hours = Math.floor(this.remainingTime / 3600);
    const mins = Math.floor((this.remainingTime % 3600) / 60);
    const secs = this.remainingTime % 60;
    
    if (hours > 0) {
      this.display = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      this.display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    if (this.totalTime > 0) {
      const progress = (this.totalTime - this.remainingTime) / this.totalTime;
      this.dashOffset = this.circumference - (progress * this.circumference);
    }
  }
}
