# jibochallenge
Coding challenge for Jibo job interview done by Scott Wszalek

The start button will place the checker in a random spot and the checker will move on its own through the path.
If the path points to go off the board, the checker will stop there.
The stop button will stop the automatic movement of the checker.
If stopped, you can just hit play again to use the same board, this will randomize a new start spot for the checker.
The Reset button will recreate the board with the size specified next to the arrows and reset the gameplay.
The up and down arrows will help adjust the number of rows and columns you want.

The Visual UI will appear in the Right corner. The Visual for if the checker is in a cycle will not display
until the checker reaches a square that is a part of that cycle. That was a decision I made and if you look
closely at my checkCurrentPath function (line 340) will show you my simple logic achieving this. I wasn't positive
if you wanted it to display right away if it would end up in a cycle or not.
If the checker is going to end off screen then the visual ui for that will appear right away.