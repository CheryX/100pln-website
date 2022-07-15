let midiParser  = require('midi-parser-js');
let fs = require('fs');

let data = fs.readFileSync('./song.mid', 'base64')
var midiArray = midiParser.parse(data);

let hunderdPLN = '';
let instrument = '';
let limit = 1000;

function getEventData(event) {
    
    absoluteTime += event.deltaTime;

    if (event.type == 255) {
        if (event.metaType == 3) {
            instrument = event.data;
            return {
                type: 'none',
                absTime: parseDelay(absoluteTime)
            }
        } else {
            return {
                type: 'none',
                absTime: parseDelay(absoluteTime)
            }
        }
    }

    if (event.type == 8) {
        return {
            type: 'play_note',
            pitch: event.data[0]-70,
            data: event.data,
            instrument: instrument,
            absTime: parseDelay(absoluteTime)
        }
    }

    if (event.type == 9) {
        return {
            type: 'none',
            absTime: parseDelay(absoluteTime)
        }
    }

    return {
        type: 'other',
        id: event.type,
        data: event.data,
        instrument: instrument,
        absTime: parseDelay(absoluteTime),
    }

}

function parseDelay(delay) {
    // Option 1:
    return Math.floor(delay/96);

    // Option 2:
    // let newDelay = Math.floor(delay/96);
    // if (newDelay > 15) newDelay = Math.log(newDelay) + 10
    // return newDelay

    // Option 3:
    // return Math.log(delay)
}

let BPM = midiArray.timeDivision
hunderdPLN += `!speed@${BPM}`;

// 1. Assign every note an instrument and absolute time
let notes = []
let absoluteTime = 0;

for (instrument of midiArray.track) {
    absoluteTime = 0;
    
    for (let note of instrument.event) {

        let eventData = getEventData(note);

        if (eventData.type != 'none') notes.push(eventData)
        
    }
}

// 2. Sort all of the notes in one array
let notesSorted = notes.sort(({absTime:a}, {absTime:b}) => a-b).slice(0, limit);

console.table(notesSorted)

// 3. Convert it into .moai file

let instruments = {
    'Electric Piano': 'noteblock_harp',
    'Xylophone': 'noteblock_xylophone',
    'Grand Piano': 'noteblock_snare',
    'Piano': 'noteblock_harp',
    'Harpsichord': 'noteblock_guitar',
    'Synth': 'noteblock_bass',
    'Synth Echo': 'noteblock_bass'
}

for (let i in notesSorted) {
    if (notesSorted[i].type == 'play_note') {

        let delay = notesSorted[i].absTime - notesSorted[i-1].absTime
        
        //If they are supposed to be played at once
        if (notesSorted[i].absTime == notesSorted[i-1].absTime) {
            hunderdPLN += "|!combine"
        } else {
            delay && (hunderdPLN += `|!stop@${delay}`)
        }

        let instrument = instruments[notesSorted[i].instrument] 
        if (instrument == undefined) instrument = 'noteblock_flute'

        hunderdPLN += `|${instrument}@${notesSorted[i].pitch}`
    }
}

fs.writeFileSync('./musik.moai', hunderdPLN)