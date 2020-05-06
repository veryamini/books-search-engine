import React, { Component } from 'react';
import debounce from 'debounce';
import './main.scss';

class Autocomplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputVal: this.props.defaultValue || '',
      options: undefined,
      error: undefined,
      selectedBook: undefined,
      showOptions: this.props.showOptions,
    };
    this.updateOptions = debounce(this.fetchOptions, 500);
  }

  static getDerivedStateFromProps = (props, state) => {
    console.log(props);
    if (props.selectedBook !== state.selectedBook) {
      return {
        inputVal: '',
        selectedBook: undefined,
        options: undefined,
      };
    }
    return null;
  };

  fetchOptions = () => {
    const { inputVal } = this.state;
    const { k } = this.props;
    if (inputVal.trim() !== '') {
      this.props
        .searchFunction(inputVal.trim().toLowerCase(), k)
        .then((options = undefined) => {
          this.setState({
            options,
            showOptions: true,
          });
        })
        .catch((error) => {
          let updatedState = {
            options: undefined,
          };
          if (error.fileWritten && error.fileWritten === false) {
            updatedState['error'] = error.error;
          }
          this.setState(updatedState);
        });
    }
  };

  handleInputChange = (e) => {
    const { value } = e.target;
    let inputVal = value;
    this.setState({
      inputVal,
      selectedBook: undefined,
      showOptions: false,
    });
    this.updateOptions();
  };

  setValue = (selectedBook) => {
    this.setState({
      inputVal: selectedBook.title,
      selectedBook,
      showOptions: false,
    });
    this.props.onSelect && this.props.onSelect(selectedBook);
  };

  handleFocus = (e) => {
    this.setState({
      showOptions: true,
    });
  };

  handleInputBlur = (e) => {
    e.preventDefault();
    console.log('event input blur: ', e.target);
  };

  render() {
    const { options, error, selectedBook, showOptions } = this.state;
    if (error) {
        alert(error);
    }
    console.log(options);
    const optionsHtml =
      showOptions && options ? (
        <div
          className="options-list-wrapper"
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((item, key) => {
            return (
              <div
                className={`item-label ${
                  selectedBook && selectedBook.id === item.id ? 'active' : ''
                }`}
                onClick={() => this.setValue(item)}
                key={key}
              >
                {item.title}
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
          ref={(node) => (this.searchInput = node)}
        />
      </div>
    );
  }
}

export default Autocomplete;
