import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { JwtInterceptor, ServerErrorInterceptor } from './interceptors';
import { DateAgoPipe } from "@core/pipes/date-ago.pipe";

@NgModule({
  declarations: [DateAgoPipe],
  imports: [CommonModule, HttpClientModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ServerErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  exports: [
    DateAgoPipe
  ]
})
export class CoreModule {}
