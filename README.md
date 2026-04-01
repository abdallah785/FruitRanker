# FruitRanker

Classe tes fruits preferes, affronte-les en tournoi, et decouvre le champion!

## Fonctionnalites

- **Classement Top 10** : Drag & drop pour classer tes fruits
- **Tournoi** : 16 fruits en bracket elimination
- **Fruit du jour** : Chaque jour un fruit mis en avant
- **FruitBot** : Chatbot IA expert en fruits (Claude API)
- **Systeme Freemium** : Mode gratuit + Premium a 4,99 EUR/mois
- **Partage** : Bouton natif sur chaque resultat
- **Compteur global** : Votes partages entre tous les utilisateurs

## Stack technique

- HTML / CSS / JS statique (GitHub Pages)
- Airtable comme backend (API REST)
- Claude API pour le chatbot
- Stripe pour les paiements Premium

## Configuration

Edite js/config.js avec tes cles API :

## Tables Airtable requises

- **Users** : email, password_hash, plan, date_inscription
- **Votes** : user_id, fruit, score, date
- **Tournaments** : user_id, gagnant, date
- **Payments** : user_id, stripe_id, date, statut

## Deploiement

Le site est pret pour GitHub Pages. Active Pages dans Settings > Pages > main / root.

URL : https://abdallah785.github.io/FruitRanker/

## Licence

MIT
