import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Radius, Spacing } from '@/constants/theme';
import { useEvents } from '@/context/events';
import { useTheme } from '@/hooks/use-theme';
import {
  ddmmyyyyToYYYYmmdd,
  formatDateInput,
  formatDateTimeDisplay,
  formatTimeInput,
  yyyymmddToDdmmyyyy,
} from '@/lib/format';
import type { DraftEvent } from '@/lib/types';

interface FormState {
  title: string;
  description: string;
  starts_date: string;
  starts_time: string;
  ends_date: string;
  ends_time: string;
  capacity: string;
  location: string;
}

const initialFormState: FormState = {
  title: '',
  description: '',
  starts_date: '',
  starts_time: '',
  ends_date: '',
  ends_time: '',
  capacity: '1',
  location: '',
};

/** Ported from the web `organizer part/event-draft.tsx`. */
export function EventForm({ onPublishRequest }: { onPublishRequest: (event: DraftEvent) => void }) {
  const c = useTheme();
  const { draftEvents, addDraft, updateDraft, deleteDraft } = useEvents();

  const [form, setForm] = React.useState<FormState>(initialFormState);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const set = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!form.title.trim()) next.title = 'Название на събитието е задължително';
    if (!form.description.trim()) next.description = 'Описанието е задължително';
    if (!form.starts_date || form.starts_date.length < 10) {
      next.starts_date = 'Началната дата е задължителна (dd/mm/yyyy)';
    }
    if (!form.starts_time) next.starts_time = 'Началното време е задължително';

    if (form.ends_date && form.ends_date.length >= 10 && !form.ends_time) {
      next.ends_time = 'Крайното време е задължително, ако е зададена крайната дата';
    }
    if (!form.ends_date && form.ends_time) {
      next.ends_date = 'Крайната дата е задължителна, ако е зададено крайното време';
    }

    if (
      form.starts_date &&
      form.starts_date.length === 10 &&
      form.ends_date &&
      form.ends_date.length === 10 &&
      form.starts_time &&
      form.ends_time
    ) {
      const startsISO = `${ddmmyyyyToYYYYmmdd(form.starts_date)}T${form.starts_time}:00`;
      const endsISO = `${ddmmyyyyToYYYYmmdd(form.ends_date)}T${form.ends_time}:00`;
      if (endsISO <= startsISO) {
        next.ends_date = 'Крайното време трябва да бъде след началното';
      }
    }

    const capacity = parseInt(form.capacity, 10);
    if (Number.isNaN(capacity) || capacity < 1) {
      next.capacity = 'Капацитетът трябва да бъде поне 1';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const capacity = parseInt(form.capacity, 10);
    const startsAt = `${ddmmyyyyToYYYYmmdd(form.starts_date)}T${form.starts_time}:00`;
    const endsAt =
      form.ends_date && form.ends_date.length === 10 && form.ends_time
        ? `${ddmmyyyyToYYYYmmdd(form.ends_date)}T${form.ends_time}:00`
        : undefined;

    const newEvent: DraftEvent = {
      id: editingId || Date.now().toString(),
      title: form.title.trim(),
      description: form.description.trim(),
      starts_at: startsAt,
      ends_at: endsAt,
      capacity,
      location: form.location.trim() || undefined,
      status: 'DRAFT',
    };

    if (editingId) {
      updateDraft(newEvent);
      setEditingId(null);
    } else {
      addDraft(newEvent);
    }

    setForm(initialFormState);
    setErrors({});
  };

  const handleEdit = (event: DraftEvent) => {
    setEditingId(event.id);
    const [startsDate, startsTime] = event.starts_at.split('T');
    const [endsDate, endsTime] = event.ends_at ? event.ends_at.split('T') : ['', ''];

    setForm({
      title: event.title,
      description: event.description,
      starts_date: yyyymmddToDdmmyyyy(startsDate),
      starts_time: startsTime.slice(0, 5),
      ends_date: endsDate ? yyyymmddToDdmmyyyy(endsDate) : '',
      ends_time: endsTime ? endsTime.slice(0, 5) : '',
      capacity: event.capacity.toString(),
      location: event.location || '',
    });
  };

  const handleDelete = (id: string) => {
    deleteDraft(id);
    if (editingId === id) {
      setEditingId(null);
      setForm(initialFormState);
      setErrors({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(initialFormState);
    setErrors({});
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: c.foreground }]}>
        {editingId ? 'Редактиране на събитие' : 'Създаване на ново събитие'}
      </Text>

      <View style={styles.form}>
        <Field>
          <FieldLabel>Название на събитието *</FieldLabel>
          <Input
            value={form.title}
            onChangeText={(v) => set({ title: v })}
            placeholder="Въведете заглавие на събитието"
            invalid={!!errors.title}
          />
          <FieldError>{errors.title}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Описание *</FieldLabel>
          <Textarea
            value={form.description}
            onChangeText={(v) => set({ description: v })}
            placeholder="Детали и информация за събитието"
            invalid={!!errors.description}
          />
          <FieldError>{errors.description}</FieldError>
        </Field>

        <View style={styles.row}>
          <Field style={styles.rowItem}>
            <FieldLabel>Начало *</FieldLabel>
            <View style={styles.dateTime}>
              <Input
                style={styles.dateInput}
                value={form.starts_date}
                onChangeText={(v) => set({ starts_date: formatDateInput(v) })}
                placeholder="dd/mm/yyyy"
                keyboardType="number-pad"
                invalid={!!errors.starts_date}
              />
              <Input
                style={styles.timeInput}
                value={form.starts_time}
                onChangeText={(v) => set({ starts_time: formatTimeInput(v) })}
                placeholder="HH:MM"
                keyboardType="number-pad"
                invalid={!!errors.starts_time}
              />
            </View>
            <FieldError>{errors.starts_date}</FieldError>
            <FieldError>{errors.starts_time}</FieldError>
          </Field>
        </View>

        <View style={styles.row}>
          <Field style={styles.rowItem}>
            <FieldLabel>Край</FieldLabel>
            <View style={styles.dateTime}>
              <Input
                style={styles.dateInput}
                value={form.ends_date}
                onChangeText={(v) => set({ ends_date: formatDateInput(v) })}
                placeholder="dd/mm/yyyy"
                keyboardType="number-pad"
                invalid={!!errors.ends_date}
              />
              <Input
                style={styles.timeInput}
                value={form.ends_time}
                onChangeText={(v) => set({ ends_time: formatTimeInput(v) })}
                placeholder="HH:MM"
                keyboardType="number-pad"
                invalid={!!errors.ends_time}
              />
            </View>
            <FieldError>{errors.ends_date}</FieldError>
            <FieldError>{errors.ends_time}</FieldError>
          </Field>
        </View>

        <View style={styles.row}>
          <Field style={styles.rowItem}>
            <FieldLabel>Капацитет *</FieldLabel>
            <Input
              value={form.capacity}
              onChangeText={(v) => set({ capacity: v })}
              placeholder="1"
              keyboardType="number-pad"
              invalid={!!errors.capacity}
            />
            <FieldError>{errors.capacity}</FieldError>
          </Field>

          <Field style={styles.rowItem}>
            <FieldLabel>Местоположение или URL</FieldLabel>
            <Input
              value={form.location}
              onChangeText={(v) => set({ location: v })}
              placeholder="Адрес на мястото или видео връзка"
            />
          </Field>
        </View>

        <View style={styles.formActions}>
          {editingId ? (
            <Button variant="outline" onPress={handleCancel}>
              Отказ
            </Button>
          ) : null}
          <Button onPress={handleSubmit}>
            {editingId ? 'Актуализиране на събитие' : 'Създаване на ново събитие'}
          </Button>
        </View>
      </View>

      {draftEvents.length > 0 ? (
        <View style={styles.draftList}>
          <Text style={[styles.subheading, { color: c.foreground }]}>
            Чернови събития ({draftEvents.length})
          </Text>
          {draftEvents.map((event) => (
            <View
              key={event.id}
              style={[styles.draftCard, { backgroundColor: c.surface, borderColor: c.border }]}
            >
              <View style={styles.draftHeader}>
                <View style={styles.draftHeaderText}>
                  <Text style={[styles.draftTitle, { color: c.foreground }]}>{event.title}</Text>
                  <Text style={[styles.draftDescription, { color: c.muted }]}>
                    {event.description}
                  </Text>
                </View>
                <Badge label="ЧЕРНОВА" tone="neutral" />
              </View>

              <View style={[styles.draftMeta, { borderBottomColor: c.border }]}>
                <Meta label="Начало" value={formatDateTimeDisplay(event.starts_at)} />
                {event.ends_at ? (
                  <Meta label="Край" value={formatDateTimeDisplay(event.ends_at)} />
                ) : null}
                <Meta
                  label="Капацитет"
                  value={`${event.capacity} ${event.capacity === 1 ? 'човек' : 'човека'}`}
                />
                {event.location ? <Meta label="Местоположение" value={event.location} /> : null}
              </View>

              <View style={styles.draftActions}>
                <Button size="sm" onPress={() => onPublishRequest(event)}>
                  Публикуване
                </Button>
                <Button variant="outline" size="sm" onPress={() => handleEdit(event)}>
                  Редактиране
                </Button>
                <Button variant="outline" size="sm" danger onPress={() => handleDelete(event.id)}>
                  Изтриване
                </Button>
              </View>
            </View>
          ))}
        </View>
      ) : (
        !editingId && (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: c.muted }]}>
              Няма чернови на събитие все още. Създайте едно, за да започнете.
            </Text>
          </View>
        )
      )}
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  const c = useTheme();
  return (
    <View style={styles.metaItem}>
      <Text style={[styles.metaLabel, { color: c.subtle }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: c.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.four },
  heading: { fontSize: 20, fontWeight: '600' },
  form: { gap: Spacing.three },
  row: { flexDirection: 'row', gap: Spacing.three },
  rowItem: { flex: 1 },
  dateTime: { flexDirection: 'row', gap: Spacing.two },
  dateInput: { flex: 1 },
  timeInput: { width: 96 },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  draftList: { gap: Spacing.three },
  subheading: { fontSize: 16, fontWeight: '600' },
  draftCard: {
    borderWidth: 1,
    borderRadius: Radius.none,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  draftHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  draftHeaderText: { flex: 1, gap: Spacing.one },
  draftTitle: { fontSize: 16, fontWeight: '600' },
  draftDescription: { fontSize: 14, lineHeight: 20 },
  draftMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    paddingBottom: Spacing.three,
    rowGap: Spacing.three,
  },
  metaItem: { width: '50%', paddingRight: Spacing.two },
  metaLabel: { fontSize: 12, marginBottom: 2 },
  metaValue: { fontSize: 14, fontWeight: '600' },
  draftActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  empty: { paddingVertical: Spacing.four, alignItems: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
