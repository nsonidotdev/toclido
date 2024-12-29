#!/usr/bin/env node

import { sleep } from './utils';

function greet(name: string) {
    console.log("Hello " + name)
}

await sleep()
greet("Anton"); 