/**
 * Task runner do modulo Products.
 *
 * Flags:
 *  --deploy       Executa pipeline de deploy via script raiz
 *  --migrations   Executa somente migrations via script raiz
 *  sem flags      Sobe servidor local com logger
 */

import { nodeProcess } from "../../deps.ts";
import { productsFetch } from "./index.ts";

const args = new Set(Deno.args);
const moduleName = "products";

if (args.has("--deploy") || args.has("--migrations")) {
  const flag = args.has("--deploy") ? "--deploy" : "--migrations";
  const cmd = new Deno.Command("bash", {
    args: ["./deploy.script", moduleName, flag],
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  const status = await cmd.spawn().status;
  Deno.exit(status.success ? 0 : (status.code ?? 1));
} else {
  const port = Number(nodeProcess?.env?.PORT ?? 8787);
  console.log(`[products] local server on :${port}`);
  Deno.serve({ port }, (req) => productsFetch(req));
}

