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

const transform = (nums: number[]): Array<number> => {
    return nums.map(transformOne).flat()
}

let current = numbers
for (let i = 0; i < 25; i++) {
    current = transform(current)
}

console.log(current.length)

// part 2

current = numbers
for (let i = 0; i < 75; i++) {
    console.log(`${i} before transform ${current.length}`)
    current = transform(current)
}