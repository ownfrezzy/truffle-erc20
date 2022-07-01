const Token = artifacts.require("MaxSupply");

module.exports = function (deployer) {
    deployer.deploy(Token, 'YoptaCoin', 'YC', '10000');
};
