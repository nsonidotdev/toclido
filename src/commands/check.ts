import chalk from "chalk";
import { Command } from "commander";
import { highlightOccurrences, readTodos, writeTodos, getTodoStatus, formatTodo  } from "../utils";
import { Todo } from "../types";
import enquirer from "enquirer";

type CheckTodoOptions = {
    completed?: boolean;
    incompleted?: boolean;
    id?: string;
    title?: string;
}

const checkTodoCommand = new Command("check")
    .description("Edits a task")
    .option("-c, --completed", "Sets task as completed")
    .option("-i, --incompleted", "Sets task as incompleted")
    .option("-t, --title <title>", "Searches todo by title")
    .option("--id <identifier>", "Searches todo by id")

checkTodoCommand.action(async (_, options) => {
    const commandOptions = options.opts() as CheckTodoOptions;    

    if (typeof commandOptions.completed === "boolean" && typeof commandOptions.incompleted === "boolean") {
        console.error(chalk.red("Insufficient options. You should either mark task as completed or as incompleted, but not both"))
    }

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

    if (!targetTask && commandOptions.title) {
        if (commandOptions.title.length < 3) {
            console.error(chalk.red("Title filter option should include more than 2 characters"))
            return;
        }

        const filteredTasksByTitle = todos.filter(task => {
            return task.title.toLowerCase().includes(commandOptions.title!.toLowerCase())
        })

        if (!filteredTasksByTitle.length) {
            console.log(chalk.yellow("No tasks match your filter criteria."));
            return;
        } else if (filteredTasksByTitle.length === 1) {
            targetTask = filteredTasksByTitle[0];
        }

        if (!targetTask) {
            const { title } = await enquirer.prompt<{ title: string }>({
                type: "select",
                message: "Pick a task you meant",
                name: "title",
                // @ts-expect-error
                limit: 10,
                choices: filteredTasksByTitle.map(task => ({
                    message: highlightOccurrences({ content: task.title, targetText: commandOptions.title! }),
                    value: task.title
                }))
            });

            targetTask = filteredTasksByTitle.find(task => task.title === title);
        }
    }

    if (!targetTask) {
        const { title } = await enquirer.prompt<{ title: string }>({
            type: "autocomplete",
            message: "Start typing title of a task you want to delete",
            name: "title",
            // @ts-expect-error
            limit: 10,
            choices: todos.map(todo => todo.title),
        });

        targetTask = todos.find(task => task.title === title);
    }
    if (!targetTask) return;

    console.log(formatTodo(targetTask));

    if (commandOptions.completed) {
        targetTask.completed = true;
    } else if (commandOptions.incompleted) {
        targetTask.completed = false;
    } else {
        const { status } = await enquirer.prompt<{ status: "Done" | "Pending" }>({
            type: "select",
            message: "Pick new status for a task?",
            name: "status",
            choices: [
                "Done",
                "Pending"
            ]
        })

        if (status === "Done") {
            targetTask.completed = true;
        } else if (status === "Pending") {
            targetTask.completed = false;
        }
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
        console.log(chalk.greenBright(`Task "${chalk.blue(targetTask.title)}" now in status ${getTodoStatus({ completed: targetTask.completed })}`));
    }
})

export { checkTodoCommand }