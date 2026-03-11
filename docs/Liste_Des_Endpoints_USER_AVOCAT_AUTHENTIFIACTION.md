**User (compte + profil)**

---

**Action**			**Endpoint**			**Qui**

Inscription		POST /api/auth/register		Public

Connexion		POST /api/auth/login		Public

Mon profil		GET /api/users/me		Connecté

Modifier mon profil	PUT /api/users/me		Connecté

Supprimer mon compte	DELETE /api/users/me		Connecté



**Admin – Users**

---

**Action**				**Endpoint**

Liste (recherche, pagination)	GET /api/admin/users?search=...

Détail				GET /api/admin/users/{id}

Modifier			PUT /api/admin/users/{id}

Désactiver par id		DELETE /api/admin/users/{id}

Désactiver par email		DELETE /api/admin/users/by-email?email=...

Réactiver par id		PATCH /api/admin/users/{id}/reactivate

Réactiver par email		PATCH /api/



**Avocat (profil avocat)**

---

**Action**				**Endpoint**			**Qui**

Liste publique (filtres)	GET /api/avocats		Public

Détail public			GET /api/avocats/{id}		Public

Mon profil			GET /api/avocats/me		AVOCAT

Créer mon profil		POST /api/avocats/me		AVOCAT

Modifier mon profil		PUT /api/avocats/me		AVOCAT

Désactiver mon profil		DELETE /api/avocats/me		AVOCAT



**Admin – Avocats**

---

**Action**				**Endpoint**

Liste (filtres, pagination)	GET /api/admin/avocats

Détail				GET /api/admin/avocats/{id}

Modifier			PUT /api/admin/avocats/{id}

Désactiver par id		DELETE /api/admin/avocats/{id}

Désactiver par email		DELETE /api/admin/avocats/by-email?email=...

Réactiver par id		PATCH /api/admin/avocats/{id}/reactivate

Réactiver par email		PATCH /api/admin/avocats/by-email/reactivate?email=...





