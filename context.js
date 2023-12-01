var running = false;
var settings = {
	repeat: "1000",
	sequential_input: false,
};

function run() {
	if (running) return;
	document.getElementById("runBtn").disabled = true;
	running = true;
	document.getElementById("resultTextDefault").textContent = "Running...";
	document.getElementById("resultTextReturn").textContent = "";
	document.getElementById("resultTextDouble").textContent = "";
	var seqstr = document.getElementById("inputText").value;
	var numstr = document.getElementById("numText").value;
	var lvlstr = document.getElementById("lvlText").value;
	var repstr = document.getElementById("repText").value;
	var type = "others";
	if(document.getElementById("type_weapon").checked) type = "weapon";
	else if(document.getElementById("type_talent").checked) type = "talent";
	else if(document.getElementById("type_others").checked) type = "others";

	const worker = new Worker("./work.js");
	worker.postMessage({msg: "start", seq_str: seqstr, lvl: lvlstr, num: numstr, rep: settings.repeat, type: type});
	worker.addEventListener("message", (e) => {
		if(e.data.status == "success") {
			var result = e.data.result;
			document.getElementById("resultTextDefault").textContent = result[0];
			document.getElementById("resultTextReturn").textContent = result[1];
			document.getElementById("resultTextDouble").textContent = result[2];
		} else {
			console.log(e.data.result);
			document.getElementById("resultTextDefault").textContent = "出错了，请检查输入格式";
			document.getElementById("resultTextReturn").textContent = "";
			document.getElementById("resultTextDouble").textContent = "";
		}
		document.getElementById("runBtn").disabled = false;
		running = false;
	});
}

function setval(num, lvl, type) {
	document.getElementById("numText").value = num;
	document.getElementById("lvlText").value = lvl;
	document.getElementById("type_weapon").checked = (type == 0);
	document.getElementById("type_talent").checked = (type == 1);
	document.getElementById("type_others").checked = (type == 2);
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
}

function discard_settings() {
	document.getElementById('settings_popup').style.display = 'none';
	document.getElementById('overlay').style.display = 'none';
}