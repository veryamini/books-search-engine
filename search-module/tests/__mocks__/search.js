let data = require('./mockData.json');
let preprocessedData = require('./mockPreprocessedData.json');
const fsPromises = require('fs').promises;

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
  let completed;
  if (!Object.keys(preprocessedData).length) {
    completed = await constructData();
  }
  return await completed;
}

/**
 * Construct preprocessed data of words vs array of [bookId, occurrences]
 */
async function constructData() {
  try {
    let { summaries } = data;
    for (let i = 0; i < summaries.length; i++) {
      const summary = summaries[i]['summary'].toLowerCase();
      let word = '';
      let j = SKIP_LENGTH + 1;
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
    return 'done';
  } catch (err) {
    return err;
  }
}

/**
 * searchNoOfOccurrences searches and returns number of times subStr occurs
 * in all summaries individually, adds the same to constructedData
 * @param {String} subStr substring to be searched
 * @param {Number} idx index in summaries from where search has to be started
 */
function searchNoOfOccurrences(subStr, idx) {
  const { summaries } = data;
  // define constructedData
  constructedData[subStr] = constructedData[subStr] || [];
  for (let i = idx; i < summaries.length; i++) {
    // find number of occurrences of subStr
    let num = KMPSearch(subStr, summaries[i].summary);

    // push in array if ocurrence is greater than 0
    if (num > 0) {
      // create book_id and relevance based array
      let item = [i, num];

      // push in constructed map
      constructedData[subStr].push(item);

      // sort based on no. of occurrence for relevance
      constructedData[subStr].sort((a, b) => b[1] - a[1]);

      // Used to optimise during up scaling
      // Ignoring keyword which occur more than MAX_LENGTH times
      if (constructedData[subStr].length > MAX_LENGTH) {
        constructedData[subStr] = constructedData[subStr].slice(
          0,
          AVG_LENGTH + 1
        );
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
      p = lps[p - 1];
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
        p = lps[p - 1];
      } else {
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
    } else {
      if (len !== 0) {
        len = lps[len - 1];
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
async function searchSummaries(input, k) {
  let word = '';
  let wordList = [];
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
  const titleList = await findTitles(wordList, k);
  return titleList;
}

/**
 * findTitles searches preprocessed data basd on input strings and returns
 * list of books
 * @param {Array} wordList list of words in input string
 * @param {Number} k number of books to return
 */
async function findTitles(wordList, k) {
  try {
    const { titles, authors, summaries } = data;
    let bookList;
    let bookId;
    let book = {};
    let titleList = [];
    let wL = wordList.length;
    if (wL > 1) {
      // finding intersection of keywords using m(here wL) pointers method
      let indexArr = [];
      let dataMap = [];
      // construct dataMap for finding intersection
      for (let i = 0; i < wL; i++) {
        // if keyword exists in processed data
        if (constructedData[wordList[i]]) {
          indexArr.push(0);
          dataMap.push(constructedData[wordList[i]]);
          // sorted occurrences of wordList[i] based on book_id
          dataMap[dataMap.length - 1].sort((a, b) => a[0] - b[0]);
        }
      }

      // maxIterations can be dataMap length or length of wordList
      const maxIterations = dataMap.length;
      // define a temporary title data set
      let tempTitleList = [];

      // if different keywords exist, then compare and find equal values
      if (dataMap.length > 1) {
        while (tempTitleList.length < k) {
          // equal value found
          let equalValFound = true;
          // index of indexArr of minimum bookId value
          let minIdx = 0;

          // Searching if currIdx of all arrays in dataMap have equal value
          // if not equal assign unequalIdx
          for (let j = 0; j < maxIterations - 1; j++) {
            if (
              dataMap[j][indexArr[j]][0] !== dataMap[j + 1][indexArr[j + 1]][0]
            ) {
              equalValFound = false;
              break;
            }
          }
          // if equal values, push element in titleList and incerement current
          // indices of all sub arrays of dataMap by 1
          if (equalValFound) {
            tempTitleList.push(dataMap[0][indexArr[0]]);
            for (let j = 0; j < maxIterations; j++) {
              indexArr[j] += 1;
            }
          } else {
            // find minimum of all tops and increment the minimum value
            for (let j = 0; j < maxIterations; j++) {
              if (
                dataMap[j][indexArr[j]][0] <
                dataMap[minIdx][indexArr[minIdx]][0]
              ) {
                minIdx = j;
              }
            }
            // if one array with minimum value has reached the end, no equal elements can be found
            if (indexArr[minIdx] === dataMap[minIdx].length - 1) {
              break;
            } else {
              indexArr[minIdx] += 1;
            }
          }
        }

        // construct book list and return
        for (let i = 0; i < Math.min(tempTitleList.length, k); i++) {
          bookId = tempTitleList[i][0];
          book = {
            id: bookId,
            title: titles[bookId],
            author: authors[bookId].author,
            summary: summaries[bookId].summary,
          };
          titleList.push(book);
        }
        return titleList;
      }
      // else return k relevant books for valid keyword value
      else {
        bookList = dataMap[0];
        titleList = constructBookList(titleList, bookList, k);
        return titleList;
      }
    } else {
      // fetching top k relevant books
      if (constructedData[wordList[0]]) {
        bookList = constructedData[wordList[0]];
        titleList = constructBookList(titleList, bookList, k);
      }
      return titleList;
    }
  } catch (error) {
    return {
      error,
      response: false,
      constructedData,
    };
  }
}

/**
 * constructBookList constructs and returns bookList for single keyword
 * @param {Array} titleList titleList contains list of books
 * @param {Array} bookList all ids of books containing given keyword
 * @param {Number} k number of items to return
 */
function constructBookList(titleList, bookList = [], k) {
  const { titles, authors, summaries } = data;
  let bookId;
  let book;
  for (let j = 0; j < Math.min(bookList.length, k); j++) {
    bookId = bookList[j][0];
    book = {
      id: bookId,
      title: titles[bookId],
      author: authors[bookId].author,
      summary: summaries[bookId].summary,
    };
    titleList.push(book);
  }
  return titleList;
}

/**
 * writePreprocessedData to preprocessed.json file
 */
async function writePreprocessedData() {
  try {
    if (constructedData !== '') {
      let jsonString = JSON.stringify(constructedData);
      let writingComplete = await fsPromises.writeFile(
        './__tests__/__mocks__/mockPreprocessedData.json',
        jsonString
      );
      return writingComplete;
    }
  } catch (error) {
    return {
      error,
      response: false,
    };
  }
}

/**
 * searchBooks searches and retuens list of books by first checking if data is preprocessed
 * then calling function searchSummaries
 * @param {String} input input value
 * @param {Number} k number of titles to return
 */
function searchBooks(input, k) {
  return new Promise((resolve, reject) => {
    if (!Object.keys(preprocessedData).length) {
      reject({
        response: false,
        fileWritten: false,
        error: 'No processed data available for search',
      });
    } else {
      constructedData = preprocessedData;
      if (Object.keys(constructedData).length) {
        if (input !== '' && k > 0) {
          searchSummaries(input, k).then((title) => {
            resolve(title);
          });
        }
      }
    }
  });
}

/**
 * preprocessData processes data and writes in preprocessedData.json
 */
function preprocessData() {
  return new Promise ((resolve, reject) => {
    let preprocessPromise = preprocess();
    preprocessPromise.then((res) => {
      let writeDataPromise = writePreprocessedData();
      writeDataPromise
        .then(() => {
          console.log('Processing complete');
          resolve({
            response: true,
            error: null,
          });
        })
        .catch((error) => {
          console.log('Unable to write to preprocessedData.json');
          reject ({
            response: false,
            error,
          });
        });
      }).catch((error) => {
        console.log('Unable to write to preprocessedData.json');
        reject({
          response: false,
          error,
          fileWritten: false,
        });
    });
  })
  
}


module.exports = {
  searchBooks: searchBooks,
  preprocessData: preprocessData,
};
