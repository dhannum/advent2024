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

    const greenFilter = wordList.filter((word: string) => {
        if (firstResult.charAt(0) === 'G' && answer.charAt(0) !== word.charAt(0)) return false
        if (firstResult.charAt(1) === 'G' && answer.charAt(1) !== word.charAt(1)) return false
        if (firstResult.charAt(2) === 'G' && answer.charAt(2) !== word.charAt(2)) return false
        if (firstResult.charAt(3) === 'G' && answer.charAt(3) !== word.charAt(3)) return false
        if (firstResult.charAt(4) === 'G' && answer.charAt(4) !== word.charAt(4)) return false
        return true
    })

    // const greenAndBlackFilter = greenFilter.filter((word: string) => {
    //     if (firstResult.charAt(0) === 'B' && word.indexOf(answer.charAt(0)) !== -1) return false
    //     if (firstResult.charAt(1) === 'B' && word.indexOf(answer.charAt(1)) !== -1) return false
    //     if (firstResult.charAt(2) === 'B' && word.indexOf(answer.charAt(2)) !== -1) return false
    //     if (firstResult.charAt(3) === 'B' && word.indexOf(answer.charAt(3)) !== -1) return false
    //     if (firstResult.charAt(4) === 'B' && word.indexOf(answer.charAt(4)) !== -1) return false
    //     return true
    // })

    const finalFilter = greenFilter.filter((word: string) => {
        if (firstResult.charAt(0) === 'Y' && (findAllIndices(word, answer.charAt(0)).length === 0 || findAllIndices(word, answer.charAt(0)).indexOf(0) != -1)) return false
        if (firstResult.charAt(1) === 'Y' && (findAllIndices(word, answer.charAt(1)).length === 0 || findAllIndices(word, answer.charAt(1)).indexOf(1) != -1)) return false
        if (firstResult.charAt(2) === 'Y' && (findAllIndices(word, answer.charAt(2)).length === 0 || findAllIndices(word, answer.charAt(2)).indexOf(2) != -1)) return false
        if (firstResult.charAt(3) === 'Y' && (findAllIndices(word, answer.charAt(3)).length === 0 || findAllIndices(word, answer.charAt(3)).indexOf(3) != -1)) return false
        if (firstResult.charAt(4) === 'Y' && (findAllIndices(word, answer.charAt(4)).length === 0 || findAllIndices(word, answer.charAt(4)).indexOf(4) != -1)) return false
        return true
    })

    return finalFilter
}

console.log(firstGuess('peril', 'GGBYG'))
// console.log(firstGuess('glare', 'BYGGY'))