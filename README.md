<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="images/logo.png" alt="Logo"  height="80">
  </a>

  <h3 align="center">Best-README-Template</h3>

  <p align="center">
    An awesome README template to jumpstart your projects!
    <br />
    <a href="https://github.com/mancarius/tictactoe-vue.js-project"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://www.mattiamancarella.com/works/vue/tic-tac-toe">View Demo</a>
    ·
    <a href="https://github.com/mancarius/tictactoe-vue.js-project/issues">Report Bug</a>
    ·
    <a href="https://github.com/mancarius/tictactoe-vue.js-project/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

<p align="center">
    <img src="images\screenshot.png" alt="Logo"  height="300">
</p>

The application allows you to play Tic Tac Toe with grids of varying sizes both against the AI ​​and against a remote player.
Unlike the original game, where the game ends when the first set is made, here the game ends when there are no more moves available to each player. For each winning sequence the player accumulates a number of points equal to the length of the sequence and, in the case of multiple sequences, the final score will be the sum of all the sequences found. After a winning sequence has been counted, the boxes involved are freed and are re-assignable.

For every n points accumulated (by default 9), the player can activate the move called “Shuffling” which, when launched, randomly shuffles the grid squares. If winning sequences have been created at the end of the shuffling, they are counted and added to the score of the relevant player.

When creating the match, you can choose the number of columns and rows of the grid, the length of the winning sequence, the minimum threshold for activating the Shuffling and whether or not to activate the latter.

### Built With

This project was built with the following major frameworks:
* [Vue.js](https://www.vuejs.org)
* [Quasar](https://www.quasar.dev)
* [Typescript](https://www.typescriptlang.org/)



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

#### Firebase
If you want to use the remote functions of the application, you will have to create an application on Firebase and configure the Firestore Database and the authentication service via external provider. Otherwise you can only play against the AI.

#### Npm
To run application you need to install npm.
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/mancarius/tictactoe-vue.js-project.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Add an `.env` file in the project root, and copy the following configurations:
  ```sh
    VUE_APP_NAME=Tic Tac Toe
    VUE_APP_AUTH_STORAGE=localStorage
    VUE_APP_STATE_STORAGE=sessionStorage
    VUE_APP_MATCH_STORAGE=sessionStorage
  ```
3. _(optional)_ Enter your firebase configurations in the `.env` file
   ```sh
    VUE_APP_FIREBASE_APY_KEY=xxxxxxxxxx
    VUE_APP_FIREBASE_AUTH_DOMAIN=$VUE_APP_FIREBASE_PROJECT_ID.firebaseapp.com
    VUE_APP_FIREBASE_PROJECT_ID=xxxxxxx
    VUE_APP_FIREBASE_STORAGE_BUCKET=$VUE_APP_FIREBASE_PROJECT_ID.appspot.com
    VUE_APP_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxx
    VUE_APP_FIREBASE_APP_ID=xxxxxxxx
    VUE_APP_FIREBASE_MEASUREMENT_ID=xxxxxxxx
   ```
4. _(optional)_ In the Firestore database create a collection named `symbols` and add a document for each symbol you want to use following the following pattern:
    ```Typescript
    {
      filename: String,
      label: String,
    }
    ```


<!-- USAGE EXAMPLES -->
## Usage

For a practical demonstration of how this application works, go to [this link](https://www.mattiamancarella.com/works/vue/tic-tac-toe)



<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/othneildrew/Best-README-Template/issues) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Mattia Mancarella - [Linkedin](https://www.linkedin.com/in/mattia-mancarella) - hello@mattiamancarella.com

Project Link: [https://github.com/mancarius/tictactoe-vue.js-project](https://github.com/mancarius/tictactoe-vue.js-project)



<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements
* [Rxjs](https://rxjs.dev)





<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/mancarius/tictactoe-vue.js-project.svg?style=for-the-badge
[contributors-url]: https://github.com/mancarius/tictactoe-vue.js-project/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/mancarius/tictactoe-vue.js-project.svg?style=for-the-badge
[forks-url]: https://github.com/mancarius/tictactoe-vue.js-project/network/members
[stars-shield]: https://img.shields.io/github/stars/mancarius/tictactoe-vue.js-project.svg?style=for-the-badge
[stars-url]: https://github.com/mancarius/tictactoe-vue.js-project/stargazers
[issues-shield]: https://img.shields.io/github/issues/mancarius/tictactoe-vue.js-project.svg?style=for-the-badge
[issues-url]: https://github.com/mancarius/tictactoe-vue.js-project/issues
[license-shield]: https://img.shields.io/github/license/mancarius/tictactoe-vue.js-project.svg?style=for-the-badge
[license-url]: https://github.com/mancarius/tictactoe-vue.js-project/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/mattia-mancarella
[product-screenshot]: images/screenshot.png
