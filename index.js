const fetch = require('node-fetch');
const convert = require('xml-js');

/*
Support for interaction with Frontier Silicon Devices
For example internet radios from: Medion, Hama, Auna, ...*/
class Fsapi {
    constructor(fsapi_device_url, pin, timeout = DEFAULT_TIMEOUT_IN_SECONDS) {
        this.pin = pin;
        this.sid = null;
        this.webfsapi = null;
        this.fsapi_device_url = fsapi_device_url;
        this.timeout = timeout;
        this.DEFAULT_TIMEOUT_IN_SECONDS= 1, 
        this.PLAY_STATES= {
          "0": "stopped",
          "1": "unknown",
          "2": "playing",
          "3": "paused"
        }
    }
    async init(){
        this.webfsapi = await this.get_fsapi_endpoint()
        this.sid = await this.create_session()
    }

    async get_fsapi_endpoint() {
       try { 
          var self = this
          var doc, endpoint;
          let response = await fetch(this.fsapi_device_url)
          let str = await response.text()
          let data = await convert.xml2js(str, {compact: true, spaces: 4});
          return data.netRemote.webfsapi._text
          } catch (error) {
            if (error) {
                return error.message
            }
         }
      }
    async create_session() {
        let session = await this.call("CREATE_SESSION")
        return session.sessionId._text

        //return doc.sessionId.text;
    }
    create_query_params(params) {
      var esc = encodeURIComponent;
      var query = Object.keys(params)
        .map(k => `${esc(k)}=${esc(params[k])}`)
        .join('&');
      return query
    }
    async call(path, params = {}) {
        /* Execute a frontier silicon API call. */
        if (this.pin){params.pin = this.pin}
        if (this.sid){params.sid = this.sid}

        try {
          var query_params = this.create_query_params(params);
          let response = await fetch(`${this.webfsapi}/${path}?${query_params}`)
          let str = await response.text()
          let data = await convert.xml2js(str, {compact: true, spaces: 4});
          return data.fsapiResponse
          } catch (error) {
          if (error) {
              return error.message
          }
      }
    }
    async disconnect() {
        var doc = await this.call("DELETE_SESSION");
        return (doc.status._text === "FS_OK");
    }
    async handle_get(item) {
        return await this.call(`GET/${item}`);
    }
    async handle_set(item, value) {
        var doc = await this.call(`SET/${item}`, {"value": value});
        return (doc.status._text === "FS_OK");
    }
    async handle_text(item) {
        var doc = await this.handle_get(item);
        return await doc.value.c8_array._text;
    }
    async handle_int(item) {
        var doc = await this.handle_get(item);
        return await Number.parseInt(doc.value.u8._text);
    }
    async handle_long(item) {
        var doc = await this.handle_get(item);
        return Number.parseInt(doc.value.u32._text);
    }
    async handle_list(item) {
        var response = await this.call(`LIST_GET_NEXT/${item}/-1`, {"maxItems": 100})
        return response.item.map(i=>i.field[2].c8_array._text)
    }
    async get_play_status() {
        var status = await this.handle_int("netRemote.play.status");
        return this.PLAY_STATES[status];
    }
    async get_play_info_name() {
        return await this.handle_text("netRemote.play.info.name");
    }
    async get_play_info_text() {
        return await this.handle_text("netRemote.play.info.text");
    }
    async get_play_info_artist() {
        return await this.handle_text("netRemote.play.info.artist");
    }
    async get_play_info_album() {
        return await this.handle_text("netRemote.play.info.album");
    }
    async get_play_info_graphics() {
        return await this.handle_text("netRemote.play.info.graphicUri");
    }
    async get_volume_steps() {
        return await this.handle_int("netRemote.sys.caps.volumeSteps");
    }
    async play_control(value) {
        return await this.handle_set("netRemote.play.control", value);
    }
   async  play() {
        return await this.play_control(1);
    }
    async pause() {
        return await this.play_control(2);
    }
    async forward() {
        return await this.play_control(3);
    }
    async rewind() {
        return await this.play_control(4);
    }
    async get_volume() {
        return await this.handle_int("netRemote.sys.audio.volume");
    }
    async set_volume(value) {
        return await this.handle_set("netRemote.sys.audio.volume", value);
    }
    async get_friendly_name() {
        return await this.handle_text("netRemote.sys.info.friendlyName");
    }
    async set_friendly_name(value) {
        return await this.handle_set("netRemote.sys.info.friendlyName", value);
    }
    async get_mute() {
        return await this.handle_int("netRemote.sys.audio.mute");
    }
    async set_mute(value = false) {
        return await this.handle_set("netRemote.sys.audio.mute", Number.parseInt(value));
    }
    async get_power() {
        return await this.handle_int("netRemote.sys.power");
    }
    async set_power(value = false) {
        return await this.handle_set("netRemote.sys.power", Number.parseInt(value));
    }
    async get_modes() {
        return await this.handle_list("netRemote.sys.caps.validModes");
    }
    async get_mode_list() {
        this.modes = await this.get_modes()
        return await this.get_modes()
    }
    async get_mode() {
        var int_mode = await this.handle_long("netRemote.sys.mode");
        return this.modes[int_mode]
        }
    async set_mode(mode) {
        if (mode >= 0 && mode < this.modes.length)
        return await this.handle_set("netRemote.sys.mode", mode);
    }
    async get_duration() {
        return await this.handle_long("netRemote.play.info.duration");
    }
}
module.exports = Fsapi;
