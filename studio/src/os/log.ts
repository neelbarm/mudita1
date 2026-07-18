import pc from "picocolors";

/** Tiny leveled logger. Structured enough to grep, human enough to read. */

function ts(): string {
  return new Date().toISOString().slice(11, 19);
}

export const log = {
  info(msg: string, ...rest: unknown[]) {
    console.log(pc.dim(ts()), msg, ...rest);
  },
  ok(msg: string, ...rest: unknown[]) {
    console.log(pc.dim(ts()), pc.green("ok"), msg, ...rest);
  },
  warn(msg: string, ...rest: unknown[]) {
    console.warn(pc.dim(ts()), pc.yellow("warn"), msg, ...rest);
  },
  error(msg: string, ...rest: unknown[]) {
    console.error(pc.dim(ts()), pc.red("error"), msg, ...rest);
  },
  brass(msg: string) {
    console.log(pc.dim(ts()), pc.yellow(msg));
  },
};
