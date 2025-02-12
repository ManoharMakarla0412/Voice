const Event = require("../models/eventModel");

exports.createEvent = async (req, res) => {
  const { event, accessToken, userEmail } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // First, check availability for the requested time slot
    const freeBusyQuery = {
      timeMin: event.start.dateTime,
      timeMax: event.end.dateTime,
      timeZone: event.start.timeZone,
      items: [{ id: 'primary' }]
    };

    // Check for scheduling conflicts
    const availabilityResponse = await fetch(
      "https://www.googleapis.com/calendar/v3/freeBusy",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(freeBusyQuery),
      }
    );

    const availabilityData = await availabilityResponse.json();

    // Check if there are any busy periods during the requested time
    const busyPeriods = availabilityData.calendars?.primary?.busy || [];
    
    // Function to check if two time periods overlap
    const isOverlapping = (period1, period2) => {
      const start1 = new Date(period1.start).getTime();
      const end1 = new Date(period1.end).getTime();
      const start2 = new Date(period2.start).getTime();
      const end2 = new Date(period2.end).getTime();
      
      return start1 < end2 && start2 < end1;
    };

    // Check if the proposed event overlaps with any busy periods
    const hasConflict = busyPeriods.some(busyPeriod => 
      isOverlapping(
        { start: event.start.dateTime, end: event.end.dateTime },
        { start: busyPeriod.start, end: busyPeriod.end }
      )
    );

    if (hasConflict) {
      return res.status(409).json({
        error: "Time slot not available",
        conflicts: busyPeriods
      });
    }

    // If no conflicts, proceed with event creation
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    const data = await response.json();

    if (response.ok) {
      // Save event to MongoDB
      const newEvent = new Event({
        userEmail,
        summary: event.summary,
        description: event.description,
        start: event.start.dateTime,
        end: event.end.dateTime,
      });
      await newEvent.save();

      res.json({
        success: true,
        message: "Event created successfully!",
        event: data
      });
    } else {
      res.status(400).json({
        error: "Failed to create event in Google Calendar",
        details: data
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message
    });
  }
};