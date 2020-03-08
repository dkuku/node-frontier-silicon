const Fsapi = require('./fsapi');

const url = 'http://192.168.1.151:80/device'
const pin = 1234
const timeout = 1 // in seconds


const fs = new Fsapi(url, pin, timeout)
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
