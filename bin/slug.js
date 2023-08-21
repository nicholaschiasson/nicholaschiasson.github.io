#!/usr/bin/env deno run --allow-env

import { slug } from "../lib/lib.js";

console.info(slug(Deno.args[0]));
