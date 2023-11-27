// Merge items in the current array. This function modifies current.
function merge(current, goal, mode) {
    // align array lengths.
    while (current.length < goal.length) current.push(0);
    var max_lvl = goal.length;
    for (var now_lvl = 1; now_lvl < max_lvl; now_lvl++) {
        var i = now_lvl - 1;

        // If item number is too large, skip some of them
        const MERGE_LIMIT = 5000;
        const UNMERGED_LIMIT = 500;
        var merged_item_count = current[i] - goal[i];
        if (merged_item_count >= MERGE_LIMIT) {
            // skip 330 objects at one time.
            // default: 110 objects; 
            // 25% return: 120 objects; (100/275 = 120/330)
            // 10% double: 121 objects; (110/300 = 121/330)
            skip_count = Math.floor((merged_item_count - UNMERGED_LIMIT) / 330);
            current[i] -= 330 * skip_count;
            if (mode == "def") current[i + 1] += 110 * skip_count;
            else if (mode == "ret") current[i + 1] += 120 * skip_count;
            else if (mode == "dbl") current[i + 1] += 121 * skip_count;
        }

        // Regular merging.
        while (current[i] - goal[i] >= 3) {
            current[i] -= 3;
            current[i + 1] += 1;
            if (mode == "ret" && Math.random() < 0.25) {
                current[i] += 1;
            }
            if (mode == "dbl" && Math.random() < 0.1) {
                current[i + 1] += 1;
            }
        }
    }
}

function merge_legacy(arr, mode, lvl) {
    var arr_copy = arr.slice();
    var goal = [];
    for (var i = 0; i < lvl; i++) goal.push(0);
    merge(arr_copy, goal, mode);
    return arr_copy;
}

function satisfied(current, goal) {
    for (var i = 0; i < goal.length; i++) {
        if (i >= current.length && goal[i] >= 0) return false;
        if (goal[i] >= current[i]) return false;
    }
    return true;
}

function run_single(current, goal, mode, type) {
    var current_copy = current.slice();

    // Calculate expected highest level item number.
    merge(current_copy, goal, mode);
    var result = current_copy[goal.length - 1];
    
    // If it does not involve drop calculation, directly return.
    if (type == "others") return [result, -1];

    // Calculate the base request num (all items converted to level 1)
    var request_num = 0;
    for (var i = 0; i < current_copy.length; i++) {
        var cur_level_request = Math.max(goal[i] - current_copy[i], 0);
        request_num += cur_level_request * Math.pow(3, i);
    }

    // Start calculating drop.
    var addcnt = 0;

    // If request num is very high, skip some of them.
    if (request_num > 10000) {
        console.log("drop skip enabled");
        var drop_pack_size = 400;
        var drop_pack_base_num = get_drop_pack_base_num(type, drop_pack_size);
        var drop_pack_multiplier = Math.floor(request_num / drop_pack_base_num);
        var ascending = true;
        
        while (true) {
            var current_temp = current_copy.slice();
            gen_drop_pack(current_temp, type, drop_pack_size * drop_pack_multiplier);
            if (ascending) {
                if (satisfied(current, goal)) {
                    current_copy = arr_temp;
                    addcnt += drop_pack_count * drop_pack_multiplier;
                    drop_pack_multiplier *= 2;
                }
                else {
                    ascending = false;
                    drop_pack_multiplier = Math.floor(drop_pack_multiplier / 2);
                }
            } else {
                if (arr_temp[lvl - 1] < num) {
                    current_copy = arr_temp;
                    addcnt += drop_pack_count * drop_pack_multiplier;
                }
                drop_pack_multiplier = Math.floor(drop_pack_multiplier / 2);
                if (drop_pack_multiplier <= 1) break;
            }
        }
    }
    while (!satisfied(current_copy, goal)) {
        addcnt += 1;
        gen_drop(current_copy, type);
        merge(current_copy, goal, mode);
    }
    return [result, addcnt];
}

function run_single_legacy(arr, mode, lvl, num, type) {
    var goal = [num];
    for (var i = 1; i < lvl; i++) {
        goal.push(0);
    }   
    var result = run_single(arr, goal, mode, type);
    return result;
}

function isdigit(chr) {
    var cc = chr.charCodeAt(0);
    return cc >= 48 && cc <= 57;
}

function runimpl(seq_str, lvl, num, rep, type) {
    lvl = Number(lvl);
    if (lvl > 10) throw new Error();
    num = Number(num);
    rep = Number(rep);
    var seq_str_pre = ""
    for (var i = 0; i < seq_str.length; i++) {
        if (isdigit(seq_str[i])){
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
    console.log(seq_str_pre);
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
    var def_num = run_single_legacy(arr, "def", lvl, num, type)[0];
    var ret_num = 0;
    var dbl_num = 0;
    var def_addcnt = 0;
    var ret_addcnt = 0;
    var dbl_addcnt = 0;
    if (type != "others") {
        for (var i = 0; i < rep; i++) {
            var r = run_single_legacy(arr, "def", lvl, num, type);
            def_addcnt += r[1];
        }
    }
    for (var i = 0; i < rep; i++) {
        var r = run_single_legacy(arr, "ret", lvl, num, type);
        if (r[0] >= num) ret_cnt += 1;
        ret_num += r[0];
        ret_addcnt += r[1];
    }
    for (var i = 0; i < rep; i++) {
        var r = run_single_legacy(arr, "dbl", lvl, num, type);
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
        importScripts("./drops.js");
        try {
            var result = runimpl(e.data.seq_str, e.data.lvl, e.data.num, e.data.rep, e.data.type);
            postMessage({status: "success", result: result});
        } catch (ex) {
            postMessage({status: "failed", result: ex});
        }
    }
});