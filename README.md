# books-search-engine
Contains two parts:


## search-module
Search-Engine is a module written using Javascript to search data.json file containing a list of titles,
summaries and authors on an "input string" and returns a list of "k" book objects containing title, summary, and author.

The data.json file is initially preprocessed to create a preprocessedData.json file containing map of words and list of book_id and number of occurence of that word in summaries.

After the preproccessing is done, we can search the preprocessed data to find the list of books whose summary contain the input string.

The search uses KMP algorithm to construct preprocessedData.json file. To return the list of books, it uses m pointers algorithm (where m stands for number of words in input string).

## books-search
Books-Search is a React app created using create-react-app. It lets users search summaries through an autocomplete input, and lists the titles corresponding to that summary. It uses the above search-module to implement the search functionality.
It has responsive web design, and an attractive user-interface.

