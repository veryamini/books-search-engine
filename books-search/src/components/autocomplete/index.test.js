import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { shallow, mount } from 'enzyme';
import Autocomplete from './index';


const bookValue = { 
            label: "On the Move: A Life",
            value: {
                author: "Jared Diamond",
                id: 18,
                summary: "The Book in Three Sentences: Some environments provide more starting materials and more favorable conditions for utilizing inventions and building societies than other environments. This is particularly notable in the rise of European peoples, which occurred because of environmental differences and not because of biological differences in the people themselves. There are four primary reasons Europeans rose to power and conquered the natives of North and South America, and not the other way aroun...",
                title: "On the Move: A Life"
            }
         }

describe('value changes in the input when onChange is called', () => {
    const container = shallow(<Autocomplete 
        k={3}
        searchFunction={jest.fn()}
        onSelect={jest.fn()}
        defaultValue=""
        selectedBook={bookValue}
    />);
    it('should set the text value on change event', () => {
        container.find('input').prop('onChange')({
            target: {
                value: 'a',
            }
        });
        expect(container.find('input').prop('value')).toEqual('a');
    });
})

