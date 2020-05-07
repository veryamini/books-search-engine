


const search = require('./__mocks__/search.js');


describe('searchBooks function should reject if mockPreprocessedData.json is empty', () => {

    it('search books returns error for "the" and ask for 3 titles before preprocessing data', async () => {
        expect.assertions(1);
        return expect(search.searchBooks('the', 3)).rejects.toEqual({
            error: 'No processed data available for search',
            response: false,
            fileWritten: false,
        });
    });

});
