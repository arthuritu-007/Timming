# Requirements and Design Documentation - Timings App

## 1. Project Overview

A web application to track "timings" for specific locations (likely game-related). Users can add locations with photos and timestamps. The core feature is a 12-hour countdown timer that starts from the recorded time.

## 2. Functional Requirements

* **Add Timing**: Users can input:

  * Photo (URL or file upload simulation)

  * Location Name (e.g., "Davis")

  * Description (e.g., "Vías del tren")

  * Timestamp (Time when the event occurred)

* **Display Timings**:

  * Grid view of "Timing Cards".

  * Each card displays:

    * Photo

    * "Libre" status indicator (if applicable)

    * Title and Description

    * "Last Timing" (Time recorded)

    * "Time Ago" or "Countdown" (12-hour timer)

    * Status line (e.g., "En disputa")

    * Action buttons: "Localizar", "Conquistar", "Timear"

* **12-Hour Timer**:

  * Automatically calculates expiration time (Recorded Time + 12 Hours).

  * Visual indication of remaining time or status.

## 3. UI/Design Requirements

* **Theme**: Dark Mode (Dark teal/black background).

* **Colors**:

  * Accents: Neon Green (#22d3ee - #10b981) for titles.

  * Buttons: Blue (#3b82f6), Red (#ef4444), Purple (#7c3aed).

  * Status: Yellow/Orange for "En disputa".

* **Typography**: Sans-serif, bold headers, monospace digits for time.

* **Layout**: Responsive grid for cards.

## 4. Technical Stack

* **Frontend**: React, TypeScript, Vite.

* **Styling**: Tailwind CSS.

* **State Management**: Zustand (for local persistence of timings).

* **Icons**: Lucide-React.

* **Date Handling**: date-fns.

## 5. Data Model (TypeScript Interface)

```typescript
interface Timing {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  lastTiming: Date; // The time entered by user
  status: 'libre' | 'disputed'; // Derived or manual
}
```

