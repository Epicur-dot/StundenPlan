
var todayDate = new Date().toISOString().slice(0, 10);


async function studenplanladen(token = null) {
    // Token validieren oder abfragen
    if (!token || token === 'Token/Lehrer Kürzel') {
        token = ''; // Default-Token falls keiner angegeben
    }
    
    // Token sanitizen (Sonderzeichen entfernen)
    token = token.replace(/[^a-zA-Z0-9]/g, '');
    
    const url = `https://intranet.bib.de/ical/2e738f1cf14d44d719c88ebeffa5e34d/${token}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Netzwerkantwort war nicht ok: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.text();
        
        // Prüfen ob Daten gültiges iCal-Format haben
        if (!data.includes('BEGIN:VCALENDAR') || !data.includes('END:VCALENDAR')) {
            throw new Error('Ungültiges iCal-Format erhalten');
        }
        
        return {
            success: true,
            data: data,
            token: token
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message,
            token: token
        };
    }
}

function parseICalData(icalText) {
    const events = [];
    const lines = icalText.split('\n');
    let currentEvent = null;
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine === 'BEGIN:VEVENT') {
            currentEvent = {};
        } 
        else if (trimmedLine === 'END:VEVENT') {
            if (currentEvent) {
                events.push(currentEvent);
                currentEvent = null;
            }
        }
        else if (currentEvent) {
            // Parse Event-Eigenschaften
            const colonIndex = trimmedLine.indexOf(':');
            if (colonIndex > 0) {
                const key = trimmedLine.substring(0, colonIndex);
                const value = trimmedLine.substring(colonIndex + 1);
                
                switch (key) {
                    case 'SUMMARY':
                        currentEvent.title = value;
                        break;
                    case 'DTSTART':
                        currentEvent.start = parseICalDate(value);
                        break;
                    case 'DTEND':
                        currentEvent.end = parseICalDate(value);
                        break;
                    case 'LOCATION':
                        currentEvent.location = value;
                        break;
                    case 'DESCRIPTION':
                        currentEvent.description = value;
                        break;
                }
            }
        }
    }
    
    return events;
}
function parseICalDate(icalDateString) {
    // iCal Format: 20231204T080000Z oder 20231204T080000
    if (icalDateString.includes('T')) {
        // Datum mit Zeit
        const match = icalDateString.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
        if (match) {
            const [_, year, month, day, hour, minute, second] = match;
            return new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                parseInt(hour),
                parseInt(minute),
                parseInt(second)
            );
        }
    } else {
        // Nur Datum
        const match = icalDateString.match(/^(\d{4})(\d{2})(\d{2})/);
        if (match) {
            const [_, year, month, day] = match;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
    }
    return null;
}

function getTimeBlock(startTime) {
    if (!startTime) return 'Unbekannt';
    
    const hours = startTime.getHours();
    const minutes = startTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    // Deine Zeitblöcke aus dem Python-Code
    if (totalMinutes >= 8*60 && totalMinutes < 9*60+45) return 'Block 1';
    if (totalMinutes >= 9*60+45 && totalMinutes < 11*60+30) return 'Block 2';
    if (totalMinutes >= 11*60+30 && totalMinutes < 13*60+15) return 'Block 3';
    if (totalMinutes >= 13*60+15 && totalMinutes < 15*60) return 'Block 4';
    if (totalMinutes >= 15*60 && totalMinutes < 16*60+45) return 'Block 5';
    
    return 'Unbekannt';
}
function getWeekDates(baseDate = new Date(),weekOffset = 0){
    const date = new Date(baseDate)
    date.setDate(date.getDate()+weekOffset*7);
    dayOfWeek = date.getDay();
    var mondayOffset = 0;
    if(dayOfWeek > 0){
        mondayOffset = 1 - dayOfWeek;
    }else{
        mondayOffset = -6;
    }
    const monday=new Date();
    monday.setDate(date.getDate() + mondayOffset);
    const weekDates= [];
    for(var i = 0; i < 5; i++){
        const Day = new Date(monday);
        Day.setDate(monday.getDate() + i)
        weekDates.push(Day);
    }
    return weekDates;
}

function filterEventsforWeek(events,weekDates){
    var eventsforWeek = [];
    events.forEach(element => {
        for(var i=0;i<weekDates.length;i++){
            const eventDate = new Date(element.start); 
            eventDate.setHours(0,0,0,0);
            const weekDate = new Date(weekDates[i]);
            weekDate.setHours(0,0,0,0);
            if(eventDate.getTime() == weekDate.getTime()){
                eventsforWeek.push(element);
                break;
            }
        }
        
    });
    return eventsforWeek;
}

function structureWeek(weekDates,filterdEvents){
    for(var i = 0;i < weekDates.length; i++){
        const date =new Date(weekDates[i]);
        var eventsforDate = filterdEvents.filter(event =>{
            const eventDate = new Date(event.start); 
            eventDate.setHours(0,0,0,0);
            date.setHours(0,0,0,0);
            if(eventDate.getTime()==date.getTime()){
                
            }
        });

    }
}
function structureDay(date,events){
    var dayStruckt = []

}