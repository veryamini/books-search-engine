import React, { Component } from 'react'
import PropTypes from 'prop-types';
import debounce from 'debounce';


class Autocomplete extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputVal : '',
            options: [],
            error: undefined,
        };
        this.updateOptions = debounce(this.fetchOptions, 500);
    }


    fetchOptions = () => {
        const {inputVal} = this.state
        console.log("inputVal : ", inputVal)
        if (inputVal.trim() !== '') {
            this.props.searchFunction(inputVal.trim().toLowerCase(), 3).then((options) => {
                console.log('------options: ',options)
                this.setState({
                    options
                });
            }).catch((error) => {
                console.log(error)
                this.setState({
                    options: [],
                    error: error.error,
                });
            })
        }
    }


    handleInputChange = (e) => {
        const {value} = e.target;
        let inputVal = value;
        this.setState({
            inputVal,
        });
        this.updateOptions()
    }


    setOptionsList = (options=[]) => {
        this.setState({
            options,
        });
    }


    render() {
        return (
            <div>
                <div>
                    <input
                        className='search-input'
                        onChange={this.handleInputChange}
                        value={this.state.inputVal || ''}
                    />
                </div>
                <div>

                </div>
            </div>
        )
    }
}

export default Autocomplete;