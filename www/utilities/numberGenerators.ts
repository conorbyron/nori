export function scaleGenerator(pattern: Array<number>) {
  const partialSums = pattern.reduce(
    (arr, val) => [...arr, arr[arr.length - 1] + val],
    [0]
  )

  const totalSum = partialSums[partialSums.length - 1]

  const scale = (index: number) => {
    const course = Math.floor(index / pattern.length) * totalSum
    const fine = partialSums[index % pattern.length]
    return course + fine
  }

  return scale
}

export class NonRepeatingRandomizer {
  max: number
  lastValue: number

  constructor(max: number) {
    this.max = max
    this.lastValue = max
  }

  next() {
    let rand = Math.floor(Math.random() * this.max)
    if (rand >= this.lastValue) rand++
    this.lastValue = rand
    return rand
  }
}

export const pickNFromMGenerator = (m: number) => {
  function shuffle(arr: Array<number>) {
    let currentIndex = arr.length
    let temporaryValue
    let randomIndex
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1
      temporaryValue = arr[currentIndex]
      arr[currentIndex] = arr[randomIndex]
      arr[randomIndex] = temporaryValue
    }
    return arr
  }

  let values: Array<number> = []

  for (let i = 0; i < m; i++) {
    values.push(i)
  }

  console.log(values)

  const pickNFromM = (n: number) => {
    return shuffle(values).slice(0, n)
  }

  return pickNFromM
}
