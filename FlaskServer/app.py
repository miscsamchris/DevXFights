from flask import Flask, jsonify, request
from flask_cors import CORS
import datetime
from openai import OpenAI
import os
from aptos_sdk.account import Account
from aptos_sdk.account_address import AccountAddress
from aptos_sdk.aptos_cli_wrapper import AptosCLIWrapper
from aptos_sdk.async_client import FaucetClient, RestClient
from aptos_sdk.bcs import Serializer
from aptos_sdk.package_publisher import PackagePublisher
import random
from aptos_sdk.transactions import (
    EntryFunction,
    TransactionArgument,
    TransactionPayload,
    RawTransactionWithData,
    RawTransaction,
)
from aptos_sdk.aptos_token_client import (
    AptosTokenClient,
    Collection,
    Object,
    PropertyMap,
    Property,
    ReadObject,
    Token,
)
from aptos_sdk.type_tag import StructTag, TypeTag
app = Flask(__name__)
CORS(app)



APTOS_CORE_PATH = os.getenv(
    "APTOS_CORE_PATH",
    os.path.abspath("./aptos-core"),
)
FAUCET_URL = os.getenv(
    "APTOS_FAUCET_URL",
    "https://faucet.testnet.aptoslabs.com",
)
INDEXER_URL = os.getenv(
    "APTOS_INDEXER_URL",
    "https://api.testnet.aptoslabs.com/v1/graphql",
)
NODE_URL = os.getenv("APTOS_NODE_URL", "https://api.testnet.aptoslabs.com/v1")
rest_client = RestClient(NODE_URL)
faucet_client = FaucetClient(FAUCET_URL, rest_client)
admin_wallet = Account.load("admin")
token_client = AptosTokenClient(rest_client)  # <:!:section_1b
# Basic configuration
app.config['JSON_SORT_KEYS'] = False
app.config['DEBUG'] = True
# :!:>section_6
async def get_collection_data(
    token_client: AptosTokenClient, collection_addr: AccountAddress
) -> dict[str, str]:
    collection = (await token_client.read_object(collection_addr)).resources[Collection]
    return {
        "creator": str(collection.creator),
        "name": str(collection.name),
        "description": str(collection.description),
        "uri": str(collection.uri),
    }  # <:!:section_6


# :!:>get_token_data
async def get_token_data(
    token_client: AptosTokenClient, token_addr: AccountAddress
) -> dict[str, str]:
    token = (await token_client.read_object(token_addr)).resources[Token]
    return {
        "collection": str(token.collection),
        "description": str(token.description),
        "name": str(token.name),
        "uri": str(token.uri),
        "index": str(token.index),
    }  # <:!:get_token_data

# Add OpenAI client initialization
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def classify_developer(bio, programming_languages):
    prompt = f"""Given the following developer information:
    Bio: {bio}
    Programming Languages: {', '.join(programming_languages)}
    
    Classify the developer into one of these categories: PythonDev, JSDev, or JavaDev.
    Respond with only one of these three options."""

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a developer classifier. Respond with exactly one of: PythonDev, JSDev, or JavaDev"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=10
    )
    
    return response.choices[0].message.content.strip()

@app.route('/')
async def home():
    return jsonify({
        'message': 'Welcome to the Flask API',
        'status': 'running'
    })

@app.route('/api/health')
async def health_check():
    return jsonify({
        'status': 'healthy'
    })

@app.route('/api/github-profile', methods=['POST'])
async   def process_github_profile():
    try:
        # Get the JSON data from the request
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'bio', 'programming_languages']
        if not data or not all(field in data for field in required_fields):
            return jsonify({
                'error': 'Missing required fields. Please provide username, bio, and programming_languages.'
            }), 400
        
        # Validate programming_languages is a list
        if not isinstance(data['programming_languages'], list):
            return jsonify({
                'error': 'programming_languages must be a list'
            }), 400

        # Add classification
        dev_type = classify_developer(data['bio'], data['programming_languages'])
        
        response = {
            'username': data['username'],
            'developer_type': dev_type,
            'classified_at': datetime.datetime.utcnow().isoformat()
        }
        
        return jsonify(response), 200

    except Exception as e:
        return jsonify({
            'error': f'Error processing request: {str(e)}'
        }), 400

@app.route('/api/mint-sbt', methods=['POST'])
async def mint_sbt():
    try:
        # Get the JSON data from the request
        data = request.get_json()
        print(data)
        # Validate required fields
        required_fields = ['wallet','username','nft_uri','properties']
        if not data or not all(field in data for field in required_fields):
            return jsonify({
                'error': 'Missing required fields. Please provide admin_wallet and num_with_zeros.'
            }), 400
        
        wallet = data['wallet']
        username = data['username']
        nft_uri = data['nft_uri']
        properties = data['properties']
        # Mint the SBT
        random_number = random.randint(1, 10000)
        txn_hash = await token_client.create_collection(
            admin_wallet,
            f"{username} DEVX SBT ",
            100,
            f"{username} DEVX SBT {random_number}",
            f"https://github.com/{username}",
            True,
            True,
            True,
            True,
            True,
            True,
            True,
            True,
            True,
            0,
            1,
        )  # <:!:section_4
        print(txn_hash)

        await rest_client.wait_for_transaction(txn_hash)
        
        resp = await rest_client.account_resource(
            admin_wallet.address(), "0x1::account::Account"
        )
        
        collection_addr = AccountAddress.for_named_collection(
            admin_wallet.address(),  f"{username} DEVX SBT {random_number}",
        )
        print("collection_addr",collection_addr)
        properties=[Property.string(x["label"], x["value"]) for x in properties]
        txn_hash = await token_client.mint_soul_bound_token(
                    admin_wallet,
                    f"{username} DEVX SBT",
                    f"{username} DEVX SBT",
                    f"{username} DEVX SBT",
                    nft_uri,
                    PropertyMap(properties),
                    AccountAddress.from_str(wallet),
                )  # <:!:section_5
        await rest_client.wait_for_transaction(txn_hash)
        print(txn_hash)
        minted_tokens = await token_client.tokens_minted_from_transaction(
            txn_hash
        )
        print(minted_tokens)
        return jsonify({
            'transaction_hash': txn_hash,
            'collection_address': str(collection_addr),
            'status': 'SBT minted successfully'
        }), 200

    except Exception as e:
        return jsonify({
            'error': f'Error processing request: {str(e)}'
        }), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 