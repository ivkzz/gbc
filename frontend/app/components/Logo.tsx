import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
  orientation?: 'vertical' | 'horizontal'
}

/**
 * Унифицированный компонент логотипа GBC CORE.
 * Оптимизирован для различных размеров и ориентаций.
 */
export function Logo({ 
  className, 
  size = 'md', 
  showSubtitle = true,
  orientation = 'vertical'
}: LogoProps) {
  
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={cn(
      "flex items-center",
      isHorizontal ? "flex-row gap-3" : "flex-col gap-3 text-center",
      className
    )}>
      {/* Иконка логотипа */}
      <div className={cn(
        "relative flex items-center justify-center bg-primary shadow-xl shadow-primary/20 shrink-0 select-none transition-transform duration-500 hover:scale-105 active:scale-95",
        size === 'sm' ? "h-10 w-10 rounded-xl" : "h-14 w-14 rounded-2xl",
        !isHorizontal && size === 'lg' ? "rotate-2 hover:rotate-0" : ""
      )}>
        <span className={cn(
          "font-black text-primary-foreground italic leading-none",
          size === 'sm' ? "text-xl" : "text-2xl"
        )}>
          G
        </span>
        {/* Декоративный световой эффект */}
        <div className="absolute inset-0 rounded-inherit bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
      </div>

      {/* Текстовая часть */}
      <div className={cn(
        "flex flex-col",
        isHorizontal ? "items-start" : "items-center"
      )}>
        <h1 className={cn(
          "font-black tracking-tighter text-foreground uppercase italic leading-none",
          size === 'sm' ? "text-xl" : "text-3xl",
          isHorizontal ? "not-italic" : ""
        )}>
          GBC <span className="text-primary not-italic">Core</span>
        </h1>
        
        {showSubtitle && (
          <p className={cn(
            "font-bold text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap opacity-70 mt-1",
            size === 'sm' ? "text-[8px]" : "text-[10px]"
          )}>
            Infrastructure Control
          </p>
        )}
      </div>
    </div>
  )
}
