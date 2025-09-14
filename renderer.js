// renderer.js
// 📅 Stundenplan-Logik

// Globale Variablen für den Zugriff aus der HTML-Datei
window.todayDate = new Date().toISOString().slice(0, 10);

window.studenplanladen = async function(token = null) {
    if (!token || token === 'Token/Lehrer Kürzel') {
        token = ''; 
    }
    token = token.replace(/[^a-zA-Z0-9]/g, '');
    const url = `https://intranet.bib.de/ical/2e738f1cf14d44d719c88ebeffa5e34d/${token}`;
    
    console.log('Fetching URL:', url);
    
    try {
        // Fügen Sie CORS-Header hinzu
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Origin': 'https://intranet.bib.de'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Netzwerkantwort war nicht ok: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.text();
        
        if (!data.includes('BEGIN:VCALENDAR') || !data.includes('END:VCALENDAR')) {
            throw new Error('Ungültiges iCal-Format erhalten');
        }
        
        return { success: true, data: data, token: token };
    } catch (error) {
        console.error('Fehler beim Laden:', error);
        return { success: false, error: error.message, token: token };
    }
}

// Die restlichen Funktionen bleiben unverändert
window.parseICalData = function(icalText) {
    const events = [];
    const lines = icalText.split('\n');
    let currentEvent = null;
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === 'BEGIN:VEVENT') {
            currentEvent = {};
        } else if (trimmedLine === 'END:VEVENT') {
            if (currentEvent) {
                events.push(currentEvent);
                currentEvent = null;
            }
        } else if (currentEvent) {
            const colonIndex = trimmedLine.indexOf(':');
            if (colonIndex > 0) {
                const key = trimmedLine.substring(0, colonIndex);
                const value = trimmedLine.substring(colonIndex + 1);
                switch (key) {
                    case 'SUMMARY': currentEvent.title = value; break;
                    case 'DTSTART': currentEvent.start = parseICalDate(value); break;
                    case 'DTEND': currentEvent.end = parseICalDate(value); break;
                    case 'LOCATION': currentEvent.location = value; break;
                    case 'DESCRIPTION': currentEvent.description = value; break;
                }
            }
        }
    }
    return events;
}

window.parseICalDate = function(icalDateString) {
    if (icalDateString.includes('T')) {
        const match = icalDateString.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
        if (match) {
            const [_, year, month, day, hour, minute, second] = match;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
        }
    } else {
        const match = icalDateString.match(/^(\d{4})(\d{2})(\d{2})/);
        if (match) {
            const [_, year, month, day] = match;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
    }
    return null;
}

window.getWeekDates = function(baseDate = new Date(), weekOffset = 0){
    const date = new Date(baseDate)
    date.setDate(date.getDate() + weekOffset * 7);
    const dayOfWeek = date.getDay();
    let mondayOffset = 0;
    if(dayOfWeek > 0){
        mondayOffset = 1 - dayOfWeek;
    }else{
        mondayOffset = -6;
    }
    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);
    const weekDates = [];
    for(let i = 0; i < 5; i++){
        const Day = new Date(monday);
        Day.setDate(monday.getDate() + i);
        weekDates.push(Day);
    }
    return weekDates;
}

window.filterEventsforWeek = function(events, weekDates){
    const eventsforWeek = [];
    events.forEach(element => {
        for(let i = 0; i < weekDates.length; i++){
            const eventDate = new Date(element.start); 
            eventDate.setHours(0, 0, 0, 0);
            const weekDate = new Date(weekDates[i]);
            weekDate.setHours(0, 0, 0, 0);
            if(eventDate.getTime() === weekDate.getTime()){
                eventsforWeek.push(element);
                break;
            }
        }
    });
    return eventsforWeek;
}

window.getTimeBlock = function(startTime) {
    if (!startTime) return 'Unbekannt';
    const hours = startTime.getHours();
    const minutes = startTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes >= 8*60 && totalMinutes < 9*60+45) return 'Block 1';
    if (totalMinutes >= 9*60+45 && totalMinutes < 11*60+30) return 'Block 2';
    if (totalMinutes >= 11*60+30 && totalMinutes < 13*60+15) return 'Block 3';
    if (totalMinutes >= 13*60+15 && totalMinutes < 15*60) return 'Block 4';
    if (totalMinutes >= 15*60 && totalMinutes < 16*60+45) return 'Block 5';
    return 'Unbekannt';
}