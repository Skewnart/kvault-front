export interface RegisterEnvelopeDTO {
    enc_sk: Uint8Array;
    master_salt: Uint8Array;
    pk: Uint8Array;
    sk_nonce: Uint8Array;
}
