import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { shallow } from 'enzyme';
import Home from './index';

afterEach(cleanup);

describe('<Home /> with no events occurred yet', () => {
    const container = shallow(<Home />);

    it('should match the snapshot', () => {
        expect(container.html()).toMatchSnapshot();
    });

    it('Header div has Search Book text', () => {
        const {getByText} = render(<Home />);
        expect(getByText('Search Books')).toBeInTheDocument();
    });
    
    it('initially submit button is disabled', () => {
        expect(
          container.find('button').prop('disabled'))
    });
})

describe('adds a book by calling callback function of Autocomplete, and add in bookList', () => {
    beforeEach(cleanup);
    let wrapper = shallow(
        <Home
        />
      );
    const selectVal = { 
        label: "On the Move: A Life",
        value: {
            author: "Jared Diamond",
            id: 18,
            summary: "The Book in Three Sentences: Some environments provide more starting materials and more favorable conditions for utilizing inventions and building societies than other environments. This is particularly notable in the rise of European peoples, which occurred because of environmental differences and not because of biological differences in the people themselves. There are four primary reasons Europeans rose to power and conquered the natives of North and South America, and not the other way aroun...",
            title: "On the Move: A Life"
        }
     }
    it('calls handleOptionChange()', () => {
        expect(wrapper.state('bookList')).toEqual([]);
        expect(wrapper.state('selectedBook')).toEqual(undefined);
        wrapper.find('Autocomplete').prop('onSelect')(selectVal);

        expect(wrapper.state('selectedBook')).toEqual(selectVal);
        expect(
            wrapper.find('button').prop('disabled'),
            ).toBeFalsy();

        wrapper.find('form').simulate('submit', { preventDefault () {} })
        expect(wrapper.state('selectedBook')).toEqual(undefined);

        expect(
        wrapper.find('button').prop('disabled'),
        ).toBeTruthy();
        expect(wrapper.state('bookList')).toEqual([selectVal]);
        expect(wrapper.find('BookCard').exists()).toBe(true);
      });

      it('book isn\'t added if book exists in bookList', () => {
        expect(wrapper.state('selectedBook')).toEqual(undefined);
        wrapper.find('Autocomplete').prop('onSelect')(selectVal);

        wrapper.find('form').simulate('submit', { preventDefault () {} })
        wrapper.find('Autocomplete').prop('onSelect')(selectVal);
        wrapper.find('form').simulate('submit', { preventDefault () {} })
        
        expect(wrapper.state('bookList')).toEqual([selectVal]);
        expect(wrapper.state('highlightId')).toEqual(selectVal.id);

      })
})

