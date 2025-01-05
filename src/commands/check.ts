import chalk from "chalk";
import { Command } from "commander";
import { readTodos, writeTodos, formatTodoStatus, formatTodo, findTodoByTitle, validateStatus } from "../utils";
import { Todo } from "../types";
import enquirer, { prompt } from "enquirer";
import { TodoStatus } from "../enums";
import { promptStatus } from "../utils/prompts";

type CheckTodoOptions = {
    status?: TodoStatus;
    id?: string;
    title?: string;
}

const checkTodoCommand = new Command("check")
    .description("Edits a task")
    .option("-s, --status <status>", "Sets task as completed", validateStatus)
    .option("-t, --title <title>", "Searches todo by title")
    .option("--id <identifier>", "Searches todo by id")

checkTodoCommand.action(async (_, options) => {
    const commandOptions = options.opts() as CheckTodoOptions;

    if (commandOptions.id && commandOptions.title) {
        console.error(chalk.red("You can't search a task by id and title at the same time"))
    }

    const todos = await readTodos();
    if (!todos) return;

    if (!todos.length) {
        console.log(chalk.yellow("You don't have any tasks"))
        return;
    }


    let targetTask: Todo | undefined;

    if (commandOptions.id) {
        targetTask = todos.find(task => task.id === commandOptions.id);
        if (!targetTask) {
            console.log(chalk.yellow("No tasks match your filter criteria."));
            return;
        }
    }

    targetTask = await findTodoByTitle({ todos, searchStr: commandOptions.title })
    if (!targetTask) return;

    console.log(formatTodo(targetTask));

    if (commandOptions.status) {
        targetTask.status = commandOptions.status;
    } else {
        const status = await promptStatus();
        targetTask.status = status;
    }

    const updatedTodos = todos.map(task => {
        if (task.id === targetTask.id) {
            return targetTask;
        }

        return task;
    })

    const { error: writeTodosError } = await writeTodos(updatedTodos);
    if (writeTodosError) {
        console.error(chalk.red("Error: Unable to save the updated todos."));
    } else {
        console.log(chalk.greenBright(`Task "${chalk.blue(targetTask.title)}" now in status ${formatTodoStatus(targetTask.status)}`));
    }
})

export { checkTodoCommand }