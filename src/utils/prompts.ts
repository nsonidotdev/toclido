import enquirer from "enquirer"
import { TodoPriority, TodoStatus } from "../enums"
import { formatPriority, formatTodoStatus } from "./format"
import chalk from "chalk";


type BasePromptOptions = {
    message?: string;
}

export const promptConfirm = async (options: BasePromptOptions): Promise<boolean> => {
    const { confirm } = await enquirer.prompt<{ confirm: "Yes" | "No" }>({
        type: "select",
        message: options.message ?? "Are you sure you want to do this action?",
        name: "confirm",
        initial: 0,
        choices: [
            "Yes",
            "No"
        ]
    })

    return confirm === "Yes"
}

export const promptStatus = async (options?: BasePromptOptions): Promise<TodoStatus> => {
    const { status } = await enquirer.prompt<{ status: TodoStatus }>({
        type: "select",
        message: options?.message ?? "Pick a status for the task",
        name: "status",
        choices: Object.values(TodoStatus).map(status => ({
            message: formatTodoStatus(status),
            name: status,
            value: status,
        }))
    })

    return status;
}

export const promptPriority = async (options?: BasePromptOptions): Promise<TodoPriority> => {
    const { priority } = await enquirer.prompt<{ priority: TodoPriority }>({
        type: "select",
        message: options?.message ?? `Pick a ${chalk.red("priority")} of the task`,
        name: "priority",
        initial: 1,
        choices: Object.values(TodoPriority).map(status => ({
            message: formatPriority(status),
            name: status,
            value: status,
        })),
    });

    return priority;
}