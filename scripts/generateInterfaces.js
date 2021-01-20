// Clone colonyNetwork, using passed argument
const { readFileSync, writeFileSync, existsSync } = require('fs');
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const yaml = require('js-yaml');

async function main() {
	const commit = process.env.CONTRACT_COMMIT || "develop"
	try {
		await exec(`rm -rf ./interfaces`)
		options = {cwd: "./colonyNetwork"}
		await exec(`git clone https://github.com/joinColony/colonyNetwork.git colonyNetwork`)
		await exec(`git checkout ${commit} && git submodule update --init --recursive`, options)
		await exec(`yarn install --ignore-engines`, options)
		await exec(`yarn run provision:token:contracts`, options)

		await exec(`yarn run truffle compile`, options)
		// Get built files
		await exec("mkdir interfaces")
		await exec("mv ./colonyNetwork/build/contracts/IColonyNetwork.json ./interfaces")
		await exec("mv ./colonyNetwork/build/contracts/Token.json ./interfaces")
		await exec("mv ./colonyNetwork/build/contracts/IColony.json ./interfaces")
		await exec("mv ./colonyNetwork/build/contracts/OneTxPayment.json ./interfaces")
		console.log("Interfaces extracted")
	} catch (err) {
		console.log(err)
	}
	await exec(`rm -rf ./colonyNetwork`)
	try {

		const subgraphConfig = yaml.safeLoad(
	      readFileSync(
	        "./subgraph.yaml",
	        'utf8',
	      ),
	    );
	    subgraphConfig.dataSources.map(({ name }, index) => {
	      if (name === 'ColonyNetwork') {
	        subgraphConfig.dataSources[index].source.address = process.env.NETWORK_ADDRESS;

	      }
	    });
	    writeFileSync(
	      "./subgraph.yaml",
	      yaml.safeDump(subgraphConfig),
	      { encoding: 'utf8' },
	    );

	    await exec("sed -i'' -e 's|./../colonyNetwork/build/contracts/|./interfaces/|g' ./subgraph.yaml")

	} catch (err){
		console.log(err)
	}
}

main()