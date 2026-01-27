import * as fs from 'fs'
import { z } from 'zod'

const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.trim().length > 0)

const splitLines = lines[0].split(',')

interface Span {
    start: number
    end: number
}

const pattern = /(\d+)-(\d+)/

const LineSchema = z
    .string()
    .transform((line) => {
        const match = line.match(pattern)

        if (!match || Number.isNaN(Number(match[1])) || Number.isNaN(Number(match[2])))
            return z.NEVER
        else return { start: Number(match[1]), end: Number(match[2]) }
    })
    .pipe(
        z.object({
            start: z.number(),
            end: z.number(),
        }),
    )

const InputSchema = z.array(LineSchema)

const spans: Array<Span> = InputSchema.parse(splitLines)

const enumerate = (span: Span): Array<number> => {
    return Array.from({ length: span.end - span.start + 1 }, (v, k) => k + span.start)
}

const isValid1 = (id: number): boolean => {
    const strId = id.toString()

    if (strId.length % 2 === 1) return true

    const half = strId.substring(0, strId.length / 2)

    return strId !== `${half}${half}`
}

const isValid2 = (id: number): boolean => {
    const strId = id.toString()

    for (let i = 1; i < strId.length; i++) {
        const piece = strId.substring(0, i)

        if (
            strId === `${piece}${piece}` ||
            strId === `${piece}${piece}${piece}` ||
            strId === `${piece}${piece}${piece}${piece}` ||
            strId === `${piece}${piece}${piece}${piece}${piece}` ||
            strId === `${piece}${piece}${piece}${piece}${piece}${piece}` ||
            strId === `${piece}${piece}${piece}${piece}${piece}${piece}${piece}` ||
            strId === `${piece}${piece}${piece}${piece}${piece}${piece}${piece}${piece}` ||
            strId === `${piece}${piece}${piece}${piece}${piece}${piece}${piece}${piece}${piece}`
        )
            return false
    }

    return true
}

const invalid = spans.flatMap((span) => enumerate(span)).filter((id) => !isValid2(id))

console.log(invalid.length)

console.log(invalid)

const sum = invalid.reduce((sum, id) => sum + id, 0)

console.log(sum)
