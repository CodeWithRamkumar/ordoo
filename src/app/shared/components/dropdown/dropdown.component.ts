import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  standalone: true,
  imports: [NgSelectModule, FormsModule, CommonModule]
})
export class DropdownComponent {
  private resizeSub!: Subscription;
  private scrollSub!: Subscription;
  @ViewChild('triggerWrapper', { static: false }) triggerWrapper!: ElementRef;
  @ViewChild('ordooDropDown', { static: false }) ordooDropDown: any;
  @Input() filterDetails: any;
  @Output() emitSelectedValues: EventEmitter<string> = new EventEmitter();
  
  private isTriggerClose: boolean = false;
  private DropDownSelectedListTemp: any[] = [];
  private DropDownSingleSelectedBackup = "";

  preventSearchEnter(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onSelectAll() {
    this.filterDetails.dropDownSelectedList = this.filterDetails?.dropDownList.map((x: { value: any; }) => x.value);
  }

  onUnSelectAll() {
    this.filterDetails.dropDownSelectedList = [];
  }

  onCancel() {
    this.ordooDropDown.close();
  }

  onApply() {
    this.isTriggerClose = true;
    this.ordooDropDown.close();
  }

  onDropdownOpen() {
    setTimeout(() => {
      const firstSelected = document.querySelector('.ng-option-selected') as HTMLElement;
      if (firstSelected) {
        firstSelected.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }
    }, 0);
    
    this.isTriggerClose = false;
    this.DropDownSelectedListTemp = [];
    
    if (this.filterDetails?.dropDownType === 'multiple') {
      this.DropDownSelectedListTemp = [...this.filterDetails.dropDownSelectedList];
      if (!this.filterDetails.dropDownSelectedList || this.filterDetails.dropDownSelectedList?.length == 0) {
        this.filterDetails['dropDownSelectedList'] = this.filterDetails['dropDownList']?.map((item: any) => item.value);
      }
    } else {
      this.DropDownSingleSelectedBackup = this.filterDetails.dropDownSelectedList;
    }
  }

  onDropdownClose() {
    if (this.filterDetails?.dropDownType === 'multiple') {
      if (this.isTriggerClose) {
        this.filterDetails.typeOfClose = 'Manual';
        if (this.filterDetails.dropDownSelectedList?.length == this.filterDetails.dropDownList?.length) {
          this.filterDetails.dropDownSelectedList = [];
        }
      } else {
        this.filterDetails.typeOfClose = 'auto';
        this.filterDetails.dropDownSelectedList = this.DropDownSelectedListTemp;
      }
    } else {
      this.filterDetails.typeOfClose = this.DropDownSingleSelectedBackup !== this.filterDetails.dropDownSelectedList ? 'Change' : 'NotChange';
    }
    
    this.emitSelectedValues.emit(this.filterDetails);
    this.isTriggerClose = false;
    this.DropDownSelectedListTemp = [];
    this.resizeSub?.unsubscribe();
    this.scrollSub?.unsubscribe();
  }


  customSearchFn = (searchTerm: string, item: any) => {
    searchTerm = searchTerm.toLowerCase();
    if (this.filterDetails?.groupingEnable) {
      return item.label.toLowerCase().includes(searchTerm) || item?.[this.filterDetails?.groupByText]?.toLowerCase()?.includes(searchTerm);
    }
    return item.label.toLowerCase().includes(searchTerm);
  }

  openFilter() {
    this.positionDropdown();
    this.ordooDropDown?.open();
    this.resizeSub = fromEvent(window, 'resize').subscribe(() => this.positionDropdown());
    this.scrollSub = fromEvent(window, 'scroll').subscribe(() => this.positionDropdown());
  }

  private positionDropdown(): void {
    setTimeout(() => {
      const triggerEl = this.triggerWrapper?.nativeElement;
      const panelEl = document.querySelector('.ng-dropdown-panel') as HTMLElement;

      if (!triggerEl || !panelEl || !this.ordooDropDown?.isOpen) return;

      const triggerRect = triggerEl.getBoundingClientRect();
      const dropdownMinWidth = 250;
      const dropdownMaxWidth = 350;
      const windowPadding = 16;

      const maxAvailableWidth = Math.min(window.innerWidth - windowPadding * 2, dropdownMaxWidth);
      const finalWidth = Math.max(dropdownMinWidth, maxAvailableWidth);

      let left = triggerRect.left + triggerRect.width / 2 - finalWidth / 2;
      const maxLeft = window.innerWidth - finalWidth - windowPadding;
      left = Math.max(windowPadding, Math.min(left, maxLeft));

      panelEl.style.position = 'absolute';
      panelEl.style.minWidth = `${dropdownMinWidth}px`;
      panelEl.style.maxWidth = `${dropdownMaxWidth}px`;
      panelEl.style.width = `${finalWidth}px`;
      panelEl.style.top = `${triggerRect.bottom + window.scrollY}px !important`;
      panelEl.style.left = `${left}px`;
      panelEl.style.zIndex = '999999';
    }, 0);
  }
  }
