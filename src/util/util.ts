export const zip = <A, B>(a: Array<A>, b: Array<B>): [A, B][] => a.map((k, i) => [k, b[i]])

export const isEqual = <A> (a: Array<A>, b: Array<A>): boolean => {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false
    }
    return true
}

export const toWindows = (inputArray: number[], size: number) => {
    return Array.from(
        {length: inputArray.length - (size - 1)},
        (_, index) => inputArray.slice(index, index+size)
    )
}