import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonIcon, IonToggle, IonInput, IonSelect, IonSelectOption, AlertController, ModalController } from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/shared/services/header.service';
import { addIcons } from 'ionicons';
import { add, alarm, trash, pencil, checkmark, close, time, notifications } from 'ionicons/icons';
import { AlarmModalComponent } from './alarm-modal.component';

interface Alarm {
  id: string;
  time: string;
  label: string;
  isActive: boolean;
  repeatDays: string[];
  sound: string;
}

@Component({
  selector: 'app-alarm',
  templateUrl: './alarm.page.html',
  styleUrls: ['./alarm.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonIcon, IonToggle, IonInput, IonSelect, IonSelectOption]
})
export class AlarmPage implements OnInit, OnDestroy {
  alarms: Alarm[] = [];
  showTimePicker = false;
  selectedHour = '07';
  selectedMinute = '00';
  selectedPeriod = 'AM';
  
  hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  minutes = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'));
  editingAlarm: Alarm | null = null;
  
  newAlarm: Alarm = {
    id: '',
    time: '07:00',
    label: 'Alarm',
    isActive: true,
    repeatDays: [],
    sound: 'default'
  };

  weekDays = [
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' }
  ];

  sounds = [
    { value: 'default', label: 'Default' },
    { value: 'gentle', label: 'Gentle' },
    { value: 'classic', label: 'Classic' },
    { value: 'digital', label: 'Digital' }
  ];

  private alarmTimeouts: Map<string, any> = new Map();
  private audio: HTMLAudioElement | null = null;
  private isAlarmActive = false;

  constructor(private headerService: HeaderService, private alertController: AlertController, private modalController: ModalController) {
    addIcons({ add, alarm, trash, pencil, checkmark, close, time, notifications });
    this.loadAlarms();
  }

  ngOnInit() {
    this.headerService.updateHeaderData({
      title: 'Alarm',
      subtitle: 'Set and manage alarms',
      image: 'alarm',
      imageType: 'icon',
      showBack: true,
      showMenu: true,
      backNavigationUrl: '/workspace/clock'
    });
    this.requestNotificationPermission();
  }

  ngOnDestroy() {
    this.clearAllTimeouts();
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }

  formatTime12Hour(time24: string): string {
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${period}`;
  }

  confirmTime() {
    const hour24 = this.selectedPeriod === 'AM' 
      ? (this.selectedHour === '12' ? '00' : this.selectedHour)
      : (this.selectedHour === '12' ? '12' : (parseInt(this.selectedHour) + 12).toString().padStart(2, '0'));
    
    this.newAlarm.time = `${hour24}:${this.selectedMinute}`;
    this.showTimePicker = false;
  }

  updateTime() {
    const hour24 = this.selectedPeriod === 'AM' 
      ? (this.selectedHour === '12' ? '00' : this.selectedHour)
      : (this.selectedHour === '12' ? '12' : (parseInt(this.selectedHour) + 12).toString().padStart(2, '0'));
    
    this.newAlarm.time = `${hour24}:${this.selectedMinute}`;
  }

  cancelEdit() {
    this.editingAlarm = null;
    this.resetNewAlarm();
  }

  editAlarm(alarm: Alarm) {
    this.editingAlarm = alarm;
    this.newAlarm = { ...alarm };
    
    // Update time picker values based on alarm time
    const [hours, minutes] = alarm.time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    
    this.selectedHour = hour12.toString().padStart(2, '0');
    this.selectedMinute = minutes;
    this.selectedPeriod = period;
  }



  saveAlarm() {
    if (this.editingAlarm) {
      const index = this.alarms.findIndex(a => a.id === this.editingAlarm!.id);
      if (index !== -1) {
        this.alarms[index] = { ...this.newAlarm, isActive: true };
        this.scheduleAlarm(this.alarms[index]);
      }
    } else {
      const alarm: Alarm = {
        ...this.newAlarm,
        id: Date.now().toString()
      };
      this.alarms.push(alarm);
      this.scheduleAlarm(alarm);
    }
    this.saveAlarms();
    this.cancelEdit();
  }

  deleteAlarm(alarmId: string) {
    this.clearTimeout(alarmId);
    this.alarms = this.alarms.filter(a => a.id !== alarmId);
    this.saveAlarms();
  }

  toggleAlarm(alarm: Alarm) {
    alarm.isActive = !alarm.isActive;
    if (alarm.isActive) {
      this.scheduleAlarm(alarm);
    } else {
      this.clearTimeout(alarm.id);
    }
    this.saveAlarms();
    
    // Force change detection
    this.alarms = [...this.alarms];
  }

  toggleRepeatDay(day: string) {
    const index = this.newAlarm.repeatDays.indexOf(day);
    if (index > -1) {
      this.newAlarm.repeatDays.splice(index, 1);
    } else {
      this.newAlarm.repeatDays.push(day);
    }
  }

  isDaySelected(day: string): boolean {
    return this.newAlarm.repeatDays.includes(day);
  }

  getRepeatText(alarm: Alarm): string {
    if (alarm.repeatDays.length === 0) return 'Once';
    if (alarm.repeatDays.length === 7) return 'Every day';
    if (alarm.repeatDays.length === 5 && 
        ['mon', 'tue', 'wed', 'thu', 'fri'].every(day => alarm.repeatDays.includes(day))) {
      return 'Weekdays';
    }
    return alarm.repeatDays.map(day => 
      this.weekDays.find(d => d.key === day)?.label
    ).join(', ');
  }

  private scheduleAlarm(alarm: Alarm) {
    if (!alarm.isActive) return;

    this.clearTimeout(alarm.id);
    const now = new Date();
    const [hours, minutes] = alarm.time.split(':').map(Number);
    
    const scheduleNext = () => {
      const alarmTime = new Date();
      alarmTime.setHours(hours, minutes, 0, 0);
      
      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
      }
      
      if (alarm.repeatDays.length > 0) {
        while (!this.shouldAlarmRing(alarmTime, alarm.repeatDays)) {
          alarmTime.setDate(alarmTime.getDate() + 1);
        }
      }
      
      const timeout = alarmTime.getTime() - now.getTime();
      const timeoutId = setTimeout(() => {
        this.triggerAlarm(alarm);
        if (alarm.repeatDays.length > 0) {
          scheduleNext();
        }
      }, timeout);
      
      this.alarmTimeouts.set(alarm.id, timeoutId);
    };
    
    scheduleNext();
  }

  private shouldAlarmRing(date: Date, repeatDays: string[]): boolean {
    const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayKey = dayMap[date.getDay()];
    return repeatDays.includes(dayKey);
  }

  private async triggerAlarm(alarm: Alarm) {
    // Prevent multiple alarms at the same time
    if (this.isAlarmActive) return;
    this.isAlarmActive = true;
    
    this.playAlarmSound(alarm.sound);
    
    // Vibrate on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    // Show notification on mobile
    if ('Notification' in window && Notification.permission === 'granted' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      const notification = new Notification(`🔔 ${alarm.label}`, {
        body: `Time: ${this.formatTime12Hour(alarm.time)}`,
        icon: '/assets/icon/favicon.png',
        requireInteraction: true
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
    
    // Show ionic modal
    const modal = await this.modalController.create({
      component: AlarmModalComponent,
      componentProps: {
        time: this.formatTime12Hour(alarm.time),
        label: alarm.label,
        sound: alarm.sound
      },
      backdropDismiss: false,
      cssClass: 'alarm-modal'
    });
    
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    // Stop sound
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    
    this.isAlarmActive = false;
    
    // Handle snooze
    if (data?.snooze) {
      this.snoozeAlarm(alarm);
    }
    
    // If it's a one-time alarm (no repeat days), disable it
    if (alarm.repeatDays.length === 0) {
      alarm.isActive = false;
      this.saveAlarms();
      this.alarms = [...this.alarms];
    }
  }

  private snoozeAlarm(alarm: Alarm) {
    // Stop current sound
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    
    // Schedule alarm for 1 minute later
    const timeoutId = setTimeout(() => {
      this.triggerAlarm(alarm);
    }, 1 * 60 * 1000);
    
    this.alarmTimeouts.set(`snooze-${alarm.id}`, timeoutId);
  }

  private playAlarmSound(sound: string) {
    try {
      const soundMap: { [key: string]: string } = {
        'default': 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
        'gentle': 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
        'classic': 'https://assets.mixkit.co/active_storage/sfx/2860/2860-preview.mp3',
        'digital': 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
      };
      
      this.audio = new Audio(soundMap[sound] || soundMap['default']);
      this.audio.loop = true;
      this.audio.play().catch(err => console.error('Audio play failed:', err));
    } catch (error) {
      console.error('Error playing alarm sound:', error);
    }
  }

  private clearTimeout(alarmId: string) {
    const timeoutId = this.alarmTimeouts.get(alarmId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.alarmTimeouts.delete(alarmId);
    }
  }

  private clearAllTimeouts() {
    this.alarmTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.alarmTimeouts.clear();
  }

  private saveAlarms() {
    localStorage.setItem('ordoo-alarms', JSON.stringify(this.alarms));
  }

  private loadAlarms() {
    const saved = localStorage.getItem('ordoo-alarms');
    if (saved) {
      const loadedAlarms = JSON.parse(saved);
      
      // Remove duplicates based on time
      const uniqueAlarms = loadedAlarms.filter((alarm: Alarm, index: number, self: Alarm[]) => 
        index === self.findIndex(a => a.time === alarm.time)
      );
      
      this.alarms = uniqueAlarms;
      this.alarms.forEach(alarm => {
        if (alarm.isActive) {
          this.scheduleAlarm(alarm);
        }
      });
      
      // Save cleaned alarms back
      if (loadedAlarms.length !== uniqueAlarms.length) {
        this.saveAlarms();
      }
    }
  }

  private resetNewAlarm() {
    this.newAlarm = {
      id: '',
      time: '07:00',
      label: 'Alarm',
      isActive: true,
      repeatDays: [],
      sound: 'default'
    };
    
    // Reset time picker values
    this.selectedHour = '07';
    this.selectedMinute = '00';
    this.selectedPeriod = 'AM';
  }

  private requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      });
    }
  }
}
