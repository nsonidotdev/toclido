import { InvalidOptionArgumentError } from "commander";
import { TodoPriority } from "../enums";
import chalk from "chalk";

export const validatePriority = (priority: string) => {
    if (Object.values(TodoPriority).every(p => p !== priority)) {
        throw new InvalidOptionArgumentError(`Priority should be one of following values: ${chalk.magenta(Object.values(TodoPriority).join(", "))}`)
    }

    return priority;
}