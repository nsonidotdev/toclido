#!/usr/bin/env node

import { Command } from 'commander';
import { addTodoCommand } from './commands/add';

const program = new Command();

program
  .name('toclido')
  .description('CLI to help you manage your own business')
  .version('0.0.1');

program
  .addCommand(addTodoCommand)


program.parse(process.argv);
