
const fs = require('fs');
const path = require('path');

const TRIGGERS = ["recep", "tayyip", "erdoğan", "erdogan"];
let BAD_WORDS_CACHE = null;

function getBadWords() {
    try {
        const filePath = path.join(process.cwd(), 'swears.txt');
        if (fs.existsSync(filePath)) {
            // Read as binary buffer first to detect encoding if needed, but assuming UTF-8
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            BAD_WORDS_CACHE = fileContent
                .split(/\r?\n/)
                .map(w => w.trim().toLowerCase())
                .filter(w => w.length > 0);

            console.log(`Loaded ${BAD_WORDS_CACHE.length} bad words.`);

            // DEBUG: Check for 'amk'
            const amk = BAD_WORDS_CACHE.find(w => w.includes('amk'));
            console.log(`First word containing 'amk': '${amk}'`);

            const exactAmk = BAD_WORDS_CACHE.find(w => w === 'amk');
            console.log(`Exact match 'amk' found: ${!!exactAmk}`);
            if (exactAmk) {
                console.log(`'amk' char codes: ${[...exactAmk].map(c => c.charCodeAt(0)).join(',')}`);
            }

            // Check finding it
            const testStr = " in amk";
            console.log(`'${testStr}'.includes('amk'): ${testStr.includes('amk')}`);

        } else {
            console.log("swears.txt not found");
            BAD_WORDS_CACHE = [];
        }
    } catch (error) {
        console.error("Error reading swears.txt:", error);
        BAD_WORDS_CACHE = [];
    }
    return BAD_WORDS_CACHE;
}

getBadWords();

const content = "tayyibin amk";
let checkContent = content.toLowerCase();
TRIGGERS.forEach(trigger => {
    checkContent = checkContent.split(trigger).join(' ');
});
console.log(`Check Content: '${checkContent}'`);

const badWords = BAD_WORDS_CACHE || [];
const match = badWords.find(badWord => checkContent.includes(badWord));
console.log(`Match: ${match}`);
