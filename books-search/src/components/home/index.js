import React, { Component } from 'react';
import {searchBooks} from '../../search-module/search';
import Autocomplete from '../autocomplete';


class Home extends Component {
    render() {
        return (
            <div>
                <div className='searchPanel'>
                    <Autocomplete
                        k={3}
                        searchFunction={searchBooks}
                    />
                </div>
            </div>
        )
    }
}

export default Home;