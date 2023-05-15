module signature::ecdsa {
    use sui::ecdsa_k1;
    use sui::event;
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use std::vector;
    /// Event on whether the signature is verified
    struct VerifiedEvent has copy, drop {
        is_verified: bool,
    }

    /// Object that holds the output data
    struct Output has copy, drop {
        v: vector<u8>
    }

    public entry fun verify_signature(signature: vector<u8>, public_key: vector<u8>, raw_msg: vector<u8>) {
        let is_verified = ecdsa_k1::secp256k1_verify(&signature, &public_key, &raw_msg, 0);       
        event::emit(VerifiedEvent {is_verified:is_verified});
    }

 public entry fun get_public_key(signature: vector<u8>, msg: vector<u8>){
        // Normalize the last byte of the signature to be 0 or 1.
        let v = vector::borrow_mut(&mut signature, 64);
        if (*v == 27) {
            *v = 0;
        } else if (*v == 28) {
            *v = 1;
        } else if (*v > 35) {
            *v = (*v - 1) % 2;
        };
        
        let pubkey = ecdsa_k1::secp256k1_ecrecover(&signature, &msg, 1);
        event::emit(Output {v:pubkey});
    }

}