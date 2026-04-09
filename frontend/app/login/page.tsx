import { login } from './actions'
import { Button } from '@/components/ui/button'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  const params = await searchParams;
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex flex-col space-y-2 text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Вход</h1>
          <p className="text-sm text-gray-500">
            Введите email и пароль для доступа к дашборду
          </p>
        </div>

        <form action={login} className="flex flex-col gap-4">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {params?.message && (
            <p className="mt-4 p-4 bg-red-50 text-red-600 text-sm font-medium rounded text-center">
              {params.message}
            </p>
          )}

          <Button type="submit" className="w-full mt-2">
            Войти
          </Button>
        </form>
      </div>
    </div>
  )
}
