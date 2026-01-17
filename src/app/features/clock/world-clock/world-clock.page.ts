import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonIcon, IonFab, IonFabButton, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/shared/services/header.service';
import { DropdownComponent } from 'src/app/shared/components/dropdown/dropdown.component';
import { addIcons } from 'ionicons';
import { globeOutline, add, close } from 'ionicons/icons';
import * as timezoneDataImport from '../../../../assets/data/timezones.json';

interface WorldClock {
  city: string;
  timezone: string;
  time: string;
  date: string;
}

interface TimezoneData {
  city: string;
  country: string;
  timezone: string;
}

@Component({
  selector: 'app-world-clock',
  templateUrl: './world-clock.page.html',
  styleUrls: ['./world-clock.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonCard, IonCardContent, IonFab, IonFabButton, IonIcon, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, DropdownComponent]
})
export class WorldClockPage implements OnInit, OnDestroy {
  worldClocks: WorldClock[] = [];
  private timeInterval: any;
  isModalOpen = false;
  selectedCountry: any = null;
  selectedCity: any = null;
  customLabel = '';
  
  timezoneData = (timezoneDataImport as any).default.sort((a: TimezoneData, b: TimezoneData) => a.country.localeCompare(b.country));

  countryFilterDetails: any;
  cityFilterDetails: any;

  get uniqueCountries() {
    const countries = new Set<string>();
    this.timezoneData.forEach((tz: TimezoneData) => countries.add(tz.country));
    return Array.from(countries).map(country => ({ label: country, value: country }));
  }

  get filteredCities() {
    if (!this.selectedCountry) return [];
    return this.timezoneData
      .filter((tz: TimezoneData) => tz.country === this.selectedCountry)
      .map((tz: TimezoneData) => ({ label: tz.city, value: tz.city }));
  }

  constructor(private headerService: HeaderService) {
    addIcons({ globeOutline, add, close });
    this.countryFilterDetails = {
      dropDownList: [],
      dropDownSelectedList: null,
      dropDownType: 'single',
      placeHolder: 'Select Country',
      dropDownTemplateType: 'Common',
      isSearchEnable: true
    };
    this.cityFilterDetails = {
      dropDownList: [],
      dropDownSelectedList: null,
      dropDownType: 'single',
      placeHolder: 'Select City',
      dropDownTemplateType: 'Common',
      isSearchEnable: true
    };
  }

  ngOnInit() {
    this.initializeDefaultClocks();
    this.countryFilterDetails.dropDownList = this.uniqueCountries;
    this.updateWorldClocks();
    this.timeInterval = setInterval(() => {
      this.updateWorldClocks();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  ionViewDidEnter() {
    this.headerService.updateHeaderData({
      title: 'World Clock',
      subtitle: 'Global time zones',
      image: 'globe-outline',
      imageType: 'icon',
      showBack: true,
      showMenu: true,
      backNavigationUrl: '/workspace/clock'
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedCountry = null;
    this.selectedCity = null;
    this.customLabel = '';
    this.countryFilterDetails.dropDownSelectedList = null;
    this.cityFilterDetails.dropDownSelectedList = null;
  }

  onCountryChange(filterDetails: any) {
    if (filterDetails.typeOfClose === 'Change') {
      this.selectedCountry = filterDetails.dropDownSelectedList;
      this.selectedCity = null;
      this.customLabel = '';
      this.cityFilterDetails.dropDownList = this.filteredCities;
      this.cityFilterDetails.dropDownSelectedList = null;
    }
  }

  onCityChange(filterDetails: any) {
    if (filterDetails.typeOfClose === 'Change') {
      this.selectedCity = filterDetails.dropDownSelectedList;
      this.customLabel = filterDetails.dropDownSelectedList;
    }
  }

  addClock() {
    if (this.selectedCity && this.customLabel.trim()) {
      const cityData = this.timezoneData.find((tz: TimezoneData) => tz.city === this.selectedCity);
      if (cityData) {
        this.worldClocks.push({
          city: this.customLabel.trim(),
          timezone: cityData.timezone,
          time: '',
          date: ''
        });
        this.updateWorldClocks();
        this.closeModal();
      }
    }
  }

  private updateWorldClocks() {
    this.worldClocks.forEach(clock => {
      const now = new Date();
      const timeInZone = new Date(now.toLocaleString('en-US', { timeZone: clock.timezone }));
      
      clock.time = timeInZone.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      clock.date = timeInZone.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    });
  }

  private initializeDefaultClocks() {
    const defaultTimezones = [
      { city: 'New York', timezone: 'America/New_York' },
      { city: 'London', timezone: 'Europe/London' },
      { city: 'Tokyo', timezone: 'Asia/Tokyo' },
      { city: 'Dubai', timezone: 'Asia/Dubai' },
      { city: 'Mumbai', timezone: 'Asia/Kolkata' },
      { city: 'Sydney', timezone: 'Australia/Sydney' }
    ];
    
    this.worldClocks = defaultTimezones.map(tz => ({
      city: tz.city,
      timezone: tz.timezone,
      time: '',
      date: ''
    }));
  }
}