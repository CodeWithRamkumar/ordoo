import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdrevelDropdownComponent } from './dropdown.component';

describe('EdrevelDropdownComponent', () => {
  let component: EdrevelDropdownComponent;
  let fixture: ComponentFixture<EdrevelDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EdrevelDropdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdrevelDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
