export function range(end) {
    return [...new Array(end).keys()];
}

// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
export function sfc32(a, b, c, d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}

// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
export function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}


export function weightedRandom(arr /* : [T, number][] */, random = () => Math.random()) {
    const sum = arr.map(a => a[1]).reduce((a, b) => a + b, 0);
    let rnd = random() * sum;
    for (const a of arr) {
        rnd -= a[1];
        if (rnd < 0) return a[0];
    }
    throw new Error(`The array is empty!`);
}
