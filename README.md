# 🚀 TypoQuest: L'Aventure Cosmique

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**TypoQuest** est une application ludo-éducative conçue pour aider les enfants à maîtriser le clavier (AZERTY/QWERTY) à travers une aventure spatiale immersive. Grâce à l'IA (Gemini), les phrases s'adaptent et restent amusantes !

## 🌟 Points Forts

- **Totalement Hors-Ligne** : Une fois installé, le jeu fonctionne sans internet (parfait pour les voyages).
- **IA Générative** : Utilise Google Gemini pour créer des phrases de quêtes uniques et rigolotes.
- **Zéro Data** : Aucune donnée personnelle n'est collectée. Tout est stocké localement.
- **Multi-plateforme** : S'installe sur Windows, Linux (Debian/Ubuntu), macOS et Android via la technologie PWA.

---

## 📥 Comment l'installer ?

### Option 1 : Installation rapide (Recommandé pour les parents)
Si vous avez un lien vers une version en ligne (ex: GitHub Pages) :
1. Ouvrez le lien dans **Chrome** ou **Edge**.
2. Cliquez sur l'icône d'installation dans la barre d'adresse (un petit ordinateur ou un "+").
3. Le jeu est maintenant sur votre bureau !

### Option 2 : Installation via GitHub (Pour les curieux et développeurs)
Si vous souhaitez faire tourner le projet localement sur votre machine :

#### Pré-requis
- [Node.js](https://nodejs.org/) (version 18 ou plus)
- Un navigateur moderne (Chrome, Firefox, Edge)

#### Étapes
1. **Cloner le projet**
   ```bash
   git clone https://github.com/VOTRE_NOM/typoquest.git
   cd typoquest
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer l'API Gemini (Optionnel pour le mode local)**
   Le jeu contient des phrases de secours, mais pour l'IA, créez un fichier `.env` à la racine :
   ```env
   API_KEY=VOTRE_CLE_API_GOOGLE_GEMINI
   ```

4. **Lancer le jeu**
   ```bash
   npm run dev
   ```
   Ouvrez ensuite l'adresse `http://localhost:5173` dans votre navigateur.

---

## 🐧 Notes spécifiques pour Linux Debian
Pour que l'application s'intègre parfaitement à votre menu d'applications :
1. Assurez-vous d'utiliser **Chromium** ou **Google Chrome**.
2. Allez dans `Menu > Enregistrer et partager > Installer la page en tant qu'application`.
3. Un fichier `.desktop` sera automatiquement créé par votre navigateur dans `~/.local/share/applications`.

## 🛠️ Technologies utilisées
- **React 19** & **TypeScript**
- **Tailwind CSS** (Design spatial)
- **Google Gemini API** (Génération de contenu)
- **Service Workers** (Gestion du mode hors-ligne)

---

## 🤝 Contribuer
Les suggestions de nouveaux mini-jeux ou d'avatars sont les bienvenues ! N'hésitez pas à ouvrir une *Issue* ou une *Pull Request*.

## 📄 Licence
Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.
