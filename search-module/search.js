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
 * 
 * @param {String} subStr substring to be searched
 * @param {Number} idx index in summaries from where search has to be started
 */
function searchNoOfOccurrences(subStr, idx) {

}

/**
 * 
 * @param {String} pattern substring to be searched
 * @param {String} string 
 */
function KMPSearch(pattern, string) {

}

/**
 * Compute LPS array
 * @param {String} pattern to be searched
 * @param {Number} m length of lps array
 * @param {Array} lps 
 */
function computeLPSArray(pattern, m, lps) {

}

/**
 * 
 * @param {*} input 
 * @param {*} k 
 */
function searchSummaries(input, k) {

}
