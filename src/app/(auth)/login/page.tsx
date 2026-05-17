import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1fr)_480px]">
      <section className="hidden border-r bg-secondary/35 px-12 py-10 lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            CD
          </div>
          <div className="mt-16 max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Crew Desk</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight tracking-normal">
              Central operations for people, assets, gear, and field work.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              A modular enterprise workspace built on Directus and Next.js, ready for RBAC,
              workflows, analytics, and future operational modules.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground">
          <div className="rounded-md border bg-background/60 p-4">Directus Auth</div>
          <div className="rounded-md border bg-background/60 p-4">PostgreSQL</div>
          <div className="rounded-md border bg-background/60 p-4">RBAC Ready</div>
        </div>
      </section>
      <section className="flex items-center justify-center px-5 py-10">
        <LoginForm />
      </section>
    </main>
  );
}
