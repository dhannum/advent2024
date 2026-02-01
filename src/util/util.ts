import * as fs from 'node:fs'

export const zip = <A, B>(a: Array<A>, b: Array<B>): [A, B][] => a.map((k, i) => [k, b[i]])

export const isEqual = <A>(a: Array<A>, b: Array<A>): boolean => {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false
    }
    return true
}

export const toWindows = (inputArray: number[], size: number) => {
    return Array.from({ length: inputArray.length - (size - 1) }, (_, index) =>
        inputArray.slice(index, index + size),
    )
}

export const square = <T>(inputArray: T[][]): T[][] => {
    const max = Math.max(...inputArray.map((row) => row.length))
    const rowsPadded = inputArray.map((row) =>
        row.concat(Array.from({ length: max - row.length }, () => undefined as T)),
    )

    const extraRows = Array.from({ length: inputArray[0].length - inputArray.length }, () =>
        Array.from({ length: inputArray[0].length }, () => undefined as T),
    )
    return rowsPadded.concat(extraRows)
}

export const transpose = <T>(inputArray: T[][]): T[][] => {
    if (inputArray.length != inputArray[0].length) throw Error('array not square')

    return inputArray[0].map((_, colIndex) => inputArray.map((row) => row[colIndex]))
}

export const dumpToFile = (filename: string, data: string[] | string[][]) => {
    let toDump = data
    if (Array.isArray(data[0])) {
        toDump = data.map((row) => (row as string[]).join(''))
    }

    const file = fs.createWriteStream(filename)
    toDump.forEach((v) => {
        file.write(v + '\n')
    })
    file.end()
}

export const printGrid = (data: string[][]) => {
    data.forEach((row) => console.log(row.join(' ')))
}

export const allIndexes = (str: string, target: string, start: number = 0) => {
    const a: number[] = []
    let i = start - 1
    while ((i = str.indexOf(target, i + 1)) >= 0) a.push(i)
    return a
}