// Formatting utilities

import chalk from "chalk";
import { Todo } from "../types";
import { TodoPriority, TodoStatus } from "../enums";

export const formatTodo = (todo: Todo, options?: { prefix?: string }) => {
    const status = formatTodoStatus(todo.status)
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

export const formatTodoStatus = (status: TodoStatus) => {
    switch (status) {
        case TodoStatus.Todo:
            return chalk.yellowBright("Todo");
        case TodoStatus.InProgress:
            return chalk.blue("In Progress");
        case TodoStatus.Done:
            return chalk.green("Done");
        default:
            return chalk.gray("Unknown Status");
    }
}
