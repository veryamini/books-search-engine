import React from 'react';
import ReactDOM from "react-dom";
import { render, cleanup } from '@testing-library/react';
import Home from './index';

afterEach(cleanup);

it('Header div has Search Book text', () => {
    const {getByText} = render(<Home />);
    expect(getByText('Search Books')).toBeInTheDocument();
});

it('initially submit button is disabled', () => {
    const { getByTestId } = render(<Home />); 
    expect(getByTestId('submit')).toBeDisabled();
})