import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HeaderData } from 'src/app/core/utils/header-data';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private headerDataSubject = new BehaviorSubject<HeaderData>({
    title: 'My Workspace',
    subtitle: 'Access all your applications',
    image: 'assets/icon/ordoo-logo.svg',
    imageType:'image',
    showBack: false,
    showMenu: true,
    backNavigationUrl: ''
  });

  headerData$ = this.headerDataSubject.asObservable();

  updateHeaderData(data: HeaderData) {
    this.headerDataSubject.next(data);
  }
}