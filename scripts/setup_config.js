const path = require('path');
const os = require('os');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const yaml = require('js-yaml');

const NETWORK_ADDRESS = process.env.NETWORK_ADDRESS || '0x0000000000000000000000000000000000000000';
const SUBGRAPH_CONFIG = path.resolve(__dirname, '..', 'subgraph.yaml');
const ETHER_ROUTER_ADDRESS = path.resolve(__dirname, '..', '..', 'colonyNetwork/etherrouter-address.json');

try {
  if (existsSync(SUBGRAPH_CONFIG)) {
    /*
     * Read the subgraph config yaml config
     */
    const subgraphConfig = yaml.safeLoad(
      readFileSync(
        SUBGRAPH_CONFIG,
        'utf8',
      ),
    );
    /*
     * Get the deployed etherRouter address
     */
    let etherRouterAddress = NETWORK_ADDRESS;
    if (existsSync(ETHER_ROUTER_ADDRESS)) {
      etherRouterAddress = require(ETHER_ROUTER_ADDRESS).etherRouterAddress;
    }
    /*
     * Write the subgraph config object values
     */
    // console.log(subgraphConfig);
    // console.log(subgraphConfig.dataSources.source);
    // subgraphConfig.dataSources.source.address = etherRouterAddress;
    subgraphConfig.dataSources.map(({ name }, index) => {
      if (name === 'ColonyNetwork') {
        subgraphConfig.dataSources[index].source.address = etherRouterAddress;
      }
    });
    /*
     * Write the subgraph config yaml
     */
    console.log(); // New Line
    console.log('Updating the deployed EtherRouter address inside the config file');
    writeFileSync(
      SUBGRAPH_CONFIG,
      yaml.safeDump(subgraphConfig),
      { encoding: 'utf8' },
    );
  }
} catch (error) {

  console.log(error);

}
