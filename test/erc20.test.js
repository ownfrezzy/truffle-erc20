const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const assert = require('assert');

const compiledToken = require('../build/contracts/MaxSupply.json');

let accounts;
let token;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    token = await new web3.eth.Contract(compiledToken.abi)
        .deploy({
            data: compiledToken.bytecode,
            arguments: ['new', 'token', '10000']
        })
        .send({ from: accounts[0], gas: '5000000'});
});

describe('Token', () => {

    it('[TEST] Deploys a new contract', () => {
        assert.ok(token.options.address);
    });

    it('[Constructor] Creates initial supply on deployer balance', async () => {
        const ownerBalance = await token.methods.balanceOf(accounts[0]).call()
        assert.equal(web3.utils.fromWei(ownerBalance), '10000')
    })

    it('[Constructor] Creates fixed initial supply', async () => {
        const ownerBalance = await token.methods.totalSupply().call()
        assert.equal(web3.utils.fromWei(ownerBalance), '10000')
    })

    it('[Constructor] Gives contract a proper name', async () => {
        const name = await token.methods.name().call();
        assert.equal(name, 'new')
    })

    it('[Constructor] Gives contract a proper symbol', async () => {
        const symbol = await token.methods.symbol().call();
        assert.equal(symbol, 'token')
    })

    it('[Transfer] Transfers the right amount of tokens from caller to recipient', async () => {
        const owner = accounts[0];
        const recipient = accounts[1];
        await token.methods.transfer(recipient,web3.utils.toWei('500')).send({from: owner})
        const recipientBalance = await token.methods.balanceOf(recipient).call()
        const ownerBalance = await token.methods.balanceOf(owner).call()
        assert.equal(web3.utils.fromWei(recipientBalance), '500')
        assert.equal(web3.utils.fromWei(ownerBalance), '9500')
    })

    it('[Approve] Increasing allowance for spender', async () => {
        const owner = accounts[0];
        const spender = accounts[1];
        await token.methods.approve(spender, web3.utils.toWei('10000')).send({from: owner});
        const allowance = await token.methods.allowance(owner, spender).call();
        assert.equal(web3.utils.fromWei(allowance), '10000');
    })

    it('[TransferFrom] Fails when insufficient allowance', async () => {
        const owner = accounts[0];
        const manager = accounts[1];
        try {
            await token.methods.transferFrom(owner, manager, '10000').send({from: manager});
            assert(false)
        } catch (err) {
            assert(err)
        }
    })

    it ('[TransferFrom] Transfers amount of tokens if enough allowance', async () => {
        const owner = accounts[0];
        const spender = accounts[1];
        await token.methods.approve(spender, web3.utils.toWei('10000')).send({from: owner});
        await token.methods.transferFrom(owner, spender, web3.utils.toWei('500')).send({from: spender});
        const spenderBalance = await token.methods.balanceOf(spender).call()
        const ownerBalance = await token.methods.balanceOf(owner).call()
        assert.equal(web3.utils.fromWei(spenderBalance), '500')
        assert.equal(web3.utils.fromWei(ownerBalance), '9500')
    })

    it('[TransferFrom] Decreases allowance for spender after TransferFrom call', async () => {
        const owner = accounts[0];
        const spender = accounts[1];
        await token.methods.approve(spender, web3.utils.toWei('10000')).send({from: owner});
        await token.methods.transferFrom(owner, spender, web3.utils.toWei('500')).send({from: spender});
        const allowance = await token.methods.allowance(owner, spender).call();
        assert.equal(web3.utils.fromWei(allowance), '9500');
    })
})
