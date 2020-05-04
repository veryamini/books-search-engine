const data = require('./data.json');
let preprocessedData = require('./preprocessedData.json');
const fs = require('fs')

// Map to store processed data
let constructedData = {};


async function preprocess() {
    let completed = false;
    if (!Object.keys(preprocessedData).length) {
        return await constructData();
    }
}

/**
 * Construct preprocessed data to enable search
 */
function constructData() {

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
 * 
 * @param {*} input 
 * @param {*} k 
 */
function searchSummaries(input, k) {

}
