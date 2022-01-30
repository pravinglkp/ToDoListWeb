const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/toDoListDB", { useNewUrlParser: true });

const itemSchema = {
    name: String
};
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Work 1"
});
const item2 = new Item({
    name: "Work 2"
});
const item3 = new Item({
    name: "Work 3"
});


const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

/*Item.insertMany(defaultItems, function (err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log("succesfully saved default errors");
    }
});*/


app.listen(3000, function () {
    console.log("Server started at post 3000");
});

app.get("/", function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("list", { listTitle: "Today", items: foundItems });
        }
    });

});

app.get("/:customList", function (req, res) {
    const customListName = _.capitalize(req.params.customList);
    List.findOne({ name: customListName }, function (err, foundList) {
        if (err) {
            console.log(err);
        }
        else {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else {
                res.render("list", { listTitle: foundList.name, items: foundList.items });
            }
        }
    });
});

app.post("/", function (req, res) {

    let itemName = req.body.newItem;
    let listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    if (listName == "Today") {
        item.save();
        console.log(listName);
        res.redirect("/");
    } else {

        console.log(listName);
        List.findOne({ name: listName }, function (err, foundList) {
            if (err) {
                console.log(err);
            }
            else {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            }
        });
    }
});


app.post("/delete", function (req, res) {
    const id = req.body.checkbox;
    const listName = req.body.list;
    if (listName == "Today") {
        Item.findByIdAndRemove(id, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Successfully deleted Item!");
                res.redirect("/");
            }
        });
    }
    else {
        List.findOneAndUpdate(
            { name: listName },
            { $pull: { items: { _id: id } } },
            function (err, foundList) {
                if (!err) {
                    res.redirect("/" + listName);
                }
            });
    }


});
app.get("/about", function (req, res) {
    res.render("about");
});