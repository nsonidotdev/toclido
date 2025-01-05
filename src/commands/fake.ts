import { Command } from "commander";
import { Todo } from "../types";
import { faker } from '@faker-js/faker';
import { TodoPriority, TodoStatus } from "../enums";
import { readTodos, writeTodos } from "../utils";
import chalk from "chalk";

type FakeOptions = {
    number?: number;
}

const fakeCommand = new Command("fake") 
    .description("Adds fake todos")
    .option("-n, --number <count>", "Adds specified count of todos ", parseInt)

fakeCommand.action(async (_, options) => {
    const commandOptions = options.opts() as FakeOptions;
    let todosCount = commandOptions.number ?? 1;
    let newTodos: Todo[] = [...Array(todosCount)].map(() => ({
        id: faker.string.uuid(),
        title: faker.lorem.words({ min: 3, max: 10 }),
        priority: faker.helpers.arrayElement(Object.values(TodoPriority)),
        status: faker.helpers.arrayElement(Object.values(TodoStatus)),
        createdAt: faker.date.recent({ days: 50 }),
    } satisfies Todo));

    const todos = await readTodos();    
    if (!todos) return;

    const { error: writeTodosError } = await writeTodos(todos.concat(newTodos));
    if (writeTodosError) {
        console.error(chalk.red("Unable to add new todos"))
    } else {
        console.log(chalk.green("Fake todos successfuly added"))
    }
})


export { fakeCommand }
