import { Component, VERSION } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  name = 'Angular ' + VERSION.major;
  myObjt = {
    name: this.name,
    call: function () {
      console.log('hello');
    },
  };
  template =
    '<div (click)="context.call()"> Mon nom est {{ context.name}}</div>';
}
