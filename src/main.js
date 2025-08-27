
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
