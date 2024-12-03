import * as fs from 'fs'
const rawFile = fs.readFileSync('input.txt','utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

const totals = lines.map((line) => {
    const regex = /mul\((\d+),(\d+)\)/g
    let match

    const results: number[] = []
    while ((match = regex.exec(line)) !== null) {
        results.push(parseInt(match[1]) * parseInt(match[2]))
    }

    return results.reduce((acc, val) => acc + val, 0)
})

const overallTotal = totals.reduce((acc, val) => acc + val, 0)

console.log(overallTotal)

let enabled = true
const totalsWithCond = lines.map((line) => {
    const regex = /(do\(\))|(don't\(\))|mul\((\d+),(\d+)\)/g
    let match
    const results: number[] = []

    while ((match = regex.exec(line)) !== null) {
        if (match[1] === 'do()') {
            enabled = true
        } else if (match[2] === 'don\'t()') {
            enabled = false
        } else if (match[3] && match[4]) {
            if (enabled)
                results.push(parseInt(match[3]) * parseInt(match[4]))
        }
    }

    return results.reduce((acc, val) => acc + val, 0)
})

const overallTotalWithCond = totalsWithCond.reduce((acc, val) => acc + val, 0)

console.log(overallTotalWithCond)