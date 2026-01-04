import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/shared/services/header.service';
import { addIcons } from 'ionicons';
import { calculatorOutline, timeOutline, trashOutline, arrowBackOutline, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-basic-calculator',
  templateUrl: './basic-calculator.page.html',
  styleUrls: ['./basic-calculator.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule]
})
export class BasicCalculatorPage implements OnInit {
  display = '';
  result = '';
  showHistory = false;
  history: string[] = [];
  lastCalculation = '';
  justCalculated = false;

  constructor(private headerService: HeaderService) {
    addIcons({ calculatorOutline, timeOutline, trashOutline, arrowBackOutline, closeOutline });
  }

  ngOnInit() {}

  ionViewDidEnter() {
    this.headerService.updateHeaderData({
      title: 'Basic Calculator',
      subtitle: 'Click back to return',
      image: 'calculator',
      imageType: 'icon',
      showBack: true,
      showMenu: true,
      backNavigationUrl: '/workspace/calculator-dashboard'
    });
  }

  inputNumber(num: string) {
    const inputElement = document.querySelector('.display-text') as HTMLInputElement;
    const cursorPos = inputElement?.selectionStart ?? this.display.length;
    
    if (this.justCalculated || this.display === 'Error') {
      this.display = num;
      this.justCalculated = false;
    } else {
      this.display = this.display.slice(0, cursorPos) + num + this.display.slice(cursorPos);
    }
    this.calculateLive();
    
    // Restore cursor position
    setTimeout(() => {
      if (inputElement) {
        inputElement.setSelectionRange(cursorPos + 1, cursorPos + 1);
      }
    });
  }

  inputOperation(op: string) {
    const inputElement = document.querySelector('.display-text') as HTMLInputElement;
    const cursorPos = inputElement?.selectionStart ?? this.display.length;
    
    if (this.display === 'Error') {
      this.display = '';
      this.result = '';
      this.justCalculated = false;
      return;
    }
    
    if (!this.display) return;
    
    // If just calculated, continue with the result
    if (this.justCalculated) {
      this.display = this.display + op;
      this.justCalculated = false;
      this.calculateLive();
      
      // Set cursor at end
      setTimeout(() => {
        if (inputElement) {
          inputElement.setSelectionRange(this.display.length, this.display.length);
        }
      });
      return;
    }
    
    // Check character before and after cursor
    const beforeCursor = this.display[cursorPos - 1];
    const afterCursor = this.display[cursorPos];
    let newCursorPos = cursorPos;
    
    if (['+', '-', '×', '÷'].includes(beforeCursor)) {
      // Replace operator before cursor
      this.display = this.display.slice(0, cursorPos - 1) + op + this.display.slice(cursorPos);
      newCursorPos = cursorPos; // Stay at same position
    } else if (['+', '-', '×', '÷'].includes(afterCursor)) {
      // Replace operator after cursor
      this.display = this.display.slice(0, cursorPos) + op + this.display.slice(cursorPos + 1);
      newCursorPos = cursorPos + 1; // Move after the new operator
    } else {
      // Insert operator at cursor position
      this.display = this.display.slice(0, cursorPos) + op + this.display.slice(cursorPos);
      newCursorPos = cursorPos + 1; // Move after the new operator
    }
    
    this.calculateLive();
    
    // Restore cursor position
    setTimeout(() => {
      if (inputElement) {
        inputElement.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  }

  inputDecimal() {
    const inputElement = document.querySelector('.display-text') as HTMLInputElement;
    const cursorPos = inputElement?.selectionStart ?? this.display.length;
    
    if (this.justCalculated) {
      this.display = '0.';
      this.justCalculated = false;
    } else {
      // Get current number at cursor position
      const beforeCursor = this.display.slice(0, cursorPos);
      const afterCursor = this.display.slice(cursorPos);
      
      // Find the current number boundaries
      const beforeMatch = beforeCursor.match(/[+\-×÷]?([^+\-×÷]*)$/);
      const afterMatch = afterCursor.match(/^([^+\-×÷]*)/); 
      
      const currentNumber = (beforeMatch ? beforeMatch[1] : '') + (afterMatch ? afterMatch[1] : '');
      
      // Only add decimal if current number doesn't have one
      if (!currentNumber.includes('.')) {
        this.display = this.display.slice(0, cursorPos) + '.' + this.display.slice(cursorPos);
        
        // Restore cursor position
        setTimeout(() => {
          if (inputElement) {
            inputElement.setSelectionRange(cursorPos + 1, cursorPos + 1);
          }
        });
      }
    }
    this.calculateLive();
  }

  clear() {
    const inputElement = document.querySelector('.display-text') as HTMLInputElement;
    const cursorPos = inputElement?.selectionStart ?? this.display.length;
    
    if (this.display === 'Error') {
      this.display = '';
      this.result = '';
      this.justCalculated = false;
      return;
    }
    
    if (cursorPos > 0) {
      this.display = this.display.slice(0, cursorPos - 1) + this.display.slice(cursorPos);
      this.calculateLive();
      
      // Restore cursor position
      setTimeout(() => {
        if (inputElement) {
          inputElement.setSelectionRange(cursorPos - 1, cursorPos - 1);
        }
      });
    }
  }

  clearAll() {
    this.display = '';
    this.result = '';
    this.justCalculated = false;
  }

  toggleSign() {
    if (!this.display || this.display === 'Error') {
      this.display = '';
      this.result = '';
      this.justCalculated = false;
      return;
    }
    
    if (this.justCalculated) {
      if (this.display.startsWith('(-') && this.display.endsWith(')')) {
        // Remove brackets: (-594) -> 594
        this.display = this.display.slice(2, -1);
      } else if (this.display.startsWith('-')) {
        // Remove minus: -594 -> 594
        this.display = this.display.slice(1);
      } else {
        // Add brackets with minus: 594 -> (-594)
        this.display = '(-' + this.display + ')';
      }
    } else {
      const inputElement = document.querySelector('.display-text') as HTMLInputElement;
      const cursorPos = inputElement?.selectionStart ?? this.display.length;
      
      // Find current number boundaries around cursor
      let start = cursorPos;
      let end = cursorPos;
      
      // Find start of current number (skip operators)
      while (start > 0) {
        const char = this.display[start - 1];
        if (['+', '×', '÷'].includes(char)) break;
        if (char === '-' && start > 1 && !['+', '×', '÷'].includes(this.display[start - 2])) break;
        start--;
      }
      
      // Find end of current number
      while (end < this.display.length && !/[+\-×÷]/.test(this.display[end])) {
        end++;
      }
      
      const currentNumber = this.display.slice(start, end);
      let newCursorPos = cursorPos;
      
      if (currentNumber && !isNaN(Number(currentNumber))) {
        if (currentNumber.startsWith('(-') && currentNumber.endsWith(')')) {
          // Remove brackets and minus sign
          const newNumber = currentNumber.slice(2, -1);
          this.display = this.display.slice(0, start) + newNumber + this.display.slice(end);
          newCursorPos = cursorPos - 3; // Adjust for removed (-...)
        } else if (currentNumber.startsWith('-')) {
          // Convert -number to (-number)
          const newNumber = '(' + currentNumber + ')';
          this.display = this.display.slice(0, start) + newNumber + this.display.slice(end);
          newCursorPos = cursorPos + 2; // Adjust for added ()
        } else {
          // Add brackets with minus sign
          const newNumber = '(-' + currentNumber + ')';
          this.display = this.display.slice(0, start) + newNumber + this.display.slice(end);
          newCursorPos = cursorPos + 3; // Adjust for added (-...)
        }
        
        // Restore cursor position
        setTimeout(() => {
          if (inputElement) {
            inputElement.setSelectionRange(newCursorPos, newCursorPos);
          }
        });
      }
    }
    this.calculateLive();
  }

  inputPercent() {
    if (!this.display) return;
    
    const value = parseFloat(this.display);
    if (!isNaN(value)) {
      this.display = String(value / 100);
      this.justCalculated = true;
    }
  }

  performCalculation() {
    if (!this.display) return;
    
    // If already showing result, don't recalculate
    if (this.justCalculated) return;
    
    try {
      let expression = this.display.replace(/×/g, '*').replace(/÷/g, '/');
      
      // Remove trailing operator
      if (/[+\-*/]$/.test(expression)) {
        expression = expression.slice(0, -1);
      }
      
      if (/[+\-*/]/.test(expression)) {
        const calculatedResult = this.evaluateExpression(expression);
        
        if (isFinite(calculatedResult)) {
          const calculation = `${this.display.replace(/[+\-×÷]$/, '')} = ${calculatedResult}`;
          
          // Add to history only if valid calculation and not duplicate
          if (this.display !== String(calculatedResult) && calculation !== this.lastCalculation) {
            this.history.unshift(calculation);
            if (this.history.length > 10) this.history.pop();
            this.lastCalculation = calculation;
          }
          
          this.display = String(calculatedResult);
          this.result = '';
          this.justCalculated = true;
        }
      }
    } catch (error) {
      this.display = 'Error';
      this.justCalculated = true;
    }
  }

  calculateLive() {
    if (!this.display || this.justCalculated) {
      this.result = '';
      return;
    }
    
    try {
      let expression = this.display.replace(/×/g, '*').replace(/÷/g, '/');
      
      // Remove trailing operator for live calculation
      if (/[+\-*/]$/.test(expression)) {
        expression = expression.slice(0, -1);
      }
      
      if (/[+\-*/]/.test(expression)) {
        const calculatedResult = this.evaluateExpression(expression);
        if (isFinite(calculatedResult)) {
          this.result = String(calculatedResult);
        } else {
          this.result = '';
        }
      } else {
        this.result = '';
      }
    } catch {
      this.result = '';
    }
  }

  evaluateExpression(expr: string): number {
    // Replace bracketed negative numbers: (-99) -> -99
    let processedExpr = expr.replace(/\((-?\d+(?:\.\d+)?)\)/g, '$1');
    
    // Use Function constructor for safe evaluation
    try {
      return new Function('return ' + processedExpr)();
    } catch {
      throw new Error('Invalid expression');
    }
  }

  onDisplayInput(event: any) {
    this.display = event.target.value;
    this.justCalculated = false;
    this.calculateLive();
  }

  clearHistory() {
    this.history = [];
  }

  loadFromHistory(calculation: string) {
    const result = calculation.split(' = ')[1];
    if (result) {
      this.display = result;
      this.result = '';
      this.justCalculated = true;
      this.showHistory = false;
    }
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }
}