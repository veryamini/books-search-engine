import React, { Component } from 'react';
import { searchBooks } from '../../search-module/search';
import Autocomplete from '../autocomplete';
import BookCard from '../bookCard';
import './main.scss';

/**
 * Home renders book search form and book list
 */
class Home extends Component {
  /**
   * constructor initialises state
   * @param {Object} props props received by Home
   */
  constructor(props) {
    super(props);
    this.state = {
      selectedBook: undefined,
      bookList: [],
      highlightId: undefined,
    };
  }

  /**
   * handleOptionChange sets selectedBook in state
   * @param {Object} selectedBook selected book
   */  
  handleOptionChange = (selectedBook) => {
    this.setState({
      selectedBook,
    });
  };

  /**
   * handleAddBook adds book if book is not included in bookList, otherwise
   * highlights book
   * @param {Object} e event object
   */
  handleAddBook = (e) => {
    e.preventDefault();
    const { selectedBook, bookList } = this.state;
    // check if book exists in list, highligt the book and not add to list
    let existsBook  = bookList.filter((item) => item.id === selectedBook.id);
    if (!existsBook.length) {
      bookList.push(selectedBook);
      this.setState({
        bookList,
        selectedBook: undefined,
        highlightId: undefined,
      });
    } else {
      // else add to bookList
      this.setState({
        highlightId: existsBook[0].id,
        selectedBook: undefined,
      });
    }
  };

  /**
   * render renders Home
   * @returns {Node}
   */
  render() {
    const { bookList, selectedBook, highlightId } = this.state;
    // creates bookHtml to list all books
    const booksHtml = bookList && bookList.length ? (
      bookList.map((book, index) => {
        return (
          <BookCard
            title={book.title}
            author={book.author}
            summary={book.summary}
            key={index}
            highlightId={highlightId}
            id={book.id}
          />
        );
      })
    ) : (
      <div className="not-selected">No Books Selected</div>
    );
    const submitBtnProps = selectedBook ? {} : { disabled: true };
    return (
      <div className="homePage">
        <div className="header-div">
          <div className="header" data-testid="header">Search Books</div>
          <form
            className="search-panel"
            onSubmit={(e) => this.handleAddBook(e)}
          >
            <Autocomplete
              k={3}
              searchFunction={searchBooks}
              onSelect={this.handleOptionChange}
              defaultValue=""
              selectedBook={selectedBook}
            />
            <button
              className={`submit-btn ${selectedBook ? 'active' : ''}`}
              type="submit"
              data-testid="submit"
              {...submitBtnProps}
            >
              Submit
            </button>
          </form>
        </div>
        <div className="book-list">{booksHtml}</div>
      </div>
    );
  }
}

export default Home;
