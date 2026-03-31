/* tslint:disable */
/* eslint-disable */

export class Encoded {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(encoded: Uint8Array, enc_kyber: Uint8Array, enc_nonce: Uint8Array): Encoded;
    enc_kyber: Uint8Array;
    enc_nonce: Uint8Array;
    encoded: Uint8Array;
}

export class RegisterEnvelope {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(master_salt: Uint8Array, enc_sk: Uint8Array, pk: Uint8Array, sk_nonce: Uint8Array): RegisterEnvelope;
    enc_sk: Uint8Array;
    master_salt: Uint8Array;
    pk: Uint8Array;
    sk_nonce: Uint8Array;
}

export function create_encoded(plain_text: string, pk: Uint8Array): Encoded;

export function generate_register_envelope(master_password: string): RegisterEnvelope;

export function read_encoded(master_password: string, master_salt: Uint8Array, enc_sk: Uint8Array, sk_nonce: Uint8Array, encoded: Uint8Array, enc_kyber: Uint8Array, nonce: Uint8Array): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly create_encoded: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly generate_register_envelope: (a: number, b: number) => [number, number, number];
    readonly read_encoded: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number) => [number, number, number, number];
    readonly __wbg_encoded_free: (a: number, b: number) => void;
    readonly __wbg_get_encoded_enc_kyber: (a: number) => [number, number];
    readonly __wbg_get_encoded_enc_nonce: (a: number) => [number, number];
    readonly __wbg_get_encoded_encoded: (a: number) => [number, number];
    readonly __wbg_set_encoded_enc_kyber: (a: number, b: number, c: number) => void;
    readonly __wbg_set_encoded_enc_nonce: (a: number, b: number, c: number) => void;
    readonly __wbg_set_encoded_encoded: (a: number, b: number, c: number) => void;
    readonly encoded_new: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly __wbg_get_registerenvelope_enc_sk: (a: number) => [number, number];
    readonly __wbg_get_registerenvelope_master_salt: (a: number) => [number, number];
    readonly __wbg_get_registerenvelope_pk: (a: number) => [number, number];
    readonly __wbg_get_registerenvelope_sk_nonce: (a: number) => [number, number];
    readonly __wbg_registerenvelope_free: (a: number, b: number) => void;
    readonly __wbg_set_registerenvelope_enc_sk: (a: number, b: number, c: number) => void;
    readonly __wbg_set_registerenvelope_master_salt: (a: number, b: number, c: number) => void;
    readonly __wbg_set_registerenvelope_pk: (a: number, b: number, c: number) => void;
    readonly __wbg_set_registerenvelope_sk_nonce: (a: number, b: number, c: number) => void;
    readonly registerenvelope_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
