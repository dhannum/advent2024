import * as fs from 'fs'
import { z } from 'zod'

const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.trim().length > 0)

const pattern = /([LR])(\d+)/
type LR = 'L' | 'R'
interface Move {
    direction: LR
    distance: number
}

const LineSchema = z
    .string()
    .transform((line) => {
        const match = line.match(pattern)

        if (!match || Number.isNaN(Number(match[2]))) return z.NEVER
        else return { direction: match[1], distance: Number(match[2]) }
    })
    .pipe(
        z.object({
            direction: z.enum(['L', 'R']),
            distance: z.number(),
        }),
    )

const InputSchema = z.array(LineSchema)

const instructions: Array<Move> = InputSchema.parse(lines)

const turnDial = (dial: number, change: Move): [number, number] => {
    let timesAround = 0
    let newDial = dial

    // chop off all the extraneous hundreds
    if (change.distance > 99 || change.distance < -99) {
        timesAround = Math.trunc(change.distance / 100)
        change.distance = change.distance % 100
    }

    if (change.direction === 'R') {
        newDial = dial + change.distance
        // did we go around?
        if (newDial >= 100) {
            timesAround++
        }
    } else if (change.direction === 'L') {
        newDial = dial - change.distance
        // did we go around?
        if (newDial <= 0) {
            if (dial !== 0) timesAround++
        }
    }

    // normalize
    if (newDial < 0) newDial += 100
    if (newDial > 99) newDial -= 100

    return [newDial, timesAround]
}

const unlock = (instructions: Array<Move>) => {
    let dial = 50
    let count = 0

    console.log(`Start ${dial} -> ${count}`)
    instructions.forEach((instruction) => {
        const [newDial, newCount] = turnDial(dial, instruction)
        count += newCount
        dial = newDial
        console.log(
            `After ${instruction.direction}${instruction.distance}: dial at ${dial} -> clicks at ${count}`,
        )
    })

    console.log(count)
}

unlock(instructions)
