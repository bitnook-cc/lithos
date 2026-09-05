import { useGameStore } from '@/store/gameStore';
import { useMetaStore } from '@/store/metaStore';

export function exportRecovery() {
  const data = JSON.stringify({ run: JSON.parse(useGameStore.getState().exportSave()), legacy: JSON.parse(useMetaStore.getState().exportSave()) }, null, 2);
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = 'lithos-recovery.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
