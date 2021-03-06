autowatch = 1;
inlets = 1;
outlets = 2;

// take input from hfdata dict, and store to arrays. 
// use the arrays to create the bach.roll score.

global_midi_pitch = new Array(); // 2d
global_velocities = new Array(); // 2d 

global_note_onset_ratios = new Array();
global_note_duration_ratios = new Array();
global_note_onsets = new Array(); // 1d array
global_note_durations = new Array(); // 1d array

global_beat_onset_and_duration = new Array();
global_markers = new Array(); // 2d
global_beat_ratios = new Array(); // 2d

global_filename = "intet";
global_beats_per_bar = 3;
global_bach2onset_init = false;


function pitch() {
    var input_list = arrayfromargs(arguments);
    global_midi_pitch.push(input_list);
    // add random velocies to each note. between 40 - 127
    global_velocities.push(input_list.map(function() {
        return Math.round((Math.random()*87)+40);
    }));
}


function note_onset_ratios() {
    var input_list1 = arrayfromargs(arguments);
    global_note_onset_ratios.push(input_list1);
}


function note_duration_ratios() {
    var input_list2 = arrayfromargs(arguments);
    global_note_duration_ratios.push(input_list2);
}


function beat_onset_and_duration() {
    var input_list3 = arrayfromargs(arguments);
    global_beat_onset_and_duration.push(input_list3);
}


function beat_ratios() {
    var input_list4 = arrayfromargs(arguments);
    global_beat_ratios.push(input_list4);
}


function file_name(dictname) {
    global_filename = dictname;
}


function dict2bach() {
    // create note onsets and note durations from ratios.
    for (var i=0; i<global_note_onset_ratios.length; i++) {
        for (var y=0; y<global_note_onset_ratios[i].length; y++) {
            var onstime = (global_note_onset_ratios[i][y]/100) * global_beat_onset_and_duration[i][1];
            global_note_onsets.push(onstime+global_beat_onset_and_duration[i][0]);
            global_note_durations.push((global_note_duration_ratios[i][y]/100) * global_beat_onset_and_duration[i][1]);
        }
    }

    // create beat markers from ratios.
    var bar = 0;
    for (var x=0; x<=global_beat_onset_and_duration.length; x++) {
        if (x%global_beats_per_bar == 0) {
            bar += 1; 
        }
        if (x != global_beat_onset_and_duration.length) {
            global_markers.push(["addmarker", 
                                global_beat_onset_and_duration[x][0],
                                bar, 
                                (x%global_beats_per_bar)+1]);
        } else {
            //add an ending marker.
            global_markers.push(["addmarker", 
                                global_beat_onset_and_duration[global_beat_onset_and_duration.length-1][0] + global_beat_onset_and_duration[global_beat_onset_and_duration.length-1][1],
                                bar, 
                                1]);
        }
    }

    // set the [bach.roll] domain to score length. [v domain] object.
	//this.patcher.getnamed("curr_domain").message("domain", global_note_onsets[0], global_markers[global_markers.length-1][1]);

    // just set the domain value in the value box.
    outlet(0, "domain", "domain", global_note_onsets[0], global_markers[global_markers.length-1][1]);

    // start sending to bach.roll.
    outlet(0, "clear");
    var oned_pitch_velo = global_midi_pitch.reduce(function(prev, next) {
        return prev.concat(next);
    });
    outlet(0, "cents", oned_pitch_velo);

    oned_pitch_velo = global_velocities.reduce(function(prev, next) {
        return prev.concat(next);
    })
    outlet(0, "velocity", oned_pitch_velo);

    outlet(0, "onsets", global_note_onsets);
    outlet(0, "durations", global_note_durations);
    for (var w=0; w<global_markers.length; w++) {
        outlet(0, "markers", global_markers[w]);
    }
    outlet(0, "bang");
    outlet(1, "init");
}


// main function
function bang() {
    dict2bach();
}


function clear() {
    global_midi_pitch = new Array();
    global_velocities = new Array(); 
    global_note_onset_ratios = new Array();
    global_note_duration_ratios = new Array();
    global_beat_onset_and_duration = new Array();
    global_note_onsets = new Array();
    global_note_durations = new Array();
    global_markers = new Array();
    global_beat_ratios = new Array();
    global_beats_per_bar = 3;
    global_bach2onset_init = false;
    global_filename = "intet";
}