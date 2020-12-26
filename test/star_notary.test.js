const StarNotary = artifacts.require("StarNotary");

contract('StarNotary', (accounts) => {
    const [deployer, user1, user2] = accounts;
    // owner = accounts[0];

    beforeEach(async () => {
        this.instance = await StarNotary.new("STAR 1", "SYT", { from: deployer });
    })

    it('can Create a Star', async() => {
        let tokenId = '1';
        const symbol = 'STAR 1';
        await this.instance.createStar('Awesome Star!', symbol, tokenId, {from: accounts[0]})
        const { name } = await this.instance.tokenIdToStarInfo.call(tokenId);
        assert.equal(name, 'Awesome Star!');
    });
    
    it('lets user1 put up their star for sale', async() => {
        let starId = '2';
        let symbol = 'STAR 2';
        let starPrice = web3.utils.toWei(".01", "ether");

        await this.instance.createStar('awesome star', symbol, starId, { from: user1 });
        await this.instance.putStarUpForSale(starId, starPrice, { from: user1 });
        assert.equal(await this.instance.starsForSale.call(starId), starPrice);
    });
    
    it('lets user1 get the funds after the sale', async() => {
        let starId = 3;
        let symbol = 'STAR 3';
        let starPrice = web3.utils.toWei(".01", "ether");
        let balance = web3.utils.toWei(".05", "ether");
        await this.instance.createStar('awesome star', symbol, starId, { from: user1 });
        await this.instance.putStarUpForSale(starId, starPrice, {from: user1});
        let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
        await this.instance.buyStar(starId, { from: user2, value: balance });
        let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
        let value1 = Number(balanceOfUser1BeforeTransaction.toString()) + Number(starPrice.toString());
        let value2 = Number(balanceOfUser1AfterTransaction.toString());
        assert.equal(value1, value2);
    });
    
    it('lets user2 buy a star, if it is put up for sale', async() => {
        let starId = '4';
        let symbol = 'STAR 4';
        let starPrice = web3.utils.toWei(".01", "ether");
        let balance = web3.utils.toWei(".05", "ether");
        await this.instance.createStar('awesome star', symbol, starId, {from: user1});
        await this.instance.putStarUpForSale(starId, starPrice, {from: user1});
        let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
        await this.instance.buyStar(starId, {from: user2, value: balance});
        assert.equal(await this.instance.ownerOf.call(starId), user2);
    });
    
    it('lets user2 buy a star and decreases its balance in ether', async() => {
        let starId = '5';
        let symbol = 'STAR 5';
        let starPrice = web3.utils.toWei(".01", "ether");
        let balance = web3.utils.toWei(".05", "ether");
        await this.instance.createStar('awesome star', symbol, starId, {from: user1});
        await this.instance.putStarUpForSale(starId, starPrice, {from: user1});
        let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
        const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
        await this.instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
        const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
        let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
        assert.equal(value, starPrice);
    });
    
    // Implement Task 2 Add supporting unit tests
    
    it('can add the star name and star symbol properly', async() => {
        // 1. create a Star with different tokenId
        const starId = '10';
        const symbol = 'STAR 6';
        await this.instance.createStar('awesome star', symbol, starId, { from: user1 });
        //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
        const { name, symbol: symbol1 } = await this.instance.tokenIdToStarInfo.call(starId);
        assert.equal(name, 'awesome star');
        assert.equal(symbol1, symbol);
    });
    
    it('lets 2 users exchange stars', async() => {
        const starId1 = '1';
        const starId2 = '2';
    
        const symbol1 = 'STAR 1';
        const symbol2 = 'STAR 2';
    
        // 1. create 2 Stars with different tokenId
        await this.instance.createStar('Awesome star 1', symbol1, starId1, { from: user1 });
        await this.instance.createStar('Awesome star 1', symbol2, starId2, { from: user2 });
    
        // 2. Call the exchangeStars functions implemented in the Smart Contract
        await this.instance.exchangeStars(starId1, starId2, { from: user1 });
        // 3. Verify that the owners changed
        assert.equal(await this.instance.ownerOf(starId1), user2);
        assert.equal(await this.instance.ownerOf(starId2), user1);
    });
    
    it('lets a user transfer a star', async() => {
        const starId = '1';
        const symbol = 'STAR 1';
        // 1. create a Star with different tokenId
        await this.instance.createStar('Awesome star', symbol, starId, { from: user1 });
        await this.instance.approve(user2, starId, { from: user1 });
        // 2. use the transferStar function implemented in the Smart Contract
        await this.instance.transferStar(user2, starId, { from: user1 });
        // 3. Verify the star owner changed.
        assert.equal(await this.instance.ownerOf(starId), user2);
    });
    
    it('lookUptokenIdToStarInfo test', async() => {
        const starId = '1';
        const symbol = 'STAR 1';
        // 1. create a Star with different tokenId
        await this.instance.createStar('Awesome star', symbol, starId, { from: user1 });
        // 2. Call your method lookUptokenIdToStarInfo
        const star = await this.instance.lookUptokenIdToStarInfo(starId);
        // 3. Verify if you Star name is the same
        assert.equal(star, 'Awesome star');
    });
});