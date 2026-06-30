import { EventsRepository } from "./events.repository.js";

export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}
}
