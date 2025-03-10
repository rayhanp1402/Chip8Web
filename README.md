<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/rayhanp1402/Chip8Web">
    <img src="./chip8_emulator/images/tetris-icon.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">CHIP-8 Web</h3>

  <p align="center">
    Yet another CHIP-8 Web Emulator, I know
    <br />
    <a href="https://chip8web.netlify.app/"><strong>Go to Website »</strong></a>
    <br />
    <br />
    <a href="https://github.com/rayhanp1402/Chip8Web/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/rayhanp1402/Chip8Web/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![CHIP-8 Web Screen Shot][chip8-web-screenshot]](https://github.com/rayhanp1402/Chip8Web)
For those who are unfamiliar with CHIP-8, it is a Virtual Machine (VM) developed by Joseph Weisbecker for his
1802 microprocessor, which was initially used on the COSMAC VIP and Telmac 1800.

There are already many CHIP-8 emulator on the web as we speak. Why did I make yet another one? Because I wanted to.
And, this time the emulator has a dedicated disassembler complete with a simple utility terminal. Also, how many web based
CHIP-8 emulator that can save your ROM on the cloud again? Right.

A few caveats:
* This emulator implements the Chip-8 Opcodes from [Cowgod's CHIP-8 Technical Reference](http://devernay.free.fr/hacks/chip8/C8TECH10.HTM)
* Passed [BC_test](https://github.com/daniel5151/AC8E/blob/master/roms/bc_test.txt) and [Corax's](https://github.com/corax89/chip8-test-rom) tests.
* Passed all [Timendus'](https://github.com/Timendus/chip8-test-suite) tests except for Quirks test and Scrolling test.
* Does not account for CARRY 8xy6 and CARRY 8xyE third flags of [Timendus'](https://github.com/Timendus/chip8-test-suite) flag test
* Wait for key press does not wait for key release before continuing instruction

Accounting these couple of points, some of the ROM you find online might not work properly on the emulator.
Most will work though, as long as the ROM is not specifically programmed for Super CHIP-48 or other variants of CHIP-8.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With
These are the technologies that made this possible

* [![Typescript][Typescript]][Typescript-url]
* [![HTML5]][HTML5]
* [![CSS3]][CSS3]
* [![Bootstrap][Bootstrap.com]][Bootstrap-url]
* [![Vite][Vite]][Vite-url]
* [![Java][Java]][Java-url]
* [![Spring][Spring]][Spring-url]
* [![Amazon S3][AmazonS3]][AmazonS3-url]
* [![Supabase][Supabase]][Supabase-url]
* [![Postgres][Postgres]][Postgres-url]
* [![Docker][Docker]][Docker-url]
* [![Google Cloud][GoogleCloud]][GoogleCloud-url]
* [![Netlify][Netlify]][Netlify-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## Usage

Key features will be listed here

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

This project is licensed under the MIT License. See [`LICENSE`](./LICENSE) for more details.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Rayhan Hanif Maulana Pradana - Discord: pradana1402 - rayhan.hanif14maulana@gmail.com

Project Link: [https://github.com/rayhanp1402/Chip8Web](https://github.com/rayhanp1402/Chip8Web)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

These are some of the inspirations as well as guides and resources that make the completion of this project posible

* [Choose an Open Source License](https://choosealicense.com)
* [Tania Rascia's Chip8.js](https://taniarascia.github.io/chip8/)
* [ElCholoGamer's Chip8-Emulator](https://chip-8.vercel.app/)
* [Cowgod's CHIP-8 Technical Reference](http://devernay.free.fr/hacks/chip8/C8TECH10.HTM)
* [Austin Morlan's CHIP-8 Emulator Guide](https://austinmorlan.com/posts/chip8_emulator/)
* [Tobias V. Langhoff's CHIP-8 Emulator Guide](https://tobiasvl.github.io/blog/write-a-chip-8-emulator/)
* [BC_Test](https://github.com/daniel5151/AC8E/blob/master/roms/bc_test.txt)
* [Corax's Test](https://github.com/corax89/chip8-test-rom)
* [Timendus' Tests](https://github.com/Timendus/chip8-test-suite)
* [othneildrew's README Template](https://github.com/othneildrew/Best-README-Template?tab=readme-ov-file)
* [ileraiyo's Markdown Badges](https://github.com/Ileriayo/markdown-badges)
* [Icons8](https://icons8.com/icons/set/tetris)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=for-the-badge
[contributors-url]: https://github.com/othneildrew/Best-README-Template/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=for-the-badge
[forks-url]: https://github.com/othneildrew/Best-README-Template/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=for-the-badge
[stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=for-the-badge
[issues-url]: https://github.com/othneildrew/Best-README-Template/issues
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/othneildrew
[chip8-web-screenshot]: ./chip8_emulator/images/chip8-web-preview.PNG
[Typescript]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[Typescript-url]: https://www.typescriptlang.org/
[HTML5]:https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white
[CSS3]: https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white
[Vite]: https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vite.dev/
[Java]: https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white
[Java-url]: https://www.java.com/en/
[Spring]: https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white
[Spring-url]: https://spring.io/
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[Postgres]: https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white
[Postgres-url]: https://www.postgresql.org/
[AmazonS3]: https://img.shields.io/badge/Amazon%20S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white
[AmazonS3-url]: https://aws.amazon.com/
[Supabase]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.com/
[GoogleCloud]: https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white
[GoogleCloud-url]: https://cloud.google.com/
[Netlify]: https://img.shields.io/badge/netlify-%23000000.svg?style=for-the-badge&logo=netlify&logoColor=#00C7B7
[Netlify-url]: https://www.netlify.com/
[Docker]: https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/