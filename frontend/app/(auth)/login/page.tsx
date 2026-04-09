import { login } from './actions'
import { SubmitButton } from './submit-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/Logo'

/**
 * Серверный компонент страницы входа.
 * Соответствует требованиям 2026 года: Rich Aesthetics + Server Component.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const params = await searchParams;
  
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-muted/10 px-4 overflow-hidden">
      {/* Декоративные элементы фона для "Premium" вида */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>
      </div>
      
      <div className="z-10 w-full max-w-[360px] transition-all duration-500 animate-in fade-in zoom-in-95">
        <Logo size="md" className="mb-6" />

        <Card className="border-border/40 bg-background/80 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)]">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-bold tracking-tight">Вход в систему</CardTitle>
            <CardDescription className="text-xs font-medium">
              Введите данные для доступа к панели
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <form action={login} className="grid gap-4">
              <div className="grid gap-1">

                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
                  Электронная почта
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@gbc.kz"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  required
                  className="h-10 bg-muted/20 border-border/50 focus-visible:ring-primary/40 focus-visible:bg-background transition-all"
                />
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    Пароль
                  </Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="h-10 bg-muted/20 border-border/50 focus-visible:ring-primary/40 focus-visible:bg-background transition-all"
                />
              </div>
              
              {params?.message && (
                <div className="rounded-lg bg-destructive/5 p-2.5 text-[11px] font-bold text-destructive border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                    {params.message}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <SubmitButton />
              </div>
            </form>

          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-50">
          © 2026 GBC Systems • Secure Access
        </p>
      </div>
    </div>
  )
}
