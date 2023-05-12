const getDb = require("../util/database").getDb;
const mongodb = require("mongodb");
const { get } = require("../routes/admin");
class User {
  constructor(user, email, cart, id) {
    this.user = user;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }
  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }
  addToCart(product) {
    const cartIndex = this.cart.items.findIndex((cp) => {
      return cp.productId.toString() === product._id.toString();
    });
    console.log(cartIndex);
    let newQuantity = 1;
    let updatedCartItems = [...this.cart.items];
    if (cartIndex > -1) {
      newQuantity = this.cart.items[cartIndex].quantity + 1;
      updatedCartItems[cartIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new mongodb.ObjectId(product._id),
        quantity: newQuantity,
      });
    }
    const updatedCart = {
      items: updatedCartItems,
    };
    const db = getDb();
    return db.collection("users").updateOne(
      { _id: new mongodb.ObjectId(this._id) },
      {
        $set: { cart: updatedCart },
      }
    );
  }
  getCart() {
    const db = getDb();
    const listProductId = this.cart.items.map((products) => products.productId);
    return db
      .collection("products")
      .find({ _id: { $in: listProductId } })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((res) => {
              return res.productId.toString() === p._id.toString();
            }).quantity,
          };
        });
      });
  }

  deleteItemFromCart(productId) {
    const updatedCart = this.cart.items.filter(
      (res) => res.productId.toString() !== productId.toString()
    );
    const db = getDb();
    return db.collection("users").updateOne(
      { _id: new mongodb.ObjectId(this._id) },
      {
        $set: { cart: { items: updatedCart } },
      }
    );
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: new mongodb.ObjectId(this._id),
            name: this.user,
          },
        };
        return db.collection("orders").insertOne(order);
      })

      .then((result) => {
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne(
            { _id: new mongodb.ObjectId(this._id) },
            { $set: { cart: { items: [] } } }
          );
      });
  }
  getOrder() {
    const db = getDb();
    return db
      .collection("orders")
      .find({ "user._id": new mongodb.ObjectId(this._id) })
      .toArray()
      .then((result) => result)
      .catch((err) => console.log(err));
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(userId) })
      .then((result) => {
        return result;
      })
      .catch((err) => console.log(err));
  }
}
module.exports = User;
