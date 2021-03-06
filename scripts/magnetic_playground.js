
var width = 800;
var height = 600;
var center_x = 426;
var center_y = 200;
var the_calm_downer = 10;
var elem = document.getElementById('draw-shapes');
var params = { width: width, height: height };
var two = new Two(params).appendTo(elem);
var stepLength = 10;
var constraint = 7;

function render() {
    two.clear();
    for (var i = 0; i < width; i += stepLength) {
        for (var j = 0; j < height; j += stepLength) {
            var br = new Two.Vector((i - center_x) / the_calm_downer, (j - center_y) / the_calm_downer);
            var r = br.length();
            if (r > controls.strength/constraint) {
                continue;
            }
            var rhat = new Two.Vector(br.x, br.y);
            rhat.set(rhat.x / r, rhat.y / r);
            var m = new Two.Vector(0, 5 * 20 / 6 * controls.strength);
            var numTermOne = 3 * rhat.dot(m);
            var numerator = (rhat.multiplyScalar(numTermOne)).subSelf(m);
            numerator.divideScalar(2 * Math.PI * r * r);

            if(numerator.length() > stepLength * 2) {
                numerator = numerator.normalize().multiplyScalar(stepLength * 2);
            }
            var x2 = i + 0.5 * (numerator.x);
            var x1 = i - 0.5 * (numerator.x);
            var y2 = j + 0.5 * (numerator.y);
            var y1 = j - 0.5 * (numerator.y);

            if (r > 2) {
                var line = two.makeLine(x1, y1, x2, y2);
                line.linewidth = 0.5;
                line.fill = "#881111";
                line.stroke = "rgba(0, 0, 0, 255)";
            }
        }
    }
    // two has convenience methods to create shapes.
    var rect = two.makeRectangle(center_x, center_y, 20, 40);

    //center of rect: 218, 110
    rect.fill = 'rgb(0, 200, 255)';
    rect.noStroke();


    // Don't forget to tell two to render everything
    // to the screen
    two.update();
}

var controls = new function() {
    this.strength = 50;
};

var gui = new dat.GUI();
var strength = gui.add(controls, 'strength', 0, 1000);

render();
strength.onChange(
    render
    );

