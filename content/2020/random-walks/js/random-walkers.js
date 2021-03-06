window.onload = function() {
    var gui = new dat.GUI({
        closed: false,
        remembered: {
            undefined: {
                "0": {},
            },
        },
        folders: {},
        load: JSON,
        width: 400,
        autoPlace: false,
    });

    gui.add(controls, "speed", 1, 10).name("Speed To Move");
    gui.add(controls, "line_width", 1, 10).name("Line Width");

    // gui.add(controls, "reoccurance_rate", 0, 8).name("Reoccurance Rate");
    gui
        .add(controls, "walker_count", 1, 50)
        .name("Number of Walkers").step(1);
    gui.add(controls, "limit_angles", 3, 360).name("Limit Number of Directions").step(1);

    gui.add(controls, "restart_button").name("Click To Restart");

    var customContainer = document.getElementById("controls-container");
    customContainer.append(gui.domElement);
};

//colorArray source: https://gist.github.com/mucar/3898821
var colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
];

var controls = new(function() {
    this.speed = 5;
    this.line_width = 1;
    this.walker_count = 5;

    this.limit_angles = 4;
    this.time_to_recover = 4;

    this.restart_button = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        initialise();
    }
})();


function initialise() {
    // Create array of walkers with set parameters, start walkers in center of canvas
    walker_array = []
    for (var i = 0; i < controls.walker_count; i++) {
        var walker = {
            x_position: canvas.width / 2,
            y_position: canvas.height / 2,
            line_width: controls.line_width,
            colour: colorArray[i],
            speed: controls.speed,
            angle: Math.random() * 360,
            halt: false,
        }
        walker.x_velocity = walker.speed * Math.cos(walker.angle)
        walker.y_velocity = walker.speed * Math.sin(walker.angle)
        walker_array.push(walker)
    }
    setInterval(paint_canvas, 20);
}



function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

function radians_to_degrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
}


function gen_angle_list(number_of_groups) {
    /* Generate array of possible angles from limitation

     For example, if the limitation of angles is 4, then 360 / 4 = 90, and resulting array will be angle_list = [0,90,180,270,360]
     Including 0 & 360 is to give the walker equal chance to turn around and stay in the canvas
    */
    var angle_list = []

    var initial_angle = 360 / number_of_groups;

    for (var i = 0; i < number_of_groups + 1; i++) {
        angle_list.push(initial_angle * i);
    }
    return angle_list
}

function get_nearest_angle(goal, angle_list) {
    // Source: https://stackoverflow.com/questions/8584902/get-closest-number-out-of-array

    // Find nearest angle in possible direction array from new random angle

    var closest = angle_list.reduce(function(prev, curr) {
        return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
    });
    return closest

}


var possible_directions = gen_angle_list(controls.limit_angles);



function move_walker(walker, possible_directions) {
    // Update new random direction & update velocity of walker
    var new_angle = Math.random() * 360
    walker.x_position += walker.x_velocity
    walker.y_position += walker.y_velocity
    walker.angle = degrees_to_radians(get_nearest_angle(new_angle, possible_directions))
    walker.x_velocity = walker.speed * Math.cos(walker.angle)
    walker.y_velocity = walker.speed * Math.sin(walker.angle)
}

function check_boundaries(canvas, walker) {
    // Checks if walker has collided with walls and stops walker
    if (walker.x_position >= canvas.width - walker.line_width || walker.x_position <= walker.line_width) {
        walker.x_velocity = 0;
        walker.y_velocity = 0;
        walker.halt = true
    }

    if (walker.y_position >= canvas.height - walker.line_width || walker.y_position <= walker.line_width) {
        walker.x_velocity = 0
        walker.y_velocity = 0
        walker.halt = true;
    }
}

function paint_canvas() {
    // Regenerate possible angle list
    possible_directions = gen_angle_list(controls.limit_angles)

    // Loop through all walkers, moving & painting accordingly
    for (var i = 0; i < walker_array.length; i++) {

        current_walker = walker_array[i];

        // If walker hasn't hit the walls yet
        if (!current_walker.halt) {
            var prev_x = current_walker.x_position
            var prev_y = current_walker.y_position
            ctx.beginPath()
            ctx.moveTo(prev_x, prev_y)
            check_boundaries(canvas, current_walker);
            move_walker(current_walker, possible_directions);
            ctx.strokeStyle = current_walker.colour;
            ctx.lineWidth = current_walker.line_width;
            ctx.lineTo(current_walker.x_position, current_walker.y_position)
            ctx.stroke()

            ctx.closePath();
        }
    }
}


var canvas = document.getElementById("random-walk-canvas")
var ctx = canvas.getContext('2d')
ctx.canvas.width = document.getElementById("canvas-container").clientWidth


var walker_array = []
initialise();