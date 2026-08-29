declare const Deno: {
  env: { get(name: string): string | undefined }
  serve(handler: (request: Request) => Response | Promise<Response>): void
}

declare module "npm:@supabase/supabase-js@2" {
  export function createClient(
    ...args: unknown[]
  ): {
    from(table: string): {
      insert(value: Record<string, unknown>): {
        select(columns: string): {
          single(): Promise<{ data: unknown error: unknown }>
        }
      }
    }
  }
}
