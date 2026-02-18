import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface ProsConsSectionProps {
  title: string
  icon: ReactNode
  iconColor: string
  bulletColor: string
  items: string[]
}

export function ProsConsSection({
  title,
  icon,
  iconColor,
  bulletColor,
  items,
}: ProsConsSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className={iconColor}>{icon}</div>
        <h2 className="text-sm">{title}</h2>
      </div>

      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className={`${bulletColor} mt-1 shrink-0`}>•</span>
            <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
