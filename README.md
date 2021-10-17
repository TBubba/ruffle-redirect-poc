# Ruffle Redirect

A proof of concept for intercepting web requests made from a Flash application running inside (standalone) Ruffle.

The purpose of this is to make sure that is is feasable to make Ruffle run Flash applications that are "site locked" or relies on resources located at hard coded URLs.

Read the source code for more information (it's short and commented).

# Running Demo

Note: This project does not contain any Flash files. You have to provide one yourself.

0. Install [Node](https://nodejs.org/)
1. Install dependencies ``npm run i``
2. Build the project and run the file server ``npm run serve``
3. Place your Flash file in the folder ``static``. This is the root folder of the file server
4. Open the demo in your web browser ``http://localhost:8080/`` (you will require specific seach paramters, see the next section)

# Details

__The demo uses the following search parameters:__

* ``fake_root`` - Base URL that all redirects will be made FROM.
* ``real_root`` - Base URL that that all redirects will be made TO.
* ``entry`` - URL of the Flash file to load (this will be redirected).

Example: ``http://localhost:8080/?fake_root=https://www.coolmath-games.com/games/&real_root=http://localhost:8080/&entry=https://www.coolmath-games.com/games/learn_to_fly_final_3.54k_coolmath_1.swf``

__The redirection (roughly) works like this:__

* Ruffle sends a request with the URL ``https://www.coolmath-games.com/games/very_cool/game.swf``
* The request is intercepted and its URL is compared against fake_root (fake_root = ``https://www.coolmath-games.com/games/``)
* It's a match! The request's URL is modified to match real_root (real_root = ``http://localhost:8080/``)
* The request is sent to ``http://localhost:8080/very_cool/game.swf``

# Conclusions

* This has only been tested on a single site-locked game. I would like to try it with Flash applications that send requests at runtime (such as multi-file games), but I can't find any that are compatible with Ruffle.

* The current approach is to replace ``window.fetch`` with a wrapper function that redirects _all_ requests. This may not be desireable in all cases since it could redirect unrelated requests made on the same page. A solution may be to run Ruffle and Ruffle Redirect inside an iframe.
