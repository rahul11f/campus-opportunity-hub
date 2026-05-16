'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    const res = await fetch('/api/student/notifications');
    const data = await res.json();
    setItems(data || []);
  }

  useEffect(() => {
    load();

    const interval = setInterval(load, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-3">
        <Bell />
        <h1 className="text-5xl font-bold">
          Notifications
        </h1>
      </div>

      {items.length === 0 && (
        <div className="rounded-3xl border bg-card p-8">
          No notifications yet
        </div>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-3xl border bg-card p-6"
        >
          <h3 className="text-xl font-bold">
            {item.title}
          </h3>

          <p className="mt-3 text-muted-foreground">
            {item.message}
          </p>
        </div>
      ))}
    </div>
  );
}