#!/usr/bin/env node

import { Command } from 'commander';
import { addTodoCommand } from './commands/add';
import { viewTodosCommand } from './commands/view';
import { deleteTodoCommand } from './commands/delete';
import { checkTodoCommand } from './commands/check';
import { clearTodosCommand } from './commands/clear';
import { fakeCommand } from './commands/fake';

const program = new Command();

program
  .name('toclido')
  .description('CLI to help you manage your own business')
  .version('0.0.1');

program
  .addCommand(addTodoCommand)
  .addCommand(viewTodosCommand)
  .addCommand(deleteTodoCommand)
  .addCommand(checkTodoCommand)
  .addCommand(clearTodosCommand)
  .addCommand(fakeCommand)


program.parse(process.argv);
