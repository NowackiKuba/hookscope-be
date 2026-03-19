export type EndpointProviderValue =
  | 'stripe'
  | 'clerk'
  | 'github'
  | 'shopify'
  | 'przelewy24';

const VALID_PROVIDERS = ['stripe', 'clerk', 'github', 'shopify', 'przelewy24'];

export class EndpointProvider {
  private _value: EndpointProviderValue;

  constructor(v: string) {
    if (!VALID_PROVIDERS.includes(v)) {
      // TODO
    }

    this._value = v as EndpointProviderValue;
  }

  get value(): EndpointProviderValue {
    return this._value;
  }

  static stripe(): EndpointProvider {
    return new EndpointProvider('stripe');
  }
  static clerk(): EndpointProvider {
    return new EndpointProvider('clerk');
  }
  static github(): EndpointProvider {
    return new EndpointProvider('github');
  }
  static shopify(): EndpointProvider {
    return new EndpointProvider('shopify');
  }
  static przelewy24(): EndpointProvider {
    return new EndpointProvider('przelewy24');
  }
}
