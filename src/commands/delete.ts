import { Command } from "commander";
import { readTodos, formatTodo, writeTodos, findTodoByTitle } from "../utils";
import chalk from "chalk";
import enquirer from "enquirer";
import { Todo } from "../types";

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

    if (!commandOptions.id && !commandOptions.title) {
        const answer = await enquirer.prompt<{ title: string }>({
            type: "autocomplete",
            message: "Start typing title of a task you want to delete",
            name: "title",
            // @ts-expect-error
            limit: 10,
            choices: todos.map(todo => todo.title),
        });

        commandOptions.title = answer.title;
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

    const shouldDelete = !!commandOptions.y;
    if (!shouldDelete) {
        const { confirm } = await enquirer.prompt<{ confirm: "Yes" | "No" }>({
            type: "select",
            message: "Are you sure you want to delete this taks?",
            name: "confirm",
            initial: 0,
            choices: [
                "Yes",
                "No"
            ]
        })
    
        if (confirm === "No") return;
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