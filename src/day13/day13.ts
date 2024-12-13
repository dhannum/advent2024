import * as fs from 'fs'
const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

interface Pair {
    x: number
    y: number
}

interface ClawMachine {
    da: Pair
    db: Pair
    prize: Pair
}

interface Sequence {
    a: number
    b: number
}

const clawMachines: ClawMachine[] = []
for (let i = 0; i < lines.length; i += 3) {
    const resultsA = /Button A: X\+(\d+), Y\+(\d+)/.exec(lines[i])!
    const resultsB = /Button B: X\+(\d+), Y\+(\d+)/.exec(lines[i + 1])!
    const resultP = /Prize: X=(\d+), Y=(\d+)/.exec(lines[i + 2])!

    clawMachines.push({
        da: { x: Number(resultsA[1]), y: Number(resultsA[2]) },
        db: { x: Number(resultsB[1]), y: Number(resultsB[2]) },
        prize: { x: Number(resultP[1]), y: Number(resultP[2]) },
    })
}

// part 1

const computeCost = (sequence: Sequence) => sequence.a * 3 + sequence.b

const findSolution = (clawMachine: ClawMachine): Sequence | undefined => {
    const a =
        (clawMachine.prize.y - (clawMachine.db.y / clawMachine.db.x) * clawMachine.prize.x) /
        (clawMachine.da.y - (clawMachine.db.y / clawMachine.db.x) * clawMachine.da.x)

    const b = (clawMachine.prize.x - clawMachine.da.x * a) / clawMachine.db.x

    if (Math.abs(a - Math.round(a)) < 0.001 && Math.abs(b - Math.round(b)) < 0.001)
        return { a: Math.round(a), b: Math.round(b) }
    else return undefined
}

const totalCost = clawMachines
    .map(findSolution)
    .filter((solution) => solution !== undefined)
    .map((solution) => computeCost(solution))
    .reduce((a, b) => a + b, 0)

console.log(totalCost)

// part 2

const newClawMachines = clawMachines.map((clawMachine) => ({
    da: { ...clawMachine.da },
    db: { ...clawMachine.db },
    prize: { x: clawMachine.prize.x + 10000000000000, y: clawMachine.prize.y + 10000000000000 },
}))

const biggerTotalCost = newClawMachines
    .map(findSolution)
    .filter((solution) => solution !== undefined)
    .map((solution) => computeCost(solution))
    .reduce((a, b) => a + b, 0)

console.log(biggerTotalCost)
