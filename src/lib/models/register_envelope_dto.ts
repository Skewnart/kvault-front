export interface RegisterEnvelopeDTO {
    enc_sk: Uint8Array;
    master_salt: Uint8Array;
    pk: Uint8Array;
    sk_nonce: Uint8Array;
}

export function RegisterEnvelopeDTOFrom(envelope_str: string) {
    const envelope_json = JSON.parse(envelope_str);
    const envelope: RegisterEnvelopeDTO = {
        enc_sk: new Uint8Array(Object.values(envelope_json.enc_sk)),
        master_salt: new Uint8Array(Object.values(envelope_json.master_salt)),
        pk: new Uint8Array(Object.values(envelope_json.pk)),
        sk_nonce: new Uint8Array(Object.values(envelope_json.sk_nonce))
    };

    return envelope;
}