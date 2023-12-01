//#region Drop
// Get drop table.
function get_drop_table(type) {
    if (type == "weapon") {
        return {
            lvl1: 2.2,
            pack: 3.1,
            rate_table: [0, 0.775, 0.2, 0.025]
        };
    } else if (type == "talent") {
        return {
            lvl1: 2.2,
            pack: 2.2,
            rate_table: [0, 0.9, 0.1]
        };
    } else throw new Error();
}

// Adds drop to base_arr. This function modifies base_arr.
function gen_drop(base_arr, type) {
    // Get drop table
    var drop_table = get_drop_table(type);
    var lvl1_base = Math.floor(drop_table.lvl1);
    var lvl1_rate = drop_table.lvl1 - lvl1_base;
    var pack_base = Math.floor(drop_table.pack);
    var pack_rate = drop_table.pack - pack_base;
    var rate_table = drop_table.rate_table;

    // Generate extra drops
    if (Math.random() < lvl1_rate) lvl1_base += 1;
    if (Math.random() < pack_rate) pack_base += 1;
    base_arr[0] += lvl1_base;

    // Generate drop levels
    for (var i = 0; i < pack_base; i++) {
        var v = Math.random();
        var rate_sum = 0;
        for (var j = 0; j < rate_table.length; j++) {
            rate_sum += rate_table[j];
            if (v < rate_sum || j == rate_table.length - 1) {
                base_arr[j] += 1;
                break;
            }
        }
    }
}

// Add n drops to base_arr. floor(n/400) drop packs added and the rest are generated.
// It is adviced to call this function with size=400n.
function gen_drop_pack(base_arr, type, size) {
    // Get drop table
    var drop_table = get_drop_table(type);

    // Align base_arr and drop table.
    while (base_arr.length < drop_table.rate_table.length) base_arr.push(0);

    // If the drop pack size is too large, skip some of them
    const MIN_DROP_PACK_SIZE = 400;
    var min_drop_pack_count = Math.floor(size / MIN_DROP_PACK_SIZE);
    for (var i = 0; i < drop_table.rate_table.length; i++) {
        base_arr[i] += drop_table.rate_table[i] * drop_table.pack * MIN_DROP_PACK_SIZE * min_drop_pack_count;
    }
    base_arr[0] += drop_table.lvl1 * MIN_DROP_PACK_SIZE * min_drop_pack_count;
    size -= MIN_DROP_PACK_SIZE * min_drop_pack_count;
    for (var i = 0; i < size; i++) {
        gen_drop(base_arr, type);
    }
}


function get_drop_pack_base_num(type, size) {
    var drop_pack = [];
    gen_drop_pack(drop_pack, type, size);
    var base_num = 0;
    for (var i = 0; i < drop_pack.length; i++) {
        base_num += drop_pack[i] * Math.pow(3, i);
    }
    return base_num;
}
//#endregion

//#region Merge
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
//#endregion

//#region Run Single
function satisfied(current, goal) {
    for (var i = 0; i < goal.length; i++) {
        if (i >= current.length && goal[i] >= 0) return false;
        if (goal[i] > current[i]) return false;
    }
    return true;
}

function run_single(current, goal, mode, type) {
    var current_copy = current.slice();

    // Calculate expected highest level item number.
    merge(current_copy, goal, mode);
    var result = current_copy[goal.length - 1];
    var addcnt = 0;
    
    // If it does not involve drop calculation, directly return.
    if (type == "others") return [result, -1];

    // Calculate the base request num (all items converted to level 1)
    var request_num = 0;
    for (var i = 0; i < current_copy.length; i++) {
        var cur_level_request = Math.max(goal[i] - current_copy[i], 0);
        request_num += cur_level_request * Math.pow(3, i);
    }

    const DROP_BASE_LIMIT = 5000;
    // If the requested number is too large, skip some of them.
    if (request_num >= DROP_BASE_LIMIT) {
        // First do binary lifting, then do binary searching.
        var last_unsat = current_copy.slice();
        var pack_count = 1;
        var ascend = true;
        const PACK_SIZE = 400;
        while (pack_count >= 1) {
            gen_drop_pack(current_copy, type, pack_count * PACK_SIZE);
            merge(current_copy, goal, mode);
            if (satisfied(current_copy, goal)) {
                current_copy = last_unsat.slice();
                ascend = false;
            } else {
                last_unsat = current_copy.slice();
                addcnt += pack_count * PACK_SIZE;
            }
            if (ascend) pack_count *= 2;
            else pack_count /= 2;
        }
    }

    // Start calculating drop.
    while (!satisfied(current_copy, goal)) {
        addcnt += 1;
        gen_drop(current_copy, type);
        merge(current_copy, goal, mode);
    }
    return [result, addcnt];
}
//#endregion

//#region Full Run

function run_one_mode(current, goal, mode, type, rep) {
    const DICT = {
        "def": "不使用",
        "ret": "25%返还",
        "dbl": "10%双倍"
    };
    var success_count = 0, result_sum = 0, drop_sum = 0;
    for (var i = 0; i < rep; i++) {
        var [result, drop_count] = run_single(current, goal, mode, type);
        if (drop_count == 0) success_count += 1;
        result_sum += result;
        drop_sum += drop_count;
    }
    var result = "";
    if (mode == "def") {
        result += DICT[mode] + "：" + (result_sum / rep).toFixed(0);
    } else {
        result += DICT[mode] + "：" + (result_sum / rep).toFixed(2);
        if (mode != "def") result += "/" + (success_count / rep * 100).toFixed(2) + "%";
    }
    if (type != "others") {
        result += "，刷" + (drop_sum / rep).toFixed(2) + "次";
        result += "/" + (drop_sum / rep * 20).toFixed(2) + "树脂";
    }
    return result;
}

function runimpl(current, goal, type, rep) {
    return [
        run_one_mode(current, goal, "def", type, rep),
        run_one_mode(current, goal, "ret", type, rep),
        run_one_mode(current, goal, "dbl", type, rep)
    ];
}
//#endregion

self.addEventListener("message", (e) => {
    if (e.data.msg === "start") {
        try {
            var result = runimpl(e.data.current, e.data.goal, e.data.type, e.data.rep);
            postMessage({status: "success", result: result});
        } catch (ex) {
            postMessage({status: "failed", result: ex});
        }
    } else {
        postMessage({status: "failed", result: Error("Unknown message")});
    }
});
