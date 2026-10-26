
INDIAN OPEN WORLD 3D GAME
=========================

FILES:
------
index.html       - Game ka HTML structure
style.css        - Game ki styling
responsive.css   - Mobile responsive styling (optional)
script.js        - Three.js 3D game logic
run_game.bat     - Game start karne ke liye
README.txt       - Instructions


HOW TO PLAY:
------------
1. Sab files ek hi folder mein rakho.
2. Windows par run_game.bat par double-click karo.
3. Browser mein http://localhost:8000 kholo.
4. Internet connection on rakho, kyunki Three.js online load hota hai.


CONTROLS:
---------
W          - Aage / accelerator
S          - Peeche / brake
A          - Left
D          - Right
E          - Car ya bike mein baithna / utarna
SPACE      - Brake
R          - Player reset


GAME FEATURES:
--------------
- Procedural 3D city
- Cars aur Indian-style motorcycles
- Traffic aur pedestrians
- Third-person camera
- Vehicle theft par police chase
- Wanted level system


TROUBLESHOOTING:
----------------
Agar game nahi khulti:
- Check karo ke Python installed hai.
- Browser mein http://localhost:8000 kholo.
- Internet connection check karo.
- HTML, CSS aur JS files ke names check karo.
- Agar port 8000 busy ho to terminal mein:
  python -m http.server 8001
  phir http://localhost:8001 kholo.
