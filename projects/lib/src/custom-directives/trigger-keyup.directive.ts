import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { KEY_BUTTON } from '../util/buttons-key';

/**
 * In order for this custom directive to work you need minumim to set the element's tabindex="0", to make it focusable
 */
@Directive({
  selector: '[triggerKeyup]',
})
export class TriggerKeyupDirective {
    /**
     * To be set in case if you want to trigger another element form the active focused element
     */
  @Input('targetedElement') targetedElement: HTMLElement;
  constructor(private el: ElementRef) {
  }

  @HostListener('keyup', ['$event']) triggerKeyup(event: KeyboardEvent) {
    if(this.targetedElement) {
      this.buttonPressHandler(event, this.targetedElement);
    } else {
      this.buttonPressHandler(event, this.el.nativeElement);
    }
  }

  buttonPressHandler(event: KeyboardEvent, element: HTMLElement): void {
      console.log(event);
    const isClick =
      ['Enter', 'Space'].includes(event.code) ||
      [KEY_BUTTON.RETURN, KEY_BUTTON.SPACE].includes(event.keyCode);

    if (isClick) {
      event.preventDefault();
      event.stopPropagation();
      element.click();
    }
  }
}