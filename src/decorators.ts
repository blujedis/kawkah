
export function enumerable(enabled: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = enabled;
    return descriptor;
  };
}


export function nonenumerable(target: any, key: string) {
  Object.defineProperty(target, key, {
    get: function () { return undefined; },
    set: function (this: any, val: any) {
      Object.defineProperty(this, key, {
        value: val,
        writable: true,
        enumerable: false,
        configurable: true,
      });
    },
    enumerable: false,
  });
}
