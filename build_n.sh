#An Do, [21. 12. 15. AM 4:30]
#stay in test-network
cd ../fabcar
./networkDown.sh
cd ../test-network
./network.sh down
./network.sh up createChannel -ca -s couchdb
cd addOrg3/
./addOrg3.sh up -c mychannel -ca -s couchdb
cd ..
./network.sh deployCC -ccn fabcar -ccv 1 -cci initLedger -ccl javascript  -ccp ../chaincode/fabcar/javascript/ -ccep "AND('Org1MSP.peer','Org2MSP.peer','Org3MSP.peer')"
cd ../fabcar/javascript/
node enrollAdmin.js
node registerUser.js
npm install
npm install express
npm install multer
npm install ejs
docker update --restart unless-stopped $(docker ps -q)
#

#xem block 
docker logs peer0.org0.example.com -f


#binary fetch
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/

# Environment variables for Org1

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051