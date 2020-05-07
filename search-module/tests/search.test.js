const search = require('./__mocks__/search.js');

const outputBooks = [
    {
        id: 18,
        title: 'On the Move: A Life',
        author: 'Jared Diamond',
        summary:
        'The Book in Three Sentences: Some environments provide more starting materials and more favorable conditions for utilizing inventions and building societies than other environments. This is particularly notable in the rise of European peoples, which occurred because of environmental differences and not because of biological differences in the people themselves. There are four primary reasons Europeans rose to power and conquered the natives of North and South America, and not the other way around: 1) the continental differences in the plants and animals available for domestication, which led to more food and larger populations in Europe and Asia, 2) the rate of diffusion of agriculture, technology and innovation due to the geographic orientation of Europe and Asia (east-west) compared to the Americas (north-south), 3) the ease of intercontinental diffusion between Europe, Asia, and Africa, and 4) the differences in continental size, which led to differences in total population size and technology diffusion.' },
    {
        id: 14,
        title: 'Free Will',
        author: 'Hermann Simon',
        summary:
        'The Book in Three Sentences: Ultimately, profit is the only valid metric for guiding a company, and there are only three ways to influence profit: price, volume, and cost. Of these three factors, prices get the least attention, but have the greatest impact. The price a customer is willing to pay, and therefore the price a company can achieve, is always a reflection of the perceived value of the product or service in the customer’s eyes.' },
    {
        id: 13,
        title: 'What Got You Here Won’t Get You There',
        author: 'John Perkins',
        summary:
        'The Book in Three Sentences: The United States is engaging in a modern form of slavery by using the World Bank and other international organizations to offer huge loans to developing nations for construction projects and oil production. On the surface this appears to be generous, but the money is only awarded to a country if it agrees to hire US construction firms, which ensures a select few people get rich. Furthermore, the loans are intentionally too big for any developing nation to repay and this debt burden virtually guarantees the developing nation will support the political interests of the United States.' }
];


describe('run preprocessData function and searchBooks function', () => {

    it('it returns if search books for "the" and ask for 3 titles', async () => {
        expect.assertions(1);
        const titles = await search.searchBooks('the', 3);
        expect(titles).toEqual(outputBooks);
    });

    it('it returns response as true if writing to file is successful', async () => {
        const writeFile = await search.preprocessData();
        expect.assertions(2);
        expect(writeFile.response).toBe(true);
        expect(writeFile.error).toBeNull();
    });

    
});
