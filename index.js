
const { Secp256k1Keypair, RawSigner, JsonRpcProvider, TransactionBlock, Connection } = require('@mysten/sui.js');

// sui client publish --gas-budget 500000000 --json ./ 

const packageID = '0x7cea762fb2c7c4a3f5439afb35520f04df718ed6805507baec2efeb12ec16ef3';
const moduleName = 'ecdsa';
const method = 'verify_signature';
const method2 = 'get_public_key';

const privKey = 'e331012dd4db7e4336291dc7124d8855ab48779705368fbad9f4182b406e73ac';
const rpcURL = 'http://127.0.0.1:9000';
const faucetURL = 'http://127.0.0.1:5003';

const msg = Buffer.from('hello world', 'utf8').toString('hex');

const keyPair = Secp256k1Keypair.fromSecretKey(privKey);
const signature = keyPair.signData(msg);

console.log(signature);

const caller = new RawSigner(keyPair, new JsonRpcProvider(
    new Connection({ fullnode: rpcURL, faucet: faucetURL })
));

(async () => {

    const tx = new TransactionBlock();

    const callArgs = [
        Array.from(Buffer.from(signature)),
        Array.from(Buffer.from(keyPair.getPublicKey().toBytes())),
        Array.from(Buffer.from(msg, 'hex'))
    ];

    const params = callArgs.map((v) => tx.pure(v));

    tx.moveCall({
        target: `${packageID}::${moduleName}::${method}`,
        arguments: params
    });


    const result = await caller.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: {
            showObjectChanges: true,
            showEffects: true,
            showEvents: true,
            showInput: false
        }
    });


    // console.log(JSON.stringify(result, undefined, '  '));

    result.events?.map(v => {
        console.log(v.parsedJson);
    });

    const tx2 = new TransactionBlock();

    const callArgs2 = [
        Array.from(Buffer.from(signature)).concat([0x01]),
        Array.from(Buffer.from(msg, 'hex'))
    ];

    const params2 = callArgs2.map((v) => tx2.pure(v));

    tx2.moveCall({
        target: `${packageID}::${moduleName}::${method2}`,
        arguments: params2
    });


    const result2 = await caller.signAndExecuteTransactionBlock({
        transactionBlock: tx2,
        options: {
            showObjectChanges: true,
            showEffects: true,
            showEvents: true,
            showInput: false
        }
    });

    // console.log(JSON.stringify(result2, undefined, '  '));

    result2.events?.map(v => {
        console.log(v.parsedJson);
        if (v.parsedJson.v) {
            console.log("Recovered: \t" + Buffer.from(v.parsedJson.v).toString('hex'));
            console.log("Actual: \t" + Buffer.from(keyPair.getPublicKey().toBytes()).toString('hex'))
        }
    });
})()


