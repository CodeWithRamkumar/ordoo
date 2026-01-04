import { Component, Input, OnInit } from '@angular/core';
import { IonFooter, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { TabsComponent } from "../tabs/tabs.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [IonFooter, IonTitle, IonToolbar, CommonModule]
})
export class FooterComponent  implements OnInit {
  constructor() { }

  ngOnInit() {}

}
