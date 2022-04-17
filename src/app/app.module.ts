import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { DgAdhocComponent } from './angular-compile.component';


@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, DgAdhocComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
