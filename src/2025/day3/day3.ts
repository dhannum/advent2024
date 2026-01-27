import * as fs from 'fs'

const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.trim().length > 0)

const maxJoltage1 = (battery: string): number => {
    for (let i = 99; i >= 0; i--) {
        const padded = i.toString().padStart(2, '0')

        const pattern = new RegExp(`\\d*[${padded.charAt(0)}]\\d*[${padded.charAt(1)}]\\d*`, 'g')

        const match = battery.match(pattern)

        if (match !== null) return i
    }

    return 0
}

const maxJoltage2 = (battery: string): number => {
    const solutionIndexes: number[] = []

    while (solutionIndexes.length < 12) {
        for (let target = 9; target >= 0; target--) {
            const maxUsedIndexSoFar = solutionIndexes.reduce((acc, val) => Math.max(acc, val), -1)

            const firstIndexOfTarget = battery.indexOf(`${target}`, maxUsedIndexSoFar + 1)

            if (
                firstIndexOfTarget === -1 ||
                firstIndexOfTarget > battery.length - (12 - solutionIndexes.length)
            )
                continue
            else {
                solutionIndexes.push(firstIndexOfTarget)
                break
            }
        }
    }

    const strResult = solutionIndexes
        .sort((a, b) => (a > b ? 1 : -1))
        .reduce((acc: string, val) => `${acc}${battery.charAt(val)}`, '')

    return parseInt(strResult)
}

const joltages = lines.map((battery) => maxJoltage2(battery))
console.log(joltages)

const sum = joltages.reduce((sum, id) => sum + id, 0)
console.log(sum)
