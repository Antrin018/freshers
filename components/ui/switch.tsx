// components/Switch.tsx
'use client';

import { Switch as HeadlessSwitch } from '@headlessui/react';


export default function Switch({ enabled, setEnabled }: { enabled: boolean; setEnabled: (val: boolean) => void }) {
  return (
    <HeadlessSwitch
      checked={enabled}
      onChange={setEnabled}
      className={`${
        enabled ? 'bg-green-500' : 'bg-gray-300'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
    >
      <span
        className={`${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </HeadlessSwitch>
  );
}
