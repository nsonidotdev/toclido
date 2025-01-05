// Formatting utilities

import chalk from "chalk";
import { Todo } from "../types";
import { TodoPriority } from "../enums";

export const formatTodo = (todo: Todo, options?: { prefix?: string }) => {
    const status = getTodoStatus({ completed: todo.completed })
    return `\n${chalk.bold(`${options?.prefix ?? ""}${todo.title}`)}\nStatus: ${status} Priority: ${stylePriority(todo.priority)}\n`;
}

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

export const getTodoStatus = (options: { completed: boolean }) => {
    return options.completed ? chalk.green("✔ Done") : chalk.red("✘ Pending");
}
