import _ from "lodash";
import { Observable } from "rxjs";

const filterDifferentFields = function (
  base: any,
  source: Record<string, any>
): Record<string, any> {
  const fields = {};
  for (const [key, value] of Object.entries(source)) {
    const isObservable = key.endsWith("$") || value instanceof Observable;
    const isEqual = _.isEqual(base[key], value);

    if (isEqual || isObservable) {
      continue;
    }

    Object.assign(fields, { [key]: value });
  }
  return fields;
};

export default filterDifferentFields;
