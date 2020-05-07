# books-search-engine

## Run on your local machine

Clone the repo.

## Run search-module on your local machine
If you want to run search-module separately, you have to update the data.json file in /search-module/src.
Then run the command:

`cd src/`

`node preprocess`

The above command will preprocess your data.json file to enable search feature.

## To run the books-search app

`cd books-search`

 Install the dependencies by running

 `npm install`

To preprocess your data.json file run:

 `node preprocess`

To start the server, run:

 `npm start`

 The server should be up and running. If you want different data for your books, updata data.json file in the following format:

 ```{
     titles: ['Book title'],
     summaries: [
        {
            id: 0,
            summary: 'Book summary here'
        }
     ],
     authors: [
        {
            book_id: 0,
            author: 'book author',
        }
     ]
 }
 ```

 The titles, summaries and authors should have one-to-one mapping in lists, with id corresponding to the index of corresponding book title.


This repo consists of two parts:


## search-module
Search-Engine is a module written using Javascript to search data.json file containing a list of titles,
summaries and authors on an "input string" and returns a list of "k" book objects containing title, summary, and author.

The data.json file is initially preprocessed to create a preprocessedData.json file containing map of words and list of book_id and number of occurence of that word in summaries.

After the preproccessing is done, we can search the preprocessed data to find the list of books whose summary contain the input string.

The search uses KMP algorithm to construct preprocessedData.json file. To return the list of books, it uses m pointers algorithm (where m stands for number of words in input string).

## books-search
Books-Search is a React app created using create-react-app. It lets users search summaries through an autocomplete input, and lists the titles corresponding to that summary. It uses the above search-module to implement the search functionality.

It has responsive web design, and an attractive user-interface.

## Note
The search-module has two tests namely preprocess.test and search.test. preprocess.test runs when the mockPreprocessedData.json file contains empty object.
Similarly, search.test file runs for two exposed functions of search module, preprocessData and searchBooks.

To run this module, you will need `node >= 12.0` on your local machine.

## Scalability
The current implementation is for a set of 50 books, with room for scalability. If we are assuming to implement it for 10^6 books, we can make a few assumptions:
* Each summary may not contain 10^4 distinct words
* If any keyword ocuurs more that 10^4 times, we do not store all the book ids for them while preprocessing, we keep only MIN_COUNT values of most relevant occurrences.
* If any keyword occurrs less than MIN_COUNT, we do not store them in preprocessed data.
* Need better RAM to run code on memory

## Challenges
For challanges I faced please visit [CHALLANGES.md](./CHALLENGES.md)