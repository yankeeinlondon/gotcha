import { log } from "console";
import chalk from "chalk"
import {
    gotcha,
    isOk,
    wasRedirected
} from "../src/index"

async function go(url: string) {

    const start = process.hrtime.bigint();

    const result = await gotcha(url);

    if (isOk(result)) {
        const received = process.hrtime.bigint();



        if (result.statusCode >= 200 && result.statusCode < 300) {
            const html = await result.body.text();
            const parsed = process.hrtime.bigint();

            const receivedTiming = (received - start) / 1000000n;
            const textTiming = (parsed - start) / 1000000n;
 
            log(`Successfully loaded: ${url}`);

            log({ headers: result.headers, statusCode: result.statusCode });
            log(`HTML Preview:\n\n${html.slice(0, 1000)}\n...\n\n`);
            log(`- received ${html.length} characters in ${receivedTiming}ms`);
            log(`- parsed to text in ${textTiming}ms`)
        }

    } else {
        if(wasRedirected(result)) {
            const text = await result.context.body.text();
            log("Handing Redirection :: body is ->\n", text)
        }
        log(result);
    }
}

log(chalk.bold.yellow`\n\nWe'll start by successfully loading a Wikipedia article\n`)

await go("https://en.wikipedia.org/wiki/The_Velvet_Underground_%26_Nico#Reissues_and_deluxe_editions"
)

log(chalk.bold.yellow`\n\nNow we'll force a redirect from a test URL\n`)

await go("https://httpstat.us/301");

log(chalk.bold.yellow`\nNow we'll force a redirect from HTTP to HTTPS\n`)

await go("http://google.com")

