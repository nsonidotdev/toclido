import chalk from "chalk";
import { Command } from "commander";
import { getTodoStatus, highlightOccurrences, readTodos, stylePriority } from "../utils";
import { Todo } from "../types";
import enquirer from "enquirer";
import { handleError } from "../lib";
import { TODOS_PATH } from "../constants";
import { writeFile } from "fs/promises";

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
                choices: filteredTasksByTitle.map(task => task.title)
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

    const status = getTodoStatus({ completed: targetTask.completed });
    console.log(`\n${chalk.bold(`${targetTask.title}`)}\nStatus: ${status} Priority: ${stylePriority(targetTask.priority)}\n`);

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

        console.log(status)
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

    console.log(targetTask.completed)

    const { error: writeTodosError } = await handleError(writeFile(TODOS_PATH, JSON.stringify(updatedTodos, null, 2)));
    if (writeTodosError) {
        console.error(chalk.red("Error: Unable to save the updated todos."));
    } else {
        console.log(chalk.greenBright(`\nTask "${chalk.blue(targetTask.title)}" now in status ${getTodoStatus({ completed: targetTask.completed })}`));
    }
})

export { checkTodoCommand }