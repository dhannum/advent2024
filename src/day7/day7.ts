import * as fs from 'fs'
import * as Process from "node:process";
const rawFile = fs.readFileSync('input.txt','utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

// setup

interface Equation {
    total: number,
    operands: Array<number>
}

const equations: Array<Equation> = lines.map((line, i) => {
    return {
        total: parseInt(line.split(':')[0]),
        operands: line.split(':')[1].trim().split(' ').map((n) => parseInt(n))
    }
})

// part 1

const isValid = (equation: Equation, subtotal: number): boolean => {
    if (equation.operands.length === 0) return subtotal === equation.total

    if (equation.total < subtotal) return false

    return isValid({ total: equation.total, operands: equation.operands.slice(1) }, subtotal + equation.operands[0]) ||
      isValid({ total: equation.total, operands: equation.operands.slice(1) }, subtotal * equation.operands[0])
}

const validEquations = equations.filter((eq) => isValid(eq, 0))

console.log(validEquations.reduce((acc, curr) => acc + curr.total, 0))

// part 2

const isValidWithConcat = (equation: Equation, subtotal: number): boolean => {
    if (equation.operands.length === 0) return subtotal === equation.total

    if (equation.total < subtotal) return false

    return isValidWithConcat({ total: equation.total, operands: equation.operands.slice(1) }, subtotal + equation.operands[0]) ||
      isValidWithConcat({ total: equation.total, operands: equation.operands.slice(1) }, subtotal * equation.operands[0]) ||
      isValidWithConcat({ total: equation.total, operands: equation.operands.slice(1) }, parseInt(subtotal.toString().concat(equation.operands[0].toString())))
}

const validEquationsWithConcat = equations.filter((eq) => isValidWithConcat(eq, 0))

console.log(validEquationsWithConcat.reduce((acc, curr) => acc + curr.total, 0))