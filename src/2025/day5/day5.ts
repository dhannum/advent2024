import * as fs from 'fs'

const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n')

const divider = lines.findIndex((line) => line.trim().length == 0)

interface Span {
    start: number
    end: number
}

const spans: Array<Span> = lines.slice(0, divider).map((line) => {
    const [start, end] = line.split('-').map((v) => parseInt(v))
    return { start, end }
})

const toCheck: Array<number> = lines
    .slice(divider + 1, lines.length)
    .filter((line) => line.trim().length > 0)
    .map((line) => parseInt(line))

const isInSpan = (id: number, span: Span): boolean => id >= span.start && id <= span.end

const isValid = (id: number): boolean => spans.some((span) => isInSpan(id, span))

const validList = toCheck.map((id) => isValid(id))

const countValid = validList.filter((v) => v).length

console.log(countValid)

const setOfValid = new Set<number>()

console.log(`number of spans: ${spans.length}`)

spans.forEach((span, i) => {
    console.log(`span ${i}: ${span.start} - ${span.end}`)
    for (let i = span.start; i <= span.end; i++) setOfValid.add(i)
})

console.log(setOfValid.size)
