import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CustomerComponent } from "./customers/customer.component";
import { ReactiveFormsModule } from "@angular/forms";

import { NgxMaskModule, IConfig } from 'ngx-mask'
export const options: Partial<IConfig> | (() => Partial<IConfig>) = {}

@NgModule({
  declarations: [
    AppComponent, CustomerComponent
  ],
  imports: [
    BrowserModule, ReactiveFormsModule, NgxMaskModule.forRoot(options)
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
