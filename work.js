function merge(arr, mode, lvl) {
    arr_copy = []
    arr.forEach(i => { arr_copy.push(i); });
    for (var now_lvl = 1; now_lvl < lvl; now_lvl++) {
        var i = now_lvl - 1;
        if (arr_copy[i] >= 10000) {
            skip_count = Math.ceil((arr_copy[i] - 1000) / 330);
            arr_copy[i] -= 330 * skip_count;
            if (mode == "def") arr_copy[i + 1] += 110 * skip_count;
            else if (mode == "ret") arr_copy[i + 1] += 120 * skip_count;
            else if (mode == "dbl") arr_copy[i + 1] += 121 * skip_count;
        }
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

function gendroppack(arr, type) {
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
    var drop_pack = [];
    var drop_pack_count = 400;
    var drop_pack_multiplier = 1;
    var ascending = true;
    if (type == "weapon") drop_pack = [880, 960, 248, 31];
    else if (type == "talent") drop_pack = [880, 792, 88];
    else throw Error();

    var base_num = num * Math.pow(3, lvl - 1);
    if (base_num > 10000) {
        while (true) {
            var arr_temp = [];
            arr_copy.forEach(i => { arr_temp.push(i); });
            for (var i = 0; i < drop_pack.length; i++) {
                arr_temp[i] = arr_temp[i] + drop_pack[i] * drop_pack_multiplier;
            }
            arr_temp = merge(arr_temp, mode, lvl);
            if (ascending) {
                if (arr_temp[lvl - 1] < num) {
                    arr_copy = arr_temp;
                    addcnt += drop_pack_count * drop_pack_multiplier;
                    drop_pack_multiplier *= 2;
                }
                else {
                    ascending = false;
                    drop_pack_multiplier /= 2;
                }
            } else {
                if (arr_temp[lvl - 1] < num) {
                    arr_copy = arr_temp;
                    addcnt += drop_pack_count * drop_pack_multiplier;
                }
                drop_pack_multiplier /= 2;
                if (drop_pack_multiplier <= 1) break;
            }
        }
    }
    while (arr_copy[lvl - 1] < num) {
        addcnt += 1;
        gendrop(arr_copy, type);
        arr_copy = merge(arr_copy, mode, lvl);
    }
    return [result, addcnt];
}

function runimpl(seq_str, lvl, num, rep, type) {
    lvl = Number(lvl);
    if (lvl > 10) throw new Error();
    num = Number(num);
    rep = Number(rep);
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

self.addEventListener("message", (e) => {
    if (e.data.msg === "start") {
        try {
            var result = runimpl(e.data.seq_str, e.data.lvl, e.data.num, e.data.rep, e.data.type);
            postMessage({status: "success", result: result});
        } catch (ex) {
            postMessage({status: "failed", result: ex});
        }
    }
});