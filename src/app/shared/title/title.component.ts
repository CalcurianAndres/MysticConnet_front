import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-title',
  imports: [],
  template:`
    <span class="title" style="color: rgb(212, 212, 212);">{{ title }}</span>
    <hr>
  `
})
export class TitleComponent {

  @Input({required: true}) title!:string 

}
