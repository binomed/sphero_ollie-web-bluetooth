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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzY3JpcHRzL2FwcC5qcyIsInNjcmlwdHMvY29tcG9uZW50cy9jb2xvcnBpY2tlci5qcyIsInNjcmlwdHMvY29tcG9uZW50cy9qb3lzdGljay5qcyIsInNjcmlwdHMvb2xsaWUvb2xsaWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCdcblxuICAgIGZ1bmN0aW9uIHBhZ2VMb2FkKCkge1xuXG4gICAgICAgIC8vIENoZWNrIHRoZSBjdXJyZW50IHBhcnQgb2YgTWJvdFxuICAgICAgICBsZXQgbm9CbHVldG9vdGggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vQmx1ZXRvb3RoXCIpO1xuICAgICAgICBsZXQgc3RlcENvbm5lY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0ZXBDb25uZWN0XCIpO1xuICAgICAgICBsZXQgc3RlcENvbnRyb2wgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0ZXBDb250cm9sXCIpO1xuICAgICAgICAvLyBDaGVjayBpZiB0aGUgYmx1ZXRvb3RoIGlzIGF2YWlsYWJsZVxuICAgICAgICBpZiAobmF2aWdhdG9yLmJsdWV0b290aCA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJObyBuYXZpZ2F0b3IuYmx1ZXRvb3RoIGZvdW5kLlwiKTtcbiAgICAgICAgICAgIHN0ZXBDb25uZWN0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIG5vQmx1ZXRvb3RoLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIERpc3BsYXkgdGhlIGNvbm5lY3QgYnV0dG9uXG4gICAgICAgICAgICBzdGVwQ29ubmVjdC5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgICAgICBub0JsdWV0b290aC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICBsZXQgb2xsaWUgPSByZXF1aXJlKFwiLi9vbGxpZS9vbGxpZVwiKTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgdGhlIGNvbm5lY3Rpb25cbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29ubmVjdEJ0blwiKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIF8gPT4ge1xuICAgICAgICAgICAgICAgIC8vIFJlcXVlc3QgdGhlIGRldmljZVxuICAgICAgICAgICAgICAgIG9sbGllLnJlcXVlc3QoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihfID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbm5lY3QgdG8gdGhlIG9sbGllXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2xsaWUuY29ubmVjdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvbGxpZS5pbml0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbihfID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbm5lY3Rpb24gaXMgZG9uZSwgd2Ugc2hvdyB0aGUgY29udHJvbHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBDb25uZWN0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBDb250cm9sLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IEpveXN0aWNrID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2pveXN0aWNrLmpzJyk7XHRcdFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEpveXN0aWNrKCdqb3lzdGljaycsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGEuYW5nbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xsaWUucHJvY2Vzc01vdG9yKGRhdGEuYW5nbGUsIGRhdGEucG93ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHRcdFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnRKb3lzdGljayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYXJ0LWpveXN0aWNrJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFydEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYXJ0LWJ1dHRvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN3aXRjaFBhcnRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N3aXRjaFBhcnRzJyk7XHRcdCArICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3dpdGNoIGJldHdlZW4gYnV0dG9uIGFuZCBqb3lzdGlja1x0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2hQYXJ0cy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2dCkge1x0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tlZCkge1x0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRCdG4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcdFx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0Sm95c3RpY2suc3R5bGUuZGlzcGxheSA9ICcnO1x0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcdFx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0QnRuLnN0eWxlLmRpc3BsYXkgPSAnJztcdFx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0Sm95c3RpY2suc3R5bGUuZGlzcGxheSA9ICdub25lJztcdFx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cdFx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbnRyb2wgdGhlIHJvYm90IGJ5IGJ1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBidG5VcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5VcCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJ0bkRvd24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuRG93bicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJ0bkxlZnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuTGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJ0blJpZ2h0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0blJpZ2h0Jyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJ0blVwLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBfID0+IHsgb2xsaWUucHJvY2Vzc01vdG9yKDAsNTApIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnRuRG93bi5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3RvcigxODAsNTApIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnRuTGVmdC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3RvcigyNzAsNTApIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnRuUmlnaHQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIF8gPT4geyBvbGxpZS5wcm9jZXNzTW90b3IoOTAsNTApIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBidG5VcC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIF8gPT4geyBvbGxpZS5wcm9jZXNzTW90b3IoMCwgMCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidG5Eb3duLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3RvcigxODAsIDApIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnRuTGVmdC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIF8gPT4geyBvbGxpZS5wcm9jZXNzTW90b3IoMjcwLCAwKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ0blJpZ2h0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3Rvcig5MCwgMCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyaWNrcyB3aXRoIHRoZSByb2JvdFxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0blRyaWNrMScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXz0+eyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGxpZS5wcm9jZXNzU3BpbihvbGxpZS5Nb3RvcnMuZm9yd2FyZCwgb2xsaWUuTW90b3JzLnJldmVyc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5UcmljazInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIF89PnsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xsaWUucHJvY2Vzc1NwaW4ob2xsaWUuTW90b3JzLnJldmVyc2UsIG9sbGllLk1vdG9ycy5mb3J3YXJkKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuVHJpY2szJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfPT57IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sbGllLnByb2Nlc3NTcGluKG9sbGllLk1vdG9ycy5mb3J3YXJkLCBvbGxpZS5Nb3RvcnMuZm9yd2FyZClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0blRyaWNrNCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXz0+eyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGxpZS5wcm9jZXNzU3BpbihvbGxpZS5Nb3RvcnMucmV2ZXJzZSwgb2xsaWUuTW90b3JzLnJldmVyc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29sb3IgdGhlIHJvYm90XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgQ29sb3JQaWNrZXIgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvY29sb3JwaWNrZXIuanMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDb2xvclBpY2tlcigocmdiKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xsaWUucHJvY2Vzc0NvbG9yKHJnYi5yZWQsIHJnYi5ibHVlLCByZ2IuZ3JlZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcblxuXG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG5cblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgcGFnZUxvYWQpO1xuXG4gICAgLyppZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikgeyAgICAgICAgXG4gICAgICAgIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLnJlZ2lzdGVyKCcuL3NlcnZpY2Utd29ya2VyLmpzJywge3Njb3BlIDogbG9jYXRpb24ucGF0aG5hbWV9KS50aGVuKGZ1bmN0aW9uKHJlZykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NlcnZpY2UgV29ya2VyIFJlZ2lzdGVyIGZvciBzY29wZSA6ICVzJyxyZWcuc2NvcGUpO1xuICAgICAgICB9KTtcbiAgICB9Ki9cblxufSkoKTsiLCJcbmNsYXNzIENvbG9yUGlja2VyIHtcbiAgICBjb25zdHJ1Y3RvcihjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB0aGlzLmltZy5zcmMgPSAnLi9hc3NldHMvaW1hZ2VzL2NvbG9yLXdoZWVsLnBuZyc7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKTtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5pbWcub25sb2FkID0gdGhpcy5fbG9hZC5iaW5kKHRoaXMpO1xuICAgIH1cblxuXG4gICAgX2xvYWQoKSB7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IDE1MCAqIGRldmljZVBpeGVsUmF0aW87XG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IDE1MCAqIGRldmljZVBpeGVsUmF0aW87XG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLndpZHRoID0gXCIxNTBweFwiO1xuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBcIjE1MHB4XCI7XG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fY2FsY3VsYXRlUmdiLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuY29udGV4dC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgIH1cblxuXG4gICAgX2NhbGN1bGF0ZVJnYihldnQpIHtcbiAgICAgICAgLy8gUmVmcmVzaCBjYW52YXMgaW4gY2FzZSB1c2VyIHpvb21zIGFuZCBkZXZpY2VQaXhlbFJhdGlvIGNoYW5nZXMuXG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gMTUwICogZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gMTUwICogZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgICAgdGhpcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IHggPSBNYXRoLnJvdW5kKChldnQuY2xpZW50WCAtIHJlY3QubGVmdCkgKiBkZXZpY2VQaXhlbFJhdGlvKTtcbiAgICAgICAgbGV0IHkgPSBNYXRoLnJvdW5kKChldnQuY2xpZW50WSAtIHJlY3QudG9wKSAqIGRldmljZVBpeGVsUmF0aW8pO1xuICAgICAgICBsZXQgZGF0YSA9IHRoaXMuY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCkuZGF0YTtcblxuICAgICAgICBsZXQgciA9IGRhdGFbKCh0aGlzLmNhbnZhcy53aWR0aCAqIHkpICsgeCkgKiA0XTtcbiAgICAgICAgbGV0IGcgPSBkYXRhWygodGhpcy5jYW52YXMud2lkdGggKiB5KSArIHgpICogNCArIDFdO1xuICAgICAgICBsZXQgYiA9IGRhdGFbKCh0aGlzLmNhbnZhcy53aWR0aCAqIHkpICsgeCkgKiA0ICsgMl07XG5cbiAgICAgICAgdGhpcy5jYWxsYmFjayh7XG4gICAgICAgICAgICByZWQ6IHIsXG4gICAgICAgICAgICBibHVlOiBiLFxuICAgICAgICAgICAgZ3JlZW46IGdcbiAgICAgICAgfSk7XG5cblxuICAgICAgICB0aGlzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIHRoaXMuY29udGV4dC5hcmMoeCwgeSArIDIsIDEwICogZGV2aWNlUGl4ZWxSYXRpbywgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcbiAgICAgICAgdGhpcy5jb250ZXh0LnNoYWRvd0NvbG9yID0gJyMzMzMnO1xuICAgICAgICB0aGlzLmNvbnRleHQuc2hhZG93Qmx1ciA9IDQgKiBkZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgICB0aGlzLmNvbnRleHQuZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgICAgICAgdGhpcy5jb250ZXh0LmZpbGwoKTtcbiAgICB9XG5cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbG9yUGlja2VyOyIsImNsYXNzIEpveXN0aWNrIHtcblxuICAgIGNvbnN0cnVjdG9yKGlkLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmpveXN0aWNrID0gbmlwcGxlanMuY3JlYXRlKHtcbiAgICAgICAgICAgIHpvbmU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSxcbiAgICAgICAgICAgIG1vZGU6ICdzdGF0aWMnLFxuICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiAnNTAlJyxcbiAgICAgICAgICAgICAgICB0b3A6ICc1MCUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2l6ZTogMjAwLFxuICAgICAgICAgICAgY29sb3I6ICcjYzEwNDM1J1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgIC8qZnVuY3Rpb24gTG9nRihldnQsIGRhdGEpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXZ0LGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuam95c3RpY2sub24oJ21vdmUnLCBMb2dGKTtcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignc3RhcnQnLCBMb2dGKTtcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignZGlyJywgTG9nRik7XG4gICAgICAgIHRoaXMuam95c3RpY2sub24oJ3BsYWluJywgTG9nRik7XG4gICAgICAgIHRoaXMuam95c3RpY2sub24oJ3Nob3duJywgTG9nRik7XG4gICAgICAgIHRoaXMuam95c3RpY2sub24oJ2hpZGRlbicsIExvZ0YpO1xuICAgICAgICB0aGlzLmpveXN0aWNrLm9uKCdkZXN0cm95JywgTG9nRik7XG4gICAgICAgIHRoaXMuam95c3RpY2sub24oJ3ByZXNzdXJlJywgTG9nRik7XG4gICAgICAgIHRoaXMuam95c3RpY2sub24oJ2VuZCcsIExvZ0YpOyovXG5cbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignbW92ZScsIHRoaXMuX21vdmUuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuam95c3RpY2sub24oJ2VuZCcsIHRoaXMuX2VuZC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5sYXN0UG93ZXIgPSAwO1xuICAgICAgICB0aGlzLmxhc3RBbmdsZSA9IDA7XG4gICAgfVxuXG4gICAgX21vdmUoZXZ0LCBkYXRhKSB7ICAgICAgICBcbiAgICAgICAgaWYgKGRhdGEuYW5nbGUpIHsgICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBwb3dlciA9IE1hdGgucm91bmQoKGRhdGEuZGlzdGFuY2UgLyAxMDApICogMTAwKTtcbiAgICAgICAgICAgIGxldCBhbmdsZSA9IGRhdGEuYW5nbGUuZGVncmVlO1xuICAgICAgICAgICAgaWYgKHBvd2VyICE9IHRoaXMubGFzdFBvd2VyXG4gICAgICAgICAgICB8fCBhbmdsZSAhPSB0aGlzLmxhc3RBbmdsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubGFzdFBvd2VyID0gcG93ZXI7ICAgXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0QW5nbGUgPSBhbmdsZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrKHtcbiAgICAgICAgICAgICAgICAgICAgYW5nbGUgOiBNYXRoLmFicygzNjAgLSAoKHRoaXMubGFzdEFuZ2xlICsgMjcwKSAlIDM2MCkpLFxuICAgICAgICAgICAgICAgICAgICBwb3dlciA6IHRoaXMubGFzdFBvd2VyXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG5cbiAgICB9XG5cbiAgICBfZW5kKGV2dCwgZGF0YSkge1xuICAgICAgICB0aGlzLmxhc3RQb3dlciA9IDA7XG4gICAgICAgIHRoaXMuY2FsbGJhY2soe1xuICAgICAgICAgICAgYW5nbGU6IHRoaXMubGFzdEFuZ2xlLFxuICAgICAgICAgICAgcG93ZXI6IDBcbiAgICAgICAgfSk7XG4gICAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gSm95c3RpY2s7IiwiJ3VzZSBzdHJpY3QnXG5cbi8qKlxuICogR2VuZXJhbCBjb25maWd1cmF0aW9uIChVVUlEKVxuKi9cbmNsYXNzIENvbmZpZyB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG4gICAgXG4gICAgcmFkaW9TZXJ2aWNlKCkgeyByZXR1cm4gXCIyMmJiNzQ2Zi0yYmIwLTc1NTQtMmQ2Zi03MjY1Njg3MDUzMjdcIiB9XG4gICAgcm9ib3RTZXJ2aWNlKCkgeyByZXR1cm4gXCIyMmJiNzQ2Zi0yYmEwLTc1NTQtMmQ2Zi03MjY1Njg3MDUzMjdcIiB9XG4gICAgY29udHJvbENoYXJhY3RlcmlzdGljKCkgeyByZXR1cm4gXCIyMmJiNzQ2Zi0yYmExLTc1NTQtMmQ2Zi03MjY1Njg3MDUzMjdcIiB9XG4gICAgYW50aURPU0NoYXJhdGVyaXN0aWMoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYmQtNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cbiAgICBwb3dlckNoYXJhdGVyaXN0aWMoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYjItNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cbiAgICB3YWtlVXBDUFVDaGFyYXRlcmlzdGljKCkgeyByZXR1cm4gXCIyMmJiNzQ2Zi0yYmJmLTc1NTQtMmQ2Zi03MjY1Njg3MDUzMjdcIiB9XG59XG5cbiAgICBcblxuLyoqXG4gKiBDbGFzcyBmb3IgdGhlIHJvYm90XG4gKiAqL1xuY2xhc3MgT2xsaWUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmRldmljZSA9IG51bGw7XG4gICAgICAgIHRoaXMuY29uZmlnID0gbmV3IENvbmZpZygpO1xuICAgICAgICB0aGlzLm9uRGlzY29ubmVjdGVkID0gdGhpcy5vbkRpc2Nvbm5lY3RlZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJ1enplckluZGV4ID0gMDtcbiAgICAgICAgdGhpcy5zZXF1ZW5jZSA9IDA7XG4gICAgICAgIHRoaXMuYnVzeSA9IGZhbHNlO1xuICAgICAgICB0aGlzLk1vdG9ycyA9IHtcbiAgICAgICAgICAgIG9mZiA6IDB4MDAsXG4gICAgICAgICAgICBmb3J3YXJkIDogMHgwMSxcbiAgICAgICAgICAgIHJldmVyc2UgOiAweDAyLFxuICAgICAgICAgICAgYnJha2UgOiAweDAzLFxuICAgICAgICAgICAgaWdub3JlIDogMHgwNFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICBSZXF1ZXN0IHRoZSBkZXZpY2Ugd2l0aCBibHVldG9vdGhcbiAgICAqL1xuICAgIHJlcXVlc3QoKSB7XG4gICAgICAgIGxldCBvcHRpb25zID0ge1xuICAgICAgICAgICAgXCJmaWx0ZXJzXCI6IFt7XG4gICAgICAgICAgICAgICAgXCJzZXJ2aWNlc1wiOiBbdGhpcy5jb25maWcucmFkaW9TZXJ2aWNlKCldXG4gICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICBcInNlcnZpY2VzXCI6IFt0aGlzLmNvbmZpZy5yb2JvdFNlcnZpY2UoKV1cbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgXCJvcHRpb25hbFNlcnZpY2VzXCI6IFt0aGlzLmNvbmZpZy5yYWRpb1NlcnZpY2UoKSwgdGhpcy5jb25maWcucm9ib3RTZXJ2aWNlKCldXG4gICAgICAgIH07ICAgICAgICBcbiAgICAgICAgcmV0dXJuIG5hdmlnYXRvci5ibHVldG9vdGgucmVxdWVzdERldmljZShvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oZGV2aWNlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRldmljZSA9IGRldmljZTtcbiAgICAgICAgICAgICAgICB0aGlzLmRldmljZS5hZGRFdmVudExpc3RlbmVyKCdnYXR0c2VydmVyZGlzY29ubmVjdGVkJywgdGhpcy5vbkRpc2Nvbm5lY3RlZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRldmljZTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbm5lY3QgdG8gdGhlIGRldmljZVxuICAgICAqICovXG4gICAgY29ubmVjdCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRldmljZSkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdEZXZpY2UgaXMgbm90IGNvbm5lY3RlZC4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRldmljZS5nYXR0LmNvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpbml0KCl7XG4gICAgICAgIGlmKCF0aGlzLmRldmljZSl7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ0RldmljZSBpcyBub3QgY29ubmVjdGVkLicpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dyaXRlQ2hhcmFjdGVyaXN0aWModGhpcy5jb25maWcucmFkaW9TZXJ2aWNlKCksIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5hbnRpRE9TQ2hhcmF0ZXJpc3RpYygpLFxuICAgICAgICAgICAgICAgICAgICBuZXcgVWludDhBcnJheSgnMDExaTMnLnNwbGl0KCcnKS5tYXAoYyA9PiBjLmNoYXJDb2RlQXQoKSkpKVxuICAgICAgICAgICAgLnRoZW4oKCk9PntcbiAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJz4gRm91bmQgQW50aSBET1MgY2hhcmFjdGVyaXN0aWMnKTtcbiAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dyaXRlQ2hhcmFjdGVyaXN0aWModGhpcy5jb25maWcucmFkaW9TZXJ2aWNlKCksIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5wb3dlckNoYXJhdGVyaXN0aWMoKSxcbiAgICAgICAgICAgICAgICAgICAgbmV3IFVpbnQ4QXJyYXkoWzB4MDddKSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJz4gRm91bmQgVFggUG93ZXIgY2hhcmFjdGVyaXN0aWMnKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl93cml0ZUNoYXJhY3RlcmlzdGljKHRoaXMuY29uZmlnLnJhZGlvU2VydmljZSgpLCBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcud2FrZVVwQ1BVQ2hhcmF0ZXJpc3RpYygpLFxuICAgICAgICAgICAgICAgICAgICBuZXcgVWludDhBcnJheShbMHgwMV0pKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpPT57ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXYWtlIENQVSB3cml0ZSBkb25lLicpOyAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL1NldCByZ2JMZWQgdG8gMFxuICAgICAgICAgICAgICAgIGxldCBjb2xvciA9IDB4MDE7XG4gICAgICAgICAgICAgICAgY29sb3IgJj0gMHhGRjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc2VuZENvbW1hbmQoMHgwMiwgMHgyMCwgbmV3IFVpbnQ4QXJyYXkoW2NvbG9yXSkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZ2IgTGVkIHNldCB0byAwJyk7XG4gICAgICAgICAgICAgICAgLy8gc2V0IEJhY2tMZWQgdG8gMTI3XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmRDb21tYW5kKDB4MDIsIDB4MjEsIG5ldyBVaW50OEFycmF5KFsxMjddKSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCk9PntcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQmFjayBMZWQgc2V0IHRvIDEyNycpO1xuICAgICAgICAgICAgICAgIC8vIHNldCBzdGFiaWxpc2F0aW9uIHRvIDBcbiAgICAgICAgICAgICAgICBsZXQgZmxhZyA9IDA7XG4gICAgICAgICAgICAgICAgZmxhZyAmPSAweDAxO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZW5kQ29tbWFuZCgweDAyLCAweDAyLCBuZXcgVWludDhBcnJheShbZmxhZ10pKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTdGFiaWxpc2F0aW9uIHNldCB0byAwJyk7XG4gICAgICAgICAgICAgICAgLy8gU2V0IGhlYWRpbmcgdG8gMFxuICAgICAgICAgICAgICAgIGxldCBoZWFkaW5nID0gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc2VuZENvbW1hbmQoMHgwMiwgMHgwMSwgbmV3IFVpbnQ4QXJyYXkoW2hlYWRpbmcgPj4gOCwgaGVhZGluZyAmIDB4RkZdKSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCk9PntcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSGVhZGluZyBzZXQgdG8gMCwgZGV2aWNlIGlzIHJlYWR5ICEnKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnRyb2wgdGhlIG1vdG9ycyBvZiByb2JvdFxuICAgICovXG4gICAgcHJvY2Vzc01vdG9yKGhlYWRpbmcsIHBvd2VyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdSb2xsIGhlYWRpbmc9JytoZWFkaW5nKTtcbiAgICAgICAgaWYgKHRoaXMuYnVzeSkge1xuICAgICAgICAgICAgLy8gUmV0dXJuIGlmIGFub3RoZXIgb3BlcmF0aW9uIHBlbmRpbmdcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ1c3kgPSB0cnVlO1xuICAgICAgICBsZXQgZGlkID0gMHgwMjsgLy8gVmlydHVhbCBkZXZpY2UgSURcbiAgICAgICAgbGV0IGNpZCA9IDB4MzA7IC8vIFJvbGwgY29tbWFuZFxuICAgICAgICAvLyBSb2xsIGNvbW1hbmQgZGF0YTogc3BlZWQsIGhlYWRpbmcgKE1TQiksIGhlYWRpbmcgKExTQiksIHN0YXRlXG4gICAgICAgIGxldCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoW3Bvd2VyLCBoZWFkaW5nID4+IDgsIGhlYWRpbmcgJiAweEZGLCAxXSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmRDb21tYW5kKGRpZCwgY2lkLCBkYXRhKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYnVzeSA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycm9yKT0+e1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG5cbiAgICB9XG5cbiAgICBwcm9jZXNzQ29sb3IocmVkLGJsdWUsZ3JlZW4pe1xuICAgICAgICBjb25zb2xlLmxvZygnU2V0IGNvbG9yOiByPScrcmVkKycsZz0nK2dyZWVuKycsYj0nK2JsdWUpO1xuICAgICAgICBpZiAodGhpcy5idXN5KSB7XG4gICAgICAgICAgICAvLyBSZXR1cm4gaWYgYW5vdGhlciBvcGVyYXRpb24gcGVuZGluZ1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnVzeSA9IHRydWU7XG4gICAgICAgIGxldCBkaWQgPSAweDAyOyAvLyBWaXJ0dWFsIGRldmljZSBJRFxuICAgICAgICBsZXQgY2lkID0gMHgyMDsgLy8gU2V0IFJHQiBMRUQgT3V0cHV0IGNvbW1hbmRcbiAgICAgICAgLy8gQ29sb3IgY29tbWFuZCBkYXRhOiByZWQsIGdyZWVuLCBibHVlLCBmbGFnXG4gICAgICAgIGxldCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoW3JlZCwgZ3JlZW4sIGJsdWUsIDBdKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fc2VuZENvbW1hbmQoZGlkLCBjaWQsIGRhdGEpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjb2xvciBzZXQgISBcIik7XG4gICAgICAgICAgICB0aGlzLmJ1c3kgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnJvcik9PntcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgcHJvY2Vzc1NwaW4obG1vdG9yLCBybW90b3Ipe1xuICAgICAgICBjb25zb2xlLmxvZygnU3BpbicpO1xuICAgICAgICBpZiAodGhpcy5idXN5KXtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ1c3kgPSB0cnVlO1xuICAgICAgICBsZXQgZGlkID0gMHgwMjsgLy9WaXJ0dWFsIGRldmljZSBJRFxuICAgICAgICBsZXQgY2lkID0gMHgzMzsgLy8gU2V0IHJhdyBNb3RvcnMgY29tbWFuZFxuICAgICAgICBcbiAgICAgICAgICAgICAgXG4gICAgICAgIGxldCBsbW9kZSA9IGxtb3RvciAmIDB4MDc7XG4gICAgICAgIGxldCBscG93ZXIgPSAyMDAgJiAweEZGO1xuICAgICAgICBsZXQgcm1vZGUgPSBybW90b3IgJiAweDA3O1xuICAgICAgICBsZXQgcnBvd2VyID0gMjAwICYgMHhGRjtcbiAgICAgICAgXG4gICAgICAgIGxldCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoW2xtb2RlLCBscG93ZXIsIHJtb2RlLCBycG93ZXJdKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fc2VuZENvbW1hbmQoZGlkLCBjaWQsIGRhdGEpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxtb2RlID0gdGhpcy5Nb3RvcnMub2ZmICYgMHgwNztcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxwb3dlciA9IDIwMCAmIDB4RkY7XG4gICAgICAgICAgICAgICAgICAgIGxldCBybW9kZSA9IHRoaXMuTW90b3JzLm9mZiAmIDB4MDc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBycG93ZXIgPSAyMDAgJiAweEZGO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGEgPSBuZXcgVWludDhBcnJheShbbG1vZGUsIGxwb3dlciwgcm1vZGUsIHJwb3dlcl0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbmRDb21tYW5kKGRpZCwgY2lkLCBkYXRhKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnVzeSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGVycm9yKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KTsgXG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7ICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpPT57XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuXG4gICAgZGlzY29ubmVjdCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRldmljZSkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdEZXZpY2UgaXMgbm90IGNvbm5lY3RlZC4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRldmljZS5nYXR0LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uRGlzY29ubmVjdGVkKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnRGV2aWNlIGlzIGRpc2Nvbm5lY3RlZC4nKTtcbiAgICB9XG4gICAgXG4gICAgX2ludFRvSGV4QXJyYXkodmFsdWUsIG51bUJ5dGVzKSB7XG4gICAgICAgIHZhciBoZXhBcnJheSA9IG5ldyBBcnJheShudW1CeXRlcyk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IG51bUJ5dGVzIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGhleEFycmF5W2ldID0gdmFsdWUgJiAweEZGO1xuICAgICAgICAgICAgdmFsdWUgPj49IDg7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaGV4QXJyYXk7XG4gICAgIH07XG5cblxuICAgIF9zZW5kQ29tbWFuZChkaWQsIGNpZCwgZGF0YSkge1xuICAgICAgICAvLyBDcmVhdGUgY2xpZW50IGNvbW1hbmQgcGFja2V0c1xuICAgICAgICAvLyBBUEkgZG9jczogaHR0cHM6Ly9naXRodWIuY29tL29yYm90aXgvRGV2ZWxvcGVyUmVzb3VyY2VzL2Jsb2IvbWFzdGVyL2RvY3MvU3BoZXJvX0FQSV8xLjUwLnBkZlxuICAgICAgICAvLyBOZXh0IHNlcXVlbmNlIG51bWJlclxuICAgICAgICBsZXQgc2VxID0gdGhpcy5zZXF1ZW5jZSAmIDI1NTtcbiAgICAgICAgdGhpcy5zZXF1ZW5jZSArPSAxO1xuICAgICAgICAvLyBTdGFydCBvZiBwYWNrZXQgIzJcbiAgICAgICAgbGV0IHNvcDIgPSAweGZjO1xuICAgICAgICBzb3AyIHw9IDE7IC8vIEFuc3dlclxuICAgICAgICBzb3AyIHw9IDI7IC8vIFJlc2V0IHRpbWVvdXRcbiAgICAgICAgLy8gRGF0YSBsZW5ndGhcbiAgICAgICAgbGV0IGRsZW4gPSBkYXRhLmJ5dGVMZW5ndGggKyAxO1xuICAgICAgICBsZXQgc3VtID0gZGF0YS5yZWR1Y2UoKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGEgKyBiO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gQ2hlY2tzdW1cbiAgICAgICAgbGV0IGNoayA9IChzdW0gKyBkaWQgKyBjaWQgKyBzZXEgKyBkbGVuKSAmIDI1NTtcbiAgICAgICAgY2hrIF49IDI1NTtcbiAgICAgICAgbGV0IGNoZWNrc3VtID0gbmV3IFVpbnQ4QXJyYXkoW2Noa10pO1xuXG4gICAgICAgIGxldCBwYWNrZXRzID0gbmV3IFVpbnQ4QXJyYXkoWzB4ZmYsIHNvcDIsIGRpZCwgY2lkLCBzZXEsIGRsZW5dKTtcbiAgICAgICAgLy8gQXBwZW5kIGFycmF5czogcGFja2V0ICsgZGF0YSArIGNoZWNrc3VtXG4gICAgICAgIGxldCBhcnJheSA9IG5ldyBVaW50OEFycmF5KHBhY2tldHMuYnl0ZUxlbmd0aCArIGRhdGEuYnl0ZUxlbmd0aCArIGNoZWNrc3VtLmJ5dGVMZW5ndGgpO1xuICAgICAgICBhcnJheS5zZXQocGFja2V0cywgMCk7XG4gICAgICAgIGFycmF5LnNldChkYXRhLCBwYWNrZXRzLmJ5dGVMZW5ndGgpO1xuICAgICAgICBhcnJheS5zZXQoY2hlY2tzdW0sIHBhY2tldHMuYnl0ZUxlbmd0aCArIGRhdGEuYnl0ZUxlbmd0aCk7XG4gICAgICAgIHJldHVybiB0aGlzLl93cml0ZUNoYXJhY3RlcmlzdGljKHRoaXMuY29uZmlnLnJvYm90U2VydmljZSgpLCB0aGlzLmNvbmZpZy5jb250cm9sQ2hhcmFjdGVyaXN0aWMoKSwgYXJyYXkpLnRoZW4oKHJldHVybkRhdGEpPT57XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQ29tbWFuZCB3cml0ZSBkb25lLiA6ICVzJyxyZXR1cm5EYXRhKTsgIFxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9KTsgICAgICAgICAgXG4gICAgfVxuXG5cbiAgXG5cbiAgICBfd3JpdGVDaGFyYWN0ZXJpc3RpYyhzZXJ2aWNlVUlELCBjaGFyYWN0ZXJpc3RpY1VJRCwgdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlLmdhdHQuZ2V0UHJpbWFyeVNlcnZpY2Uoc2VydmljZVVJRClcbiAgICAgICAgICAgIC50aGVuKHNlcnZpY2UgPT4gc2VydmljZS5nZXRDaGFyYWN0ZXJpc3RpYyhjaGFyYWN0ZXJpc3RpY1VJRCkpXG4gICAgICAgICAgICAudGhlbihjaGFyYWN0ZXJpc3RpYyA9PiBjaGFyYWN0ZXJpc3RpYy53cml0ZVZhbHVlKHZhbHVlKSk7XG4gICAgfVxuXG5cbn1cblxuXG5sZXQgb2xsaWUgPSBuZXcgT2xsaWUoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBvbGxpZTsiXX0=
