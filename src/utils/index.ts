

export const sleep = (ms: number = 1000) => new Promise(r => setTimeout(r, ms));



export * from './validate';