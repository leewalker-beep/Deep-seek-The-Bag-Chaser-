import { setNarrativeEvents, updateSatiricalExpansions } from '../config/narrativeEvents';
import { setWorldFeedContent } from '../utils/worldFeedLoader';
import mud from '../config/narrative/mud.json';
import street from '../config/narrative/street.json';
import startup from '../config/narrative/startup.json';
import corporate from '../config/narrative/corporate.json';
import elite from '../config/narrative/elite.json';
import presidency from '../config/narrative/presidency.json';
import templates from '../config/worldFeed/templates.json';

const allEvents = [
  ...mud,
  ...street,
  ...startup,
  ...corporate,
  ...elite,
  ...presidency
];

// Remove any duplicates by ID
const uniqueMap = new Map<string, any>();
for (const event of allEvents) {
  uniqueMap.set(event.id, event);
}

setNarrativeEvents(Array.from(uniqueMap.values()));
updateSatiricalExpansions();

setWorldFeedContent(templates);
