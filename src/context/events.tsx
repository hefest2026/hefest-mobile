import * as React from 'react';

import type { DraftEvent, PublishedEvent } from '@/lib/types';

/**
 * Single in-memory event store shared across the organizer and student areas.
 * Seeded with the same mock global events the web app used. Organizer-published
 * drafts land here too, so they show up in the student feed within a session.
 */

const MOCK_GLOBAL_EVENTS: PublishedEvent[] = [
  {
    id: 'global-1',
    title: 'React Advanced Уъркшоп',
    description:
      'Дълбоко гмуркане в архитектурата на компонентите, Server Actions и оптимизация на производителността.',
    starts_at: '2026-07-15T10:00:00',
    ends_at: '2026-07-15T16:00:00',
    capacity: 45,
    location: 'София Тех Парк, Сграда Инкубатор',
    status: 'PUBLISHED',
    published_at: '2026-06-20T12:00:00',
    participants: ['student-12', 'student-13', 'student-14', 'student-15'],
    waitlist: [],
  },
  {
    id: 'global-2',
    title: 'AI & Дизайн Нетуъркинг Вечер',
    description:
      'Дискусия и демонстрации на тема как генеративният изкуствен интелект променя UI/UX процесите.',
    starts_at: '2026-07-22T19:00:00',
    ends_at: '2026-07-22T21:30:00',
    capacity: 5,
    location: "'ул. „Генерал Гурко' 12, София",
    status: 'PUBLISHED',
    published_at: '2026-06-24T09:15:00',
    participants: ['student-14', 'student-154', 'student-54', 'student-23', 'student-67'],
    waitlist: ['student-99', 'student-100'],
  },
];

interface EventsState {
  draftEvents: DraftEvent[];
  publishedEvents: PublishedEvent[];
  isOwn: (eventId: string) => boolean;
  addDraft: (draft: DraftEvent) => void;
  updateDraft: (draft: DraftEvent) => void;
  deleteDraft: (id: string) => void;
  publishDraft: (id: string) => void;
  deletePublished: (id: string) => void;
  register: (eventId: string, studentId: string) => void;
  joinWaitlist: (eventId: string, studentId: string) => void;
  cancel: (eventId: string, studentId: string) => void;
}

const EventsContext = React.createContext<EventsState | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [draftEvents, setDraftEvents] = React.useState<DraftEvent[]>([]);
  const [publishedEvents, setPublishedEvents] =
    React.useState<PublishedEvent[]>(MOCK_GLOBAL_EVENTS);
  // Ids of events the current organizer published this session ("your event").
  const [ownEventIds, setOwnEventIds] = React.useState<string[]>([]);

  const addDraft = React.useCallback((draft: DraftEvent) => {
    setDraftEvents((prev) => [draft, ...prev]);
  }, []);

  const updateDraft = React.useCallback((draft: DraftEvent) => {
    setDraftEvents((prev) => prev.map((e) => (e.id === draft.id ? draft : e)));
  }, []);

  const deleteDraft = React.useCallback((id: string) => {
    setDraftEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const publishDraft = React.useCallback(
    (id: string) => {
      setDraftEvents((prevDrafts) => {
        const draft = prevDrafts.find((e) => e.id === id);
        if (draft) {
          const published: PublishedEvent = {
            ...draft,
            status: 'PUBLISHED',
            published_at: new Date().toISOString(),
            participants: [],
            waitlist: [],
          };
          setPublishedEvents((prev) => [...prev, published]);
          setOwnEventIds((prev) => [...prev, id]);
        }
        return prevDrafts.filter((e) => e.id !== id);
      });
    },
    [],
  );

  const deletePublished = React.useCallback((id: string) => {
    setPublishedEvents((prev) => prev.filter((e) => e.id !== id));
    setOwnEventIds((prev) => prev.filter((eid) => eid !== id));
  }, []);

  const register = React.useCallback((eventId: string, studentId: string) => {
    setPublishedEvents((prev) =>
      prev.map((e) =>
        e.id === eventId &&
        !e.participants.includes(studentId) &&
        e.participants.length < e.capacity
          ? { ...e, participants: [...e.participants, studentId] }
          : e,
      ),
    );
  }, []);

  const joinWaitlist = React.useCallback((eventId: string, studentId: string) => {
    setPublishedEvents((prev) =>
      prev.map((e) =>
        e.id === eventId && !e.waitlist.includes(studentId)
          ? { ...e, waitlist: [...e.waitlist, studentId] }
          : e,
      ),
    );
  }, []);

  const cancel = React.useCallback((eventId: string, studentId: string) => {
    setPublishedEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;

        const isParticipating = event.participants.includes(studentId);
        const isWaitlisted = event.waitlist.includes(studentId);

        if (isParticipating) {
          const newParticipants = event.participants.filter((id) => id !== studentId);
          // Promote the first waitlisted student into the freed slot.
          if (event.waitlist.length > 0) {
            return {
              ...event,
              participants: [...newParticipants, event.waitlist[0]],
              waitlist: event.waitlist.slice(1),
            };
          }
          return { ...event, participants: newParticipants };
        }

        if (isWaitlisted) {
          return {
            ...event,
            waitlist: event.waitlist.filter((id) => id !== studentId),
          };
        }

        return event;
      }),
    );
  }, []);

  const isOwn = React.useCallback(
    (eventId: string) => ownEventIds.includes(eventId),
    [ownEventIds],
  );

  const value = React.useMemo<EventsState>(
    () => ({
      draftEvents,
      publishedEvents,
      isOwn,
      addDraft,
      updateDraft,
      deleteDraft,
      publishDraft,
      deletePublished,
      register,
      joinWaitlist,
      cancel,
    }),
    [
      draftEvents,
      publishedEvents,
      isOwn,
      addDraft,
      updateDraft,
      deleteDraft,
      publishDraft,
      deletePublished,
      register,
      joinWaitlist,
      cancel,
    ],
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents(): EventsState {
  const ctx = React.useContext(EventsContext);
  if (!ctx) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return ctx;
}
