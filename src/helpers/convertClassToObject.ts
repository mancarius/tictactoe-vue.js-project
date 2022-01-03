import { forOwn } from "lodash";

export function convertClassToObject<T>(instance: any, deep = false): T{
    const { ...object } = instance;
    if (deep) return object;
    const publicProps = forOwn(object, (value, key) => key.match(/^[^_]/g));
    return publicProps;
}