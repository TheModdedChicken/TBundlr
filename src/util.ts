type Namespaces = "tbundlr_event" | "tbundlr_warn" | "tbundlr_err"

export function CreateInfoType (namespace: Namespaces, ...args: string[]) {
  return `${namespace}:-:${args.join("::")}`
}