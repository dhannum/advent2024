import * as fs from 'fs'

const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

const towels = lines[0].split(',').map((towel) => towel.trim())

const patterns = lines.toSpliced(0, 1)

// part 1

const memoized = new Map<string, number>()

const solve = (pattern: string, towels: string[]): number => {
    if (memoized.has(pattern)) return memoized.get(pattern)!

    let solutionCount = 0

    for (let i = 0; i < towels.length; i++) {
        const towel = towels[i]
        if (pattern.startsWith(towel)) {
            const newPattern = pattern.slice(towel.length)
            if (newPattern.length === 0) {
                memoized.set(pattern, 1)
                solutionCount++
            } else {
                solutionCount += solve(newPattern, towels)
            }
        }
    }
    memoized.set(pattern, solutionCount)
    return solutionCount
}

const solutionCounts = patterns.map((pattern) => solve(pattern, towels))

console.log(solutionCounts.filter((v) => v > 0).length)

// part 2

console.log(
    solutionCounts.reduce((a, v) => {
        return a + v
    }, 0),
)
