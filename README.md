# ForsaLaw

Plateforme LegalTech tunisienne pour la mise en relation client-avocat, la gestion de rendez-vous (presentiel et en ligne), les notifications, l'authentification securisee et les modules de collaboration.

---

## Overview

ForsaLaw centralise dans une seule application :

- la gestion des comptes (`client`, `avocat`, `admin`) ;
- la prise de rendez-vous avec agenda avance avocat ;
- les notifications email (demande, proposition, annulation, rappels) ;
- la visioconference gratuite pour RDV en ligne (Jitsi) ;
- la securite JWT, OAuth2 Google et flux de reset mot de passe.

---

## Main Features

### Authentication and User Management

- inscription / connexion JWT ;
- OAuth2 Google ;
- reset password securise par token temporaire ;
- verrouillage du compte apres 3 tentatives de connexion echouees ;
- demande de deblocage de compte envoyee a l'admin (`POST /api/auth/request-unlock`).

### Avocat Verification and Admin Flows

- separation claire des endpoints admin profil vs verification avocat ;
- gestion du statut de verification (`verificationStatus`, `verifie`) ;
- reactivation admin des comptes bloques.

### RendezVous Management (Advanced)

- cycle de vie RDV (`EN_ATTENTE`, `PROPOSE`, `CONFIRME`, `ANNULE`) ;
- agenda avocat avance :
  - configuration agenda,
  - plages recurrentes,
  - exceptions ;
- calcul des creneaux disponibles cote client ;
- validation anti-conflit avant proposition ;
- RDV en ligne (Jitsi) avec generation automatique `meetingUrl` a la confirmation ;
- rappels automatiques J-1 / H-1.

### Notifications

- templates email metier (demande, proposition, annulation, confirmation, rappels) ;
- preferences de notifications par utilisateur.

### Communication and Collaboration

- modules messenger et reclamation ;
- endpoints admin de suivi et supervision.

---

## Tech Stack

![Java](https://img.shields.io/badge/Java-21-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![Spring Data JPA](https://img.shields.io/badge/Spring%20Data%20JPA-Hibernate-59666C?style=for-the-badge&logo=hibernate&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-Build-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Dev%20Server-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![OAuth2](https://img.shields.io/badge/OAuth2-Google-EA4335?style=for-the-badge&logo=google&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

---

## Project Structure

- `backend/` : API Spring Boot, logique metier, persistance
- `frontend/` : application front
- `docs/` : guides techniques et workflow
- `.github/workflows/` : pipelines CI

---

## Getting Started

### 1) Clone repository

```bash
git clone https://github.com/ForsaLaw/ForsaLaw.git
cd ForsaLaw
```

### 2) Start database

Depuis `backend/` :

```bash
docker-compose up -d
```

### 3) Configure environment

Copier `backend/.env.example` vers un fichier `.env` local et renseigner les valeurs necessaires (DB, JWT, SMTP, OAuth2, etc.).

Variables importantes :

- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`
- `ADMIN_SUPPORT_EMAIL`
- `JITSI_BASE_URL`

### 4) Run backend

Depuis `backend/` :

```bash
mvn spring-boot:run
```

### 5) Run frontend

Depuis `frontend/` :

```bash
npm install
npm run dev
```

---

## Important URLs

- Application backend: `http://localhost:8081`
- Swagger UI: `http://localhost:8081/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8081/v3/api-docs`
- Frontend dev (Vite): `http://localhost:3000` (ou port Vite affiche dans terminal)

---

## Git Workflow

Branche cible de travail: `develop`.

Cycle recommande :

1. partir de `develop` a jour ;
2. creer une branche `feature/...` ou `fix/...` ;
3. committer avec messages explicites ;
4. push et ouvrir PR vers `develop` ;
5. merger apres review + CI verte.

Guide detaille :

- [docs/GIT-WORKFLOW.md](docs/GIT-WORKFLOW.md)
- [docs/DEVOPS.md](docs/DEVOPS.md)

---

## Documentation

- [docs/DOCKER.md](docs/DOCKER.md)
- [docs/FLYWAY-VS-JPA.md](docs/FLYWAY-VS-JPA.md)
- [docs/RAG-INTEGRATION-NON-ENDPOINTS.md](docs/RAG-INTEGRATION-NON-ENDPOINTS.md)
- [docs/Liste_Des_Endpoints_USER_AVOCAT_AUTHENTIFIACTION.md](docs/Liste_Des_Endpoints_USER_AVOCAT_AUTHENTIFIACTION.md)

---

## Contributors

- Nadhmi Rouissi
- Youssef Zaied
