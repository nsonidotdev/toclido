import { Command } from "commander";
import { validatePriority } from "../utils";
import { TodoPriority } from "../enums";
import { handleError } from "../lib";
import { readFile } from "fs/promises";
import { TODOS_PATH } from '../constants'
import chalk from "chalk";
import { Todo } from "../types";

type ViewOptions = {
    completed?: boolean;
    incompleted?: boolean;
    priority?: TodoPriority;
}

const viewTodosCommand = new Command('view')
    .description('Adds a todo')
    .option('-c, --completed', 'Shows only completed tasks')
    .option('-i, --incompleted', 'Shows only incompleted tasks')
    .option('-p, --priority <priority>', 'Shows tasks with specified priority', validatePriority);


viewTodosCommand.action(async (_, options) => {
    const commandOptions = options.opts() as ViewOptions;

    if (typeof commandOptions.completed === "boolean" && typeof commandOptions.incompleted === "boolean") {
        console.error(chalk.red("You can view either completed or incompleted tasks, if you want to view both don't path -i and -c options"))
        return;
    }

    const { data: todosJSON, error: readTodosError } = await handleError(readFile(TODOS_PATH, "utf-8"));
    if (readTodosError) {
        if (readTodosError.code === "ENOENT") {
            console.log(chalk.yellow("You don't have any tasks \n"));
        } else {
            console.error(chalk.red(`Error reading todos file: ${readTodosError.message}`));
        }

        return;
    }
    if (!todosJSON) return;

    const { data: todos, error: todosParseError } = await handleError<Todo[]>(() => JSON.parse(todosJSON));
    if (todosParseError || !(todos instanceof Array)) {
        console.error(chalk.red(`Error parsing todos file. It might be corrupted. Check the validity of the ${chalk.blue("todos.json")} file to a JSON format.`));
        return;
    }

    const filteredTodos = todos.filter((todo) => {
        if ('priority' in commandOptions && commandOptions.priority !== todo.priority) {
            return false;
        }

        if (typeof commandOptions.completed === "boolean" && commandOptions.completed && !todo.completed) {
            return false;
        }

        if (typeof commandOptions.incompleted === "boolean" && commandOptions.incompleted && todo.completed) {
            return false;
        }
            
        return true
    })

    console.log(filteredTodos)
})

export { viewTodosCommand }