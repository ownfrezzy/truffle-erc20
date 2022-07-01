const Token = artifacts.require("ERC20MaxSupply");

module.exports = function (deployer) {
    deployer.deploy(Token, 'YoptaCoin', 'YC', 10000);
};
