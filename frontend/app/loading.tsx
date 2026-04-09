/**
 * Глобальный компонент загрузки для проекта GBC.
 * Реализован в премиальном стиле с использованием анимаций и блюра.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 overflow-hidden">
      {/* Декоративный фон для загрузочного экрана */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 text-center animate-in fade-in zoom-in-95 duration-700">
        {/* Анимированный логотип */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)] animate-bounce duration-[2000ms]">
          <span className="text-4xl font-black text-primary-foreground italic select-none">G</span>
          {/* Кольцо вокруг логотипа */}
          <div className="absolute -inset-2 rounded-2xl border-2 border-primary/20 animate-spin duration-[4000ms]" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tighter uppercase italic text-foreground">
              GBC <span className="text-primary">Systems</span>
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] opacity-60">
              Synchronizing infrastructure
            </p>
          </div>

          {/* Премиальный прогресс-бар */}
          <div className="relative mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-muted shadow-inner">
            <div className="absolute inset-0 h-full w-full animate-loading-bar bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)]" />
          </div>
        </div>

        {/* Статусные сообщения (цикличные или просто текст) */}
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest opacity-40 animate-pulse">
          Secure connection established...
        </div>
      </div>
    </div>
  )
}
