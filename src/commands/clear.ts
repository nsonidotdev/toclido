import { Command } from "commander";
import { promptConfirm } from "../utils/prompts";
import { writeTodos } from "../utils";
import chalk from "chalk";

type ClearTodosOptions = {
    y?: boolean;
}

const clearTodosCommand = new Command("clear")
    .description("Deletes all todos")
    .option("-y", "Delete all tasks without confirmation")

clearTodosCommand.action(async (args, options) => {
    const commandOptions = options.opts() as ClearTodosOptions;

    let isConfirmed = commandOptions.y
        ? true
        : await promptConfirm({
            message: "Are you sure you want to delete all tasks"
        })

    if (!isConfirmed) return;

    const { error: writeTodosError } = await writeTodos([]);
    if (writeTodosError) {
        console.error(chalk.red("Error: Unable to clear todos."));
    } else {
        console.log(chalk.greenBright("\nAll tasks where successfuly deleted!"));
    }
})

export { clearTodosCommand }