import * as fs from 'fs'

const findAllIndices = (str: string, t: string) => {
    const indices: number[] = []
    for (let i = 0; i < str.length; i++) {
        if (str[i] === t) indices.push(i)
    }
    return indices
}

const firstGuess = (answer: string, firstResult: string) => {
    const rawFile = fs.readFileSync('words.txt', 'utf8')

    const wordList = rawFile.split('\n').map((line: string) => line.toLowerCase())

    // allow only words that have the green letters in place
    const greenFilter = wordList.filter((word: string) => {
        if (firstResult.charAt(0) === 'G' && answer.charAt(0) !== word.charAt(0)) return false
        if (firstResult.charAt(1) === 'G' && answer.charAt(1) !== word.charAt(1)) return false
        if (firstResult.charAt(2) === 'G' && answer.charAt(2) !== word.charAt(2)) return false
        if (firstResult.charAt(3) === 'G' && answer.charAt(3) !== word.charAt(3)) return false
        if (firstResult.charAt(4) === 'G' && answer.charAt(4) !== word.charAt(4)) return false
        return true
    })

    // allow only words that have the yellow letters in other places
    const finalFilter = greenFilter.filter((word: string) => {
        if (
            firstResult.charAt(0) === 'Y' &&
            !(
                findAllIndices(answer, word.charAt(0)).includes(1) ||
                findAllIndices(answer, word.charAt(0)).includes(2) ||
                findAllIndices(answer, word.charAt(0)).includes(3) ||
                findAllIndices(answer, word.charAt(0)).includes(4)
            )
        )
            return false
        if (
            firstResult.charAt(1) === 'Y' &&
            !(
                findAllIndices(answer, word.charAt(1)).includes(0) ||
                findAllIndices(answer, word.charAt(1)).includes(2) ||
                findAllIndices(answer, word.charAt(1)).includes(3) ||
                findAllIndices(answer, word.charAt(1)).includes(4)
            )
        )
            return false
        if (
            firstResult.charAt(2) === 'Y' &&
            !(
                findAllIndices(answer, word.charAt(2)).includes(0) ||
                findAllIndices(answer, word.charAt(2)).includes(1) ||
                findAllIndices(answer, word.charAt(2)).includes(3) ||
                findAllIndices(answer, word.charAt(2)).includes(4)
            )
        )
            return false
        if (
            firstResult.charAt(3) === 'Y' &&
            !(
                findAllIndices(answer, word.charAt(3)).includes(0) ||
                findAllIndices(answer, word.charAt(3)).includes(1) ||
                findAllIndices(answer, word.charAt(3)).includes(2) ||
                findAllIndices(answer, word.charAt(3)).includes(4)
            )
        )
            return false
        if (
            firstResult.charAt(4) === 'Y' &&
            !(
                findAllIndices(answer, word.charAt(4)).includes(0) ||
                findAllIndices(answer, word.charAt(4)).includes(1) ||
                findAllIndices(answer, word.charAt(4)).includes(2) ||
                findAllIndices(answer, word.charAt(4)).includes(3)
            )
        )
            return false

        return true
    })

    return finalFilter
}

// console.log(firstGuess('peril', 'GGBYG'))
console.log(firstGuess('glare', 'BYGGY'))
