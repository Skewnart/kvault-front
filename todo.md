# TODO

register : 
		type à l'utilisateur ?
	    trois demandes max simultanées (pour éviter de bourrer)

connexion : anti brute force (statut : blocked)


Gestion de révocation de token
Barre de recherche
Gestion des dossiers
Gestion de favoris

Il faut pouvoir naviguer avec le clavier partout dans l'appli
L'affichage d'un mot de passe ne doit durer que quelques secondes

## Register 

L'admin (il faut un statut à l'utilisateur) aura une page sur l'IHM pour générer un uuid d'inscription (avec nombre d'inscription pour cet uuid) et temps pour s'inscrire.
Le user ira sur /register/{uuid}. Quel que soit l'uuid la page fonctionnera, le check se fait à l'inscription. Le user mettra user, mot de passe (aes), masterpassword (enveloppe)
Le serveur checkera le uuid (existence, timing, nb inscription restante)
Redirection utilisateur

### v2

Kvault register :
Le user doit être ADMIN pour avoir une page pour inviter les gens et voir les invitations en cours (/register/invitations)
	(tableau : date de fin de validité, user invité, "copier le lien d'invitation", "désactiver" avec confirmation. Il peut désactiver une invitation seulement si elle est encore active. Le tri doit être fait pour voir tous les liens actifs en premier, puis terminé. Les désactivés doivent être barrés)

Dans cette page, il peut créer des "invitations" (/register/invitations/new)
Une invitation est à usage unique (il sélectionne une durée de validité, et la validation lui retourne un guid d'invitation)

L'utilisateur va sur la page "/register/{guid}" pour s'enregistrer.
Une fois qu'il a créé son compte, ça renseigne un truc dans la base qui rend le guid inactif pour un autre qui utiliserait le lien.

BDD pour invitation :
guid (unique), created_at (default now), validity_period (timestamp ?, not_null), user_id, is_active (default true)
actif -> is_active AND user_id IS NULL AND now() >= created_at AND now() <= created_at + validity_period

TODO PLUS TARD :- Sur le front, il faudra afficher les invitations avec en premier les invitations utilisables du plus récent au plus dans le futur,
				puis non utilisables de maintenant à plus dans le passé (utilisé en bleu, !is_active en barré, expiré en rouge)
				- faire la désactivation d'un invitation

				Rassembler tous les enc_*
				user : enc_folders : { id, name }
				folders : id, user_id, enc_entries { id, name, description, is_favorite }
				entry : id, user_id, user, password


### En pause, À faire :
	Sur le front, register en cours (redirection une fois register, faire les validateurs (mot de passe identique etc), gérer + d'erreurs pour le guid, duplicate usrename etc)
	Côté front, garder l'envelope quand le register passe, et le token aussi
		Pour le login, récupérer l'envelope

# Full process Encryption (Register, Entry creation, Entry retrieve)

import * as wasm from "$lib/wasm_pkg/kvault_wasm";
import { onMount } from 'svelte';

onMount(async () => {
	await wasm.default();

	const master_password = "ThisIsAStrongPassword123!";
	const user_unique = "my_username";
	const entry_password = "entry_password";

	const register_envelope = wasm.generate_register_envelope(master_password, user_unique);
	console.log("register_envelope", register_envelope);

	const entry_result = wasm.create_entry(entry_password, register_envelope.pk);
	console.log("entry_result", entry_result);

	const password = wasm.read_entry(
		master_password,
		user_unique,
		register_envelope.enc_sk,
		register_envelope.sk_nonce,
		entry_result.enc_pwd,
		entry_result.enc_kyber,
		entry_result.pwd_nonce
	);
	console.log("password", password);

	console.log("mot de passe égaux : ", password === entry_password ? "oui" : "non");
});
