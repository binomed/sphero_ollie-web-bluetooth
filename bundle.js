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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzY3JpcHRzL2FwcC5qcyIsInNjcmlwdHMvY29tcG9uZW50cy9jb2xvcnBpY2tlci5qcyIsInNjcmlwdHMvb2xsaWUvb2xsaWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCdcblxuICAgIGZ1bmN0aW9uIHBhZ2VMb2FkKCkge1xuXG4gICAgICAgIC8vIENoZWNrIHRoZSBjdXJyZW50IHBhcnQgb2YgTWJvdFxuICAgICAgICBsZXQgbm9CbHVldG9vdGggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vQmx1ZXRvb3RoXCIpO1xuICAgICAgICBsZXQgc3RlcENvbm5lY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0ZXBDb25uZWN0XCIpO1xuICAgICAgICBsZXQgc3RlcENvbnRyb2wgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0ZXBDb250cm9sXCIpO1xuICAgICAgICAvLyBDaGVjayBpZiB0aGUgYmx1ZXRvb3RoIGlzIGF2YWlsYWJsZVxuICAgICAgICBpZiAobmF2aWdhdG9yLmJsdWV0b290aCA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJObyBuYXZpZ2F0b3IuYmx1ZXRvb3RoIGZvdW5kLlwiKTtcbiAgICAgICAgICAgIHN0ZXBDb25uZWN0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIG5vQmx1ZXRvb3RoLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIERpc3BsYXkgdGhlIGNvbm5lY3QgYnV0dG9uXG4gICAgICAgICAgICBzdGVwQ29ubmVjdC5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgICAgICBub0JsdWV0b290aC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICBsZXQgb2xsaWUgPSByZXF1aXJlKFwiLi9vbGxpZS9vbGxpZVwiKTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgdGhlIGNvbm5lY3Rpb25cbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29ubmVjdEJ0blwiKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIF8gPT4ge1xuICAgICAgICAgICAgICAgIC8vIFJlcXVlc3QgdGhlIGRldmljZVxuICAgICAgICAgICAgICAgIG9sbGllLnJlcXVlc3QoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihfID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbm5lY3QgdG8gdGhlIG9sbGllXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2xsaWUuY29ubmVjdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvbGxpZS5pbml0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbihfID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbm5lY3Rpb24gaXMgZG9uZSwgd2Ugc2hvdyB0aGUgY29udHJvbHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBDb25uZWN0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBDb250cm9sLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucGFydC1idXR0b24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udHJvbCB0aGUgcm9ib3QgYnkgYnV0dG9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJ0blVwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0blVwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYnRuRG93biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5Eb3duJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYnRuTGVmdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5MZWZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYnRuUmlnaHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuUmlnaHQnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYnRuVXAuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIF8gPT4geyBvbGxpZS5wcm9jZXNzTW90b3IoMCw1MCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidG5Eb3duLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBfID0+IHsgb2xsaWUucHJvY2Vzc01vdG9yKDE4MCw1MCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidG5MZWZ0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBfID0+IHsgb2xsaWUucHJvY2Vzc01vdG9yKDI3MCw1MCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidG5SaWdodC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3Rvcig5MCw1MCkgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJ0blVwLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3RvcigwLCAwKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ0bkRvd24uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBfID0+IHsgb2xsaWUucHJvY2Vzc01vdG9yKDE4MCwgMCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidG5MZWZ0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3RvcigyNzAsIDApIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnRuUmlnaHQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBfID0+IHsgb2xsaWUucHJvY2Vzc01vdG9yKDkwLCAwKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHJpY2tzIHdpdGggdGhlIHJvYm90XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuVHJpY2sxJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfPT57IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sbGllLnByb2Nlc3NTcGluKG9sbGllLk1vdG9ycy5mb3J3YXJkLCBvbGxpZS5Nb3RvcnMucmV2ZXJzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0blRyaWNrMicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXz0+eyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGxpZS5wcm9jZXNzU3BpbihvbGxpZS5Nb3RvcnMucmV2ZXJzZSwgb2xsaWUuTW90b3JzLmZvcndhcmQpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5UcmljazMnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIF89PnsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xsaWUucHJvY2Vzc1NwaW4ob2xsaWUuTW90b3JzLmZvcndhcmQsIG9sbGllLk1vdG9ycy5mb3J3YXJkKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbG9yIHRoZSByb2JvdFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IENvbG9yUGlja2VyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2NvbG9ycGlja2VyLmpzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgQ29sb3JQaWNrZXIoKHJnYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sbGllLnByb2Nlc3NDb2xvcihyZ2IucmVkLCByZ2IuYmx1ZSwgcmdiLmdyZWVuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG5cblxuXG4gICAgICAgIH1cblxuICAgIH1cblxuXG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHBhZ2VMb2FkKTtcblxuICAgIC8qaWYgKCdzZXJ2aWNlV29ya2VyJyBpbiBuYXZpZ2F0b3IpIHsgICAgICAgIFxuICAgICAgICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3RlcignLi9zZXJ2aWNlLXdvcmtlci5qcycsIHtzY29wZSA6IGxvY2F0aW9uLnBhdGhuYW1lfSkudGhlbihmdW5jdGlvbihyZWcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlIFdvcmtlciBSZWdpc3RlciBmb3Igc2NvcGUgOiAlcycscmVnLnNjb3BlKTtcbiAgICAgICAgfSk7XG4gICAgfSovXG5cbn0pKCk7IiwiXG5jbGFzcyBDb2xvclBpY2tlciB7XG4gICAgY29uc3RydWN0b3IoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgdGhpcy5pbWcuc3JjID0gJy4vYXNzZXRzL2ltYWdlcy9jb2xvci13aGVlbC5wbmcnO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJyk7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIHRoaXMuaW1nLm9ubG9hZCA9IHRoaXMuX2xvYWQuYmluZCh0aGlzKTtcbiAgICB9XG5cblxuICAgIF9sb2FkKCkge1xuICAgICAgICBcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSAxNTAgKiBkZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSAxNTAgKiBkZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS53aWR0aCA9IFwiMTUwcHhcIjtcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gXCIxNTBweFwiO1xuICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2NhbGN1bGF0ZVJnYi5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLmNvbnRleHQuZHJhd0ltYWdlKHRoaXMuaW1nLCAwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICB9XG5cblxuICAgIF9jYWxjdWxhdGVSZ2IoZXZ0KSB7XG4gICAgICAgIC8vIFJlZnJlc2ggY2FudmFzIGluIGNhc2UgdXNlciB6b29tcyBhbmQgZGV2aWNlUGl4ZWxSYXRpbyBjaGFuZ2VzLlxuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IDE1MCAqIGRldmljZVBpeGVsUmF0aW87XG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IDE1MCAqIGRldmljZVBpeGVsUmF0aW87XG4gICAgICAgIHRoaXMuY29udGV4dC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuXG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCB4ID0gTWF0aC5yb3VuZCgoZXZ0LmNsaWVudFggLSByZWN0LmxlZnQpICogZGV2aWNlUGl4ZWxSYXRpbyk7XG4gICAgICAgIGxldCB5ID0gTWF0aC5yb3VuZCgoZXZ0LmNsaWVudFkgLSByZWN0LnRvcCkgKiBkZXZpY2VQaXhlbFJhdGlvKTtcbiAgICAgICAgbGV0IGRhdGEgPSB0aGlzLmNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpLmRhdGE7XG5cbiAgICAgICAgbGV0IHIgPSBkYXRhWygodGhpcy5jYW52YXMud2lkdGggKiB5KSArIHgpICogNF07XG4gICAgICAgIGxldCBnID0gZGF0YVsoKHRoaXMuY2FudmFzLndpZHRoICogeSkgKyB4KSAqIDQgKyAxXTtcbiAgICAgICAgbGV0IGIgPSBkYXRhWygodGhpcy5jYW52YXMud2lkdGggKiB5KSArIHgpICogNCArIDJdO1xuXG4gICAgICAgIHRoaXMuY2FsbGJhY2soe1xuICAgICAgICAgICAgcmVkOiByLFxuICAgICAgICAgICAgYmx1ZTogYixcbiAgICAgICAgICAgIGdyZWVuOiBnXG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgdGhpcy5jb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICB0aGlzLmNvbnRleHQuYXJjKHgsIHkgKyAyLCAxMCAqIGRldmljZVBpeGVsUmF0aW8sIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuY29udGV4dC5zaGFkb3dDb2xvciA9ICcjMzMzJztcbiAgICAgICAgdGhpcy5jb250ZXh0LnNoYWRvd0JsdXIgPSA0ICogZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgICAgdGhpcy5jb250ZXh0LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gICAgICAgIHRoaXMuY29udGV4dC5maWxsKCk7XG4gICAgfVxuXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb2xvclBpY2tlcjsiLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBHZW5lcmFsIGNvbmZpZ3VyYXRpb24gKFVVSUQpXG4qL1xuY2xhc3MgQ29uZmlnIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgIH1cbiAgICBcbiAgICByYWRpb1NlcnZpY2UoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYjAtNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cbiAgICByb2JvdFNlcnZpY2UoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYTAtNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cbiAgICBjb250cm9sQ2hhcmFjdGVyaXN0aWMoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYTEtNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cbiAgICBhbnRpRE9TQ2hhcmF0ZXJpc3RpYygpIHsgcmV0dXJuIFwiMjJiYjc0NmYtMmJiZC03NTU0LTJkNmYtNzI2NTY4NzA1MzI3XCIgfVxuICAgIHBvd2VyQ2hhcmF0ZXJpc3RpYygpIHsgcmV0dXJuIFwiMjJiYjc0NmYtMmJiMi03NTU0LTJkNmYtNzI2NTY4NzA1MzI3XCIgfVxuICAgIHdha2VVcENQVUNoYXJhdGVyaXN0aWMoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYmYtNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cbn1cblxuICAgIFxuXG4vKipcbiAqIENsYXNzIGZvciB0aGUgcm9ib3RcbiAqICovXG5jbGFzcyBPbGxpZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZGV2aWNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5jb25maWcgPSBuZXcgQ29uZmlnKCk7XG4gICAgICAgIHRoaXMub25EaXNjb25uZWN0ZWQgPSB0aGlzLm9uRGlzY29ubmVjdGVkLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnV6emVySW5kZXggPSAwO1xuICAgICAgICB0aGlzLnNlcXVlbmNlID0gMDtcbiAgICAgICAgdGhpcy5idXN5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuTW90b3JzID0ge1xuICAgICAgICAgICAgb2ZmIDogMHgwMCxcbiAgICAgICAgICAgIGZvcndhcmQgOiAweDAxLFxuICAgICAgICAgICAgcmV2ZXJzZSA6IDB4MDIsXG4gICAgICAgICAgICBicmFrZSA6IDB4MDMsXG4gICAgICAgICAgICBpZ25vcmUgOiAweDA0XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgIFJlcXVlc3QgdGhlIGRldmljZSB3aXRoIGJsdWV0b290aFxuICAgICovXG4gICAgcmVxdWVzdCgpIHtcbiAgICAgICAgbGV0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICBcImZpbHRlcnNcIjogW3tcbiAgICAgICAgICAgICAgICBcInNlcnZpY2VzXCI6IFt0aGlzLmNvbmZpZy5yYWRpb1NlcnZpY2UoKV1cbiAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgIFwic2VydmljZXNcIjogW3RoaXMuY29uZmlnLnJvYm90U2VydmljZSgpXVxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBcIm9wdGlvbmFsU2VydmljZXNcIjogW3RoaXMuY29uZmlnLnJhZGlvU2VydmljZSgpLCB0aGlzLmNvbmZpZy5yb2JvdFNlcnZpY2UoKV1cbiAgICAgICAgfTsgICAgICAgIFxuICAgICAgICByZXR1cm4gbmF2aWdhdG9yLmJsdWV0b290aC5yZXF1ZXN0RGV2aWNlKG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihkZXZpY2UgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZGV2aWNlID0gZGV2aWNlO1xuICAgICAgICAgICAgICAgIHRoaXMuZGV2aWNlLmFkZEV2ZW50TGlzdGVuZXIoJ2dhdHRzZXJ2ZXJkaXNjb25uZWN0ZWQnLCB0aGlzLm9uRGlzY29ubmVjdGVkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGV2aWNlO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29ubmVjdCB0byB0aGUgZGV2aWNlXG4gICAgICogKi9cbiAgICBjb25uZWN0KCkge1xuICAgICAgICBpZiAoIXRoaXMuZGV2aWNlKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ0RldmljZSBpcyBub3QgY29ubmVjdGVkLicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlLmdhdHQuY29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGluaXQoKXtcbiAgICAgICAgaWYoIXRoaXMuZGV2aWNlKXtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnRGV2aWNlIGlzIG5vdCBjb25uZWN0ZWQuJyk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd3JpdGVDaGFyYWN0ZXJpc3RpYyh0aGlzLmNvbmZpZy5yYWRpb1NlcnZpY2UoKSwgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmFudGlET1NDaGFyYXRlcmlzdGljKCksXG4gICAgICAgICAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KCcwMTFpMycuc3BsaXQoJycpLm1hcChjID0+IGMuY2hhckNvZGVBdCgpKSkpXG4gICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnPiBGb3VuZCBBbnRpIERPUyBjaGFyYWN0ZXJpc3RpYycpO1xuICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fd3JpdGVDaGFyYWN0ZXJpc3RpYyh0aGlzLmNvbmZpZy5yYWRpb1NlcnZpY2UoKSwgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLnBvd2VyQ2hhcmF0ZXJpc3RpYygpLFxuICAgICAgICAgICAgICAgICAgICBuZXcgVWludDhBcnJheShbMHgwN10pKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpPT57XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnPiBGb3VuZCBUWCBQb3dlciBjaGFyYWN0ZXJpc3RpYycpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dyaXRlQ2hhcmFjdGVyaXN0aWModGhpcy5jb25maWcucmFkaW9TZXJ2aWNlKCksIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy53YWtlVXBDUFVDaGFyYXRlcmlzdGljKCksXG4gICAgICAgICAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KFsweDAxXSkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCk9PnsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dha2UgQ1BVIHdyaXRlIGRvbmUuJyk7ICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vU2V0IHJnYkxlZCB0byAwXG4gICAgICAgICAgICAgICAgbGV0IGNvbG9yID0gMHgwMTtcbiAgICAgICAgICAgICAgICBjb2xvciAmPSAweEZGO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZW5kQ29tbWFuZCgweDAyLCAweDIwLCBuZXcgVWludDhBcnJheShbY29sb3JdKSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1JnYiBMZWQgc2V0IHRvIDAnKTtcbiAgICAgICAgICAgICAgICAvLyBzZXQgQmFja0xlZCB0byAxMjdcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc2VuZENvbW1hbmQoMHgwMiwgMHgyMSwgbmV3IFVpbnQ4QXJyYXkoWzEyN10pKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCYWNrIExlZCBzZXQgdG8gMTI3Jyk7XG4gICAgICAgICAgICAgICAgLy8gc2V0IHN0YWJpbGlzYXRpb24gdG8gMFxuICAgICAgICAgICAgICAgIGxldCBmbGFnID0gMDtcbiAgICAgICAgICAgICAgICBmbGFnICY9IDB4MDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmRDb21tYW5kKDB4MDIsIDB4MDIsIG5ldyBVaW50OEFycmF5KFtmbGFnXSkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpPT57XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1N0YWJpbGlzYXRpb24gc2V0IHRvIDAnKTtcbiAgICAgICAgICAgICAgICAvLyBTZXQgaGVhZGluZyB0byAwXG4gICAgICAgICAgICAgICAgbGV0IGhlYWRpbmcgPSAwO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZW5kQ29tbWFuZCgweDAyLCAweDAxLCBuZXcgVWludDhBcnJheShbaGVhZGluZyA+PiA4LCBoZWFkaW5nICYgMHhGRl0pKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdIZWFkaW5nIHNldCB0byAwLCBkZXZpY2UgaXMgcmVhZHkgIScpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udHJvbCB0aGUgbW90b3JzIG9mIHJvYm90XG4gICAgKi9cbiAgICBwcm9jZXNzTW90b3IoaGVhZGluZywgcG93ZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1JvbGwgaGVhZGluZz0nK2hlYWRpbmcpO1xuICAgICAgICBpZiAodGhpcy5idXN5KSB7XG4gICAgICAgICAgICAvLyBSZXR1cm4gaWYgYW5vdGhlciBvcGVyYXRpb24gcGVuZGluZ1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnVzeSA9IHRydWU7XG4gICAgICAgIGxldCBkaWQgPSAweDAyOyAvLyBWaXJ0dWFsIGRldmljZSBJRFxuICAgICAgICBsZXQgY2lkID0gMHgzMDsgLy8gUm9sbCBjb21tYW5kXG4gICAgICAgIC8vIFJvbGwgY29tbWFuZCBkYXRhOiBzcGVlZCwgaGVhZGluZyAoTVNCKSwgaGVhZGluZyAoTFNCKSwgc3RhdGVcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgVWludDhBcnJheShbcG93ZXIsIGhlYWRpbmcgPj4gOCwgaGVhZGluZyAmIDB4RkYsIDFdKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fc2VuZENvbW1hbmQoZGlkLCBjaWQsIGRhdGEpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5idXN5ID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpPT57XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcblxuICAgIH1cblxuICAgIHByb2Nlc3NDb2xvcihyZWQsYmx1ZSxncmVlbil7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTZXQgY29sb3I6IHI9JytyZWQrJyxnPScrZ3JlZW4rJyxiPScrYmx1ZSk7XG4gICAgICAgIGlmICh0aGlzLmJ1c3kpIHtcbiAgICAgICAgICAgIC8vIFJldHVybiBpZiBhbm90aGVyIG9wZXJhdGlvbiBwZW5kaW5nXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5idXN5ID0gdHJ1ZTtcbiAgICAgICAgbGV0IGRpZCA9IDB4MDI7IC8vIFZpcnR1YWwgZGV2aWNlIElEXG4gICAgICAgIGxldCBjaWQgPSAweDIwOyAvLyBTZXQgUkdCIExFRCBPdXRwdXQgY29tbWFuZFxuICAgICAgICAvLyBDb2xvciBjb21tYW5kIGRhdGE6IHJlZCwgZ3JlZW4sIGJsdWUsIGZsYWdcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgVWludDhBcnJheShbcmVkLCBncmVlbiwgYmx1ZSwgMF0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9zZW5kQ29tbWFuZChkaWQsIGNpZCwgZGF0YSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImNvbG9yIHNldCAhIFwiKTtcbiAgICAgICAgICAgIHRoaXMuYnVzeSA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycm9yKT0+e1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwcm9jZXNzU3BpbihsbW90b3IsIHJtb3Rvcil7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTcGluJyk7XG4gICAgICAgIGlmICh0aGlzLmJ1c3kpe1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnVzeSA9IHRydWU7XG4gICAgICAgIGxldCBkaWQgPSAweDAyOyAvL1ZpcnR1YWwgZGV2aWNlIElEXG4gICAgICAgIGxldCBjaWQgPSAweDMzOyAvLyBTZXQgcmF3IE1vdG9ycyBjb21tYW5kXG4gICAgICAgIFxuICAgICAgICAgICAgICBcbiAgICAgICAgbGV0IGxtb2RlID0gbG1vdG9yICYgMHgwNztcbiAgICAgICAgbGV0IGxwb3dlciA9IDIwMCAmIDB4RkY7XG4gICAgICAgIGxldCBybW9kZSA9IHJtb3RvciAmIDB4MDc7XG4gICAgICAgIGxldCBycG93ZXIgPSAyMDAgJiAweEZGO1xuICAgICAgICBcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgVWludDhBcnJheShbbG1vZGUsIGxwb3dlciwgcm1vZGUsIHJwb3dlcl0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9zZW5kQ29tbWFuZChkaWQsIGNpZCwgZGF0YSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbG1vZGUgPSB0aGlzLk1vdG9ycy5vZmYgJiAweDA3O1xuICAgICAgICAgICAgICAgICAgICBsZXQgbHBvd2VyID0gMjAwICYgMHhGRjtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJtb2RlID0gdGhpcy5Nb3RvcnMub2ZmICYgMHgwNztcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJwb3dlciA9IDIwMCAmIDB4RkY7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IG5ldyBVaW50OEFycmF5KFtsbW9kZSwgbHBvd2VyLCBybW9kZSwgcnBvd2VyXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VuZENvbW1hbmQoZGlkLCBjaWQsIGRhdGEpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5idXN5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0pOyBcbiAgICAgICAgICAgICAgICB9LCAxMDAwKTsgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnJvcik9PntcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG5cbiAgICBkaXNjb25uZWN0KCkge1xuICAgICAgICBpZiAoIXRoaXMuZGV2aWNlKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ0RldmljZSBpcyBub3QgY29ubmVjdGVkLicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlLmdhdHQuZGlzY29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25EaXNjb25uZWN0ZWQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEZXZpY2UgaXMgZGlzY29ubmVjdGVkLicpO1xuICAgIH1cbiAgICBcbiAgICBfaW50VG9IZXhBcnJheSh2YWx1ZSwgbnVtQnl0ZXMpIHtcbiAgICAgICAgdmFyIGhleEFycmF5ID0gbmV3IEFycmF5KG51bUJ5dGVzKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gbnVtQnl0ZXMgLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgaGV4QXJyYXlbaV0gPSB2YWx1ZSAmIDB4RkY7XG4gICAgICAgICAgICB2YWx1ZSA+Pj0gODtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBoZXhBcnJheTtcbiAgICAgfTtcblxuXG4gICAgX3NlbmRDb21tYW5kKGRpZCwgY2lkLCBkYXRhKSB7XG4gICAgICAgIC8vIENyZWF0ZSBjbGllbnQgY29tbWFuZCBwYWNrZXRzXG4gICAgICAgIC8vIEFQSSBkb2NzOiBodHRwczovL2dpdGh1Yi5jb20vb3Jib3RpeC9EZXZlbG9wZXJSZXNvdXJjZXMvYmxvYi9tYXN0ZXIvZG9jcy9TcGhlcm9fQVBJXzEuNTAucGRmXG4gICAgICAgIC8vIE5leHQgc2VxdWVuY2UgbnVtYmVyXG4gICAgICAgIGxldCBzZXEgPSB0aGlzLnNlcXVlbmNlICYgMjU1O1xuICAgICAgICB0aGlzLnNlcXVlbmNlICs9IDE7XG4gICAgICAgIC8vIFN0YXJ0IG9mIHBhY2tldCAjMlxuICAgICAgICBsZXQgc29wMiA9IDB4ZmM7XG4gICAgICAgIHNvcDIgfD0gMTsgLy8gQW5zd2VyXG4gICAgICAgIHNvcDIgfD0gMjsgLy8gUmVzZXQgdGltZW91dFxuICAgICAgICAvLyBEYXRhIGxlbmd0aFxuICAgICAgICBsZXQgZGxlbiA9IGRhdGEuYnl0ZUxlbmd0aCArIDE7XG4gICAgICAgIGxldCBzdW0gPSBkYXRhLnJlZHVjZSgoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gYSArIGI7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBDaGVja3N1bVxuICAgICAgICBsZXQgY2hrID0gKHN1bSArIGRpZCArIGNpZCArIHNlcSArIGRsZW4pICYgMjU1O1xuICAgICAgICBjaGsgXj0gMjU1O1xuICAgICAgICBsZXQgY2hlY2tzdW0gPSBuZXcgVWludDhBcnJheShbY2hrXSk7XG5cbiAgICAgICAgbGV0IHBhY2tldHMgPSBuZXcgVWludDhBcnJheShbMHhmZiwgc29wMiwgZGlkLCBjaWQsIHNlcSwgZGxlbl0pO1xuICAgICAgICAvLyBBcHBlbmQgYXJyYXlzOiBwYWNrZXQgKyBkYXRhICsgY2hlY2tzdW1cbiAgICAgICAgbGV0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkocGFja2V0cy5ieXRlTGVuZ3RoICsgZGF0YS5ieXRlTGVuZ3RoICsgY2hlY2tzdW0uYnl0ZUxlbmd0aCk7XG4gICAgICAgIGFycmF5LnNldChwYWNrZXRzLCAwKTtcbiAgICAgICAgYXJyYXkuc2V0KGRhdGEsIHBhY2tldHMuYnl0ZUxlbmd0aCk7XG4gICAgICAgIGFycmF5LnNldChjaGVja3N1bSwgcGFja2V0cy5ieXRlTGVuZ3RoICsgZGF0YS5ieXRlTGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dyaXRlQ2hhcmFjdGVyaXN0aWModGhpcy5jb25maWcucm9ib3RTZXJ2aWNlKCksIHRoaXMuY29uZmlnLmNvbnRyb2xDaGFyYWN0ZXJpc3RpYygpLCBhcnJheSkudGhlbigocmV0dXJuRGF0YSk9PntcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb21tYW5kIHdyaXRlIGRvbmUuIDogJXMnLHJldHVybkRhdGEpOyAgXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH0pOyAgICAgICAgICBcbiAgICB9XG5cblxuICBcblxuICAgIF93cml0ZUNoYXJhY3RlcmlzdGljKHNlcnZpY2VVSUQsIGNoYXJhY3RlcmlzdGljVUlELCB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5kZXZpY2UuZ2F0dC5nZXRQcmltYXJ5U2VydmljZShzZXJ2aWNlVUlEKVxuICAgICAgICAgICAgLnRoZW4oc2VydmljZSA9PiBzZXJ2aWNlLmdldENoYXJhY3RlcmlzdGljKGNoYXJhY3RlcmlzdGljVUlEKSlcbiAgICAgICAgICAgIC50aGVuKGNoYXJhY3RlcmlzdGljID0+IGNoYXJhY3RlcmlzdGljLndyaXRlVmFsdWUodmFsdWUpKTtcbiAgICB9XG5cblxufVxuXG5cbmxldCBvbGxpZSA9IG5ldyBPbGxpZSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG9sbGllOyJdfQ==
