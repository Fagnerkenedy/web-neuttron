

// let id = '42931815-db1b-41e7-95b9-365a82d7c1e5'

// let idString = id.toString()

// console.log("idString: ",idString)

let item_preco_unitario = "214,7"

let precoArray = item_preco_unitario.split(",", 2)
let casaDecimal = precoArray[1]
if(casaDecimal.length == 1) {
    item_preco_unitario = item_preco_unitario + "0"
}

console.log("item_preco_unitario final: ", item_preco_unitario)