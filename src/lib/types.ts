/** Domain types ported from the hefest-frontend web app. */

export interface BaseEvent {
  id: string;
  title: string;
  description: string;
  starts_at: string; // ISO-ish "YYYY-MM-DDTHH:mm:ss"
  ends_at?: string;
  capacity: number;
  location?: string;
}

export interface DraftEvent extends BaseEvent {
  status: 'DRAFT';
}

export interface PublishedEvent extends BaseEvent {
  status: 'PUBLISHED';
  published_at: string;
  participants: string[]; // student IDs
  waitlist: string[]; // student IDs
}

export type AppEvent = DraftEvent | PublishedEvent;

export type Role = 'organizer' | 'student';
