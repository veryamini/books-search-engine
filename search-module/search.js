const data = require('./data.json');
let preprocessedData = require('./preprocessedData.json');
const fs = require('fs')


// Length of the phrase 'The Book in Three Sentences:'
const SKIP_LENGTH = 28;

// In case of scaling change to 10^6 books, assuming if a word comes more
// than 10^4 times, it won't be used as a keyword to search a book
const MAX_LENGTH = 25;

// / In case of scaling change to 10^6 books, assuming if a word comes less
// than 10 times, it won't be used as a keyword to search a book
const MIN_LENGTH = 0;

// Store this many items for each keyword if no of summaries having this
// keyword is more than MAX_LENGTH
const AVG_LENGTH = 10;

// Map to store processed data
let constructedData = {};


async function preprocess() {
    let completed = false;
    if (!Object.keys(preprocessedData).length) {
        return await constructData();
    }
}

/**
 * Construct preprocessed data of words vs array of [bookId, occurrences]
 */
function constructData() {
    return new Promise ((resolve, reject) => {
        let {summaries} = data;
        for (let i = 0; i < summaries.length; i++) {
            const summary = summaries[i]['summary'];
            let word = '';
            let j = SKIP_LENGTH+1;
            let ch;
            while (j < summary.length) {
                ch = summary.charAt(j);
                if (word === ' ') {
                    word = '';
                }
                if (ch === ' ' || ch === '.' || ch === ',' || ch === '-') {
                //    break word and search
                    if (!constructedData[word]) {
                        // run KMP on all summaries
                        searchNoOfOccurrences(word, i);
                    }
                    word = '';
                    j += 1;
                    continue;
                }
                word += ch;
                j += 1;
            }
       }
       resolve();
    }).catch((err) => {
        reject(err);
    });
}

/**
 * searchNoOfOccurrences searches and returns number of times subStr occurs
 * in all summaries individually, adds the same to constructedData
 * @param {String} subStr substring to be searched
 * @param {Number} idx index in summaries from where search has to be started
 */
function searchNoOfOccurrences(subStr, idx) {
    const {summaries} = data;
    // define constructedData 
    constructedData[subStr] = constructedData[subStr] || [];
    for (let i = idx; i < summaries.length; i++) {
        // find number of occurrences of subStr
        let num = KMPSearch(subStr, summaries[i].summary);

        // push in array if ocurrence is greater than 0
        if (num > 0) {

            // create book_id and relevance based array
            let item = [i, num]

            // push in constructed map
            constructedData[subStr].push(item);

            // sort based on no. of occurrence for relevance
            constructedData[subStr].sort((a, b) => b[1] - a[1]);

            // Used to optimise during up scaling
            // Ignoring keyword which occur more than MAX_LENGTH times
            if (constructedData[subStr].length > MAX_LENGTH) {
                constructedData[subStr] = constructedData[subStr].splice(0, AVG_LENGTH+1);
            }

            // Used to optimise during up scaling and ignoring keywords which
            // don't occur more than MIN_LENGTH times
            if (constructedData[subStr].length < MIN_LENGTH) {
                delete constructedData[subStr];
            }
        }
    }
}

/**
 * Compute KMP search to find number of occurrences in string 
 * @param {String} pattern substring to be searched
 * @param {String} string 
 * @returns {Number} occur number of occurrences in string
 */
function KMPSearch(pattern, string) {
    const m = pattern.length;
    const n = string.length;

    // lps holds prefix and suffix values for pattern
    let lps = Array(m);
    let p = 0; // index of pattern

    computeLPSArray(pattern, m, lps);

    let i = 0;
    let occur = 0;
    let next = 0;

    while (i < n) {
        if (pattern[p] === string[i]) {
            p++;
            i++;
        }
        if (p === m) {
            // if pattern exists, find more occurrances
            p = lps[p-1];
            occur++;

            //if pattern exists more than once, reset i
            if (lps[p] !== 0) {
                i = ++next;
            }
            p = 0;
        }
        // handles mismatch after p matches
        else if (i < n && pattern[p] !== string[i]) {
            // match characters after p - 1
            if (p !== 0) {
                p = lps[p-1];
            }
            else {
                i += 1;
            }
        }
    }
    return occur;
}

/**
 * Compute LPS array
 * @param {String} pattern to be searched
 * @param {Number} m length of lps array
 * @param {Array} lps lps array of pattern string
 */
function computeLPSArray(pattern, m, lps) {
    let len = 0;
    let i = 1;
    lps[0] = 0; // lps[0] is always 0

    // calculate lps[i] for i = 1 to m-1
    while (i < m) {
        if (pattern[i] === pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        }
        else {
            if (len !== 0) {
                len = lps[len-1];
            }
            // handle len === 0, set lps[i]
            else {
                lps[i] = len;
                i++;
            }
        }
    }
}

/**
 * SearchSummaries searches summaries for input string and returns a list of
 * titles 
 * @param {String} input input string to be searched in data
 * @param {Number} k number of titles to be returned
 * @returns {Array} returns a list of titles where summaries include the given
 * input string
 */
function searchSummaries(input, k) {
    let word = '';
    let wordList = [];
    let titleList = [];
    for (let i = 0; i < input.length; i++) {
        let ch = input.charAt(i);
        if (ch === ' ') {
            if (word.trim() !== '') {
                wordList.push(word);
            }
            word = '';
            continue;
        }
        word += ch;
    }
    if (word.trim() !== '') {
        wordList.push(word);
    }
    titleList = findTitles(wordList, k);
    return titleList;
}


/**
 * findTitles searches preprocessed data basd on input strings and returns
 * list of books
 * @param {Array} wordList list of words in input string
 * @param {Number} k number of books to return
 */
function findTitles(wordList, k) {
    const {titles, authors, summaries} = data;
    let bookList;
    let bookId;
    let book ={};
    let titleList = [];
    let wL = wordList.length;
    if (wL > 1) {
        // finding intersection of keywords using m(here wL) pointers method
        let titleSet = new Set();
        let indexArr = Array(wL).fill(0);
        let dataMap = [];
        for (let i = 0; i < wL; i++) {
            dataMap.push(constructedData[wordList[i]]);
            // sorted occuraances of wordList[i] based on book_id
            dataMap[dataMap.length-1].sort((a, b) => a[0] - b[0]);
        }
        let arrayLimit = 0;
        while (arrayLimit < wL && titleList.length < k) {
            let j = 0;
            let equal = 0;
            let maxVal;
            arrayLimit = 0;
            while (j < wL-1) {
                if (indexArr[j] === dataMap[j].length) {
                    j++;
                    arrayLimit += 1;
                }
                if (dataMap[j][indexArr[j]][0] < dataMap[j+1][indexArr[j+1]][0]) {
                    indexArr[j] += 1;
                    break;
                }
                if (dataMap[j][indexArr[j]][0] > dataMap[j+1][indexArr[j+1]][0]) {
                    indexArr[j+1] += 1;
                    break;
                }
                if (dataMap[j][indexArr[j]][0] === dataMap[j+1][indexArr[j+1]][0]) {
                    j += 1;
                    equal += 1;

                    if (j === 1) {
                        maxVal = dataMap[j][indexArr[j]];
                    }
                    else {
                        maxVal = findMaxByRelevance(dataMap[j][indexArr[j]], dataMap[j+1][indexArr[j+1]])
                    }
                    indexArr[j] += 1;
                    indexArr[j+1] += 1;
                    if (equal === wL-1) {
                        titleList.push(maxVal);
                        break;

                    }
                }
            }
        }
        for (let i = 0; i < k; i++) {
            bookId = titleList[i][0];
            book = {
                id : bookId,
                title: titles[bookId],
                author: authors[bookId].author,
                summary: summaries[bookId].summary,
            };
            titleList[i] = book;
        }
        return titleList;

    }
    else {
        // fetching top k relevant books
        if (constructedData[wordList[0]]) {
            bookList = constructedData[wordList[0]];
            for (j = 0; j < k; j++) {
                bookId = bookList[j][0];
                book = {
                    id : bookId,
                    title: titles[bookId],
                    author: authors[bookId].author,
                    summary: summaries[bookId].summary,
                };
                titleList.push(book);
            }
        }
        return titleList;
    }
}


/**
 * findMaxByRelevance finds maximum of two array elements based on relevance
 * (number of occurrences in summary)
 * @param {Array} a array element of [book_id, ocurrence]
 * @param {*} b array element of [book_id, ocurrence]
 * @returns {Array} elemnt with maximum occurences
 */
function findMaxByRelevance(a, b) {
    if (a[1] > b[1]) {
        return a;
    }
    return b;
}

/**
 * writePreprocessedData to preprocessed.json file
 */
async function writePreprocessedData() {
    if (constructedData !== '') {
        let jsonString = JSON.stringify(constructedData);
        fs.writeFile('./preprocessedData.json', jsonString, (err) => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file');
        }
    });
    }
}

/**
 * Called when need to preprocess data and write to preprocessed.json
 */
function main() {
    preprocess()
    writePreprocessedData();
}

/**
 * findString
 */
function findString() {
    if (!Object.keys(preprocessedData).length) {
        main()
    } else {
        constructedData = preprocessedData;
        console.log('achieve', searchSummaries('achieve', 3));
        console.log( 'your',searchSummaries('your', 3));
        console.log('you', searchSummaries('you', 3));
        console.log('your problems', searchSummaries('your problems', 3));
    } 
}