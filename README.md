# node-fsapi
JS implementation of the Frontier Silicon API
- This project is is a direct port of zhelev/python-fsapi (https://github.com/zhelev/python-fsapi) using  metapensiero/metapensiero.pj (https://github.com/metapensiero/metapensiero.pj)
    

# Required node libs:
```
npm install node-fetch xml-js --save
```

Usage
=====

```js
const URL = 'http://192.168.1.151:80/device'
const PIN = 1234
const TIMEOUT = 1 // in seconds

const fs = new FSAPI(URL, PIN, TIMEOUT)
run()
async function run(){
  await fs.init()
  await fs.get_mode_list().then(e=>console.log(e))
  await fs.get_mode().then(e=>console.log(e))
  await fs.get_play_status().then(e=>console.log(e))
  await fs.get_play_info_text().then(e=>console.log(e))
  await fs.get_play_info_artist().then(e=>console.log(e))
  await fs.get_play_info_album().then(e=>console.log(e))
  await fs.get_play_info_graphics().then(e=>console.log(e))
  await fs.get_volume_steps().then(e=>console.log(e))
  await fs.disconnect().then(e=>console.log(e))
}
```
This results in:
```
# node example.js

[ 'Internet radio',
  'TIDAL',
  'Napster',
  'Deezer',
  'Qobuz',
  'Spotify',
  'DMR',
  'Music player',
  'AUX in' ]
Deezer
playing
Search and Destroy (Iggy Pop Mix)
Iggy & the Stooges
Raw Power
http://assets.airable.io/600x600/jpeg:80/aHR0cHM6Ly9jZG5zLWltYWdlcy5kemNkbi5uZXQvaW1hZ2VzL2NvdmVyLzRhMTQyMmRhOGIyYWM3MjYzNzNmZjRlNWYxZDUwMTE1LzUwMHg1MDAtMDAwMDAwLTgwLTAtMC5qcGc/
21
true
```
