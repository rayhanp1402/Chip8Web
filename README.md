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
    <li><a href="#release-notes">Release Notes</a></li>
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

The authentication leverages Supabase's Google auth, where the client directly calls Supabase 
and receives a JWT token. Any other queries will go through the backend, which will validate the JWT
token if necessary.

Supabase's PostgreSQL stores the ROM names and their uploader UUID, while the ROM files are stored
into an AWS S3 Bucket. Saving and Deleting into the bucket is handled by the backend. However, Reading
is directly done by the client which uses a presigned URL generated by the backend.

Tests for the backend are written with the help of JUnit and Mockito.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## Usage
### 1. Loading ROM
You can load the ROM via the Upload ROM button or Select ROM. Select ROM takes the saved ROMs from the cloud. Once a ROM is
loaded, you can click the Play button to start the emulation or Stop button to stop it.
### 2. Login with Google
This will enable Save ROM feature and Delete ROM feature. Will change the terminal's username as well.
### 3. Save and Delete ROM
You can save your ROMs to cloud, which can be used later. You can also delete the saved ROM. Don't worry, your saved
ROMs are private and cannot be read or downloaded by other users.
### 4. Select ROM
As stated above, used to load saved ROMs from the cloud into the emulator. There will be some ROMs which you haven't
saved yourself, or in other words, that are not your ROMs. Those are publicly available ROMs which is uploaded by the
developer/admin (myself).
### 5. Change Cycle Speed
Cycle speed can be configured to determine how fast in which the emulator executes the instructions.
### 6. Disassembler
You can view the emulator's properties (such as the Registers and Memory) in real time as the emulator is executing.
### 7. Terminal
Once a ROM is loaded, you can use the terminal to fiddle with the disassembler (breakpoints and step) 
or configure the cycle speed. You can type help to view the commands. 

Note: As of v1.1.0, Terminal will be hidden on smaller devices.
### 8. Keypad
You can test your keyboard to keypad mapping by pressing any keys on your keyboard. If one of the keypad
"glows" when you press a key on your keyboard, then it is the mapped key. For example, the "R" in my keyboard
corresponds to the "D" in the keypad (QWERTY-based). You can click on the keypads as well if you prefer.



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




<!-- RELEASE NOTES -->
## Release Notes
* 2025-03-13 -- 1.1.0
  * Minor backend fix
  * Inject configuration class for S3 presigner instead of directly building it in the services

* 2025-03-13 -- 1.1.0
  * Minor frontend update
  * Responsive page with reliable minimum width of 375px
  * Hide terminal under 940px

* 2025-03-11 -- 1.0.0
  * Initial version

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
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