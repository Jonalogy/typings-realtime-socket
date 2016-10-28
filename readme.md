## Readme

#### Rules
* Each room 3 players max
* Only type forward, no turning back!

## Current Issue
Unexplained crash on Heroku or multiuser environment. Suspect on masterList{}. Try validating welcome modal to disable button if input is empty.

## Known Issues
1.  @Safari: Player input does not show up but competitors' does. Empty character divs are appended to `#myTrack` instead.
2. Entry modal accepts no input for nickname
3. Chat input doesn't accept spaces.

## Good to have Features
* Blinking Cursor:


Some server side data handling models.
```javascript
masterList[socket.id] = [nickname, room];
```

```javascript
allRooms[`room${roomNum}`] = members;
```
```javascript
members[nickname] = [ nickname , socket.id, `room${roomNum}` ];
```
