import chalk from 'chalk';
import { TodoPriority } from '../enums';


export const sleep = (ms: number = 1000) => new Promise(r => setTimeout(r, ms));

export const stylePriority = (priority: TodoPriority, displayText?: string): string => {
    switch (priority) {
        case TodoPriority.Low: 
            return chalk.blueBright(displayText ?? priority)
        case TodoPriority.Low: 
            return chalk.yellow(displayText ?? priority)
        case TodoPriority.Low: 
            return chalk.redBright(displayText ?? priority)
        case TodoPriority.Low: 
            return chalk.red(displayText ?? priority);
        default:
            return priority;

    }
}

export * from './validate';