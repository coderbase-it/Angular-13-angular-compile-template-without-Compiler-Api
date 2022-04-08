import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  createNgModuleRef,
  Input,
  ModuleWithProviders,
  NgModule,
  NgModuleRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  Type,
  TypeDecorator,
  ViewContainerRef,
} from '@angular/core';
import * as _ from 'lodash';
import { Subject } from 'rxjs';

@Component({
  selector: '[dg-adhoc-html]',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DgAdhocComponent implements OnChanges, OnInit, OnDestroy {
  constructor(private vcr: ViewContainerRef) {}

  @Input('dg-adhoc-html')
  html: string;

  @Input('dg-adhoc-styles')
  styles: string[];

  @Input('dg-adhoc-context')
  context: SafeAny;

  @Input('dg-adhoc-module')
  module: NgModule;

  @Input('dg-adhoc-imports')
  imports: Array<Type<SafeAny> | ModuleWithProviders<SafeAny> | SafeAny[]>;

  @Input('dg-adhoc-error-handler')
  errorHandler: (...args: SafeAny[]) => SafeAny = undefined;

  visibleEmitter = new Subject<boolean>();

  get isComponentVisible(): boolean {
    return typeof this.html === 'string' && this.html.trim() !== '';
  }

  private _componentRef: ComponentRef<SafeAny> | null = null;
  private _moduleRef: NgModuleRef<SafeAny> | null = null;
  private visible = false;

  ngOnChanges(changes: SimpleChanges) {
    try {
      this.update();
    } catch (e) {
      if (_.isNil(this.errorHandler)) {
        throw e;
      } else {
        this.errorHandler(e);
      }
    }
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    // nothing
  }

  ngOnDestroy(): void {
    if (this._componentRef) {
      this._componentRef.destroy();
    }

    if (this._moduleRef) {
      this._moduleRef.destroy();
    }
  }

  update() {
    this.vcr.clear();
    this._componentRef = null;

    if (this._moduleRef) {
      this._moduleRef.destroy();
      this._moduleRef = null;
    }

    if (_.isNil(this.html) || this.html.trim() === '') {
      return;
    }

    const componentType = this.createComponentType(
      this.html,
      this.styles,
      this.context
    );
    const moduleType = this.createModuleType(componentType);
    this._moduleRef = createNgModuleRef(moduleType, this.vcr.injector);
    this._componentRef = this.vcr.createComponent(componentType);
  }

  toggle() {
    // console.log(this.vcr.injector.get(AsyncPipe));
    this.visible = !this.visible;
    this.visibleEmitter.next(this.visible);
  }

  private createModuleType(componentType: Type<SafeAny>): Type<SafeAny> {
    let metadata: NgModule = {};

    if (!_.isNil(this.module)) {
      metadata = _.cloneDeep(this.module);
    }

    metadata.imports = metadata.imports || [];
    metadata.imports = metadata.imports.concat(this.imports || []);

    metadata.declarations = metadata.declarations || [];
    metadata.declarations = metadata.declarations.concat([componentType]);

    const moduleType = class AdhocModule {
      // nothing
    };
    const moduleTypeDecorator: TypeDecorator = NgModule(metadata);
    // noinspection UnnecessaryLocalVariableJS
    const decoratedModuleType = moduleTypeDecorator(moduleType);
    return decoratedModuleType;
  }

  // noinspection JSMethodCanBeStatic
  private createComponentType(
    html: string,
    styles: string[],
    context: SafeAny
  ): Type<SafeAny> {
    const metadata: Component = {};
    metadata.selector = RandomUtil.nextSelector();
    metadata.template = html;
    if (styles) {
      metadata.styles = [...styles];
    }

    metadata.changeDetection = ChangeDetectionStrategy.OnPush;

    const componentType = class AdhocComponent {
      context: SafeAny = context;
    };
    const componentTypeCreator: TypeDecorator = Component(metadata);
    // noinspection UnnecessaryLocalVariableJS
    const decoratedComponentType = componentTypeCreator(componentType);
    return decoratedComponentType;
  }
}

type SafeAny = any;

const reverse = (str: string) => {
  return str.split('').reverse().join('');
};

const random = () => {
  return (
    Math.floor(Math.random() * (99999999999999999 - 10000000000000000)) +
    10000000000000000
  ).toString(16);
};

let currentIdTime: number;
let currentId = 0;

abstract class RandomUtil {
  public static nextSelector(): string {
    const now = Date.now();
    if (currentIdTime !== now) {
      currentId = 0;
      currentIdTime = now;
    }
    const comingId = ++currentId;
    const randomHex = reverse(random()).padStart(15, '0');
    const timeHex = reverse(currentIdTime.toString(16).padStart(12, '0'));
    const comingIdHex = reverse(comingId.toString(16).padStart(3, '0'));
    return `adhoc-component-${timeHex}${comingIdHex}${randomHex}`;
  }

  private constructor() {}
}
