var running = false;
var settings = {
	repeat: "1000",
	sequential_input: false,
};

//#region Parsing
function isdigit(chr) {
	var cc = chr.charCodeAt(0);
	return cc >= 48 && cc <= 57;
}

function parse_sequence(seq_str) {
	var seq_str_pre = ""
	for (var i = 0; i < seq_str.length; i++) {
		if (isdigit(seq_str[i])) {
			seq_str_pre += seq_str[i];
		}
		else {
			if ((seq_str[i] == "-") &&
				(i == 0 || !isdigit(seq_str[i - 1]) && seq_str[i - 1] != "-") &&
				(i != seq_str.length - 1 && isdigit(seq_str[i + 1]))
			) {
				seq_str_pre += "-";
			} else if (!seq_str_pre.endsWith(" ")) {
				seq_str_pre += " ";
			}
		}
	}
	seq_str_pre = seq_str_pre.trim();
	var str_arr = seq_str_pre.split(" ");
	var arr = [];
	for (var i = str_arr.length - 1; i >= 0; i--) {
		if (str_arr[i] != "") {
			arr.push(Number(str_arr[i]));
		}
	}
	if (arr.length == 0) arr.push(0);
	return arr;
}

function parse_input() {
	// Get current
	var current_str = document.getElementById("inputText").value;
	var current = parse_sequence(current_str);

	// Get goal
	var goal = [];
	if (settings.sequential_input) {
		var goal_str = document.getElementById("goalText").value;
		goal = parse_sequence(goal_str)
		if (goal.length > 10) throw Error("Goal level out of range");
	} else {
		var num_str = document.getElementById("numText").value;
		var lvl_str = document.getElementById("lvlText").value;
		var num = Number(num_str);
		var lvl = Number(lvl_str);
		if (lvl < 1 || lvl > 10) throw Error("Goal level out of range");
		for (var i = 1; i < lvl; i++) {
			goal.push(0);
		}
		goal.push(num);
	}

	// Get type
	var type = "others";
	if (document.getElementById("type_weapon").checked) type = "weapon";
	else if (document.getElementById("type_talent").checked) type = "talent";
	else if (document.getElementById("type_others").checked) type = "others";

	// Get rep
	var rep_str = settings.repeat;
	var rep = Number(rep_str);

	return {
		current: current,
		goal: goal,
		rep: rep,
		type: type,
		msg: "start"
	};
}
//#endregion

//#region Work
function start_run() {
	if (running) return false;
	document.getElementById("runBtn").disabled = true;
	running = true;
	document.getElementById("resultTextDefault").textContent = "Running...";
	document.getElementById("resultTextReturn").textContent = "";
	document.getElementById("resultTextDouble").textContent = "";
	return true;
}

function stop_run() {
	document.getElementById("runBtn").disabled = false;
	running = false;
}

function fail(ex) {
	console.log(ex);
	document.getElementById("resultTextDefault").textContent = "出错了，请检查输入格式";
	document.getElementById("resultTextReturn").textContent = "";
	document.getElementById("resultTextDouble").textContent = "";
	stop_run();
}

function run() {
	if (!start_run()) return;
	var params;
	try {
		params = parse_input();
	} catch (ex) {
		fail(ex);
		return;
	}
	console.log(params);
	const worker = new Worker("./work.js");
	worker.postMessage(params);
	worker.addEventListener("message", (e) => {
		if (e.data.status == "success") {
			var result = e.data.result;
			document.getElementById("resultTextDefault").textContent = result[0];
			document.getElementById("resultTextReturn").textContent = result[1];
			document.getElementById("resultTextDouble").textContent = result[2];
		} else {
			fail(e.data.result);
			return;
		}
		stop_run();
	});
}
//#endregion

//#region Pages and settings
function setval(num, lvl, type) {
	if (settings.sequential_input) {
		var str = String(num);
		for (var i = 1; i < lvl; i++) {
			str += " 0";
		}
		document.getElementById("goalText").value = str;
	} else {
		document.getElementById("numText").value = num;
		document.getElementById("lvlText").value = lvl;
	}
	if (type !== undefined) {
		document.getElementById("type_weapon").checked = (type == 0);
		document.getElementById("type_talent").checked = (type == 1);
		document.getElementById("type_others").checked = (type == 2);
	}
}

function chghide() {
	document.getElementById('fastbtns').hidden = !document.getElementById('fastbtns').hidden;
}

function open_settings() {
	document.getElementById('settings_popup').style.display = 'block';
	document.getElementById('overlay').style.display = 'block';
	document.getElementById("repText").value = settings.repeat;
	document.getElementById("sequential_input_checkbox").checked = settings.sequential_input;
}

function save_settings() {
	var converting = false;
	var seq;
	if (settings.sequential_input != document.getElementById("sequential_input_checkbox").checked) {
		converting = true;
		try {
			seq = parse_input().goal;
		} catch {
			converting = false;
		}
	}
	document.getElementById('settings_popup').style.display = 'none';
	document.getElementById('overlay').style.display = 'none';
	settings.repeat = document.getElementById("repText").value;
	settings.sequential_input = document.getElementById("sequential_input_checkbox").checked;
	if (settings.sequential_input) {
		document.getElementById('traditional_input_div').hidden = true;
		document.getElementById('sequential_input_div').hidden = false;
	} else {
		document.getElementById('traditional_input_div').hidden = false;
		document.getElementById('sequential_input_div').hidden = true;
	}
	if (converting) setval(seq[seq.length - 1], seq.length);
}

function discard_settings() {
	document.getElementById('settings_popup').style.display = 'none';
	document.getElementById('overlay').style.display = 'none';
}
//#endregion