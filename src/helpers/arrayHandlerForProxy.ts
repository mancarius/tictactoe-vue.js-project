function arrayHandlerForProxy(target: any, prop: string | number | symbol) {
  
  if (Array.prototype.hasOwnProperty.call(Array.prototype, prop)) {
    const origMethod = target[prop];
    if (typeof origMethod === "function") {
      return (...args: any[]) => {
        return origMethod.apply(target, args);
      };
    }
  }
  return Reflect.get(target, prop);
}

export default arrayHandlerForProxy;
