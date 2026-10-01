import { Icon } from '@/components/ui/Icon'

interface StatsCardsProps {
  total: number
  active: number
  completed: number
}

export function StatsCards({ total, active, completed }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Dreams',
      value: String(total),
      suffix: 'logged',
      labelClass: 'text-on-surface-variant',
      valueClass: 'text-on-surface',
    },
    {
      label: 'In Flight',
      value: String(active),
      suffix: 'active',
      labelClass: 'text-primary-container',
      valueClass: 'text-on-surface',
    },
    {
      label: 'Conquered',
      value: String(completed),
      suffix: 'summits',
      labelClass: 'text-success-olive dark:text-emerald-glow',
      valueClass: 'text-success-olive dark:text-emerald-glow',
    },
    {
      label: 'Milestone Pace',
      value: 'On Track',
      suffix: null,
      icon: 'bolt' as const,
      labelClass: 'text-primary-container',
      valueClass: 'text-primary-container',
    },
  ]

  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex flex-col justify-between rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-sm transition-colors hover:border-outline-variant dark:bg-surface-container-low"
        >
          <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${card.labelClass}`}>
            {card.label}
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={`font-bold ${
                card.suffix ? 'text-[32px] leading-10' : 'text-2xl leading-8'
              } ${card.valueClass}`}
            >
              {card.value}
            </span>
            {card.icon && <Icon className="text-xl leading-7" name={card.icon} />}
            {card.suffix && <span className="text-[13px] leading-[18px] text-on-surface-variant">{card.suffix}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
