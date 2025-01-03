#!/usr/bin/env node

import { Command } from 'commander';
import { addTodoCommand } from './commands/add';
import { viewTodosCommand } from './commands/view';

const program = new Command();

program
  .name('toclido')
  .description('CLI to help you manage your own business')
  .version('0.0.1');

program
  .addCommand(addTodoCommand)
  .addCommand(viewTodosCommand)


program.parse(process.argv);
