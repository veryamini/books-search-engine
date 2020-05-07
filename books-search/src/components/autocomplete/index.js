import React, { Component } from 'react';
import debounce from 'debounce';
import PropTypes from 'prop-types';
import './main.scss';

/**
 * Autocomplete takes text as input as shows options based on search function
 * provided as props
 */
class Autocomplete extends Component {
  /**
   * constructor initialises state
   * @param {Object} props props received by Autocomplete
   */
  constructor(props) {
    super(props);
    this.state = {
      inputVal: this.props.defaultValue || '',
      options: undefined,
      error: undefined,
      selectedBook: undefined,
      showOptions: false, // options need to be shown
      isFocused: false, // input is focused
    };
    this.updateOptions = debounce(this.fetchOptions, 500);
  }

  /**
   * getDerivedStateFromProps updates selectedBook if the book form has been
   * submitted
   */
  static getDerivedStateFromProps = (props, state) => {
    // on submit button click, reset selectedBook value and options
    if (state.selectedBook !== undefined && props.selectedBook !== state.selectedBook.value) {
      return {
        inputVal: '',
        selectedBook: undefined,
        options: undefined,
      };
    }
    return null;
  };

  /**
   * fetchOptions fetches options based on provided search function
   */
  fetchOptions = () => {
    const { inputVal } = this.state;
    const { k, searchFunction } = this.props;
    if (inputVal.trim() !== '') {
      searchFunction(inputVal.trim().toLowerCase(), k)
        .then((options = undefined) => {
          if (options) {
            options = options.map((item) => {
              return {label: item.title, value: item};
            });
            console.log("options: ", options)
          }
          this.setState({
            options,
            showOptions: true,
          });
        })
        .catch((error) => {
          // if search function gives an error, set options as undefined
          let updatedState = {
            options: undefined,
            error: error && error.error,
          };
          this.setState(updatedState);
        });
    }
  };

  /**
   * handleInputChange sets changed input value in state and calls updateOptions
   * @param {Object} e event object
   */
  handleInputChange = (e) => {
    const { value } = e.target;
    let inputVal = value;
    this.setState({
      inputVal,
      selectedBook: undefined,
      showOptions: false,
      isFocused: true,
    });
    this.updateOptions();
    // if inputVal contains only spaces, set selectedBook as undefined
    if (inputVal.trim() === '') {
      this.props.onSelect && this.props.onSelect(undefined);
    }
  };

  /**
   * setValue ses selected book value in state and sets showOptions to false
   * @param {Object} selectedBook item selected
   */
  setValue = (selectedBook) => {
    this.setState({
      inputVal: selectedBook.value.title,
      selectedBook,
      showOptions: false,
      isFocused: false,
    });
    // sends selected book to parent
    this.props.onSelect && this.props.onSelect(selectedBook.value);
  };

  /**
   * handleFocus sets input focus  and showOptions to true
   */
  handleFocus = () => {
    this.setState({
      showOptions: true,
      isFocused: true,
    });
  };

  /**
   * handleBlur closes options and sets input focus to false in state
   */
  handleBlur = () => {
    this.setState({
      isFocused: false,
    })
  }

  /**
   * render renders Autocomplete
   * @returns {Node}
   */
  render() {
    const { options, error, selectedBook, showOptions, isFocused } = this.state;
    if (error) {
        alert(error);
    }
    const optionsHtml =
    isFocused && showOptions && options ? (
        <div
          className="options-list-wrapper"
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((item, key) => {
            return (
              <div
                className={`item-label ${
                  selectedBook && selectedBook.value.id === item.value.id ? 'active' : ''
                }`}
                onMouseDown={() => this.setValue(item)}
                key={key}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      ) : null;
    return (
      <div
        className="autocomplete-wrapper"
        onClick={this.handleFocus}
      >
        {optionsHtml}
        <input
          className="search-input"
          onChange={this.handleInputChange}
          value={this.state.inputVal || ''}
          onBlur={this.handleBlur}
        />
      </div>
    );
  }
}

Autocomplete.propTypes = {
  searchFunction: PropTypes.func,
  k: PropTypes.number,
  defaultValue: PropTypes.string,
  onSelect: PropTypes.func,
  selectedBook: PropTypes.object,
};

export default Autocomplete;
