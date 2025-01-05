import { InvalidOptionArgumentError } from "commander";
import { TodoPriority, TodoStatus } from "../enums";
import chalk from "chalk";

export const validatePriority = (priority: string) => {
    if (Object.values(TodoPriority).every(p => p !== priority)) {
        throw new InvalidOptionArgumentError(`Priority should be one of following values: ${chalk.magenta(Object.values(TodoPriority).join(", "))}`)
    }

    return priority;
}

export const validateStatus = (status: string) => {
    if (Object.values(TodoStatus).every(s => s !== status)) {
        throw new InvalidOptionArgumentError(`Status should be one of following values: ${chalk.magenta(Object.values(TodoStatus).join(", "))}`)
    }

    return status;
}