require('dotenv').config();

const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.MYSQL_ID,
    database: "bamazon_db"
});

connection.connect(err => {
    if (err) {
      throw err;
    }
    productsList();
});

  // Displays the product list (along with the department, price, and stock quantity)
const productsList = () => {
    connection.query(
      "SELECT * FROM products;",
      (err, res) => {
        if (err) {
          throw err;
        }
        res.forEach(row =>
            console.log(`ID: ${row.item_id} | ${row.product_name} | Department: ${row.department_name} | Price: ${row.price} | Stock Quantity: ${row.stock_quantity}`)
        );
        var choices = [];
        for(var i = 0; i < res.length; i++){
            choices.push(res[i].item_id + "");
        }
        inquirer.prompt([
            {
                type: "list",
                message: "Which product would you like to purchase?",
                name: "item_id",
                choices: choices
            },
            {
                type: "input",
                message: "Please enter the quantity.",
                name: "quantity"
            }
        ]).then(function (input) {
            connection.query("SELECT * FROM products WHERE item_id = ?", [input.item_id], function (err, res) {
            if (err) {
                throw err;
            }
                var quantity = res[0].stock_quantity;
                var price = res[0].price;
                if (input.quantity > quantity) {
                    console.log("We're sorry, this item is out of stock.")
            }
            else {
                connection.query("UPDATE products SET ? WHERE item_id = ?", [{ stock_quantity: quantity - input.quantity }, input.item_id], function (err, res) {
                    if (err) {
                        throw err;
                }
                console.log("Total cost: $" + (price * input.quantity));
                })
            }
        })
    });
});
}