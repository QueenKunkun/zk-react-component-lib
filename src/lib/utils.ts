
export const isNonNullish = <T>(x: T) => x !== null && x !== undefined;

export function getValue<T>(obj: T, field: keyof T | undefined, rowIdx: number) {
    if (!isNonNullish(obj)) return undefined;
    if (Array.isArray(obj)) {
        return obj[rowIdx];
    }
    return field === undefined ? undefined : obj[field];
}

export function isLengthGT0<T>(arr?: T[]): arr is T[] {
    return isNonNullish(arr) && arr.length > 0;
}
