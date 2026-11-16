import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/admin/icons';
import { A, AText } from '@/admin/ui';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Trigger({ label, value, placeholder, open, onPress }: { label?: string; value: string; placeholder: string; open: boolean; onPress: () => void }) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <AText kind="label">{label}</AText> : null}
      <Pressable accessibilityRole="button" onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: A.white, borderWidth: 1, borderColor: A.lineStrong, borderRadius: 8, height: 42, paddingHorizontal: 12 }}>
        <AText kind="small" color={value ? A.text : A.faint}>
          {value || placeholder}
        </AText>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} color={A.muted} />
      </Pressable>
    </View>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

/** A date field with a small calendar. `value` is `YYYY-MM-DD` or an empty string. */
export function DateField({ label, value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(`${value}T00:00:00`) : null;
  const [cursor, setCursor] = useState(() => {
    const base = selected ?? new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  const first = new Date(cursor.year, cursor.month, 1).getDay();
  const length = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length }, (_, i) => i + 1)];
  const step = (delta: number) => {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };
  const display = selected ? `${selected.getDate()}, ${MONTHS[selected.getMonth()]}, ${selected.getFullYear()}` : '';

  return (
    <View style={{ zIndex: open ? 30 : 1 }}>
      <Trigger label={label} value={display} placeholder="Select date" open={open} onPress={() => setOpen((v) => !v)} />
      {open ? (
        <View style={{ position: 'absolute', top: label ? 70 : 46, left: 0, width: 290, backgroundColor: A.white, borderRadius: 10, borderWidth: 1, borderColor: A.line, padding: 12, gap: 8, zIndex: 40 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <AText kind="small">
              {MONTHS[cursor.month]} {cursor.year}
            </AText>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => step(-1)} hitSlop={8}>
                <Icon name="chevron-up" size={16} color={A.muted} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => step(1)} hitSlop={8}>
                <Icon name="chevron-down" size={16} color={A.muted} />
              </Pressable>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {DAYS.map((d) => (
              <View key={d} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4 }}>
                <AText kind="tiny" color={A.muted}>
                  {d}
                </AText>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {cells.map((day, i) => {
              const iso = day ? `${cursor.year}-${pad(cursor.month + 1)}-${pad(day)}` : '';
              const active = iso === value;
              return (
                <View key={i} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 }}>
                  {day ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${day} ${MONTHS[cursor.month]} ${cursor.year}`}
                      onPress={() => {
                        onChange(iso);
                        setOpen(false);
                      }}
                      style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? A.accent : 'transparent' }}
                    >
                      <AText kind="small" color={active ? A.white : A.text}>
                        {day}
                      </AText>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Column({ items, current, onPick }: { items: number[]; current: number | null; onPick: (n: number) => void }) {
  return (
    <ScrollView style={{ height: 160, width: 56 }} showsVerticalScrollIndicator={false}>
      {items.map((n) => (
        <Pressable key={n} accessibilityRole="button" onPress={() => onPick(n)} style={{ alignItems: 'center', paddingVertical: 8, borderRadius: 6, backgroundColor: n === current ? A.field : 'transparent' }}>
          <AText kind="small" color={n === current ? A.accent : A.text}>
            {pad(n)}
          </AText>
        </Pressable>
      ))}
    </ScrollView>
  );
}

/** A time field with hour / minute / AM-PM columns. `value` is `HH:MM` (24 hour) or an empty string. */
export function TimeField({ label, value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [h24, m] = value ? value.split(':').map(Number) : [NaN, NaN];
  const hour12 = Number.isNaN(h24) ? null : h24 % 12 === 0 ? 12 : h24 % 12;
  const pm = !Number.isNaN(h24) && h24 >= 12;
  const display = hour12 === null ? '' : `${pad(hour12)} : ${pad(m)} ${pm ? 'PM' : 'AM'}`;

  const commit = (nextHour12: number, minute: number, nextPm: boolean) => {
    const h = (nextHour12 % 12) + (nextPm ? 12 : 0);
    onChange(`${pad(h)}:${pad(minute)}`);
  };
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <View style={{ zIndex: open ? 30 : 1 }}>
      <Trigger label={label} value={display} placeholder="Select time" open={open} onPress={() => setOpen((v) => !v)} />
      {open ? (
        <View style={{ position: 'absolute', top: label ? 70 : 46, left: 0, backgroundColor: A.white, borderRadius: 10, borderWidth: 1, borderColor: A.line, padding: 10, flexDirection: 'row', gap: 6, zIndex: 40 }}>
          <Column items={hours} current={hour12} onPick={(n) => commit(n, Number.isNaN(m) ? 0 : m, pm)} />
          <Column items={minutes} current={Number.isNaN(m) ? null : m} onPick={(n) => commit(hour12 ?? 12, n, pm)} />
          <View style={{ gap: 4, justifyContent: 'center' }}>
            {['AM', 'PM'].map((half) => (
              <Pressable key={half} accessibilityRole="button" onPress={() => commit(hour12 ?? 12, Number.isNaN(m) ? 0 : m, half === 'PM')} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: (half === 'PM') === pm && hour12 !== null ? A.field : 'transparent' }}>
                <AText kind="small" color={(half === 'PM') === pm && hour12 !== null ? A.accent : A.text}>
                  {half}
                </AText>
              </Pressable>
            ))}
            <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
              <AText kind="small" color={A.accent}>
                Done
              </AText>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** Combines a local date (`YYYY-MM-DD`) and time (`HH:MM`) into an ISO string, or '' when either is missing. */
export function toIso(date: string, time: string): string {
  if (!date || !time) return '';
  const d = new Date(`${date}T${time}:00`);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

export function splitIso(iso: string | null | undefined): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}
