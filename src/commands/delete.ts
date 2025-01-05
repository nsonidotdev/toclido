import { Command } from "commander";
import { readTodos, formatTodo, writeTodos, findTodoByTitle } from "../utils";
import chalk from "chalk";
import enquirer from "enquirer";
import { Todo } from "../types";
import { promptConfirm } from "../utils/prompts";

type DeleteTodoOptions = {
    title?: string;
    y?: boolean;
    id?: string;
}

const deleteTodoCommand = new Command("delete")
    .description("Deletes a task")
    .option("-t, --title <title>", "Deletes todo by title")
    .option("-y", "Delete task without confirmation")
    .option("--id <identifier>", "Deletes todo by id")

deleteTodoCommand.action(async (_, options) => {
    const commandOptions = options.opts() as DeleteTodoOptions;

    if (commandOptions.id && commandOptions.title) {
        console.error("You can't delete a task by more then 1 parameter at the same time")
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

    if (!targetTask) {
        targetTask = await findTodoByTitle({ todos, searchStr: commandOptions.title })
    }
    if (!targetTask) return;

    console.log(formatTodo(targetTask));

    const shouldDelete = !!commandOptions.y;
    if (!shouldDelete) {
        const isConfirmed = await promptConfirm({
            message: `Are you sure you want to ${chalk.red("delete")} this taks?`
        })
        if (!isConfirmed) return;
    }

    const newTodos = todos.filter(todo => todo.id !== targetTask.id);
    const { error: writeTodosError } = await writeTodos(newTodos);

    if (writeTodosError) {
        console.error(chalk.red("Error: Unable to save the updated todos."));
    } else {
        console.log(chalk.greenBright(`\nTaks "${chalk.blue(targetTask.title)}" deleted successfully!`));
    }
})


export { deleteTodoCommand };