        var MAX_16BIT_SIGNED = 32767;
        function getKey(x, y) {
          if (x > MAX_16BIT_SIGNED || y > MAX_16BIT_SIGNED)
            throw "Invalid X or Y value.";
          x += MAX_16BIT_SIGNED;
          y += MAX_16BIT_SIGNED;
          return (x << 16) | y;
        }
        var width = 800;
        var height = 600;
        var the_calm_downer = 10;

        var elem = document.getElementById('draw-shapes');
        var params = { width: width, height: height };
        var two = new Two(params).appendTo(elem);

        var stepLength = 10;
        var magnets = new Array(2);
        for (var i = 0; i < magnets.length; i++) {
          magnets[i] = new Array(3);
        }

        magnets[0] = [426, 189];
        magnets[1] = [150, 150];

        var numStars = 1000;
        var starProps = new Array(numStars);
        var stars = new Array(numStars);
        var vectors = {};
        var d = new Date();
        var t = d.getTime();
        var constraint = 7;
        var strengths = []

        var moveLimit = 1;

        for (var i = 0; i < numStars; i++) {
            var rand = Math.floor((Math.random() * 10) + 1);

            
          starProps[i] = [20 * (i % (width / stepLength)) + rand, 30 * (i / (width / stepLength)) + rand, 0, 0, 20, 1, 6];
          stars[i] = two.makeCircle(starProps[i][0], starProps[i][1], starProps[i][4]);
            //two.makeStar(starProps[i][0], starProps[i][1], 20, 10, 6);
        }

        two.bind('update', function() {
          for (var j = 0; j < numStars; j++) { 
            var star = stars[j];
            var x = star.translation.x;
            var y = star.translation.y;
            var low_x = parseInt(Math.floor(x), 10);
            low_x -= low_x % stepLength;
            var low_y = parseInt(Math.floor(y), 10);
            low_y -= low_y % stepLength;
            var high_x = parseInt(Math.ceil(x), 10);
            high_x += stepLength - (high_x % stepLength);
            var high_y = parseInt(Math.ceil(y), 10);
            high_y += stepLength - (high_y % stepLength);
            var keys = [getKey(low_x, low_y), getKey(low_x, high_y), getKey(high_x, high_y), getKey(high_x, low_y)];
            var avgVect = [0,0];
            var numOkay = 0;
            for (var i = 0; i < keys.length; i++) {
              var vect = vectors[keys[i]];
              if (vect) {
                numOkay++;
                avgVect[0] += vect.x;
                avgVect[1] += vect.y;
              }
            }

            if (avgVect[0] != 0 || avgVect[1] != 0) {
              avgVect[0] /= numOkay;
              avgVect[1] /= numOkay;
              var s = starProps[j];
              star.fill = 'black';
              var B = avgVect;
              var scalar = (3 * .4)/(1+.4);
              var M = [B[0] * scalar, B[1] * scalar] ;
              var mdb = M[0] * B[0] + M[1] * B[1];
              var F = [B[0] * mdb * 0.1, B[1] * mdb * 0.1];
              if (Math.sqrt(F[0] * F[0] + F[1] * F[1]) > moveLimit) {
                var div = F[0] + F[1];
                F[0] /= div / moveLimit;
                F[1] /= div / moveLimit;
              }
              starProps[j][2] += F[0];
              starProps[j][3] += F[1];
              starProps[j][0] = x + starProps[j][2];
              starProps[j][1] = y + starProps[j][3];
              star.translation.x = starProps[j][0];
              star.translation.y = starProps[j][1];
            }
          }
        });


        function render() {
            two.clear();
            strengths[0] = controls.strength1;
            strengths[1] = controls.strength2;
            for (var i = 0; i < width; i += stepLength) {
                for (var j = 0; j < height; j += stepLength) {
                  var str = getKey(i, j);
                  var currVect = vectors[str];
                  for (var k = 0; k < magnets.length; k++) {
                    var br = new Two.Vector((i - magnets[k][0])/the_calm_downer, (j - magnets[k][1])/the_calm_downer);
                    var r = br.length();
                    if (r > strengths[k] / constraint)
                      continue;
                      var rhat = new Two.Vector(br.x,br.y);
                      rhat.set(rhat.x / r, rhat.y / r);
                      var m = new Two.Vector(0, 5*20 / 6 * strengths[k]);
                      var numTermOne = 3 * rhat.dot(m);
                      var numerator = (rhat.multiplyScalar(numTermOne)).subSelf(m);
                      numerator.divideScalar(2 * Math.PI * r * r);

                        if (currVect == null) {
                          vectors[str] = new Two.Vector();
                        }
                        vectors[str].addSelf(numerator);
                        currVect = vectors[str];
                    }
                    if (currVect == null)
                      continue;
                    if (currVect.length() > stepLength * 2)
                      currVect = currVect.normalize().multiplyScalar(stepLength * 2);
                    var x2 = i + 0.5 * (currVect.x);
                    var x1 = i - 0.5 * (currVect.x);
                    var y2 = j + 0.5 * (currVect.y);
                    var y1 = j - 0.5 * (currVect.y);

                  var line = two.makeLine(x1, y1, x2, y2);
                  line.linewidth = 0.5;
                  line.fill = "#881111";
                  line.stroke = "rgba(0, 0, 0, 255)";
                }
            }
            // two has convenience methods to create shapes.
            var rect = two.makeRectangle(magnets[0][0], magnets[0][1], 20, 40);
            var rect2 = two.makeRectangle(magnets[1][0], magnets[1][1], 10, 20);

            //center of rect: 218, 110
            rect.fill = 'rgb(0, 200, 255)';
            rect.noStroke();

            rect2.fill = 'blue';
            rect2.noStroke();

            // Don't forget to tell two to render everything
            for (var i = 0; i < numStars; i++){
              var s = starProps[i];
              stars[i] = two.makeCircle(s[0], s[1], s[5])//two.makeStar(s[0], s[1], s[4], s[5], s[6]);
              stars[i].fill = 'black';
            }
            // to the screen
             
            two.update();
        }

        d = new Date();
        console.log(d.getTime(), t);
        console.log(1000.0 / (d.getTime() - t));
        var controls = new function() {
          this.strength1 = 50;
          strengths[0] = this.strength1;
          this.strength2 = 50;
          strengths[1] = this.strength2;
        };

        var Play = { Play:function(){two.play();}};

        var gui = new dat.GUI();
        var strength1 = gui.add(controls, 'strength1', 0, 100);
        var strength2 = gui.add(controls, 'strength2', 0, 100);
        var button = gui.add(Play, 'Play');

        render();
        strength1.onChange(
            render
            );
        strength2.onChange(
            render
            );
 
