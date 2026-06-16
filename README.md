# Diag' Seconde Vie - Prototype mobile

## Commandes:

```bash
npm install
npx expo start
```

## Parcours de démo:
- Ouvrir `/scan` pour choisir un dossier mock
- Suivre les étapes de diagnostic

## Dossiers mock: 
`src/data/mockEstimations.ts`
## Moteur de scoring: 
`src/domain/scoringEngine.ts`
# workshop-dcn

## Dépannage Expo Go

Si Expo Go affiche "Could not connect to development server" ou que le tunnel échoue, essayer :

```bash
nvm use 20.19.4
rm -rf node_modules package-lock.json .expo node_modules/.cache
npm install
npx expo start --tunnel -c
```

Si le tunnel reste bloqué (problèmes réseau / hotspot mobile) :

```bash
EXPO_DEV_SERVER_PORT=8082 npx expo start --tunnel -c
```

Autres astuces :
- Vérifier que l'iPhone est connecté et autorise l'accès réseau (hotspot + NAT parfois bloquant).
- Si le tunnel ne fonctionne pas, créer un development build ou utiliser une ancienne version d'Expo Go compatible avec votre SDK.
- Utiliser `expo doctor` pour détecter des incohérences de versions.