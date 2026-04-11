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
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass flex w-full items-center gap-4 rounded-3xl p-4 text-left transition-colors hover:bg-surface-2/70"
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-lg"
        style={{ background: group.color, boxShadow: `0 10px 24px -8px ${group.color}66` }}
      >
        {group.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate text-[17px] font-semibold tracking-tight">{group.name}</div>
        <div className="text-xs text-text-muted">
          {t('groups.members', { count: members.length })}
        </div>
      </div>
      <div className="flex -space-x-2">
        {members.slice(0, 3).map((m, i) => (
          <Avatar key={i} src={m.user?.avatar} name={m.user?.name} size={28} />
        ))}
      </div>
    </motion.button>
  );
}
