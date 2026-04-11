import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { GROUP_COLORS, GROUP_EMOJIS } from '@geomhls/shared';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { GroupCard } from '@/components/groups/GroupCard';
import { useGroupsStore } from '@/stores/groupsStore';
import { useNavigate } from 'react-router-dom';

type ModalType = null | 'create' | 'join' | 'invite';

export default function GroupsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const groups = useGroupsStore((s) => s.groups);
  const loading = useGroupsStore((s) => s.loading);
  const fetchGroups = useGroupsStore((s) => s.fetchGroups);
  const createGroup = useGroupsStore((s) => s.createGroup);
  const joinGroup = useGroupsStore((s) => s.joinGroup);
  const setActive = useGroupsStore((s) => s.setActiveGroup);

  const [modal, setModal] = useState<ModalType>(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string>(GROUP_EMOJIS[0]);
  const [color, setColor] = useState<string>(GROUP_COLORS[0]);
  const [code, setCode] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const submitCreate = async () => {
    if (!name.trim()) return;
    try {
      const g = await createGroup({ name: name.trim(), emoji, color });
      setCreatedCode((g as any).inviteCode);
      setName('');
      setModal('invite');
    } catch {
      setErr(t('common.error'));
    }
  };

  const submitJoin = async () => {
    setErr('');
    try {
      await joinGroup(code.trim().toUpperCase());
      setCode('');
      setModal(null);
    } catch {
      setErr(t('errors.invalidCode'));
    }
  };

  const openChat = (id: string) => {
    setActive(id);
    navigate(`/chat/${id}`);
  };

  return (
    <div className="pb-36 lg:pb-10">
      <Header title={t('groups.title')} />
      <div className="px-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button size="md" variant="primary" onClick={() => setModal('create')}>
            + {t('groups.createNew')}
          </Button>
          <Button size="md" variant="secondary" onClick={() => setModal('join')}>
            {t('groups.joinCircle')}
          </Button>
        </div>

        <div className="pt-2 space-y-3">
          {loading && groups.length === 0 ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : groups.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass mt-8 flex flex-col items-center justify-center rounded-3xl p-12 text-center"
            >
              <div className="mb-4 text-5xl">👥</div>
              <h3 className="text-xl font-bold">{t('groups.empty')}</h3>
              <p className="mt-1 text-sm text-text-muted">{t('groups.emptySub')}</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {groups.map((g: any) => (
                <motion.div
                  key={g._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <GroupCard group={g} onClick={() => openChat(g._id)} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <Modal open={modal === 'create'} onClose={() => setModal(null)} title={t('groups.createNew')}>
        <div className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('groups.namePlaceholder')}
            maxLength={30}
          />
          <div>
            <div className="mb-2 text-sm text-text-muted">{t('groups.pickEmoji')}</div>
            <div className="flex flex-wrap gap-2">
              {GROUP_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`h-11 w-11 rounded-xl text-xl transition-all ${
                    emoji === e ? 'bg-brand/20 ring-2 ring-brand' : 'bg-surface-2'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm text-text-muted">{t('groups.pickColor')}</div>
            <div className="flex flex-wrap gap-2">
              {GROUP_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-11 w-11 rounded-xl ring-offset-2 ring-offset-surface transition-all ${
                    color === c ? 'ring-2 ring-white' : ''
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <Button fullWidth size="lg" onClick={submitCreate}>
            {t('common.create')}
          </Button>
        </div>
      </Modal>

      <Modal open={modal === 'join'} onClose={() => setModal(null)} title={t('groups.joinCircle')}>
        <div className="space-y-4">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t('groups.codePlaceholder')}
            maxLength={6}
            className="text-center text-2xl tracking-[0.3em] font-bold"
          />
          {err && <p className="text-sm text-danger">{err}</p>}
          <Button fullWidth size="lg" onClick={submitJoin}>
            {t('common.join')}
          </Button>
        </div>
      </Modal>

      <Modal open={modal === 'invite'} onClose={() => setModal(null)} title={t('groups.inviteCode')}>
        <div className="space-y-4 text-center">
          <div className="gradient-text text-6xl font-black tracking-[0.2em] py-6">
            {createdCode}
          </div>
          <Button
            fullWidth
            size="lg"
            variant="secondary"
            onClick={() => navigator.clipboard.writeText(createdCode)}
          >
            {t('groups.copyCode')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
