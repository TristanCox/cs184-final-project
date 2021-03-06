        var MAX_16BIT_SIGNED = 32767;
        function getKey(x, y) {
          if (x > MAX_16BIT_SIGNED || y > MAX_16BIT_SIGNED)
            throw "Invalid X or Y value.";
          x += MAX_16BIT_SIGNED;
          y += MAX_16BIT_SIGNED;
          return (x << 16) | y;
        }
        var width = screen.width - 100;
        width /= 2;
        var height = screen.height - 100;
        height /= 2;
        var the_calm_downer = 10;

        var maxVel = 50;
        var arrows = false;

        var particleSpeed = 0.1;

        var elem = document.getElementById('draw-shapes');
        var params = { width: width, height: height };
        var two = new Two(params).appendTo(elem);

        var stepLength = 10;
        var magnets = new Array(5);
        for (var i = 0; i < magnets.length; i++) {
          magnets[i] = new Array(4);
        }

        magnets[0] = [width - 50, height / 6, 20, 40];
        magnets[1] = [width - 50, height * 2 / 6, 10, 20];
        magnets[2] = [width - 50, height / 2, 20, 40];
        magnets[3] = [width - 50, height * 2 / 3, 10, 20];
        magnets[4] = [width - 50, height * 5 / 6, 10, 20];

        var numStars = 1500;
        var starProps = new Array(numStars);
        var stars = new Array(numStars);
        var vectors = {};
        var d = new Date();
        var t = d.getTime();
        var constraint = 7;
        var strengths = []

        var moveLimit = 1;

        var moved = -1;
        var magMoved = -1;
        var magOffsetX = 0;
        var magOffsetY = 0;

        elem.onmousedown = function() {
          for (i in magnets) {
            var left = magnets[i][0] - (magnets[i][2] / 2);
            var right = magnets[i][0] + (magnets[i][2] / 2);
            var up = magnets[i][1] - (magnets[i][3] / 2);
            var down = magnets[i][1] + (magnets[i][3] / 2);
            var ox = event.offsetX;
            var oy = event.offsetY;
            if (ox > left && ox < right && oy > up && oy < down) {
              moved = i;
                magMoved = i;
            } else {
              console.log(ox, oy, "LRUD: ", left, right, up, down);
            }
          }
        }

        elem.onmouseup = function() {
          if (moved != -1) {
                magOffsetX = magnets[moved][0] - event.offsetX;
                magOffsetY = magnets[moved][1] - event.offsetY;
            magnets[moved][0] = event.offsetX;
            magnets[moved][1] = event.offsetY;
            console.log(magOffsetX);
            console.log(magOffsetY);
            
            moved = -1;
            render()
          }
        }

        elem.style.transform = "scale(1.3, 1.3) translateY(30%)";

        for (var i = 0; i < numStars; i++) {
            var rand = Math.floor((Math.random() * 10) + 1);

            
          starProps[i] = [20 * (i % (width / stepLength)) + rand, 30 * (i / (width / stepLength)) + rand, 0, 0, 20, 1,
              6, -1];
          stars[i] = two.makeCircle(starProps[i][0], starProps[i][1], starProps[i][4]);
            //two.makeStar(starProps[i][0], starProps[i][1], 20, 10, 6);
        }

        two.bind('update', function() {
          for (var j = 0; j < numStars; j++) { 
            var star = stars[j];
            var x = starProps[j][0];
             // console.log("x position" + x);
            var y = starProps[j][1];
              var stuck = starProps[j][8];
             
              //if(stuck > -1 && magMoved == stuck){
                  //console.log(starProps[j][8])
                 // console.log(j + " IS STUCK")

                //console.log("x pos: " + x);

               //   starProps[j][0] = x - magOffsetX;
                //  star.translation.x = starProps[j][0];
                 // console.log("new x pos: " + (x - magOffsetX));
                  //console.log("translation: ", star.translation.x)
                 //console.log("magnetX:" + magnets[stuck][0]);
                 // starProps[j][1] = y - magOffsetY;
                  //star.translation.y = starProps[j][1];

              //}
              //else {

                  for (var i = 0; i < magnets.length; i++) {
                      var left = magnets[i][0] - (magnets[i][2] / 2);
                      var right = magnets[i][0] + (magnets[i][2] / 2);
                      var up = magnets[i][1] - (magnets[i][3] / 2);
                      var down = magnets[i][1] + (magnets[i][3] / 2);

                      if (x > left && x < right && y > up && y < down) {
                          starProps[j][8] = i;
                          //starProps[j][5] = 5;
                          particleSpeed = 0;
                          star.translation.x = x - left;
                          star.translation.y = y - up;
                          i = 1000;
                      } else {
                          particleSpeed = 0.1;
                      }
                  }

                  var low_x = parseInt(Math.round(x), 10);
                  low_x -= low_x % stepLength;
                  var low_y = parseInt(Math.round(y), 10);
                  low_y -= low_y % stepLength;
                  var high_x = parseInt(Math.round(x), 10);
                  high_x += stepLength - (high_x % stepLength);
                  var high_y = parseInt(Math.round(y), 10);
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
                      console.log();
                  }

                  if (avgVect[0] != 0 || avgVect[1] != 0) {
                      avgVect[0] /= numOkay;
                      avgVect[1] /= numOkay;
                      var s = starProps[j];
                      if(s[8] > -1) {
                          stars[i].fill = 'black';
                      }else {
                          stars[i].fill = 'black';

                      }
                      var B = avgVect;
                      var scalar = (3 * .4)/(1+.4);
                      var M = [B[0] * scalar, B[1] * scalar] ;
                      var mdb = M[0] * B[0] + M[1] * B[1];
                      var F = [B[0] * mdb * particleSpeed, B[1] * mdb * particleSpeed];
                      if (Math.sqrt(F[0] * F[0] + F[1] * F[1]) > moveLimit) {
                          var div = F[0] + F[1];
                          F[0] /= div / moveLimit;
                          F[1] /= div / moveLimit;
                      }
                      starProps[j][2] += avgVect[0] * particleSpeed;
                      starProps[j][3] += avgVect[1] * particleSpeed;
                      if (Math.sqrt(starProps[j][2] * starProps[j][2] + starProps[j][3] * starProps[j][3]) > maxVel) {
                        var denom = Math.abs(starProps[j][2]) + Math.abs(starProps[j][3]);
                        starProps[j][2] /= denom / maxVel;
                        starProps[j][3] /= denom / maxVel;
                      }

                      starProps[j][0] = x + starProps[j][2] * particleSpeed;
                      starProps[j][1] = y + starProps[j][3] * particleSpeed;
                      star.translation.x = starProps[j][0];
                      star.translation.y = starProps[j][1];
                  }
              }
          });

         //}

        //magMoved = -1;



        function render() {
            two.clear();

            var bar = two.makeRectangle(width - 50, height / 2, 100, height);
            bar.fill = 'gray';

            vectors = {};
            strengths[0] = controls.strength1;
            strengths[1] = controls.strength2;
            strengths[2] = controls.strength3;
            strengths[3] = controls.strength4;
            strengths[4] = controls.strength5;
            for (var i = 0; i < width; i += stepLength) {
                for (var j = 0; j < height; j += stepLength) {
                    var str = getKey(i, j);
                    var currVect = vectors[str];
                    for (var k = 0; k < magnets.length; k++) {
                        if (magnets[k][0] > width - 100) 
                          continue;
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
                  if (arrows) {
                    var point = two.makeStar(x2, y2, 1, 2, 3);
                    point.fill = "red";
                    point.stroke = "blue";
                  }
                }
            }
            // two has convenience methods to create shapes.
            var rect = two.makeRectangle(magnets[0][0], magnets[0][1], magnets[0][2], magnets[0][3]);
            var rect2 = two.makeRectangle(magnets[1][0], magnets[1][1], magnets[1][2], magnets[1][3]);
            var rect3 = two.makeRectangle(magnets[2][0], magnets[2][1], magnets[2][2], magnets[2][3]);
            var rect4 = two.makeRectangle(magnets[3][0], magnets[3][1], magnets[3][2], magnets[3][3]);
            var rect5 = two.makeRectangle(magnets[4][0], magnets[4][1], magnets[4][2], magnets[4][3]);

            //center of rect: 218, 110
            rect.fill = 'red';
            rect.noStroke();

            rect2.fill = 'orange';
            rect2.noStroke();

            rect3.fill = 'yellow';
            rect3.noStroke();

            rect4.fill = 'green';
            rect4.noStroke();

            rect5.fill = 'blue';
            rect5.noStroke();


            // Don't forget to tell two to render everything
            for (var i = 0; i < numStars; i++){
              var s = starProps[i];

                stars[i] = two.makeCircle(s[0], s[1], s[5])//two.makeStar(s[0], s[1], s[4], s[5], s[6]);
                if(s[8] > -1) {
                    stars[i].fill = 'black';
                }else {
                    stars[i].fill = 'black';

                }
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
          this.strength3 = 50;
          strengths[2] = this.strength3;
          this.strength4 = 50;
          strengths[3] = this.strength4;
          this.strength5 = 50;
          strengths[4] = this.strength5;
          this.maxSpeed = 20;
        };

        var Play = { Play:function(){two.play();}};
        var Arrows = { Arrows: function(){arrows = !arrows; render();}};

        var gui = new dat.GUI();
        var strength1 = gui.add(controls, 'strength1', 0, 100);
        var strength2 = gui.add(controls, 'strength2', 0, 100);
        var strength3 = gui.add(controls, 'strength3', 0, 100);
        var strength4 = gui.add(controls, 'strength4', 0, 100);
        var strength5 = gui.add(controls, 'strength5', 0, 100);
        var maxSpeed = gui.add(controls, 'maxSpeed', 0, 70);
        var button = gui.add(Play, 'Play');
        var uthuhbutt = gui.add(Arrows, 'Arrows');

        render();
        strength1.onChange(
            render
            );
        strength2.onChange(
            render
            );
        strength3.onChange(
            render
            );
        strength4.onChange(
            render
            );
        strength5.onChange(
            render
            );
        maxSpeed.onChange(
            function() {
              maxVel = controls.maxSpeed;
            }
            );

 
