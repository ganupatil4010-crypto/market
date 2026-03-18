const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

const initDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ products: [], users: [] }, null, 2));
  }
};

const getData = () => {
  initDB();
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
};

const saveData = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

module.exports = {
  getProducts: () => getData().products,
  setProducts: (products) => {
    const data = getData();
    data.products = products;
    saveData(data);
  },
  getUsers: () => getData().users,
  setUsers: (users) => {
    const data = getData();
    data.users = users;
    saveData(data);
  }
};
