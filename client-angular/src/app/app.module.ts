import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { WebShellModule } from '@shell/ft/web-shell.module';
import { CoreModule } from "@core/core.module";
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, CoreModule, WebShellModule, BrowserAnimationsModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
