import chalk from 'chalk';



export const sleep = (ms: number = 1000) => new Promise(r => setTimeout(r, ms));

export const highlightOccurrences = (options: {
    content: string;
    targetText: string;
    colorFn?: (text: string) => string
}): string => {
    const highlightFn = options.colorFn ?? chalk.magentaBright.underline;

    let result = "";
    let currentIndex = 0;

    const splittedText = options.content.toLowerCase().split(options.targetText.toLowerCase())
    splittedText.forEach(({ length }) => {
        result += options.content.substring(currentIndex, currentIndex + length)
        result += highlightFn(options.content.substring(currentIndex + length, currentIndex + length + options.targetText.length))

        currentIndex = currentIndex + length + options.targetText.length;
    })

    return result;
}

export * from './validate';
export * from './data';
export * from './format';