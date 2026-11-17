async function getGoogleAccessToken(): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (
    !clientId ||
    !clientSecret ||
    !refreshToken ||
    clientId.includes("your-google")
  ) {
    return null;
  }

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const data = (await res.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

export async function getGoogleBusyIntervals(
  timeMinIso: string,
  timeMaxIso: string
): Promise<Array<{ start: string; end: string }>> {
  const token = await getGoogleAccessToken();
  if (!token) return [];

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  try {
    const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: timeMinIso,
        timeMax: timeMaxIso,
        timeZone: "Asia/Kolkata",
        items: [{ id: calendarId }],
      }),
    });
    const data = (await res.json()) as {
      calendars?: Record<string, { busy?: Array<{ start: string; end: string }> }>;
    };
    return data.calendars?.[calendarId]?.busy ?? [];
  } catch {
    return [];
  }
}

export async function createGoogleMeetEvent(params: {
  summary: string;
  description: string;
  startIso: string;
  endIso: string;
  attendeeEmail: string;
  includeMeet: boolean;
}): Promise<{ eventId?: string; meetLink?: string }> {
  const token = await getGoogleAccessToken();
  if (!token) {
    return {
      meetLink: params.includeMeet
        ? "https://meet.google.com/new"
        : undefined,
    };
  }

  const calendarId = encodeURIComponent(
    process.env.GOOGLE_CALENDAR_ID || "primary"
  );
  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1&sendUpdates=all`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: params.summary,
          description: params.description,
          start: { dateTime: params.startIso, timeZone: "Asia/Kolkata" },
          end: { dateTime: params.endIso, timeZone: "Asia/Kolkata" },
          attendees: [{ email: params.attendeeEmail }],
          conferenceData: params.includeMeet
            ? {
                createRequest: {
                  requestId: `sc-${Date.now()}`,
                  conferenceSolutionKey: { type: "hangoutsMeet" },
                },
              }
            : undefined,
        }),
      }
    );
    const data = (await res.json()) as {
      id?: string;
      hangoutLink?: string;
    };
    return {
      eventId: data.id,
      meetLink: data.hangoutLink,
    };
  } catch {
    return {};
  }
}
