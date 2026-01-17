import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonInput,IonIcon, IonModal, IonHeader, IonToolbar, IonTitle, ModalController } from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/shared/services/header.service';
import { addIcons } from 'ionicons';
import { play, pause, refresh, stop, add , timerOutline} from 'ionicons/icons';

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

  constructor(private headerService: HeaderService) {
    addIcons({ play, pause, refresh, stop, add, timerOutline });
  }

  ngOnInit() {
    this.headerService.updateHeaderData({
      title: 'Timer',
      subtitle: 'Countdown timer',
      image: 'timer-outline',
      imageType: 'icon',
      showBack: true,
      showMenu: true,
      backNavigationUrl: '/workspace/clock'
    });
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
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
  }

  private finish() {
    this.isRunning = false;
    this.isFinished = true;
    this.remainingTime = 0;
    this.updateDisplay();
    if (this.interval) clearInterval(this.interval);
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
    
    // Update progress ring - fill as time counts down
    if (this.totalTime > 0) {
      const progress = (this.totalTime - this.remainingTime) / this.totalTime;
      this.dashOffset = this.circumference - (progress * this.circumference);
    }
  }
}