import * as fs from 'fs';
const rawFile = fs.readFileSync('input1.txt','utf8');

const lines = rawFile.split('\n');

const list1 = lines.map((line) => parseInt(line.split(/\s+/)[0])).sort().filter((value) => !Number.isNaN(value))
const list2 = lines.map((line) => parseInt(line.split(/\s+/)[1])).sort().filter((value) => !Number.isNaN(value))

const zip = <A, B>(a: Array<A>, b: Array<B>): [A, B][] => a.map((k, i) => [k, b[i]])

const zipped = zip(list1, list2)

const distance = zipped.reduce((acc, curr) => acc + (Math.abs(curr[0] - curr[1])), 0)

console.log(distance)

const similarity = zipped.reduce((acc, curr) => acc + curr[0] * list2.filter(v => v == curr[0]).length, 0)

console.log(similarity)
