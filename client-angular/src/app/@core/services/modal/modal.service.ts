import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  Type,
} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModalService<T> {
  private componentRef: ComponentRef<T> | undefined;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appReference: ApplicationRef,
    private injector: Injector
  ) {}

  async open(component: Type<T>, parameters?:any): Promise<ComponentRef<T>> {
    if (this.componentRef) {
      return Promise.resolve(this.componentRef);
    }

    this.componentRef = this.componentFactoryResolver
      .resolveComponentFactory<T>(component)
      .create(this.injector);
    if (parameters) {
      Object.assign(this.componentRef.instance, parameters)
    }
    this.appReference.attachView(this.componentRef.hostView);

    const domElement = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.append(domElement);

    return Promise.resolve(this.componentRef)
  }

  async close(): Promise<void> {
    if (!this.componentRef) {
      return;
    }

    this.appReference.detachView(this.componentRef.hostView);
    this.componentRef.destroy();

    this.componentRef = undefined;
  }
}
