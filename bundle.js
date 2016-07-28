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

                        let partBtn = document.querySelector('.part-button');
                        
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
},{"./components/colorpicker.js":2,"./ollie/ollie":3}],2:[function(require,module,exports){

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzY3JpcHRzL2FwcC5qcyIsInNjcmlwdHMvY29tcG9uZW50cy9jb2xvcnBpY2tlci5qcyIsInNjcmlwdHMvb2xsaWUvb2xsaWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCdcblxuICAgIGZ1bmN0aW9uIHBhZ2VMb2FkKCkge1xuXG4gICAgICAgIC8vIENoZWNrIHRoZSBjdXJyZW50IHBhcnQgb2YgTWJvdFxuICAgICAgICBsZXQgbm9CbHVldG9vdGggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vQmx1ZXRvb3RoXCIpO1xuICAgICAgICBsZXQgc3RlcENvbm5lY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0ZXBDb25uZWN0XCIpO1xuICAgICAgICBsZXQgc3RlcENvbnRyb2wgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0ZXBDb250cm9sXCIpO1xuICAgICAgICAvLyBDaGVjayBpZiB0aGUgYmx1ZXRvb3RoIGlzIGF2YWlsYWJsZVxuICAgICAgICBpZiAobmF2aWdhdG9yLmJsdWV0b290aCA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJObyBuYXZpZ2F0b3IuYmx1ZXRvb3RoIGZvdW5kLlwiKTtcbiAgICAgICAgICAgIHN0ZXBDb25uZWN0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIG5vQmx1ZXRvb3RoLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIERpc3BsYXkgdGhlIGNvbm5lY3QgYnV0dG9uXG4gICAgICAgICAgICBzdGVwQ29ubmVjdC5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgICAgICBub0JsdWV0b290aC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICBsZXQgb2xsaWUgPSByZXF1aXJlKFwiLi9vbGxpZS9vbGxpZVwiKTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgdGhlIGNvbm5lY3Rpb25cbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29ubmVjdEJ0blwiKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIF8gPT4ge1xuICAgICAgICAgICAgICAgIC8vIFJlcXVlc3QgdGhlIGRldmljZVxuICAgICAgICAgICAgICAgIG9sbGllLnJlcXVlc3QoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihfID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbm5lY3QgdG8gdGhlIG9sbGllXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2xsaWUuY29ubmVjdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvbGxpZS5pbml0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbihfID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbm5lY3Rpb24gaXMgZG9uZSwgd2Ugc2hvdyB0aGUgY29udHJvbHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBDb25uZWN0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBDb250cm9sLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucGFydC1idXR0b24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udHJvbCB0aGUgcm9ib3QgYnkgYnV0dG9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJ0blVwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0blVwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYnRuRG93biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5Eb3duJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYnRuTGVmdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5MZWZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYnRuUmlnaHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuUmlnaHQnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYnRuVXAuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIF8gPT4geyBvbGxpZS5wcm9jZXNzTW90b3IoMCw1MCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidG5Eb3duLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBfID0+IHsgb2xsaWUucHJvY2Vzc01vdG9yKDE4MCw1MCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidG5MZWZ0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBfID0+IHsgb2xsaWUucHJvY2Vzc01vdG9yKDI3MCw1MCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidG5SaWdodC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3Rvcig5MCw1MCkgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJ0blVwLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3RvcigwLCAwKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ0bkRvd24uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBfID0+IHsgb2xsaWUucHJvY2Vzc01vdG9yKDE4MCwgMCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidG5MZWZ0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3RvcigyNzAsIDApIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnRuUmlnaHQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBfID0+IHsgb2xsaWUucHJvY2Vzc01vdG9yKDkwLCAwKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHJpY2tzIHdpdGggdGhlIHJvYm90XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuVHJpY2sxJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfPT57IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sbGllLnByb2Nlc3NTcGluKG9sbGllLk1vdG9ycy5mb3J3YXJkLCBvbGxpZS5Nb3RvcnMucmV2ZXJzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0blRyaWNrMicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXz0+eyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGxpZS5wcm9jZXNzU3BpbihvbGxpZS5Nb3RvcnMucmV2ZXJzZSwgb2xsaWUuTW90b3JzLmZvcndhcmQpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5UcmljazMnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIF89PnsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xsaWUucHJvY2Vzc1NwaW4ob2xsaWUuTW90b3JzLmZvcndhcmQsIG9sbGllLk1vdG9ycy5mb3J3YXJkKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuVHJpY2s0JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfPT57IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sbGllLnByb2Nlc3NTcGluKG9sbGllLk1vdG9ycy5yZXZlcnNlLCBvbGxpZS5Nb3RvcnMucmV2ZXJzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb2xvciB0aGUgcm9ib3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBDb2xvclBpY2tlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9jb2xvcnBpY2tlci5qcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IENvbG9yUGlja2VyKChyZ2IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGxpZS5wcm9jZXNzQ29sb3IocmdiLnJlZCwgcmdiLmJsdWUsIHJnYi5ncmVlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pO1xuXG5cblxuICAgICAgICB9XG5cbiAgICB9XG5cblxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBwYWdlTG9hZCk7XG5cbiAgICAvKmlmICgnc2VydmljZVdvcmtlcicgaW4gbmF2aWdhdG9yKSB7ICAgICAgICBcbiAgICAgICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJy4vc2VydmljZS13b3JrZXIuanMnLCB7c2NvcGUgOiBsb2NhdGlvbi5wYXRobmFtZX0pLnRoZW4oZnVuY3Rpb24ocmVnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU2VydmljZSBXb3JrZXIgUmVnaXN0ZXIgZm9yIHNjb3BlIDogJXMnLHJlZy5zY29wZSk7XG4gICAgICAgIH0pO1xuICAgIH0qL1xuXG59KSgpOyIsIlxuY2xhc3MgQ29sb3JQaWNrZXIge1xuICAgIGNvbnN0cnVjdG9yKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHRoaXMuaW1nLnNyYyA9ICcuL2Fzc2V0cy9pbWFnZXMvY29sb3Itd2hlZWwucG5nJztcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB0aGlzLmltZy5vbmxvYWQgPSB0aGlzLl9sb2FkLmJpbmQodGhpcyk7XG4gICAgfVxuXG5cbiAgICBfbG9hZCgpIHtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gMTUwICogZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gMTUwICogZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUud2lkdGggPSBcIjE1MHB4XCI7XG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCA9IFwiMTUwcHhcIjtcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9jYWxjdWxhdGVSZ2IuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgfVxuXG5cbiAgICBfY2FsY3VsYXRlUmdiKGV2dCkge1xuICAgICAgICAvLyBSZWZyZXNoIGNhbnZhcyBpbiBjYXNlIHVzZXIgem9vbXMgYW5kIGRldmljZVBpeGVsUmF0aW8gY2hhbmdlcy5cbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSAxNTAgKiBkZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSAxNTAgKiBkZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgICB0aGlzLmNvbnRleHQuZHJhd0ltYWdlKHRoaXMuaW1nLCAwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgeCA9IE1hdGgucm91bmQoKGV2dC5jbGllbnRYIC0gcmVjdC5sZWZ0KSAqIGRldmljZVBpeGVsUmF0aW8pO1xuICAgICAgICBsZXQgeSA9IE1hdGgucm91bmQoKGV2dC5jbGllbnRZIC0gcmVjdC50b3ApICogZGV2aWNlUGl4ZWxSYXRpbyk7XG4gICAgICAgIGxldCBkYXRhID0gdGhpcy5jb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KS5kYXRhO1xuXG4gICAgICAgIGxldCByID0gZGF0YVsoKHRoaXMuY2FudmFzLndpZHRoICogeSkgKyB4KSAqIDRdO1xuICAgICAgICBsZXQgZyA9IGRhdGFbKCh0aGlzLmNhbnZhcy53aWR0aCAqIHkpICsgeCkgKiA0ICsgMV07XG4gICAgICAgIGxldCBiID0gZGF0YVsoKHRoaXMuY2FudmFzLndpZHRoICogeSkgKyB4KSAqIDQgKyAyXTtcblxuICAgICAgICB0aGlzLmNhbGxiYWNrKHtcbiAgICAgICAgICAgIHJlZDogcixcbiAgICAgICAgICAgIGJsdWU6IGIsXG4gICAgICAgICAgICBncmVlbjogZ1xuICAgICAgICB9KTtcblxuXG4gICAgICAgIHRoaXMuY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5jb250ZXh0LmFyYyh4LCB5ICsgMiwgMTAgKiBkZXZpY2VQaXhlbFJhdGlvLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgICAgICB0aGlzLmNvbnRleHQuc2hhZG93Q29sb3IgPSAnIzMzMyc7XG4gICAgICAgIHRoaXMuY29udGV4dC5zaGFkb3dCbHVyID0gNCAqIGRldmljZVBpeGVsUmF0aW87XG4gICAgICAgIHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgICAgICB0aGlzLmNvbnRleHQuZmlsbCgpO1xuICAgIH1cblxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sb3JQaWNrZXI7IiwiJ3VzZSBzdHJpY3QnXG5cbi8qKlxuICogR2VuZXJhbCBjb25maWd1cmF0aW9uIChVVUlEKVxuKi9cbmNsYXNzIENvbmZpZyB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG4gICAgXG4gICAgcmFkaW9TZXJ2aWNlKCkgeyByZXR1cm4gXCIyMmJiNzQ2Zi0yYmIwLTc1NTQtMmQ2Zi03MjY1Njg3MDUzMjdcIiB9XG4gICAgcm9ib3RTZXJ2aWNlKCkgeyByZXR1cm4gXCIyMmJiNzQ2Zi0yYmEwLTc1NTQtMmQ2Zi03MjY1Njg3MDUzMjdcIiB9XG4gICAgY29udHJvbENoYXJhY3RlcmlzdGljKCkgeyByZXR1cm4gXCIyMmJiNzQ2Zi0yYmExLTc1NTQtMmQ2Zi03MjY1Njg3MDUzMjdcIiB9XG4gICAgYW50aURPU0NoYXJhdGVyaXN0aWMoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYmQtNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cbiAgICBwb3dlckNoYXJhdGVyaXN0aWMoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYjItNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cbiAgICB3YWtlVXBDUFVDaGFyYXRlcmlzdGljKCkgeyByZXR1cm4gXCIyMmJiNzQ2Zi0yYmJmLTc1NTQtMmQ2Zi03MjY1Njg3MDUzMjdcIiB9XG59XG5cbiAgICBcblxuLyoqXG4gKiBDbGFzcyBmb3IgdGhlIHJvYm90XG4gKiAqL1xuY2xhc3MgT2xsaWUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmRldmljZSA9IG51bGw7XG4gICAgICAgIHRoaXMuY29uZmlnID0gbmV3IENvbmZpZygpO1xuICAgICAgICB0aGlzLm9uRGlzY29ubmVjdGVkID0gdGhpcy5vbkRpc2Nvbm5lY3RlZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJ1enplckluZGV4ID0gMDtcbiAgICAgICAgdGhpcy5zZXF1ZW5jZSA9IDA7XG4gICAgICAgIHRoaXMuYnVzeSA9IGZhbHNlO1xuICAgICAgICB0aGlzLk1vdG9ycyA9IHtcbiAgICAgICAgICAgIG9mZiA6IDB4MDAsXG4gICAgICAgICAgICBmb3J3YXJkIDogMHgwMSxcbiAgICAgICAgICAgIHJldmVyc2UgOiAweDAyLFxuICAgICAgICAgICAgYnJha2UgOiAweDAzLFxuICAgICAgICAgICAgaWdub3JlIDogMHgwNFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICBSZXF1ZXN0IHRoZSBkZXZpY2Ugd2l0aCBibHVldG9vdGhcbiAgICAqL1xuICAgIHJlcXVlc3QoKSB7XG4gICAgICAgIGxldCBvcHRpb25zID0ge1xuICAgICAgICAgICAgXCJmaWx0ZXJzXCI6IFt7XG4gICAgICAgICAgICAgICAgXCJzZXJ2aWNlc1wiOiBbdGhpcy5jb25maWcucmFkaW9TZXJ2aWNlKCldXG4gICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICBcInNlcnZpY2VzXCI6IFt0aGlzLmNvbmZpZy5yb2JvdFNlcnZpY2UoKV1cbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgXCJvcHRpb25hbFNlcnZpY2VzXCI6IFt0aGlzLmNvbmZpZy5yYWRpb1NlcnZpY2UoKSwgdGhpcy5jb25maWcucm9ib3RTZXJ2aWNlKCldXG4gICAgICAgIH07ICAgICAgICBcbiAgICAgICAgcmV0dXJuIG5hdmlnYXRvci5ibHVldG9vdGgucmVxdWVzdERldmljZShvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oZGV2aWNlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRldmljZSA9IGRldmljZTtcbiAgICAgICAgICAgICAgICB0aGlzLmRldmljZS5hZGRFdmVudExpc3RlbmVyKCdnYXR0c2VydmVyZGlzY29ubmVjdGVkJywgdGhpcy5vbkRpc2Nvbm5lY3RlZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRldmljZTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbm5lY3QgdG8gdGhlIGRldmljZVxuICAgICAqICovXG4gICAgY29ubmVjdCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRldmljZSkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdEZXZpY2UgaXMgbm90IGNvbm5lY3RlZC4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRldmljZS5nYXR0LmNvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpbml0KCl7XG4gICAgICAgIGlmKCF0aGlzLmRldmljZSl7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ0RldmljZSBpcyBub3QgY29ubmVjdGVkLicpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dyaXRlQ2hhcmFjdGVyaXN0aWModGhpcy5jb25maWcucmFkaW9TZXJ2aWNlKCksIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5hbnRpRE9TQ2hhcmF0ZXJpc3RpYygpLFxuICAgICAgICAgICAgICAgICAgICBuZXcgVWludDhBcnJheSgnMDExaTMnLnNwbGl0KCcnKS5tYXAoYyA9PiBjLmNoYXJDb2RlQXQoKSkpKVxuICAgICAgICAgICAgLnRoZW4oKCk9PntcbiAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJz4gRm91bmQgQW50aSBET1MgY2hhcmFjdGVyaXN0aWMnKTtcbiAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dyaXRlQ2hhcmFjdGVyaXN0aWModGhpcy5jb25maWcucmFkaW9TZXJ2aWNlKCksIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5wb3dlckNoYXJhdGVyaXN0aWMoKSxcbiAgICAgICAgICAgICAgICAgICAgbmV3IFVpbnQ4QXJyYXkoWzB4MDddKSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJz4gRm91bmQgVFggUG93ZXIgY2hhcmFjdGVyaXN0aWMnKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl93cml0ZUNoYXJhY3RlcmlzdGljKHRoaXMuY29uZmlnLnJhZGlvU2VydmljZSgpLCBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcud2FrZVVwQ1BVQ2hhcmF0ZXJpc3RpYygpLFxuICAgICAgICAgICAgICAgICAgICBuZXcgVWludDhBcnJheShbMHgwMV0pKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpPT57ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXYWtlIENQVSB3cml0ZSBkb25lLicpOyAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL1NldCByZ2JMZWQgdG8gMFxuICAgICAgICAgICAgICAgIGxldCBjb2xvciA9IDB4MDE7XG4gICAgICAgICAgICAgICAgY29sb3IgJj0gMHhGRjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc2VuZENvbW1hbmQoMHgwMiwgMHgyMCwgbmV3IFVpbnQ4QXJyYXkoW2NvbG9yXSkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZ2IgTGVkIHNldCB0byAwJyk7XG4gICAgICAgICAgICAgICAgLy8gc2V0IEJhY2tMZWQgdG8gMTI3XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmRDb21tYW5kKDB4MDIsIDB4MjEsIG5ldyBVaW50OEFycmF5KFsxMjddKSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCk9PntcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQmFjayBMZWQgc2V0IHRvIDEyNycpO1xuICAgICAgICAgICAgICAgIC8vIHNldCBzdGFiaWxpc2F0aW9uIHRvIDBcbiAgICAgICAgICAgICAgICBsZXQgZmxhZyA9IDA7XG4gICAgICAgICAgICAgICAgZmxhZyAmPSAweDAxO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZW5kQ29tbWFuZCgweDAyLCAweDAyLCBuZXcgVWludDhBcnJheShbZmxhZ10pKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTdGFiaWxpc2F0aW9uIHNldCB0byAwJyk7XG4gICAgICAgICAgICAgICAgLy8gU2V0IGhlYWRpbmcgdG8gMFxuICAgICAgICAgICAgICAgIGxldCBoZWFkaW5nID0gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc2VuZENvbW1hbmQoMHgwMiwgMHgwMSwgbmV3IFVpbnQ4QXJyYXkoW2hlYWRpbmcgPj4gOCwgaGVhZGluZyAmIDB4RkZdKSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCk9PntcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSGVhZGluZyBzZXQgdG8gMCwgZGV2aWNlIGlzIHJlYWR5ICEnKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnRyb2wgdGhlIG1vdG9ycyBvZiByb2JvdFxuICAgICovXG4gICAgcHJvY2Vzc01vdG9yKGhlYWRpbmcsIHBvd2VyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdSb2xsIGhlYWRpbmc9JytoZWFkaW5nKTtcbiAgICAgICAgaWYgKHRoaXMuYnVzeSkge1xuICAgICAgICAgICAgLy8gUmV0dXJuIGlmIGFub3RoZXIgb3BlcmF0aW9uIHBlbmRpbmdcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ1c3kgPSB0cnVlO1xuICAgICAgICBsZXQgZGlkID0gMHgwMjsgLy8gVmlydHVhbCBkZXZpY2UgSURcbiAgICAgICAgbGV0IGNpZCA9IDB4MzA7IC8vIFJvbGwgY29tbWFuZFxuICAgICAgICAvLyBSb2xsIGNvbW1hbmQgZGF0YTogc3BlZWQsIGhlYWRpbmcgKE1TQiksIGhlYWRpbmcgKExTQiksIHN0YXRlXG4gICAgICAgIGxldCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoW3Bvd2VyLCBoZWFkaW5nID4+IDgsIGhlYWRpbmcgJiAweEZGLCAxXSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmRDb21tYW5kKGRpZCwgY2lkLCBkYXRhKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYnVzeSA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycm9yKT0+e1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG5cbiAgICB9XG5cbiAgICBwcm9jZXNzQ29sb3IocmVkLGJsdWUsZ3JlZW4pe1xuICAgICAgICBjb25zb2xlLmxvZygnU2V0IGNvbG9yOiByPScrcmVkKycsZz0nK2dyZWVuKycsYj0nK2JsdWUpO1xuICAgICAgICBpZiAodGhpcy5idXN5KSB7XG4gICAgICAgICAgICAvLyBSZXR1cm4gaWYgYW5vdGhlciBvcGVyYXRpb24gcGVuZGluZ1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnVzeSA9IHRydWU7XG4gICAgICAgIGxldCBkaWQgPSAweDAyOyAvLyBWaXJ0dWFsIGRldmljZSBJRFxuICAgICAgICBsZXQgY2lkID0gMHgyMDsgLy8gU2V0IFJHQiBMRUQgT3V0cHV0IGNvbW1hbmRcbiAgICAgICAgLy8gQ29sb3IgY29tbWFuZCBkYXRhOiByZWQsIGdyZWVuLCBibHVlLCBmbGFnXG4gICAgICAgIGxldCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoW3JlZCwgZ3JlZW4sIGJsdWUsIDBdKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fc2VuZENvbW1hbmQoZGlkLCBjaWQsIGRhdGEpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjb2xvciBzZXQgISBcIik7XG4gICAgICAgICAgICB0aGlzLmJ1c3kgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnJvcik9PntcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgcHJvY2Vzc1NwaW4obG1vdG9yLCBybW90b3Ipe1xuICAgICAgICBjb25zb2xlLmxvZygnU3BpbicpO1xuICAgICAgICBpZiAodGhpcy5idXN5KXtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ1c3kgPSB0cnVlO1xuICAgICAgICBsZXQgZGlkID0gMHgwMjsgLy9WaXJ0dWFsIGRldmljZSBJRFxuICAgICAgICBsZXQgY2lkID0gMHgzMzsgLy8gU2V0IHJhdyBNb3RvcnMgY29tbWFuZFxuICAgICAgICBcbiAgICAgICAgICAgICAgXG4gICAgICAgIGxldCBsbW9kZSA9IGxtb3RvciAmIDB4MDc7XG4gICAgICAgIGxldCBscG93ZXIgPSAyMDAgJiAweEZGO1xuICAgICAgICBsZXQgcm1vZGUgPSBybW90b3IgJiAweDA3O1xuICAgICAgICBsZXQgcnBvd2VyID0gMjAwICYgMHhGRjtcbiAgICAgICAgXG4gICAgICAgIGxldCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoW2xtb2RlLCBscG93ZXIsIHJtb2RlLCBycG93ZXJdKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fc2VuZENvbW1hbmQoZGlkLCBjaWQsIGRhdGEpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxtb2RlID0gdGhpcy5Nb3RvcnMub2ZmICYgMHgwNztcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxwb3dlciA9IDIwMCAmIDB4RkY7XG4gICAgICAgICAgICAgICAgICAgIGxldCBybW9kZSA9IHRoaXMuTW90b3JzLm9mZiAmIDB4MDc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBycG93ZXIgPSAyMDAgJiAweEZGO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGEgPSBuZXcgVWludDhBcnJheShbbG1vZGUsIGxwb3dlciwgcm1vZGUsIHJwb3dlcl0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbmRDb21tYW5kKGRpZCwgY2lkLCBkYXRhKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnVzeSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGVycm9yKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KTsgXG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7ICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpPT57XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuXG4gICAgZGlzY29ubmVjdCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRldmljZSkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdEZXZpY2UgaXMgbm90IGNvbm5lY3RlZC4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRldmljZS5nYXR0LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uRGlzY29ubmVjdGVkKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnRGV2aWNlIGlzIGRpc2Nvbm5lY3RlZC4nKTtcbiAgICB9XG4gICAgXG4gICAgX2ludFRvSGV4QXJyYXkodmFsdWUsIG51bUJ5dGVzKSB7XG4gICAgICAgIHZhciBoZXhBcnJheSA9IG5ldyBBcnJheShudW1CeXRlcyk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IG51bUJ5dGVzIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGhleEFycmF5W2ldID0gdmFsdWUgJiAweEZGO1xuICAgICAgICAgICAgdmFsdWUgPj49IDg7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaGV4QXJyYXk7XG4gICAgIH07XG5cblxuICAgIF9zZW5kQ29tbWFuZChkaWQsIGNpZCwgZGF0YSkge1xuICAgICAgICAvLyBDcmVhdGUgY2xpZW50IGNvbW1hbmQgcGFja2V0c1xuICAgICAgICAvLyBBUEkgZG9jczogaHR0cHM6Ly9naXRodWIuY29tL29yYm90aXgvRGV2ZWxvcGVyUmVzb3VyY2VzL2Jsb2IvbWFzdGVyL2RvY3MvU3BoZXJvX0FQSV8xLjUwLnBkZlxuICAgICAgICAvLyBOZXh0IHNlcXVlbmNlIG51bWJlclxuICAgICAgICBsZXQgc2VxID0gdGhpcy5zZXF1ZW5jZSAmIDI1NTtcbiAgICAgICAgdGhpcy5zZXF1ZW5jZSArPSAxO1xuICAgICAgICAvLyBTdGFydCBvZiBwYWNrZXQgIzJcbiAgICAgICAgbGV0IHNvcDIgPSAweGZjO1xuICAgICAgICBzb3AyIHw9IDE7IC8vIEFuc3dlclxuICAgICAgICBzb3AyIHw9IDI7IC8vIFJlc2V0IHRpbWVvdXRcbiAgICAgICAgLy8gRGF0YSBsZW5ndGhcbiAgICAgICAgbGV0IGRsZW4gPSBkYXRhLmJ5dGVMZW5ndGggKyAxO1xuICAgICAgICBsZXQgc3VtID0gZGF0YS5yZWR1Y2UoKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGEgKyBiO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gQ2hlY2tzdW1cbiAgICAgICAgbGV0IGNoayA9IChzdW0gKyBkaWQgKyBjaWQgKyBzZXEgKyBkbGVuKSAmIDI1NTtcbiAgICAgICAgY2hrIF49IDI1NTtcbiAgICAgICAgbGV0IGNoZWNrc3VtID0gbmV3IFVpbnQ4QXJyYXkoW2Noa10pO1xuXG4gICAgICAgIGxldCBwYWNrZXRzID0gbmV3IFVpbnQ4QXJyYXkoWzB4ZmYsIHNvcDIsIGRpZCwgY2lkLCBzZXEsIGRsZW5dKTtcbiAgICAgICAgLy8gQXBwZW5kIGFycmF5czogcGFja2V0ICsgZGF0YSArIGNoZWNrc3VtXG4gICAgICAgIGxldCBhcnJheSA9IG5ldyBVaW50OEFycmF5KHBhY2tldHMuYnl0ZUxlbmd0aCArIGRhdGEuYnl0ZUxlbmd0aCArIGNoZWNrc3VtLmJ5dGVMZW5ndGgpO1xuICAgICAgICBhcnJheS5zZXQocGFja2V0cywgMCk7XG4gICAgICAgIGFycmF5LnNldChkYXRhLCBwYWNrZXRzLmJ5dGVMZW5ndGgpO1xuICAgICAgICBhcnJheS5zZXQoY2hlY2tzdW0sIHBhY2tldHMuYnl0ZUxlbmd0aCArIGRhdGEuYnl0ZUxlbmd0aCk7XG4gICAgICAgIHJldHVybiB0aGlzLl93cml0ZUNoYXJhY3RlcmlzdGljKHRoaXMuY29uZmlnLnJvYm90U2VydmljZSgpLCB0aGlzLmNvbmZpZy5jb250cm9sQ2hhcmFjdGVyaXN0aWMoKSwgYXJyYXkpLnRoZW4oKHJldHVybkRhdGEpPT57XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQ29tbWFuZCB3cml0ZSBkb25lLiA6ICVzJyxyZXR1cm5EYXRhKTsgIFxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9KTsgICAgICAgICAgXG4gICAgfVxuXG5cbiAgXG5cbiAgICBfd3JpdGVDaGFyYWN0ZXJpc3RpYyhzZXJ2aWNlVUlELCBjaGFyYWN0ZXJpc3RpY1VJRCwgdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlLmdhdHQuZ2V0UHJpbWFyeVNlcnZpY2Uoc2VydmljZVVJRClcbiAgICAgICAgICAgIC50aGVuKHNlcnZpY2UgPT4gc2VydmljZS5nZXRDaGFyYWN0ZXJpc3RpYyhjaGFyYWN0ZXJpc3RpY1VJRCkpXG4gICAgICAgICAgICAudGhlbihjaGFyYWN0ZXJpc3RpYyA9PiBjaGFyYWN0ZXJpc3RpYy53cml0ZVZhbHVlKHZhbHVlKSk7XG4gICAgfVxuXG5cbn1cblxuXG5sZXQgb2xsaWUgPSBuZXcgT2xsaWUoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBvbGxpZTsiXX0=
