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
        base_arr[i] += drop_table.rate_table[i] * MIN_DROP_PACK_SIZE * min_drop_pack_count;
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