// Formatting utilities

import chalk from "chalk";
import { Todo } from "../types";
import { TodoPriority, TodoStatus } from "../enums";
import { format } from 'date-fns';

export const formatDate = (createdAt: string | Date): string => {
    return format(createdAt, 'yyyy-MM-dd HH:mm'); 
}

type FormatTodoOptions = { prefix?: string, showCreatedAt?: boolean }
export const formatTodo = (todo: Todo, options?: FormatTodoOptions) => {
    const status = formatTodoStatus(todo.status)
    const { prefix, showCreatedAt } = {
        showCreatedAt: true,
        prefix: "",
        ...(options ?? {}),
    } satisfies Required<FormatTodoOptions>;

    return `\n${chalk.bold(`${prefix}${todo.title}`)} ${showCreatedAt ? formatDate(todo.createdAt) : ""}\nStatus: ${status} Priority: ${formatPriority(todo.priority)}\n`;
}

export const formatPriority = (priority: TodoPriority, displayText?: string): string => {
    switch (priority) {
        case TodoPriority.Low:
            return chalk.gray(displayText ?? "Low")
        case TodoPriority.Medium:
            return chalk.magenta(displayText ?? "Medium")
        case TodoPriority.High:
            return chalk.yellow(displayText ?? "High")
        case TodoPriority.Urgent:
            return chalk.red(displayText ?? "Urgent");
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
