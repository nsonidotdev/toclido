import chalk from 'chalk';
import { TodoPriority } from '../enums';
import { handleError } from '../lib';
import { TODOS_PATH } from '../constants';
import { readFile } from "fs/promises";
import { Todo } from '../types';
import { PathLike } from 'fs';


export const sleep = (ms: number = 1000) => new Promise(r => setTimeout(r, ms));

export const stylePriority = (priority: TodoPriority, displayText?: string): string => {
    switch (priority) {
        case TodoPriority.Low:
            return chalk.blueBright(displayText ?? priority)
        case TodoPriority.Medium:
            return chalk.yellow(displayText ?? priority)
        case TodoPriority.High:
            return chalk.redBright(displayText ?? priority)
        case TodoPriority.Urgent:
            return chalk.red(displayText ?? priority);
        default:
            return priority;

    }
}

type ReadTodosOptions = {
    todosFilePath?: PathLike;
    onFileNotFound?: (error: any) => void | Promise<void>;
    onFileReadError?: (error: any) => void | Promise<void>;
    onJsonParseError?: (error: any) => void | Promise<void>;
}
export const readTodos = async (options?: ReadTodosOptions): Promise<Todo[] | undefined> => {
    const { data: todosJSON, error: readTodosError } = await handleError(readFile(options?.todosFilePath ?? TODOS_PATH, 'utf-8'));

    if (readTodosError) {
        if (readTodosError.code === "ENOENT") {
            if (options?.onFileNotFound) {
                await options.onFileNotFound(readTodosError);
            } else {
                console.error(chalk.red(`Tasks file does not exist`));
            }
        } else {
            if (options?.onFileReadError) {
                await options.onFileReadError(readTodosError)
            } else {
                console.error(chalk.red(`Error reading todos file: ${readTodosError.message}`));
            }
        }

        return;
    }
    if (!todosJSON) return;

    const { data: todos, error: todosParseError } = await handleError(() => JSON.parse(todosJSON));
    if (todosParseError || !(todos instanceof Array)) {
        if (options?.onJsonParseError) {
            await options.onJsonParseError(todosParseError);
        } else {
            console.error(chalk.red(`Error parsing todos file. It might be corrupted. Check the validity of the ${chalk.blue("todos.json")} file to a JSON format.`));
        }

        return;
    }

    // TODO: Validate todos data

    return todos as Todo[];
}

export const getTodoStatus = (options: { completed: boolean }) => {
    return options.completed ? chalk.green("✔ Done") : chalk.red("✘ Pending");
}

export * from './validate';