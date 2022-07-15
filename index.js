let midiParser  = require('midi-parser-js');
let fs = require('fs');

let data = fs.readFileSync('./song.mid', 'base64')
var midiArray = midiParser.parse(data);

let hunderdPLN = '';
let limit = 5000;

let BPM = midiArray.timeDivision
hunderdPLN += `!speed@${BPM}`;

for (let eventList of midiArray.track) {
    for (let event of eventList.event) {

        let combineNext = false;

        let delay = Math.floor(event.deltaTime/92)
        if (delay > 100) delay = Math.floor(Math.log(delay)+90)
        if (delay == 0) combineNext = true;
        delay && (hunderdPLN += `|!stop@${delay}`)
            
        if (event.data && event.data.length == 2 && event.data[1]) {
            
            if (combineNext) {
                hunderdPLN += '|!combine'
            }

            hunderdPLN += `|noteblock_harp@${event.data[0]-50}`

        } 

        limit --;
        if (limit < 0) break;
        
    }
}

fs.writeFileSync('./musik.moai', hunderdPLN)