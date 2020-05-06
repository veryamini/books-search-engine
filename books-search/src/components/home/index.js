import React, { Component } from 'react';
import { searchBooks } from '../../search-module/search';
import Autocomplete from '../autocomplete';
import BookCard from '../bookCard';
import './main.scss';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedBook: undefined,
      bookList: [],
    };
  }

  handleOptionChange = (selectedBook) => {
    this.setState({
      selectedBook,
    });
  };

  handleAddBook = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    const { selectedBook, bookList } = this.state;
    if (!bookList.includes(selectedBook)) {
      bookList.push(selectedBook);
      this.setState({
        bookList,
        selectedBook: undefined,
      });
    } else {
      // get id and highlight the book
    }
  };

  handleValueReset = (val) => {
    this.setState({
      resetValue: val,
    });
  };

  render() {
    const { bookList, selectedBook } = this.state;
    const booksHtml = bookList && bookList.length ? (
      bookList.map((book, index) => {
        return (
          <BookCard
            title={book.title}
            author={book.author}
            summary={book.summary}
            key={index}
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
          <div className="header">Search Books</div>
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
