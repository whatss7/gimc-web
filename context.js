var rep = 1000;

function merge(arr, mode, lvl) {
	arr_copy = []
	arr.forEach(i => { arr_copy.push(i); });
	for (var now_lvl = 1; now_lvl < lvl; now_lvl++) {
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
	return arr_copy;
}

function gendrop(arr, type) {
	var lvl1_base = 0;
	var lvl1_rate = 0;
	var pack_base = 0;
	var pack_rate = 0;
	var rate_table = [1];
	if (type == "weapon") {
		lvl1_base = 2;
		lvl1_rate = 0.2;
		pack_base = 3;
		pack_rate = 0.1;
		rate_table = [0, 0.775, 0.2, 0.025];
	} else if (type == "talent") {
		lvl1_base = 2;
		lvl1_rate = 0.2;
		pack_base = 2;
		pack_rate = 0.2;
		rate_table = [0, 0.9, 0.1];
	} else throw new Error();
	if (Math.random() < lvl1_rate) lvl1_base += 1;
	if (Math.random() < pack_rate) pack_base += 1;
	arr[0] += lvl1_base;
	for (var i = 0; i < pack_base; i++) {
		var v = Math.random();
		var a = 0;
		for (var j = 0; j < rate_table.length; j++) {
			a += rate_table[j];
			if (v < a || j == rate_table.length - 1) {
				arr[j] += 1;
				break;
			} 
		}
	}
}

function runsingle(arr, mode, lvl, num, type) {
	var arr_copy = merge(arr, mode, lvl);
	var result = arr_copy[lvl - 1];
	if (type == "others") return [result, -1]
	var addcnt = 0;
	while (arr_copy[lvl - 1] < num) {
		addcnt += 1;
		gendrop(arr_copy, type);
		arr_copy = merge(arr_copy, mode, lvl);
	}
	return [result, addcnt];
}

function runimpl(seq_str, lvl, num, type) {
	lvl = Number(lvl);
	num = Number(num);
	seq_str_pre = ""
	for (var i = 0; i < seq_str.length; i++) {
		var cc = seq_str.charCodeAt(i);
		if (cc < 48 || cc > 57) seq_str_pre += " ";
		else seq_str_pre += seq_str[i];
	}
	seq_str_pre = seq_str_pre.trim();
	var str_arr = seq_str_pre.split(" ");
	console.log(str_arr);
	var arr = [];
	for (var i = str_arr.length - 1; i >= 0; i--) {
		arr.push(Number(str_arr[i]));
	}
	while (arr.length < lvl) arr.push(0);
	console.log(arr);
	var ret_cnt = 0;
	var dbl_cnt = 0;
	var def_num = runsingle(arr, "def", lvl, num, type)[0];
	var ret_num = 0;
	var dbl_num = 0;
	var def_addcnt = 0;
	var ret_addcnt = 0;
	var dbl_addcnt = 0;
	if (type != "others") {
		for (var i = 0; i < rep; i++) {
			var r = runsingle(arr, "def", lvl, num, type);
			def_addcnt += r[1];
		}
	}
	for (var i = 0; i < rep; i++) {
		var r = runsingle(arr, "ret", lvl, num, type);
		if (r[0] >= num) ret_cnt += 1;
		ret_num += r[0];
		ret_addcnt += r[1];
	}
	for (var i = 0; i < rep; i++) {
		var r = runsingle(arr, "dbl", lvl, num, type);
		if (r[0] >= num) dbl_cnt += 1;
		dbl_num += r[0];
		dbl_addcnt += r[1];
	}
	var ret_rate = ret_cnt / rep * 100;
	var dbl_rate = dbl_cnt / rep * 100;
	ret_num /= rep;
	dbl_num /= rep;
	def_addcnt /= rep;
	ret_addcnt /= rep;
	dbl_addcnt /= rep;
	if (type != "others") {
		return [
			"不使用：" + def_num.toFixed(0) + "，刷" + def_addcnt.toFixed(2) + "次/" + (def_addcnt * 20).toFixed(2) + "树脂",
			"25%返还：" + ret_num.toFixed(2) + "/" + ret_rate.toFixed(2) + "%" + "，刷" + ret_addcnt.toFixed(2) + "次/" + (ret_addcnt * 20).toFixed(2) + "树脂",
			"10%双倍：" + dbl_num.toFixed(2) + "/" + dbl_rate.toFixed(2) + "%" + "，刷" + dbl_addcnt.toFixed(2) + "次/" + (dbl_addcnt * 20).toFixed(2) + "树脂"
		];
	} else {
		return [
			"不使用：" + def_num.toFixed(0),
			"25%返还：" + ret_num.toFixed(2) + "/" + ret_rate.toFixed(2) + "%",
			"10%双倍：" + dbl_num.toFixed(2) + "/" + dbl_rate.toFixed(2) + "%"
		];
	}
}

function run() {
	var seqstr = document.getElementById("inputText").value;
	var numstr = document.getElementById("numText").value;
	var lvlstr = document.getElementById("lvlText").value;
	var repstr = document.getElementById("repText").value;
	var type = "others";
	if(document.getElementById("type_weapon").checked) type = "weapon";
	else if(document.getElementById("type_talent").checked) type = "talent";
	else if(document.getElementById("type_others").checked) type = "others";
	if (!isNaN(Number(repstr))) rep = Number(repstr);
	try {
		var result = runimpl(seqstr, lvlstr, numstr, type);
		document.getElementById("resultTextDefault").textContent = result[0];
		document.getElementById("resultTextReturn").textContent = result[1];
		document.getElementById("resultTextDouble").textContent = result[2];
	} catch (ex) {
		console.log(ex);
		document.getElementById("resultTextDefault").textContent = "出错了，请检查输入格式";
		document.getElementById("resultTextReturn").textContent = "";
		document.getElementById("resultTextDouble").textContent = "";
	}
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