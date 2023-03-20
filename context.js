var rep = 1000;

function runsingle(arr, mode, lvl){
	arr_copy = []
	arr.forEach(i => { arr_copy.push(i); });
	for (var now_lvl = 1; now_lvl < lvl; now_lvl++){
		var i = now_lvl - 1;
		while (arr_copy[i] >= 3) {
			arr_copy[i] -= 3;
			arr_copy[i + 1] += 1;
			if (mode == "ret" && Math.random() < 0.25) {
				arr_copy[i] += 1;
			}
			if (mode == "dbl" && Math.random() < 0.1) {
				arr_copy[i + 1] += 1;
			}
		}
	}
	return arr_copy[lvl - 1];
}

function runimpl(seq_str, lvl, num){
	lvl = Number(lvl);
	num = Number(num);
	seq_str_pre = ""
	for(var i = 0; i < seq_str.length; i++){
		var cc = seq_str.charCodeAt(i);
		if(cc < 48 || cc > 57) seq_str_pre += " ";
		else seq_str_pre += seq_str[i];
	}
	var str_arr = seq_str_pre.split(" ");
	console.log(str_arr);
	var arr = [];
	for (var i = str_arr.length - 1; i >= 0; i--) {
		arr.push(Number(str_arr[i]));
	}
	while (arr.length < lvl) arr.push(0);
	console.log(arr);
	var def_num = runsingle(arr, "def", lvl);
	var ret_cnt = 0;
	var dbl_cnt = 0;
	var ret_num = 0;
	var dbl_num = 0;
	for (var i = 0; i < rep; i++) {
		var r = runsingle(arr, "ret", lvl);
		if (r >= num) ret_cnt += 1;
		ret_num += r;
	}
	for (var i = 0; i < rep; i++) {
		var r = runsingle(arr, "dbl", lvl);
		if (r >= num) dbl_cnt += 1;
		dbl_num += r;
	}
	var ret_rate = ret_cnt / rep * 100;
	var dbl_rate = dbl_cnt / rep * 100;
	ret_num /= rep;
	dbl_num /= rep;
	return [
		"不使用：" + def_num.toFixed(0),
		"25%返还：" + ret_num.toFixed(2) + "/" + ret_rate.toFixed(2) + "%",
		"10%双倍：" + dbl_num.toFixed(2) + "/" + dbl_rate.toFixed(2) + "%"
	];
}

function run(){
	var seqstr = document.getElementById("inputText").value;
	var numstr = document.getElementById("numText").value;
	var lvlstr = document.getElementById("lvlText").value;
	var repstr = document.getElementById("repText").value;
	if(!isNaN(Number(repstr))) rep = Number(repstr);
	try {
		var result = runimpl(seqstr, lvlstr, numstr);
		document.getElementById("resultTextDefault").textContent = result[0];
		document.getElementById("resultTextReturn").textContent = result[1];
		document.getElementById("resultTextDouble").textContent = result[2];
	} catch(ex) {
		console.log(ex);
		document.getElementById("resultTextDefault").textContent = "出错了，请检查输入格式";
		document.getElementById("resultTextReturn").textContent = "";
		document.getElementById("resultTextDouble").textContent = "";
	}
}

function setval(num, lvl){
	document.getElementById("numText").value = num;
	document.getElementById("lvlText").value = lvl;
}

function chghide(){
	document.getElementById('fastbtns').hidden = !document.getElementById('fastbtns').hidden;
}