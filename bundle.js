(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
    'use strict'

    function pageLoad() {

        // Check the current part of Mbot
        let noBluetooth = document.getElementById("noBluetooth");
        let stepConnect = document.getElementById("stepConnect");
        let stepControl = document.getElementById("stepControl");
        // Check if the bluetooth is available
        if (navigator.bluetooth == undefined) {
            console.error("No navigator.bluetooth found.");
            stepConnect.style.display = "none";
            noBluetooth.style.display = "flex";
        } else {
            // Display the connect button
            stepConnect.style.display = "flex";
            noBluetooth.style.display = "none";
            let ollie = require("./ollie/ollie");

            // Check the connection
            document.getElementById("connectBtn").addEventListener('click', _ => {
                // Request the device
                ollie.request()
                    .then(_ => {
                        // Connect to the ollie
                        return ollie.connect()
                        .then(()=>{
                            return ollie.init()
                        });
                    })
                    .then(_ => {
                        // Connection is done, we show the controls
                        stepConnect.style.display = "none";
                        stepControl.style.display = "flex";
                        
                        let Joystick = require('./components/joystick.js');		
                        new Joystick('joystick', (data) => {
                           //console.log(data.angle);
                           ollie.processMotor(data.angle, data.power);
                        });		
                        let partJoystick = document.querySelector('.part-joystick');
                        let partBtn = document.querySelector('.part-button');
                        let switchParts = document.getElementById('switchParts');		 +                        
                         // Switch between button and joystick		
                         switchParts.addEventListener('click', function(evt) {		
                             if (this.checked) {		
                                 partBtn.style.display = 'none';		
                                 partJoystick.style.display = '';		
                             } else {		
                                 partBtn.style.display = '';		
                                 partJoystick.style.display = 'none';		
                             }		
                         });
                        
                        // Control the robot by buttons
                        let btnUp = document.getElementById('btnUp');
                        let btnDown = document.getElementById('btnDown');
                        let btnLeft = document.getElementById('btnLeft');
                        let btnRight = document.getElementById('btnRight');

                        btnUp.addEventListener('touchstart', _ => { ollie.processMotor(0,50) });
                        btnDown.addEventListener('touchstart', _ => { ollie.processMotor(180,50) });
                        btnLeft.addEventListener('touchstart', _ => { ollie.processMotor(270,50) });
                        btnRight.addEventListener('touchstart', _ => { ollie.processMotor(90,50) });

                        btnUp.addEventListener('touchend', _ => { ollie.processMotor(0, 0) });
                        btnDown.addEventListener('touchend', _ => { ollie.processMotor(180, 0) });
                        btnLeft.addEventListener('touchend', _ => { ollie.processMotor(270, 0) });
                        btnRight.addEventListener('touchend', _ => { ollie.processMotor(90, 0) });
                        
                        // Tricks with the robot
                        document.getElementById('btnTrick1').addEventListener('click', _=>{ 
                            ollie.processSpin(ollie.Motors.forward, ollie.Motors.reverse)
                        });
                        document.getElementById('btnTrick2').addEventListener('click', _=>{ 
                            ollie.processSpin(ollie.Motors.reverse, ollie.Motors.forward)
                        });
                        document.getElementById('btnTrick3').addEventListener('click', _=>{ 
                            ollie.processSpin(ollie.Motors.forward, ollie.Motors.forward)
                        });
                        document.getElementById('btnTrick4').addEventListener('click', _=>{ 
                            ollie.processSpin(ollie.Motors.reverse, ollie.Motors.reverse)
                        });

                        // Color the robot
                        let ColorPicker = require('./components/colorpicker.js');
                        new ColorPicker((rgb) => {
                            ollie.processColor(rgb.red, rgb.blue, rgb.green);
                        });
                    })
            });



        }

    }



    window.addEventListener('load', pageLoad);

    /*if ('serviceWorker' in navigator) {        
        navigator.serviceWorker.register('./service-worker.js', {scope : location.pathname}).then(function(reg) {
            console.log('Service Worker Register for scope : %s',reg.scope);
        });
    }*/

})();
},{"./components/colorpicker.js":2,"./components/joystick.js":3,"./ollie/ollie":4}],2:[function(require,module,exports){

class ColorPicker {
    constructor(callback) {
        this.img = new Image();
        this.img.src = './assets/images/color-wheel.png';
        this.callback = callback;
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
        this.img.onload = this._load.bind(this);
    }


    _load() {
        
        this.canvas.width = 150 * devicePixelRatio;
        this.canvas.height = 150 * devicePixelRatio;
        this.canvas.style.width = "150px";
        this.canvas.style.height = "150px";
        this.canvas.addEventListener('click', this._calculateRgb.bind(this));

        this.context.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
    }


    _calculateRgb(evt) {
        // Refresh canvas in case user zooms and devicePixelRatio changes.
        this.canvas.width = 150 * devicePixelRatio;
        this.canvas.height = 150 * devicePixelRatio;
        this.context.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);

        let rect = this.canvas.getBoundingClientRect();
        let x = Math.round((evt.clientX - rect.left) * devicePixelRatio);
        let y = Math.round((evt.clientY - rect.top) * devicePixelRatio);
        let data = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height).data;

        let r = data[((this.canvas.width * y) + x) * 4];
        let g = data[((this.canvas.width * y) + x) * 4 + 1];
        let b = data[((this.canvas.width * y) + x) * 4 + 2];

        this.callback({
            red: r,
            blue: b,
            green: g
        });


        this.context.beginPath();
        this.context.arc(x, y + 2, 10 * devicePixelRatio, 0, 2 * Math.PI, false);
        this.context.shadowColor = '#333';
        this.context.shadowBlur = 4 * devicePixelRatio;
        this.context.fillStyle = 'white';
        this.context.fill();
    }


}

module.exports = ColorPicker;
},{}],3:[function(require,module,exports){
class Joystick {

    constructor(id, callback) {
        this.joystick = nipplejs.create({
            zone: document.getElementById(id),
            mode: 'static',
            position: {
                left: '50%',
                top: '50%'
            },
            size: 200,
            color: '#c10435'
        });
        this.callback = callback;

        /*function LogF(evt, data){
            console.log(evt,data);
        }
        this.joystick.on('move', LogF);
        this.joystick.on('start', LogF);
        this.joystick.on('dir', LogF);
        this.joystick.on('plain', LogF);
        this.joystick.on('shown', LogF);
        this.joystick.on('hidden', LogF);
        this.joystick.on('destroy', LogF);
        this.joystick.on('pressure', LogF);
        this.joystick.on('end', LogF);*/

        this.joystick.on('move', this._move.bind(this));
        this.joystick.on('end', this._end.bind(this));
        this.lastPower = 0;
        this.lastAngle = 0;
    }

    _move(evt, data) {        
        if (data.angle) {            
            let power = Math.round((data.distance / 100) * 100);
            let angle = data.angle.degree;
            if (power != this.lastPower
            || angle != this.lastAngle) {
                this.lastPower = power;   
                this.lastAngle = angle;
                this.callback({
                    angle : Math.abs(360 - ((this.lastAngle + 270) % 360)),
                    power : this.lastPower
                });
            }
        }
        

    }

    _end(evt, data) {
        this.lastPower = 0;
        this.callback({
            angle: this.lastAngle,
            power: 0
        });
    }

}

module.exports = Joystick;
},{}],4:[function(require,module,exports){
'use strict'

/**
 * General configuration (UUID)
*/
class Config {

    constructor() {
    }
    
    radioService() { return "22bb746f-2bb0-7554-2d6f-726568705327" }
    robotService() { return "22bb746f-2ba0-7554-2d6f-726568705327" }
    controlCharacteristic() { return "22bb746f-2ba1-7554-2d6f-726568705327" }
    antiDOSCharateristic() { return "22bb746f-2bbd-7554-2d6f-726568705327" }
    powerCharateristic() { return "22bb746f-2bb2-7554-2d6f-726568705327" }
    wakeUpCPUCharateristic() { return "22bb746f-2bbf-7554-2d6f-726568705327" }
}

    

/**
 * Class for the robot
 * */
class Ollie {
    constructor() {
        this.device = null;
        this.config = new Config();
        this.onDisconnected = this.onDisconnected.bind(this);
        this.buzzerIndex = 0;
        this.sequence = 0;
        this.busy = false;
        this.Motors = {
            off : 0x00,
            forward : 0x01,
            reverse : 0x02,
            brake : 0x03,
            ignore : 0x04
        }
    }

    /*
    Request the device with bluetooth
    */
    request() {
        let options = {
            "filters": [{
                "services": [this.config.radioService()]
            },{
                "services": [this.config.robotService()]
            }],
            "optionalServices": [this.config.radioService(), this.config.robotService()]
        };        
        return navigator.bluetooth.requestDevice(options)
            .then(device => {
                this.device = device;
                this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
                return device;
            });
    }

    /**
     * Connect to the device
     * */
    connect() {
        if (!this.device) {
            return Promise.reject('Device is not connected.');
        } else {
            return this.device.gatt.connect();
        }
    }
    
    init(){
        if(!this.device){
            return Promise.reject('Device is not connected.');
        }else{
            
            return this._writeCharacteristic(this.config.radioService(), 
                    this.config.antiDOSCharateristic(),
                    new Uint8Array('011i3'.split('').map(c => c.charCodeAt())))
            .then(()=>{
                 console.log('> Found Anti DOS characteristic');
                 return this._writeCharacteristic(this.config.radioService(), 
                    this.config.powerCharateristic(),
                    new Uint8Array([0x07]))
            })
            .then(()=>{
                  console.log('> Found TX Power characteristic');
                  return this._writeCharacteristic(this.config.radioService(), 
                    this.config.wakeUpCPUCharateristic(),
                    new Uint8Array([0x01]))
            })
            .then(()=>{                
                console.log('Wake CPU write done.');             
                //Set rgbLed to 0
                let color = 0x01;
                color &= 0xFF;
                return this._sendCommand(0x02, 0x20, new Uint8Array([color]))
            })
            .then(() => {
                console.log('Rgb Led set to 0');
                // set BackLed to 127
                return this._sendCommand(0x02, 0x21, new Uint8Array([127]));
            })
            .then(()=>{
                console.log('Back Led set to 127');
                // set stabilisation to 0
                let flag = 0;
                flag &= 0x01;
                return this._sendCommand(0x02, 0x02, new Uint8Array([flag]));
            })
            .then(()=>{
                console.log('Stabilisation set to 0');
                // Set heading to 0
                let heading = 0;
                return this._sendCommand(0x02, 0x01, new Uint8Array([heading >> 8, heading & 0xFF]));
            })
            .then(()=>{
                console.log('Heading set to 0, device is ready !');
            })
            .catch(error => {
                console.error(error);
            })
        }
    }

    /**
     * Control the motors of robot
    */
    processMotor(heading, power) {
        console.log(`Roll heading=${heading}, power=${power}`);
        if (this.busy) {
            console.warn('ollie is busy');
            // Return if another operation pending
            return Promise.reject();
        }
        this.busy = true;
        let did = 0x02; // Virtual device ID
        let cid = 0x30; // Roll command
        // Roll command data: speed, heading (MSB), heading (LSB), state
        let data = new Uint8Array([power, heading >> 8, heading & 0xFF, 1]);

        return this._sendCommand(did, cid, data).then(() => {
            console.info(`busy : ${this.busy}`);
            this.busy = false;
            return Promise.resolve();
        })
        .catch((error)=>{
            this.busy = false;
            console.error(error);
        });
        
        

    }

    processColor(red,blue,green){
        console.log('Set color: r='+red+',g='+green+',b='+blue);
        if (this.busy) {
            console.warn('ollie is busy');
            // Return if another operation pending
            return Promise.reject();
        }
        this.busy = true;
        let did = 0x02; // Virtual device ID
        let cid = 0x20; // Set RGB LED Output command
        // Color command data: red, green, blue, flag
        let data = new Uint8Array([red, green, blue, 0]);

        return this._sendCommand(did, cid, data).then(() => {
            console.log("color set ! ");
            this.busy = false;
            return Promise.resolve();
        })
        .catch((error)=>{
            this.busy = false;
            console.error(error);
        });
    }
    
    processSpin(lmotor, rmotor){
        console.log('Spin');
        if (this.busy){
            console.warn('ollie is busy');
            return Promise.reject();
        }
        this.busy = true;
        let did = 0x02; //Virtual device ID
        let cid = 0x33; // Set raw Motors command
        
              
        let lmode = lmotor & 0x07;
        let lpower = 200 & 0xFF;
        let rmode = rmotor & 0x07;
        let rpower = 200 & 0xFF;
        
        let data = new Uint8Array([lmode, lpower, rmode, rpower]);

        return this._sendCommand(did, cid, data).then(() => {
            return new Promise((resolve, reject)=>{
                setTimeout(()=> {
                    let lmode = this.Motors.off & 0x07;
                    let lpower = 200;
                    let rmode = this.Motors.off & 0x07;
                    let rpower = 200;
                    
                    let data = new Uint8Array([lmode, lpower, rmode, rpower]);

                    this._sendCommand(did, cid, data).then(() => {
                        this.busy = false;
                        resolve();
                    })
                    .catch((error)=>{
                        this.busy = false;
                        console.error(error);
                        reject(error);
                    }); 
                }, 2000);    
            });
                
        })
        .catch((error)=>{
            console.error(error);
        });
        
        
        
    }

    disconnect() {
        if (!this.device) {
            return Promise.reject('Device is not connected.');
        } else {
            return this.device.gatt.disconnect();
        }
    }

    onDisconnected() {
        console.log('Device is disconnected.');
    }
    
    _intToHexArray(value, numBytes) {
        var hexArray = new Array(numBytes);

        for (var i = numBytes - 1; i >= 0; i--) {
            hexArray[i] = value & 0xFF;
            value >>= 8;
        }

        return hexArray;
     };


    _sendCommand(did, cid, data) {
        // Create client command packets
        // API docs: https://github.com/orbotix/DeveloperResources/blob/master/docs/Sphero_API_1.50.pdf
        // Next sequence number
        let seq = this.sequence & 255;
        this.sequence += 1;
        // Start of packet #2
        let sop2 = 0xfc;
        sop2 |= 1; // Answer
        sop2 |= 2; // Reset timeout
        // Data length
        let dlen = data.byteLength + 1;
        let sum = data.reduce((a, b) => {
        return a + b;
        });
        // Checksum
        let chk = (sum + did + cid + seq + dlen) & 255;
        chk ^= 255;
        let checksum = new Uint8Array([chk]);

        let packets = new Uint8Array([0xff, sop2, did, cid, seq, dlen]);
        // Append arrays: packet + data + checksum
        let array = new Uint8Array(packets.byteLength + data.byteLength + checksum.byteLength);
        array.set(packets, 0);
        array.set(data, packets.byteLength);
        array.set(checksum, packets.byteLength + data.byteLength);
        return this._writeCharacteristic(this.config.robotService(), this.config.controlCharacteristic(), array);          
    }


  

    _writeCharacteristic(serviceUID, characteristicUID, value) {
        return this.device.gatt.getPrimaryService(serviceUID)
            .then(service => service.getCharacteristic(characteristicUID))
            .then(characteristic => characteristic.writeValue(value));
    }


}


let ollie = new Ollie();

module.exports = ollie;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzY3JpcHRzL2FwcC5qcyIsInNjcmlwdHMvY29tcG9uZW50cy9jb2xvcnBpY2tlci5qcyIsInNjcmlwdHMvY29tcG9uZW50cy9qb3lzdGljay5qcyIsInNjcmlwdHMvb2xsaWUvb2xsaWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0J1xuXG4gICAgZnVuY3Rpb24gcGFnZUxvYWQoKSB7XG5cbiAgICAgICAgLy8gQ2hlY2sgdGhlIGN1cnJlbnQgcGFydCBvZiBNYm90XG4gICAgICAgIGxldCBub0JsdWV0b290aCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibm9CbHVldG9vdGhcIik7XG4gICAgICAgIGxldCBzdGVwQ29ubmVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RlcENvbm5lY3RcIik7XG4gICAgICAgIGxldCBzdGVwQ29udHJvbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RlcENvbnRyb2xcIik7XG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSBibHVldG9vdGggaXMgYXZhaWxhYmxlXG4gICAgICAgIGlmIChuYXZpZ2F0b3IuYmx1ZXRvb3RoID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIk5vIG5hdmlnYXRvci5ibHVldG9vdGggZm91bmQuXCIpO1xuICAgICAgICAgICAgc3RlcENvbm5lY3Quc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgbm9CbHVldG9vdGguc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gRGlzcGxheSB0aGUgY29ubmVjdCBidXR0b25cbiAgICAgICAgICAgIHN0ZXBDb25uZWN0LnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgICAgIG5vQmx1ZXRvb3RoLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIGxldCBvbGxpZSA9IHJlcXVpcmUoXCIuL29sbGllL29sbGllXCIpO1xuXG4gICAgICAgICAgICAvLyBDaGVjayB0aGUgY29ubmVjdGlvblxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25uZWN0QnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXyA9PiB7XG4gICAgICAgICAgICAgICAgLy8gUmVxdWVzdCB0aGUgZGV2aWNlXG4gICAgICAgICAgICAgICAgb2xsaWUucmVxdWVzdCgpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKF8gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29ubmVjdCB0byB0aGUgb2xsaWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvbGxpZS5jb25uZWN0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9sbGllLmluaXQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKF8gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29ubmVjdGlvbiBpcyBkb25lLCB3ZSBzaG93IHRoZSBjb250cm9sc1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RlcENvbm5lY3Quc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RlcENvbnRyb2wuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgSm95c3RpY2sgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvam95c3RpY2suanMnKTtcdFx0XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgSm95c3RpY2soJ2pveXN0aWNrJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZGF0YS5hbmdsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBvbGxpZS5wcm9jZXNzTW90b3IoZGF0YS5hbmdsZSwgZGF0YS5wb3dlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcdFx0XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFydEpveXN0aWNrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBhcnQtam95c3RpY2snKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBhcnQtYnV0dG9uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3dpdGNoUGFydHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3dpdGNoUGFydHMnKTtcdFx0ICsgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTd2l0Y2ggYmV0d2VlbiBidXR0b24gYW5kIGpveXN0aWNrXHRcdFxuICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaFBhcnRzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZ0KSB7XHRcdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja2VkKSB7XHRcdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydEJ0bi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1x0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRKb3lzdGljay5zdHlsZS5kaXNwbGF5ID0gJyc7XHRcdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1x0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRCdG4uc3R5bGUuZGlzcGxheSA9ICcnO1x0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRKb3lzdGljay5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1x0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVx0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udHJvbCB0aGUgcm9ib3QgYnkgYnV0dG9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJ0blVwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0blVwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYnRuRG93biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5Eb3duJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYnRuTGVmdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5MZWZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYnRuUmlnaHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuUmlnaHQnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYnRuVXAuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIF8gPT4geyBvbGxpZS5wcm9jZXNzTW90b3IoMCw1MCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidG5Eb3duLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBfID0+IHsgb2xsaWUucHJvY2Vzc01vdG9yKDE4MCw1MCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidG5MZWZ0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBfID0+IHsgb2xsaWUucHJvY2Vzc01vdG9yKDI3MCw1MCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidG5SaWdodC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3Rvcig5MCw1MCkgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJ0blVwLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3RvcigwLCAwKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ0bkRvd24uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBfID0+IHsgb2xsaWUucHJvY2Vzc01vdG9yKDE4MCwgMCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidG5MZWZ0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3RvcigyNzAsIDApIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnRuUmlnaHQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBfID0+IHsgb2xsaWUucHJvY2Vzc01vdG9yKDkwLCAwKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHJpY2tzIHdpdGggdGhlIHJvYm90XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuVHJpY2sxJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfPT57IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sbGllLnByb2Nlc3NTcGluKG9sbGllLk1vdG9ycy5mb3J3YXJkLCBvbGxpZS5Nb3RvcnMucmV2ZXJzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0blRyaWNrMicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXz0+eyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGxpZS5wcm9jZXNzU3BpbihvbGxpZS5Nb3RvcnMucmV2ZXJzZSwgb2xsaWUuTW90b3JzLmZvcndhcmQpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5UcmljazMnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIF89PnsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xsaWUucHJvY2Vzc1NwaW4ob2xsaWUuTW90b3JzLmZvcndhcmQsIG9sbGllLk1vdG9ycy5mb3J3YXJkKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuVHJpY2s0JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfPT57IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sbGllLnByb2Nlc3NTcGluKG9sbGllLk1vdG9ycy5yZXZlcnNlLCBvbGxpZS5Nb3RvcnMucmV2ZXJzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb2xvciB0aGUgcm9ib3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBDb2xvclBpY2tlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9jb2xvcnBpY2tlci5qcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IENvbG9yUGlja2VyKChyZ2IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGxpZS5wcm9jZXNzQ29sb3IocmdiLnJlZCwgcmdiLmJsdWUsIHJnYi5ncmVlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pO1xuXG5cblxuICAgICAgICB9XG5cbiAgICB9XG5cblxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBwYWdlTG9hZCk7XG5cbiAgICAvKmlmICgnc2VydmljZVdvcmtlcicgaW4gbmF2aWdhdG9yKSB7ICAgICAgICBcbiAgICAgICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJy4vc2VydmljZS13b3JrZXIuanMnLCB7c2NvcGUgOiBsb2NhdGlvbi5wYXRobmFtZX0pLnRoZW4oZnVuY3Rpb24ocmVnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU2VydmljZSBXb3JrZXIgUmVnaXN0ZXIgZm9yIHNjb3BlIDogJXMnLHJlZy5zY29wZSk7XG4gICAgICAgIH0pO1xuICAgIH0qL1xuXG59KSgpOyIsIlxuY2xhc3MgQ29sb3JQaWNrZXIge1xuICAgIGNvbnN0cnVjdG9yKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHRoaXMuaW1nLnNyYyA9ICcuL2Fzc2V0cy9pbWFnZXMvY29sb3Itd2hlZWwucG5nJztcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB0aGlzLmltZy5vbmxvYWQgPSB0aGlzLl9sb2FkLmJpbmQodGhpcyk7XG4gICAgfVxuXG5cbiAgICBfbG9hZCgpIHtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gMTUwICogZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gMTUwICogZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUud2lkdGggPSBcIjE1MHB4XCI7XG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCA9IFwiMTUwcHhcIjtcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9jYWxjdWxhdGVSZ2IuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgfVxuXG5cbiAgICBfY2FsY3VsYXRlUmdiKGV2dCkge1xuICAgICAgICAvLyBSZWZyZXNoIGNhbnZhcyBpbiBjYXNlIHVzZXIgem9vbXMgYW5kIGRldmljZVBpeGVsUmF0aW8gY2hhbmdlcy5cbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSAxNTAgKiBkZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSAxNTAgKiBkZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgICB0aGlzLmNvbnRleHQuZHJhd0ltYWdlKHRoaXMuaW1nLCAwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgeCA9IE1hdGgucm91bmQoKGV2dC5jbGllbnRYIC0gcmVjdC5sZWZ0KSAqIGRldmljZVBpeGVsUmF0aW8pO1xuICAgICAgICBsZXQgeSA9IE1hdGgucm91bmQoKGV2dC5jbGllbnRZIC0gcmVjdC50b3ApICogZGV2aWNlUGl4ZWxSYXRpbyk7XG4gICAgICAgIGxldCBkYXRhID0gdGhpcy5jb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KS5kYXRhO1xuXG4gICAgICAgIGxldCByID0gZGF0YVsoKHRoaXMuY2FudmFzLndpZHRoICogeSkgKyB4KSAqIDRdO1xuICAgICAgICBsZXQgZyA9IGRhdGFbKCh0aGlzLmNhbnZhcy53aWR0aCAqIHkpICsgeCkgKiA0ICsgMV07XG4gICAgICAgIGxldCBiID0gZGF0YVsoKHRoaXMuY2FudmFzLndpZHRoICogeSkgKyB4KSAqIDQgKyAyXTtcblxuICAgICAgICB0aGlzLmNhbGxiYWNrKHtcbiAgICAgICAgICAgIHJlZDogcixcbiAgICAgICAgICAgIGJsdWU6IGIsXG4gICAgICAgICAgICBncmVlbjogZ1xuICAgICAgICB9KTtcblxuXG4gICAgICAgIHRoaXMuY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5jb250ZXh0LmFyYyh4LCB5ICsgMiwgMTAgKiBkZXZpY2VQaXhlbFJhdGlvLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgICAgICB0aGlzLmNvbnRleHQuc2hhZG93Q29sb3IgPSAnIzMzMyc7XG4gICAgICAgIHRoaXMuY29udGV4dC5zaGFkb3dCbHVyID0gNCAqIGRldmljZVBpeGVsUmF0aW87XG4gICAgICAgIHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgICAgICB0aGlzLmNvbnRleHQuZmlsbCgpO1xuICAgIH1cblxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sb3JQaWNrZXI7IiwiY2xhc3MgSm95c3RpY2sge1xuXG4gICAgY29uc3RydWN0b3IoaWQsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2sgPSBuaXBwbGVqcy5jcmVhdGUoe1xuICAgICAgICAgICAgem9uZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpLFxuICAgICAgICAgICAgbW9kZTogJ3N0YXRpYycsXG4gICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIGxlZnQ6ICc1MCUnLFxuICAgICAgICAgICAgICAgIHRvcDogJzUwJSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaXplOiAyMDAsXG4gICAgICAgICAgICBjb2xvcjogJyNjMTA0MzUnXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAgICAgLypmdW5jdGlvbiBMb2dGKGV2dCwgZGF0YSl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhldnQsZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignbW92ZScsIExvZ0YpO1xuICAgICAgICB0aGlzLmpveXN0aWNrLm9uKCdzdGFydCcsIExvZ0YpO1xuICAgICAgICB0aGlzLmpveXN0aWNrLm9uKCdkaXInLCBMb2dGKTtcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbigncGxhaW4nLCBMb2dGKTtcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignc2hvd24nLCBMb2dGKTtcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignaGlkZGVuJywgTG9nRik7XG4gICAgICAgIHRoaXMuam95c3RpY2sub24oJ2Rlc3Ryb3knLCBMb2dGKTtcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbigncHJlc3N1cmUnLCBMb2dGKTtcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignZW5kJywgTG9nRik7Ki9cblxuICAgICAgICB0aGlzLmpveXN0aWNrLm9uKCdtb3ZlJywgdGhpcy5fbW92ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignZW5kJywgdGhpcy5fZW5kLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLmxhc3RQb3dlciA9IDA7XG4gICAgICAgIHRoaXMubGFzdEFuZ2xlID0gMDtcbiAgICB9XG5cbiAgICBfbW92ZShldnQsIGRhdGEpIHsgICAgICAgIFxuICAgICAgICBpZiAoZGF0YS5hbmdsZSkgeyAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHBvd2VyID0gTWF0aC5yb3VuZCgoZGF0YS5kaXN0YW5jZSAvIDEwMCkgKiAxMDApO1xuICAgICAgICAgICAgbGV0IGFuZ2xlID0gZGF0YS5hbmdsZS5kZWdyZWU7XG4gICAgICAgICAgICBpZiAocG93ZXIgIT0gdGhpcy5sYXN0UG93ZXJcbiAgICAgICAgICAgIHx8IGFuZ2xlICE9IHRoaXMubGFzdEFuZ2xlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0UG93ZXIgPSBwb3dlcjsgICBcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RBbmdsZSA9IGFuZ2xlO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2soe1xuICAgICAgICAgICAgICAgICAgICBhbmdsZSA6IE1hdGguYWJzKDM2MCAtICgodGhpcy5sYXN0QW5nbGUgKyAyNzApICUgMzYwKSksXG4gICAgICAgICAgICAgICAgICAgIHBvd2VyIDogdGhpcy5sYXN0UG93ZXJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcblxuICAgIH1cblxuICAgIF9lbmQoZXZ0LCBkYXRhKSB7XG4gICAgICAgIHRoaXMubGFzdFBvd2VyID0gMDtcbiAgICAgICAgdGhpcy5jYWxsYmFjayh7XG4gICAgICAgICAgICBhbmdsZTogdGhpcy5sYXN0QW5nbGUsXG4gICAgICAgICAgICBwb3dlcjogMFxuICAgICAgICB9KTtcbiAgICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBKb3lzdGljazsiLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBHZW5lcmFsIGNvbmZpZ3VyYXRpb24gKFVVSUQpXG4qL1xuY2xhc3MgQ29uZmlnIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgIH1cbiAgICBcbiAgICByYWRpb1NlcnZpY2UoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYjAtNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cbiAgICByb2JvdFNlcnZpY2UoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYTAtNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cbiAgICBjb250cm9sQ2hhcmFjdGVyaXN0aWMoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYTEtNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cbiAgICBhbnRpRE9TQ2hhcmF0ZXJpc3RpYygpIHsgcmV0dXJuIFwiMjJiYjc0NmYtMmJiZC03NTU0LTJkNmYtNzI2NTY4NzA1MzI3XCIgfVxuICAgIHBvd2VyQ2hhcmF0ZXJpc3RpYygpIHsgcmV0dXJuIFwiMjJiYjc0NmYtMmJiMi03NTU0LTJkNmYtNzI2NTY4NzA1MzI3XCIgfVxuICAgIHdha2VVcENQVUNoYXJhdGVyaXN0aWMoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYmYtNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cbn1cblxuICAgIFxuXG4vKipcbiAqIENsYXNzIGZvciB0aGUgcm9ib3RcbiAqICovXG5jbGFzcyBPbGxpZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZGV2aWNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5jb25maWcgPSBuZXcgQ29uZmlnKCk7XG4gICAgICAgIHRoaXMub25EaXNjb25uZWN0ZWQgPSB0aGlzLm9uRGlzY29ubmVjdGVkLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnV6emVySW5kZXggPSAwO1xuICAgICAgICB0aGlzLnNlcXVlbmNlID0gMDtcbiAgICAgICAgdGhpcy5idXN5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuTW90b3JzID0ge1xuICAgICAgICAgICAgb2ZmIDogMHgwMCxcbiAgICAgICAgICAgIGZvcndhcmQgOiAweDAxLFxuICAgICAgICAgICAgcmV2ZXJzZSA6IDB4MDIsXG4gICAgICAgICAgICBicmFrZSA6IDB4MDMsXG4gICAgICAgICAgICBpZ25vcmUgOiAweDA0XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgIFJlcXVlc3QgdGhlIGRldmljZSB3aXRoIGJsdWV0b290aFxuICAgICovXG4gICAgcmVxdWVzdCgpIHtcbiAgICAgICAgbGV0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICBcImZpbHRlcnNcIjogW3tcbiAgICAgICAgICAgICAgICBcInNlcnZpY2VzXCI6IFt0aGlzLmNvbmZpZy5yYWRpb1NlcnZpY2UoKV1cbiAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgIFwic2VydmljZXNcIjogW3RoaXMuY29uZmlnLnJvYm90U2VydmljZSgpXVxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBcIm9wdGlvbmFsU2VydmljZXNcIjogW3RoaXMuY29uZmlnLnJhZGlvU2VydmljZSgpLCB0aGlzLmNvbmZpZy5yb2JvdFNlcnZpY2UoKV1cbiAgICAgICAgfTsgICAgICAgIFxuICAgICAgICByZXR1cm4gbmF2aWdhdG9yLmJsdWV0b290aC5yZXF1ZXN0RGV2aWNlKG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihkZXZpY2UgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZGV2aWNlID0gZGV2aWNlO1xuICAgICAgICAgICAgICAgIHRoaXMuZGV2aWNlLmFkZEV2ZW50TGlzdGVuZXIoJ2dhdHRzZXJ2ZXJkaXNjb25uZWN0ZWQnLCB0aGlzLm9uRGlzY29ubmVjdGVkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGV2aWNlO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29ubmVjdCB0byB0aGUgZGV2aWNlXG4gICAgICogKi9cbiAgICBjb25uZWN0KCkge1xuICAgICAgICBpZiAoIXRoaXMuZGV2aWNlKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ0RldmljZSBpcyBub3QgY29ubmVjdGVkLicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlLmdhdHQuY29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGluaXQoKXtcbiAgICAgICAgaWYoIXRoaXMuZGV2aWNlKXtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnRGV2aWNlIGlzIG5vdCBjb25uZWN0ZWQuJyk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd3JpdGVDaGFyYWN0ZXJpc3RpYyh0aGlzLmNvbmZpZy5yYWRpb1NlcnZpY2UoKSwgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmFudGlET1NDaGFyYXRlcmlzdGljKCksXG4gICAgICAgICAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KCcwMTFpMycuc3BsaXQoJycpLm1hcChjID0+IGMuY2hhckNvZGVBdCgpKSkpXG4gICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnPiBGb3VuZCBBbnRpIERPUyBjaGFyYWN0ZXJpc3RpYycpO1xuICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fd3JpdGVDaGFyYWN0ZXJpc3RpYyh0aGlzLmNvbmZpZy5yYWRpb1NlcnZpY2UoKSwgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLnBvd2VyQ2hhcmF0ZXJpc3RpYygpLFxuICAgICAgICAgICAgICAgICAgICBuZXcgVWludDhBcnJheShbMHgwN10pKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpPT57XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnPiBGb3VuZCBUWCBQb3dlciBjaGFyYWN0ZXJpc3RpYycpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dyaXRlQ2hhcmFjdGVyaXN0aWModGhpcy5jb25maWcucmFkaW9TZXJ2aWNlKCksIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy53YWtlVXBDUFVDaGFyYXRlcmlzdGljKCksXG4gICAgICAgICAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KFsweDAxXSkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCk9PnsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dha2UgQ1BVIHdyaXRlIGRvbmUuJyk7ICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vU2V0IHJnYkxlZCB0byAwXG4gICAgICAgICAgICAgICAgbGV0IGNvbG9yID0gMHgwMTtcbiAgICAgICAgICAgICAgICBjb2xvciAmPSAweEZGO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZW5kQ29tbWFuZCgweDAyLCAweDIwLCBuZXcgVWludDhBcnJheShbY29sb3JdKSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1JnYiBMZWQgc2V0IHRvIDAnKTtcbiAgICAgICAgICAgICAgICAvLyBzZXQgQmFja0xlZCB0byAxMjdcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc2VuZENvbW1hbmQoMHgwMiwgMHgyMSwgbmV3IFVpbnQ4QXJyYXkoWzEyN10pKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCYWNrIExlZCBzZXQgdG8gMTI3Jyk7XG4gICAgICAgICAgICAgICAgLy8gc2V0IHN0YWJpbGlzYXRpb24gdG8gMFxuICAgICAgICAgICAgICAgIGxldCBmbGFnID0gMDtcbiAgICAgICAgICAgICAgICBmbGFnICY9IDB4MDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmRDb21tYW5kKDB4MDIsIDB4MDIsIG5ldyBVaW50OEFycmF5KFtmbGFnXSkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpPT57XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1N0YWJpbGlzYXRpb24gc2V0IHRvIDAnKTtcbiAgICAgICAgICAgICAgICAvLyBTZXQgaGVhZGluZyB0byAwXG4gICAgICAgICAgICAgICAgbGV0IGhlYWRpbmcgPSAwO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZW5kQ29tbWFuZCgweDAyLCAweDAxLCBuZXcgVWludDhBcnJheShbaGVhZGluZyA+PiA4LCBoZWFkaW5nICYgMHhGRl0pKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdIZWFkaW5nIHNldCB0byAwLCBkZXZpY2UgaXMgcmVhZHkgIScpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udHJvbCB0aGUgbW90b3JzIG9mIHJvYm90XG4gICAgKi9cbiAgICBwcm9jZXNzTW90b3IoaGVhZGluZywgcG93ZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFJvbGwgaGVhZGluZz0ke2hlYWRpbmd9LCBwb3dlcj0ke3Bvd2VyfWApO1xuICAgICAgICBpZiAodGhpcy5idXN5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ29sbGllIGlzIGJ1c3knKTtcbiAgICAgICAgICAgIC8vIFJldHVybiBpZiBhbm90aGVyIG9wZXJhdGlvbiBwZW5kaW5nXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ1c3kgPSB0cnVlO1xuICAgICAgICBsZXQgZGlkID0gMHgwMjsgLy8gVmlydHVhbCBkZXZpY2UgSURcbiAgICAgICAgbGV0IGNpZCA9IDB4MzA7IC8vIFJvbGwgY29tbWFuZFxuICAgICAgICAvLyBSb2xsIGNvbW1hbmQgZGF0YTogc3BlZWQsIGhlYWRpbmcgKE1TQiksIGhlYWRpbmcgKExTQiksIHN0YXRlXG4gICAgICAgIGxldCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoW3Bvd2VyLCBoZWFkaW5nID4+IDgsIGhlYWRpbmcgJiAweEZGLCAxXSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmRDb21tYW5kKGRpZCwgY2lkLCBkYXRhKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgYnVzeSA6ICR7dGhpcy5idXN5fWApO1xuICAgICAgICAgICAgdGhpcy5idXN5ID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpPT57XG4gICAgICAgICAgICB0aGlzLmJ1c3kgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuXG4gICAgfVxuXG4gICAgcHJvY2Vzc0NvbG9yKHJlZCxibHVlLGdyZWVuKXtcbiAgICAgICAgY29uc29sZS5sb2coJ1NldCBjb2xvcjogcj0nK3JlZCsnLGc9JytncmVlbisnLGI9JytibHVlKTtcbiAgICAgICAgaWYgKHRoaXMuYnVzeSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdvbGxpZSBpcyBidXN5Jyk7XG4gICAgICAgICAgICAvLyBSZXR1cm4gaWYgYW5vdGhlciBvcGVyYXRpb24gcGVuZGluZ1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5idXN5ID0gdHJ1ZTtcbiAgICAgICAgbGV0IGRpZCA9IDB4MDI7IC8vIFZpcnR1YWwgZGV2aWNlIElEXG4gICAgICAgIGxldCBjaWQgPSAweDIwOyAvLyBTZXQgUkdCIExFRCBPdXRwdXQgY29tbWFuZFxuICAgICAgICAvLyBDb2xvciBjb21tYW5kIGRhdGE6IHJlZCwgZ3JlZW4sIGJsdWUsIGZsYWdcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgVWludDhBcnJheShbcmVkLCBncmVlbiwgYmx1ZSwgMF0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9zZW5kQ29tbWFuZChkaWQsIGNpZCwgZGF0YSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImNvbG9yIHNldCAhIFwiKTtcbiAgICAgICAgICAgIHRoaXMuYnVzeSA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycm9yKT0+e1xuICAgICAgICAgICAgdGhpcy5idXN5ID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHByb2Nlc3NTcGluKGxtb3Rvciwgcm1vdG9yKXtcbiAgICAgICAgY29uc29sZS5sb2coJ1NwaW4nKTtcbiAgICAgICAgaWYgKHRoaXMuYnVzeSl7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ29sbGllIGlzIGJ1c3knKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnVzeSA9IHRydWU7XG4gICAgICAgIGxldCBkaWQgPSAweDAyOyAvL1ZpcnR1YWwgZGV2aWNlIElEXG4gICAgICAgIGxldCBjaWQgPSAweDMzOyAvLyBTZXQgcmF3IE1vdG9ycyBjb21tYW5kXG4gICAgICAgIFxuICAgICAgICAgICAgICBcbiAgICAgICAgbGV0IGxtb2RlID0gbG1vdG9yICYgMHgwNztcbiAgICAgICAgbGV0IGxwb3dlciA9IDIwMCAmIDB4RkY7XG4gICAgICAgIGxldCBybW9kZSA9IHJtb3RvciAmIDB4MDc7XG4gICAgICAgIGxldCBycG93ZXIgPSAyMDAgJiAweEZGO1xuICAgICAgICBcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgVWludDhBcnJheShbbG1vZGUsIGxwb3dlciwgcm1vZGUsIHJwb3dlcl0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9zZW5kQ29tbWFuZChkaWQsIGNpZCwgZGF0YSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PntcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbG1vZGUgPSB0aGlzLk1vdG9ycy5vZmYgJiAweDA3O1xuICAgICAgICAgICAgICAgICAgICBsZXQgbHBvd2VyID0gMjAwO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcm1vZGUgPSB0aGlzLk1vdG9ycy5vZmYgJiAweDA3O1xuICAgICAgICAgICAgICAgICAgICBsZXQgcnBvd2VyID0gMjAwO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGEgPSBuZXcgVWludDhBcnJheShbbG1vZGUsIGxwb3dlciwgcm1vZGUsIHJwb3dlcl0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbmRDb21tYW5kKGRpZCwgY2lkLCBkYXRhKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnVzeSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGVycm9yKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5idXN5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0pOyBcbiAgICAgICAgICAgICAgICB9LCAyMDAwKTsgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnJvcik9PntcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG5cbiAgICBkaXNjb25uZWN0KCkge1xuICAgICAgICBpZiAoIXRoaXMuZGV2aWNlKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ0RldmljZSBpcyBub3QgY29ubmVjdGVkLicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlLmdhdHQuZGlzY29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25EaXNjb25uZWN0ZWQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEZXZpY2UgaXMgZGlzY29ubmVjdGVkLicpO1xuICAgIH1cbiAgICBcbiAgICBfaW50VG9IZXhBcnJheSh2YWx1ZSwgbnVtQnl0ZXMpIHtcbiAgICAgICAgdmFyIGhleEFycmF5ID0gbmV3IEFycmF5KG51bUJ5dGVzKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gbnVtQnl0ZXMgLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgaGV4QXJyYXlbaV0gPSB2YWx1ZSAmIDB4RkY7XG4gICAgICAgICAgICB2YWx1ZSA+Pj0gODtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBoZXhBcnJheTtcbiAgICAgfTtcblxuXG4gICAgX3NlbmRDb21tYW5kKGRpZCwgY2lkLCBkYXRhKSB7XG4gICAgICAgIC8vIENyZWF0ZSBjbGllbnQgY29tbWFuZCBwYWNrZXRzXG4gICAgICAgIC8vIEFQSSBkb2NzOiBodHRwczovL2dpdGh1Yi5jb20vb3Jib3RpeC9EZXZlbG9wZXJSZXNvdXJjZXMvYmxvYi9tYXN0ZXIvZG9jcy9TcGhlcm9fQVBJXzEuNTAucGRmXG4gICAgICAgIC8vIE5leHQgc2VxdWVuY2UgbnVtYmVyXG4gICAgICAgIGxldCBzZXEgPSB0aGlzLnNlcXVlbmNlICYgMjU1O1xuICAgICAgICB0aGlzLnNlcXVlbmNlICs9IDE7XG4gICAgICAgIC8vIFN0YXJ0IG9mIHBhY2tldCAjMlxuICAgICAgICBsZXQgc29wMiA9IDB4ZmM7XG4gICAgICAgIHNvcDIgfD0gMTsgLy8gQW5zd2VyXG4gICAgICAgIHNvcDIgfD0gMjsgLy8gUmVzZXQgdGltZW91dFxuICAgICAgICAvLyBEYXRhIGxlbmd0aFxuICAgICAgICBsZXQgZGxlbiA9IGRhdGEuYnl0ZUxlbmd0aCArIDE7XG4gICAgICAgIGxldCBzdW0gPSBkYXRhLnJlZHVjZSgoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gYSArIGI7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBDaGVja3N1bVxuICAgICAgICBsZXQgY2hrID0gKHN1bSArIGRpZCArIGNpZCArIHNlcSArIGRsZW4pICYgMjU1O1xuICAgICAgICBjaGsgXj0gMjU1O1xuICAgICAgICBsZXQgY2hlY2tzdW0gPSBuZXcgVWludDhBcnJheShbY2hrXSk7XG5cbiAgICAgICAgbGV0IHBhY2tldHMgPSBuZXcgVWludDhBcnJheShbMHhmZiwgc29wMiwgZGlkLCBjaWQsIHNlcSwgZGxlbl0pO1xuICAgICAgICAvLyBBcHBlbmQgYXJyYXlzOiBwYWNrZXQgKyBkYXRhICsgY2hlY2tzdW1cbiAgICAgICAgbGV0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkocGFja2V0cy5ieXRlTGVuZ3RoICsgZGF0YS5ieXRlTGVuZ3RoICsgY2hlY2tzdW0uYnl0ZUxlbmd0aCk7XG4gICAgICAgIGFycmF5LnNldChwYWNrZXRzLCAwKTtcbiAgICAgICAgYXJyYXkuc2V0KGRhdGEsIHBhY2tldHMuYnl0ZUxlbmd0aCk7XG4gICAgICAgIGFycmF5LnNldChjaGVja3N1bSwgcGFja2V0cy5ieXRlTGVuZ3RoICsgZGF0YS5ieXRlTGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dyaXRlQ2hhcmFjdGVyaXN0aWModGhpcy5jb25maWcucm9ib3RTZXJ2aWNlKCksIHRoaXMuY29uZmlnLmNvbnRyb2xDaGFyYWN0ZXJpc3RpYygpLCBhcnJheSk7ICAgICAgICAgIFxuICAgIH1cblxuXG4gIFxuXG4gICAgX3dyaXRlQ2hhcmFjdGVyaXN0aWMoc2VydmljZVVJRCwgY2hhcmFjdGVyaXN0aWNVSUQsIHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRldmljZS5nYXR0LmdldFByaW1hcnlTZXJ2aWNlKHNlcnZpY2VVSUQpXG4gICAgICAgICAgICAudGhlbihzZXJ2aWNlID0+IHNlcnZpY2UuZ2V0Q2hhcmFjdGVyaXN0aWMoY2hhcmFjdGVyaXN0aWNVSUQpKVxuICAgICAgICAgICAgLnRoZW4oY2hhcmFjdGVyaXN0aWMgPT4gY2hhcmFjdGVyaXN0aWMud3JpdGVWYWx1ZSh2YWx1ZSkpO1xuICAgIH1cblxuXG59XG5cblxubGV0IG9sbGllID0gbmV3IE9sbGllKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gb2xsaWU7Il19
