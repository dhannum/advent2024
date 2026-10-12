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

const isInsideOrAdjacentTo = (t: number, a: number, b: number) => {
    return t >= a - 1 && t <= b + 1
}

const spansIntersect = (a: Span, b: Span) => {
    const x =
        isInsideOrAdjacentTo(a.start, b.start, b.end) ||
        isInsideOrAdjacentTo(a.end, b.start, b.end) ||
        isInsideOrAdjacentTo(b.start, a.start, a.end) ||
        isInsideOrAdjacentTo(b.end, a.start, a.end)
    return x
}

const joinSpans = (a: Span, b: Span): Span => {
    return { start: Math.min(a.start, b.start), end: Math.max(a.end, b.end) }
}

function squish(spanList: Array<Span>, currentIndex: number, matchingIndex: number) {
    const newList = new Array<Span>()

    spanList.forEach((span, i) => {
        if (i != currentIndex && i != matchingIndex) {
            newList.push(span)
        }
    })

    newList.push(joinSpans(spanList[currentIndex], spanList[matchingIndex]))

    return newList
}

const consolidate = (listOfSpans: Array<Span>): Array<Span> => {
    // line 111, 130, index 110 and 129

    let oldList = new Array<Span>()
    let newList = listOfSpans
    while (oldList.length != newList.length) {
        oldList = newList
        for (const [i, span] of oldList.entries()) {
            const matchingIndex = oldList.findIndex((s, j) => {
                return i !== j && spansIntersect(span, s)
            })
            if (matchingIndex != -1) {
                newList = squish(oldList, i, matchingIndex)
                break
            }
        }
    }
    return newList
}

const squishedSpans = consolidate(spans)

let numberOfValid = 0

console.log(`number of spans: ${spans.length}`)
console.log(`number of spans after consolidation: ${squishedSpans.length}`)

squishedSpans.forEach((span, i) => {
    console.log(`span ${i}: ${span.start} - ${span.end}`)
    numberOfValid += span.end - span.start + 1
})

console.log(numberOfValid)
