import * as fs from 'fs'
const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

// setup

const numbers = lines[0].split(' ').map((char) => parseInt(char))

// part 1

const transformOne = (num: number) => {
    if (num === 0) {
        return [1]
    } else if (num.toString().length % 2 === 0) {
        const len = num.toString().length
        return [
            parseInt(num.toString().substring(0, len / 2)),
            parseInt(num.toString().substring(len / 2)),
        ]
    } else {
        return [num * 2024]
    }
}

// brute force
const transform = (nums: number[]): Array<number> => {
    return nums.map(transformOne).flat()
}

let current = numbers
for (let i = 0; i < 25; i++) {
    current = transform(current)
}

console.log(current.length)

// part 2

const transformCounts = (counts: Map<number, number>): Map<number, number> => {
    const newCounts = new Map()
    for (const [num, count] of counts.entries()) {
        const transformed = transformOne(num)
        for (const newNum of transformed) {
            newCounts.set(newNum, (newCounts.get(newNum) ?? 0) + count)
        }
    }
    return newCounts
}

// not brute force
let counts = new Map(numbers.map((num) => [num, 1]))
for (let i = 0; i < 75; i++) {
    counts = transformCounts(counts)
}

const length = Array.from(counts.entries()).reduce((acc, [, count]) => acc + count, 0)

console.log(length)
