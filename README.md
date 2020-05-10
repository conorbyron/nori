# nori

first exercise with rust-wasm, three.js, react, tone.js, ts

the name and inspiration for the experiment came from Toshio Iwai's Tenori-On (2007)

what I learned:
- how to have values from tone control three objects and vice versa
- how to share an array buffer between rust land and js land easily

other notes:
- really hit a wall when trying to retroactively force a react model onto the already-developed three/tone system. In order to have react be part of the system, the three/tone stuff has to be more modular; currently it's just one big tangle.
- the challenge that opened up was that of controlling the new system broadly and effectively. 
- what is the material, and what are the tools? these are the fundamental questions.
