import * as fs from 'fs'

const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

const regAStart = parseInt(/Register A: (\d+)/.exec(lines[0])![1])
const regBStart = parseInt(/Register B: (\d+)/.exec(lines[1])![1])
const regCStart = parseInt(/Register C: (\d+)/.exec(lines[2])![1])
const prog = /Program: ([\d,]+)/.exec(lines[3])![1].split(',').map(Number)

type Registers = { a: number; b: number; c: number }

const comboOperand = (rawOperand: number, reg: Registers) => {
    switch (rawOperand) {
        case 0:
        case 1:
        case 2:
        case 3:
            return rawOperand
        case 4:
            return reg.a
        case 5:
            return reg.b
        case 6:
            return reg.c
        default:
            throw new Error('Invalid combo operand')
    }
}

export const execute = (reg: Registers) => {
    const output: Array<number> = []

    for (let p = 0; p < prog.length; p += 2) {
        const instruction = prog[p]
        const operand = prog[p + 1]

        switch (instruction) {
            case 0:
                reg.a = Math.floor(reg.a / Math.pow(2, comboOperand(operand, reg)))
                break
            case 1:
                reg.b = Number(BigInt(reg.b) ^ BigInt(operand))
                break
            case 2:
                reg.b = comboOperand(operand, reg) % 8
                break
            case 3:
                p = reg.a === 0 ? p : operand - 2 // because the loop will add 2 each time
                break
            case 4:
                reg.b = Number(BigInt(reg.b) ^ BigInt(reg.c))
                break
            case 5:
                output.push(comboOperand(operand, reg) % 8)
                break
            case 6:
                reg.b = Math.floor(reg.a / Math.pow(2, comboOperand(operand, reg)))
                break
            case 7:
                reg.c = Math.floor(reg.a / Math.pow(2, comboOperand(operand, reg)))
                break
        }
    }
    return output
}

// part 1

const reg = { a: regAStart, b: regBStart, c: regCStart }

const output = execute(reg)

console.log(output.join(','))

// part 2

// find the solution of progTail and when it finds one, it recursively tries to find the solution for the next level. This allows
// it to backtrack if it finds a sub-solution that doens't work for the whole problem (which was true of my input)
const findSolution = (wholeProg: Array<number>, progTail: Array<number>, start: number) => {
    console.log(`searching for a solution for ${progTail}`)
    const searchSpaceStart = start
    // eslint-disable-next-line no-constant-condition
    for (let i = searchSpaceStart; i < searchSpaceStart + 63; i++) {
        const result = execute({ a: i, b: 0, c: 0 }).join(',')
        if (result === progTail.join(',')) {
            console.log(`Found solution ${i} for ${progTail}`)
            if (wholeProg.length === progTail.length) {
                console.log(i)
                process.exit(0)
            } else {
                // try to make the next level of the solution based on this partial solution
                findSolution(
                    wholeProg,
                    [wholeProg[wholeProg.length - 1 - progTail.length]].concat(progTail),
                    i * 8,
                )
            }
        }
    }
}

findSolution(prog, prog.slice(prog.length - 1), 0)
