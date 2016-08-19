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

    if ('serviceWorker' in navigator) {        
        navigator.serviceWorker.register('./service-worker.js', {scope : location.pathname}).then(function(reg) {
            console.log('Service Worker Register for scope : %s',reg.scope);
        });
    }

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
        console.log('Roll heading='+heading);
        if (this.busy) {
            // Return if another operation pending
            return Promise.resolve();
        }
        this.busy = true;
        let did = 0x02; // Virtual device ID
        let cid = 0x30; // Roll command
        // Roll command data: speed, heading (MSB), heading (LSB), state
        let data = new Uint8Array([power, heading >> 8, heading & 0xFF, 1]);

        return this._sendCommand(did, cid, data).then(() => {
            this.busy = false;
            return Promise.resolve();
        })
        .catch((error)=>{
            console.error(error);
        });
        
        

    }

    processColor(red,blue,green){
        console.log('Set color: r='+red+',g='+green+',b='+blue);
        if (this.busy) {
            // Return if another operation pending
            return Promise.resolve();
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
            console.error(error);
        });
    }
    
    processSpin(lmotor, rmotor){
        console.log('Spin');
        if (this.busy){
            return Promise.resolve();
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
            return new Promise(function(resolve, reject){
                setTimeout(()=> {
                    let lmode = this.Motors.off & 0x07;
                    let lpower = 200 & 0xFF;
                    let rmode = this.Motors.off & 0x07;
                    let rpower = 200 & 0xFF;
                    
                    let data = new Uint8Array([lmode, lpower, rmode, rpower]);

                    this._sendCommand(did, cid, data).then(() => {
                        this.busy = false;
                        resolve();
                    })
                    .catch((error)=>{
                        console.error(error);
                        reject(error);
                    }); 
                }, 1000);    
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
        return this._writeCharacteristic(this.config.robotService(), this.config.controlCharacteristic(), array).then((returnData)=>{
            console.log('Command write done. : %s',returnData);  
            return Promise.resolve();
        });          
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzY3JpcHRzL2FwcC5qcyIsInNjcmlwdHMvY29tcG9uZW50cy9jb2xvcnBpY2tlci5qcyIsInNjcmlwdHMvY29tcG9uZW50cy9qb3lzdGljay5qcyIsInNjcmlwdHMvb2xsaWUvb2xsaWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0J1xyXG5cclxuICAgIGZ1bmN0aW9uIHBhZ2VMb2FkKCkge1xyXG5cclxuICAgICAgICAvLyBDaGVjayB0aGUgY3VycmVudCBwYXJ0IG9mIE1ib3RcclxuICAgICAgICBsZXQgbm9CbHVldG9vdGggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vQmx1ZXRvb3RoXCIpO1xyXG4gICAgICAgIGxldCBzdGVwQ29ubmVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RlcENvbm5lY3RcIik7XHJcbiAgICAgICAgbGV0IHN0ZXBDb250cm9sID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGVwQ29udHJvbFwiKTtcclxuICAgICAgICAvLyBDaGVjayBpZiB0aGUgYmx1ZXRvb3RoIGlzIGF2YWlsYWJsZVxyXG4gICAgICAgIGlmIChuYXZpZ2F0b3IuYmx1ZXRvb3RoID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiTm8gbmF2aWdhdG9yLmJsdWV0b290aCBmb3VuZC5cIik7XHJcbiAgICAgICAgICAgIHN0ZXBDb25uZWN0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgbm9CbHVldG9vdGguc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIERpc3BsYXkgdGhlIGNvbm5lY3QgYnV0dG9uXHJcbiAgICAgICAgICAgIHN0ZXBDb25uZWN0LnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcclxuICAgICAgICAgICAgbm9CbHVldG9vdGguc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICBsZXQgb2xsaWUgPSByZXF1aXJlKFwiLi9vbGxpZS9vbGxpZVwiKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENoZWNrIHRoZSBjb25uZWN0aW9uXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29ubmVjdEJ0blwiKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIF8gPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gUmVxdWVzdCB0aGUgZGV2aWNlXHJcbiAgICAgICAgICAgICAgICBvbGxpZS5yZXF1ZXN0KClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihfID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29ubmVjdCB0byB0aGUgb2xsaWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9sbGllLmNvbm5lY3QoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9sbGllLmluaXQoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKF8gPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb25uZWN0aW9uIGlzIGRvbmUsIHdlIHNob3cgdGhlIGNvbnRyb2xzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBDb25uZWN0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RlcENvbnRyb2wuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IEpveXN0aWNrID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2pveXN0aWNrLmpzJyk7XHRcdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgSm95c3RpY2soJ2pveXN0aWNrJywgKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhLmFuZ2xlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xsaWUucHJvY2Vzc01vdG9yKGRhdGEuYW5nbGUsIGRhdGEucG93ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcdFx0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0Sm95c3RpY2sgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucGFydC1qb3lzdGljaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFydEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYXJ0LWJ1dHRvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3dpdGNoUGFydHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3dpdGNoUGFydHMnKTtcdFx0ICsgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN3aXRjaCBiZXR3ZWVuIGJ1dHRvbiBhbmQgam95c3RpY2tcdFx0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2hQYXJ0cy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2dCkge1x0XHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja2VkKSB7XHRcdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0QnRuLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHRcdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0Sm95c3RpY2suc3R5bGUuZGlzcGxheSA9ICcnO1x0XHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1x0XHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydEJ0bi5zdHlsZS5kaXNwbGF5ID0gJyc7XHRcdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0Sm95c3RpY2suc3R5bGUuZGlzcGxheSA9ICdub25lJztcdFx0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVx0XHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udHJvbCB0aGUgcm9ib3QgYnkgYnV0dG9uc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYnRuVXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuVXAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJ0bkRvd24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuRG93bicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYnRuTGVmdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5MZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBidG5SaWdodCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5SaWdodCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnRuVXAuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIF8gPT4geyBvbGxpZS5wcm9jZXNzTW90b3IoMCw1MCkgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ0bkRvd24uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIF8gPT4geyBvbGxpZS5wcm9jZXNzTW90b3IoMTgwLDUwKSB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnRuTGVmdC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3RvcigyNzAsNTApIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBidG5SaWdodC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3Rvcig5MCw1MCkgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBidG5VcC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIF8gPT4geyBvbGxpZS5wcm9jZXNzTW90b3IoMCwgMCkgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ0bkRvd24uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBfID0+IHsgb2xsaWUucHJvY2Vzc01vdG9yKDE4MCwgMCkgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ0bkxlZnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBfID0+IHsgb2xsaWUucHJvY2Vzc01vdG9yKDI3MCwgMCkgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ0blJpZ2h0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3Rvcig5MCwgMCkgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmlja3Mgd2l0aCB0aGUgcm9ib3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0blRyaWNrMScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXz0+eyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sbGllLnByb2Nlc3NTcGluKG9sbGllLk1vdG9ycy5mb3J3YXJkLCBvbGxpZS5Nb3RvcnMucmV2ZXJzZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5UcmljazInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIF89PnsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGxpZS5wcm9jZXNzU3BpbihvbGxpZS5Nb3RvcnMucmV2ZXJzZSwgb2xsaWUuTW90b3JzLmZvcndhcmQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuVHJpY2szJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfPT57IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xsaWUucHJvY2Vzc1NwaW4ob2xsaWUuTW90b3JzLmZvcndhcmQsIG9sbGllLk1vdG9ycy5mb3J3YXJkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0blRyaWNrNCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXz0+eyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sbGllLnByb2Nlc3NTcGluKG9sbGllLk1vdG9ycy5yZXZlcnNlLCBvbGxpZS5Nb3RvcnMucmV2ZXJzZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb2xvciB0aGUgcm9ib3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IENvbG9yUGlja2VyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2NvbG9ycGlja2VyLmpzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDb2xvclBpY2tlcigocmdiKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGxpZS5wcm9jZXNzQ29sb3IocmdiLnJlZCwgcmdiLmJsdWUsIHJnYi5ncmVlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHBhZ2VMb2FkKTtcclxuXHJcbiAgICBpZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikgeyAgICAgICAgXHJcbiAgICAgICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJy4vc2VydmljZS13b3JrZXIuanMnLCB7c2NvcGUgOiBsb2NhdGlvbi5wYXRobmFtZX0pLnRoZW4oZnVuY3Rpb24ocmVnKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlIFdvcmtlciBSZWdpc3RlciBmb3Igc2NvcGUgOiAlcycscmVnLnNjb3BlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn0pKCk7IiwiXHJcbmNsYXNzIENvbG9yUGlja2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICB0aGlzLmltZy5zcmMgPSAnLi9hc3NldHMvaW1hZ2VzL2NvbG9yLXdoZWVsLnBuZyc7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJyk7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICB0aGlzLmltZy5vbmxvYWQgPSB0aGlzLl9sb2FkLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIF9sb2FkKCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gMTUwICogZGV2aWNlUGl4ZWxSYXRpbztcclxuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSAxNTAgKiBkZXZpY2VQaXhlbFJhdGlvO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLndpZHRoID0gXCIxNTBweFwiO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCA9IFwiMTUwcHhcIjtcclxuICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2NhbGN1bGF0ZVJnYi5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIF9jYWxjdWxhdGVSZ2IoZXZ0KSB7XHJcbiAgICAgICAgLy8gUmVmcmVzaCBjYW52YXMgaW4gY2FzZSB1c2VyIHpvb21zIGFuZCBkZXZpY2VQaXhlbFJhdGlvIGNoYW5nZXMuXHJcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSAxNTAgKiBkZXZpY2VQaXhlbFJhdGlvO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IDE1MCAqIGRldmljZVBpeGVsUmF0aW87XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgbGV0IHggPSBNYXRoLnJvdW5kKChldnQuY2xpZW50WCAtIHJlY3QubGVmdCkgKiBkZXZpY2VQaXhlbFJhdGlvKTtcclxuICAgICAgICBsZXQgeSA9IE1hdGgucm91bmQoKGV2dC5jbGllbnRZIC0gcmVjdC50b3ApICogZGV2aWNlUGl4ZWxSYXRpbyk7XHJcbiAgICAgICAgbGV0IGRhdGEgPSB0aGlzLmNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpLmRhdGE7XHJcblxyXG4gICAgICAgIGxldCByID0gZGF0YVsoKHRoaXMuY2FudmFzLndpZHRoICogeSkgKyB4KSAqIDRdO1xyXG4gICAgICAgIGxldCBnID0gZGF0YVsoKHRoaXMuY2FudmFzLndpZHRoICogeSkgKyB4KSAqIDQgKyAxXTtcclxuICAgICAgICBsZXQgYiA9IGRhdGFbKCh0aGlzLmNhbnZhcy53aWR0aCAqIHkpICsgeCkgKiA0ICsgMl07XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbGJhY2soe1xyXG4gICAgICAgICAgICByZWQ6IHIsXHJcbiAgICAgICAgICAgIGJsdWU6IGIsXHJcbiAgICAgICAgICAgIGdyZWVuOiBnXHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LmFyYyh4LCB5ICsgMiwgMTAgKiBkZXZpY2VQaXhlbFJhdGlvLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG4gICAgICAgIHRoaXMuY29udGV4dC5zaGFkb3dDb2xvciA9ICcjMzMzJztcclxuICAgICAgICB0aGlzLmNvbnRleHQuc2hhZG93Qmx1ciA9IDQgKiBkZXZpY2VQaXhlbFJhdGlvO1xyXG4gICAgICAgIHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSAnd2hpdGUnO1xyXG4gICAgICAgIHRoaXMuY29udGV4dC5maWxsKCk7XHJcbiAgICB9XHJcblxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb2xvclBpY2tlcjsiLCJjbGFzcyBKb3lzdGljayB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoaWQsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdGhpcy5qb3lzdGljayA9IG5pcHBsZWpzLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgIHpvbmU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSxcclxuICAgICAgICAgICAgbW9kZTogJ3N0YXRpYycsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICBsZWZ0OiAnNTAlJyxcclxuICAgICAgICAgICAgICAgIHRvcDogJzUwJSdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2l6ZTogMjAwLFxyXG4gICAgICAgICAgICBjb2xvcjogJyNjMTA0MzUnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG5cclxuICAgICAgICAvKmZ1bmN0aW9uIExvZ0YoZXZ0LCBkYXRhKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXZ0LGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmpveXN0aWNrLm9uKCdtb3ZlJywgTG9nRik7XHJcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignc3RhcnQnLCBMb2dGKTtcclxuICAgICAgICB0aGlzLmpveXN0aWNrLm9uKCdkaXInLCBMb2dGKTtcclxuICAgICAgICB0aGlzLmpveXN0aWNrLm9uKCdwbGFpbicsIExvZ0YpO1xyXG4gICAgICAgIHRoaXMuam95c3RpY2sub24oJ3Nob3duJywgTG9nRik7XHJcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignaGlkZGVuJywgTG9nRik7XHJcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignZGVzdHJveScsIExvZ0YpO1xyXG4gICAgICAgIHRoaXMuam95c3RpY2sub24oJ3ByZXNzdXJlJywgTG9nRik7XHJcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignZW5kJywgTG9nRik7Ki9cclxuXHJcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignbW92ZScsIHRoaXMuX21vdmUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignZW5kJywgdGhpcy5fZW5kLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMubGFzdFBvd2VyID0gMDtcclxuICAgICAgICB0aGlzLmxhc3RBbmdsZSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgX21vdmUoZXZ0LCBkYXRhKSB7ICAgICAgICBcclxuICAgICAgICBpZiAoZGF0YS5hbmdsZSkgeyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgcG93ZXIgPSBNYXRoLnJvdW5kKChkYXRhLmRpc3RhbmNlIC8gMTAwKSAqIDEwMCk7XHJcbiAgICAgICAgICAgIGxldCBhbmdsZSA9IGRhdGEuYW5nbGUuZGVncmVlO1xyXG4gICAgICAgICAgICBpZiAocG93ZXIgIT0gdGhpcy5sYXN0UG93ZXJcclxuICAgICAgICAgICAgfHwgYW5nbGUgIT0gdGhpcy5sYXN0QW5nbGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdFBvd2VyID0gcG93ZXI7ICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RBbmdsZSA9IGFuZ2xlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFjayh7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5nbGUgOiBNYXRoLmFicygzNjAgLSAoKHRoaXMubGFzdEFuZ2xlICsgMjcwKSAlIDM2MCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvd2VyIDogdGhpcy5sYXN0UG93ZXJcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG5cclxuICAgIH1cclxuXHJcbiAgICBfZW5kKGV2dCwgZGF0YSkge1xyXG4gICAgICAgIHRoaXMubGFzdFBvd2VyID0gMDtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrKHtcclxuICAgICAgICAgICAgYW5nbGU6IHRoaXMubGFzdEFuZ2xlLFxyXG4gICAgICAgICAgICBwb3dlcjogMFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBKb3lzdGljazsiLCIndXNlIHN0cmljdCdcclxuXHJcbi8qKlxyXG4gKiBHZW5lcmFsIGNvbmZpZ3VyYXRpb24gKFVVSUQpXHJcbiovXHJcbmNsYXNzIENvbmZpZyB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJhZGlvU2VydmljZSgpIHsgcmV0dXJuIFwiMjJiYjc0NmYtMmJiMC03NTU0LTJkNmYtNzI2NTY4NzA1MzI3XCIgfVxyXG4gICAgcm9ib3RTZXJ2aWNlKCkgeyByZXR1cm4gXCIyMmJiNzQ2Zi0yYmEwLTc1NTQtMmQ2Zi03MjY1Njg3MDUzMjdcIiB9XHJcbiAgICBjb250cm9sQ2hhcmFjdGVyaXN0aWMoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYTEtNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cclxuICAgIGFudGlET1NDaGFyYXRlcmlzdGljKCkgeyByZXR1cm4gXCIyMmJiNzQ2Zi0yYmJkLTc1NTQtMmQ2Zi03MjY1Njg3MDUzMjdcIiB9XHJcbiAgICBwb3dlckNoYXJhdGVyaXN0aWMoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYjItNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cclxuICAgIHdha2VVcENQVUNoYXJhdGVyaXN0aWMoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYmYtNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cclxufVxyXG5cclxuICAgIFxyXG5cclxuLyoqXHJcbiAqIENsYXNzIGZvciB0aGUgcm9ib3RcclxuICogKi9cclxuY2xhc3MgT2xsaWUge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXZpY2UgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY29uZmlnID0gbmV3IENvbmZpZygpO1xyXG4gICAgICAgIHRoaXMub25EaXNjb25uZWN0ZWQgPSB0aGlzLm9uRGlzY29ubmVjdGVkLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5idXp6ZXJJbmRleCA9IDA7XHJcbiAgICAgICAgdGhpcy5zZXF1ZW5jZSA9IDA7XHJcbiAgICAgICAgdGhpcy5idXN5ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5Nb3RvcnMgPSB7XHJcbiAgICAgICAgICAgIG9mZiA6IDB4MDAsXHJcbiAgICAgICAgICAgIGZvcndhcmQgOiAweDAxLFxyXG4gICAgICAgICAgICByZXZlcnNlIDogMHgwMixcclxuICAgICAgICAgICAgYnJha2UgOiAweDAzLFxyXG4gICAgICAgICAgICBpZ25vcmUgOiAweDA0XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICBSZXF1ZXN0IHRoZSBkZXZpY2Ugd2l0aCBibHVldG9vdGhcclxuICAgICovXHJcbiAgICByZXF1ZXN0KCkge1xyXG4gICAgICAgIGxldCBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBcImZpbHRlcnNcIjogW3tcclxuICAgICAgICAgICAgICAgIFwic2VydmljZXNcIjogW3RoaXMuY29uZmlnLnJhZGlvU2VydmljZSgpXVxyXG4gICAgICAgICAgICB9LHtcclxuICAgICAgICAgICAgICAgIFwic2VydmljZXNcIjogW3RoaXMuY29uZmlnLnJvYm90U2VydmljZSgpXVxyXG4gICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgXCJvcHRpb25hbFNlcnZpY2VzXCI6IFt0aGlzLmNvbmZpZy5yYWRpb1NlcnZpY2UoKSwgdGhpcy5jb25maWcucm9ib3RTZXJ2aWNlKCldXHJcbiAgICAgICAgfTsgICAgICAgIFxyXG4gICAgICAgIHJldHVybiBuYXZpZ2F0b3IuYmx1ZXRvb3RoLnJlcXVlc3REZXZpY2Uob3B0aW9ucylcclxuICAgICAgICAgICAgLnRoZW4oZGV2aWNlID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGV2aWNlID0gZGV2aWNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXZpY2UuYWRkRXZlbnRMaXN0ZW5lcignZ2F0dHNlcnZlcmRpc2Nvbm5lY3RlZCcsIHRoaXMub25EaXNjb25uZWN0ZWQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRldmljZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25uZWN0IHRvIHRoZSBkZXZpY2VcclxuICAgICAqICovXHJcbiAgICBjb25uZWN0KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5kZXZpY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdEZXZpY2UgaXMgbm90IGNvbm5lY3RlZC4nKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZXZpY2UuZ2F0dC5jb25uZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpbml0KCl7XHJcbiAgICAgICAgaWYoIXRoaXMuZGV2aWNlKXtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdEZXZpY2UgaXMgbm90IGNvbm5lY3RlZC4nKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93cml0ZUNoYXJhY3RlcmlzdGljKHRoaXMuY29uZmlnLnJhZGlvU2VydmljZSgpLCBcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5hbnRpRE9TQ2hhcmF0ZXJpc3RpYygpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KCcwMTFpMycuc3BsaXQoJycpLm1hcChjID0+IGMuY2hhckNvZGVBdCgpKSkpXHJcbiAgICAgICAgICAgIC50aGVuKCgpPT57XHJcbiAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJz4gRm91bmQgQW50aSBET1MgY2hhcmFjdGVyaXN0aWMnKTtcclxuICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fd3JpdGVDaGFyYWN0ZXJpc3RpYyh0aGlzLmNvbmZpZy5yYWRpb1NlcnZpY2UoKSwgXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcucG93ZXJDaGFyYXRlcmlzdGljKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFVpbnQ4QXJyYXkoWzB4MDddKSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCk9PntcclxuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJz4gRm91bmQgVFggUG93ZXIgY2hhcmFjdGVyaXN0aWMnKTtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dyaXRlQ2hhcmFjdGVyaXN0aWModGhpcy5jb25maWcucmFkaW9TZXJ2aWNlKCksIFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLndha2VVcENQVUNoYXJhdGVyaXN0aWMoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVWludDhBcnJheShbMHgwMV0pKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKT0+eyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXYWtlIENQVSB3cml0ZSBkb25lLicpOyAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vU2V0IHJnYkxlZCB0byAwXHJcbiAgICAgICAgICAgICAgICBsZXQgY29sb3IgPSAweDAxO1xyXG4gICAgICAgICAgICAgICAgY29sb3IgJj0gMHhGRjtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZW5kQ29tbWFuZCgweDAyLCAweDIwLCBuZXcgVWludDhBcnJheShbY29sb3JdKSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1JnYiBMZWQgc2V0IHRvIDAnKTtcclxuICAgICAgICAgICAgICAgIC8vIHNldCBCYWNrTGVkIHRvIDEyN1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmRDb21tYW5kKDB4MDIsIDB4MjEsIG5ldyBVaW50OEFycmF5KFsxMjddKSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpPT57XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQmFjayBMZWQgc2V0IHRvIDEyNycpO1xyXG4gICAgICAgICAgICAgICAgLy8gc2V0IHN0YWJpbGlzYXRpb24gdG8gMFxyXG4gICAgICAgICAgICAgICAgbGV0IGZsYWcgPSAwO1xyXG4gICAgICAgICAgICAgICAgZmxhZyAmPSAweDAxO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmRDb21tYW5kKDB4MDIsIDB4MDIsIG5ldyBVaW50OEFycmF5KFtmbGFnXSkpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKT0+e1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1N0YWJpbGlzYXRpb24gc2V0IHRvIDAnKTtcclxuICAgICAgICAgICAgICAgIC8vIFNldCBoZWFkaW5nIHRvIDBcclxuICAgICAgICAgICAgICAgIGxldCBoZWFkaW5nID0gMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZW5kQ29tbWFuZCgweDAyLCAweDAxLCBuZXcgVWludDhBcnJheShbaGVhZGluZyA+PiA4LCBoZWFkaW5nICYgMHhGRl0pKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCk9PntcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdIZWFkaW5nIHNldCB0byAwLCBkZXZpY2UgaXMgcmVhZHkgIScpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udHJvbCB0aGUgbW90b3JzIG9mIHJvYm90XHJcbiAgICAqL1xyXG4gICAgcHJvY2Vzc01vdG9yKGhlYWRpbmcsIHBvd2VyKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1JvbGwgaGVhZGluZz0nK2hlYWRpbmcpO1xyXG4gICAgICAgIGlmICh0aGlzLmJ1c3kpIHtcclxuICAgICAgICAgICAgLy8gUmV0dXJuIGlmIGFub3RoZXIgb3BlcmF0aW9uIHBlbmRpbmdcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJ1c3kgPSB0cnVlO1xyXG4gICAgICAgIGxldCBkaWQgPSAweDAyOyAvLyBWaXJ0dWFsIGRldmljZSBJRFxyXG4gICAgICAgIGxldCBjaWQgPSAweDMwOyAvLyBSb2xsIGNvbW1hbmRcclxuICAgICAgICAvLyBSb2xsIGNvbW1hbmQgZGF0YTogc3BlZWQsIGhlYWRpbmcgKE1TQiksIGhlYWRpbmcgKExTQiksIHN0YXRlXHJcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgVWludDhBcnJheShbcG93ZXIsIGhlYWRpbmcgPj4gOCwgaGVhZGluZyAmIDB4RkYsIDFdKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmRDb21tYW5kKGRpZCwgY2lkLCBkYXRhKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5idXN5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpPT57XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcm9jZXNzQ29sb3IocmVkLGJsdWUsZ3JlZW4pe1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdTZXQgY29sb3I6IHI9JytyZWQrJyxnPScrZ3JlZW4rJyxiPScrYmx1ZSk7XHJcbiAgICAgICAgaWYgKHRoaXMuYnVzeSkge1xyXG4gICAgICAgICAgICAvLyBSZXR1cm4gaWYgYW5vdGhlciBvcGVyYXRpb24gcGVuZGluZ1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYnVzeSA9IHRydWU7XHJcbiAgICAgICAgbGV0IGRpZCA9IDB4MDI7IC8vIFZpcnR1YWwgZGV2aWNlIElEXHJcbiAgICAgICAgbGV0IGNpZCA9IDB4MjA7IC8vIFNldCBSR0IgTEVEIE91dHB1dCBjb21tYW5kXHJcbiAgICAgICAgLy8gQ29sb3IgY29tbWFuZCBkYXRhOiByZWQsIGdyZWVuLCBibHVlLCBmbGFnXHJcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgVWludDhBcnJheShbcmVkLCBncmVlbiwgYmx1ZSwgMF0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5fc2VuZENvbW1hbmQoZGlkLCBjaWQsIGRhdGEpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImNvbG9yIHNldCAhIFwiKTtcclxuICAgICAgICAgICAgdGhpcy5idXN5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpPT57XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm9jZXNzU3BpbihsbW90b3IsIHJtb3Rvcil7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1NwaW4nKTtcclxuICAgICAgICBpZiAodGhpcy5idXN5KXtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJ1c3kgPSB0cnVlO1xyXG4gICAgICAgIGxldCBkaWQgPSAweDAyOyAvL1ZpcnR1YWwgZGV2aWNlIElEXHJcbiAgICAgICAgbGV0IGNpZCA9IDB4MzM7IC8vIFNldCByYXcgTW90b3JzIGNvbW1hbmRcclxuICAgICAgICBcclxuICAgICAgICAgICAgICBcclxuICAgICAgICBsZXQgbG1vZGUgPSBsbW90b3IgJiAweDA3O1xyXG4gICAgICAgIGxldCBscG93ZXIgPSAyMDAgJiAweEZGO1xyXG4gICAgICAgIGxldCBybW9kZSA9IHJtb3RvciAmIDB4MDc7XHJcbiAgICAgICAgbGV0IHJwb3dlciA9IDIwMCAmIDB4RkY7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgVWludDhBcnJheShbbG1vZGUsIGxwb3dlciwgcm1vZGUsIHJwb3dlcl0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5fc2VuZENvbW1hbmQoZGlkLCBjaWQsIGRhdGEpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxtb2RlID0gdGhpcy5Nb3RvcnMub2ZmICYgMHgwNztcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbHBvd2VyID0gMjAwICYgMHhGRjtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcm1vZGUgPSB0aGlzLk1vdG9ycy5vZmYgJiAweDA3O1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBycG93ZXIgPSAyMDAgJiAweEZGO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoW2xtb2RlLCBscG93ZXIsIHJtb2RlLCBycG93ZXJdKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VuZENvbW1hbmQoZGlkLCBjaWQsIGRhdGEpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1c3kgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlcnJvcik9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7IFxyXG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7ICAgIFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKChlcnJvcik9PntcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgZGlzY29ubmVjdCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZGV2aWNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnRGV2aWNlIGlzIG5vdCBjb25uZWN0ZWQuJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlLmdhdHQuZGlzY29ubmVjdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvbkRpc2Nvbm5lY3RlZCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnRGV2aWNlIGlzIGRpc2Nvbm5lY3RlZC4nKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgX2ludFRvSGV4QXJyYXkodmFsdWUsIG51bUJ5dGVzKSB7XHJcbiAgICAgICAgdmFyIGhleEFycmF5ID0gbmV3IEFycmF5KG51bUJ5dGVzKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IG51bUJ5dGVzIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgaGV4QXJyYXlbaV0gPSB2YWx1ZSAmIDB4RkY7XHJcbiAgICAgICAgICAgIHZhbHVlID4+PSA4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGhleEFycmF5O1xyXG4gICAgIH07XHJcblxyXG5cclxuICAgIF9zZW5kQ29tbWFuZChkaWQsIGNpZCwgZGF0YSkge1xyXG4gICAgICAgIC8vIENyZWF0ZSBjbGllbnQgY29tbWFuZCBwYWNrZXRzXHJcbiAgICAgICAgLy8gQVBJIGRvY3M6IGh0dHBzOi8vZ2l0aHViLmNvbS9vcmJvdGl4L0RldmVsb3BlclJlc291cmNlcy9ibG9iL21hc3Rlci9kb2NzL1NwaGVyb19BUElfMS41MC5wZGZcclxuICAgICAgICAvLyBOZXh0IHNlcXVlbmNlIG51bWJlclxyXG4gICAgICAgIGxldCBzZXEgPSB0aGlzLnNlcXVlbmNlICYgMjU1O1xyXG4gICAgICAgIHRoaXMuc2VxdWVuY2UgKz0gMTtcclxuICAgICAgICAvLyBTdGFydCBvZiBwYWNrZXQgIzJcclxuICAgICAgICBsZXQgc29wMiA9IDB4ZmM7XHJcbiAgICAgICAgc29wMiB8PSAxOyAvLyBBbnN3ZXJcclxuICAgICAgICBzb3AyIHw9IDI7IC8vIFJlc2V0IHRpbWVvdXRcclxuICAgICAgICAvLyBEYXRhIGxlbmd0aFxyXG4gICAgICAgIGxldCBkbGVuID0gZGF0YS5ieXRlTGVuZ3RoICsgMTtcclxuICAgICAgICBsZXQgc3VtID0gZGF0YS5yZWR1Y2UoKGEsIGIpID0+IHtcclxuICAgICAgICByZXR1cm4gYSArIGI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gQ2hlY2tzdW1cclxuICAgICAgICBsZXQgY2hrID0gKHN1bSArIGRpZCArIGNpZCArIHNlcSArIGRsZW4pICYgMjU1O1xyXG4gICAgICAgIGNoayBePSAyNTU7XHJcbiAgICAgICAgbGV0IGNoZWNrc3VtID0gbmV3IFVpbnQ4QXJyYXkoW2Noa10pO1xyXG5cclxuICAgICAgICBsZXQgcGFja2V0cyA9IG5ldyBVaW50OEFycmF5KFsweGZmLCBzb3AyLCBkaWQsIGNpZCwgc2VxLCBkbGVuXSk7XHJcbiAgICAgICAgLy8gQXBwZW5kIGFycmF5czogcGFja2V0ICsgZGF0YSArIGNoZWNrc3VtXHJcbiAgICAgICAgbGV0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkocGFja2V0cy5ieXRlTGVuZ3RoICsgZGF0YS5ieXRlTGVuZ3RoICsgY2hlY2tzdW0uYnl0ZUxlbmd0aCk7XHJcbiAgICAgICAgYXJyYXkuc2V0KHBhY2tldHMsIDApO1xyXG4gICAgICAgIGFycmF5LnNldChkYXRhLCBwYWNrZXRzLmJ5dGVMZW5ndGgpO1xyXG4gICAgICAgIGFycmF5LnNldChjaGVja3N1bSwgcGFja2V0cy5ieXRlTGVuZ3RoICsgZGF0YS5ieXRlTGVuZ3RoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fd3JpdGVDaGFyYWN0ZXJpc3RpYyh0aGlzLmNvbmZpZy5yb2JvdFNlcnZpY2UoKSwgdGhpcy5jb25maWcuY29udHJvbENoYXJhY3RlcmlzdGljKCksIGFycmF5KS50aGVuKChyZXR1cm5EYXRhKT0+e1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQ29tbWFuZCB3cml0ZSBkb25lLiA6ICVzJyxyZXR1cm5EYXRhKTsgIFxyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgfSk7ICAgICAgICAgIFxyXG4gICAgfVxyXG5cclxuXHJcbiAgXHJcblxyXG4gICAgX3dyaXRlQ2hhcmFjdGVyaXN0aWMoc2VydmljZVVJRCwgY2hhcmFjdGVyaXN0aWNVSUQsIHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlLmdhdHQuZ2V0UHJpbWFyeVNlcnZpY2Uoc2VydmljZVVJRClcclxuICAgICAgICAgICAgLnRoZW4oc2VydmljZSA9PiBzZXJ2aWNlLmdldENoYXJhY3RlcmlzdGljKGNoYXJhY3RlcmlzdGljVUlEKSlcclxuICAgICAgICAgICAgLnRoZW4oY2hhcmFjdGVyaXN0aWMgPT4gY2hhcmFjdGVyaXN0aWMud3JpdGVWYWx1ZSh2YWx1ZSkpO1xyXG4gICAgfVxyXG5cclxuXHJcbn1cclxuXHJcblxyXG5sZXQgb2xsaWUgPSBuZXcgT2xsaWUoKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gb2xsaWU7Il19
