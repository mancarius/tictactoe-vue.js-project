import { Observable } from "rxjs";

const removeObservables = function (source: Record<string, any>): {
  [x: string]: any;
} {
  const target = { ...source };

  for (const [key, value] of Object.entries(target)) {
    const isObservable = key.endsWith("$") || value instanceof Observable;

    if (isObservable) {
      Reflect.deleteProperty(target, key);
    }
  }

  return target;
};

export default removeObservables;
