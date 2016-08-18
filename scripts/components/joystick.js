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