import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { IGroup } from '@geomhls/shared';
import { Avatar } from '@/components/ui/Avatar';

interface Props {
  group: IGroup;
  onClick?: () => void;
}

export function GroupCard({ group, onClick }: Props) {
  const { t } = useTranslation();
  const members = (group.members || []) as any[];

  return (
    <motion.button
      whileTap={{ scale: 0.975 }}
      onClick={onClick}
      className="glass w-full text-left rounded-3xl overflow-hidden transition-all active:brightness-95"
      style={{
        boxShadow: `0 4px 24px -6px ${group.color}22`,
        borderLeft: `3px solid ${group.color}`,
      }}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Emoji icon with color glow */}
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
          style={{
            background: `${group.color}22`,
            boxShadow: `0 6px 20px -4px ${group.color}55`,
            border: `1px solid ${group.color}33`,
          }}
        >
          {group.emoji}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="truncate text-[17px] font-semibold tracking-tight">{group.name}</div>
          <div className="mt-0.5 text-xs text-text-muted">
            {t('groups.members', { count: members.length })}
          </div>
        </div>

        {/* Avatars */}
        <div className="flex -space-x-2 flex-shrink-0">
          {members.slice(0, 3).map((m, i) => (
            <Avatar key={i} src={m.user?.avatar} name={m.user?.name} size={28} />
          ))}
          {members.length > 3 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-[10px] font-bold text-text-muted ring-2 ring-bg">
              +{members.length - 3}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
