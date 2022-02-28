Communication Application on Hyperledger Fabric Blockchain platform

Setup:
1. Setup Hyperledger Fabric as in this link: https://hyperledger-fabric.readthedocs.io/en/latest/install.html
2. Replace javascript folder in <your_directory>fabric-samples/tree/main/chaincode/fabcar by our javascript folder in our repo
3. Replace file deployCC.sh in <your_directory>fabric-samples/tree/main/test-network/scripts by file deployCC.sh in our repo
4. Change directory to  <your_directory>fabric-samples/tree/main/test-network/scripts and execute command: "chmod +x deployCC.sh"
5. Change directory to <your_directory>fabric-samples/tree/main/test-network and execute command below:

###__Build_Project__### <br />
cd ../fabcar <br />
./networkDown.sh <br />
cd ../test-network <br />
./network.sh down <br />
./network.sh up createChannel -ca -s couchdb <br />
cd addOrg3/ <br />
./addOrg3.sh up -c mychannel -ca -s couchdb <br />
cd .. <br />
./network.sh deployCC -ccn fabcar -ccv 1 -cci initLedger -ccl javascript  -ccp ../chaincode/fabcar/javascript/ <br />
cd ../fabcar/javascript/ <br />
node enrollAdmin.js <br />
node registerUser.js <br />
npm install <br />
npm install express <br />
npm install multer <br />
npm install ejs <br />
docker update --restart unless-stopped $(docker ps -q) <br />
###_End_### <br />

Open Browser, access localhost:8082
