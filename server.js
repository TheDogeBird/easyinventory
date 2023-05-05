const express = require('express');
const app = express();
const path = require('path');
const Datastore = require('nedb');

// Create a new datastore for inventory items
const inventoryDB = new Datastore({
  filename: path.join(__dirname, 'inventory.db'),
  autoload: true
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON data in request body
app.use(express.json());

// Get all inventory items
app.get('/inventory', (req, res) => {
  inventoryDB.find({}, (err, inventoryItems) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(inventoryItems);
    }
  });
});

// Get a single inventory item by ID
app.get('/inventory/:id', (req, res) => {
  const id = req.params.id;
  inventoryDB.findOne({ _id: id }, (err, inventoryItem) => {
    if (err) {
      res.status(500).send(err);
    } else if (!inventoryItem) {
      res.status(404).send(`Inventory item with ID ${id} not found.`);
    } else {
      res.json(inventoryItem);
    }
  });
});

// Add a new inventory item
app.post('/inventory', (req, res) => {
  const inventoryItem = req.body;
  inventoryDB.insert(inventoryItem, (err, newInventoryItem) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(newInventoryItem);
    }
  });
});

// Update an existing inventory item
app.put('/inventory/:id', (req, res) => {
  const id = req.params.id;
  const updatedInventoryItem = req.body;
  inventoryDB.update({ _id: id }, updatedInventoryItem, {}, (err, numReplaced) => {
    if (err) {
      res.status(500).send(err);
    } else if (numReplaced === 0) {
      res.status(404).send(`Inventory item with ID ${id} not found.`);
    } else {
      res.sendStatus(200);
    }
  });
});

// Delete an inventory item
app.delete('/inventory/:id', (req, res) => {
  const id = req.params.id;
  inventoryDB.remove({ _id: id }, {}, (err, numRemoved) => {
    if (err) {
      res.status(500).send(err);
    } else if (numRemoved === 0) {
      res.status(404).send(`Inventory item with ID ${id} not found.`);
    } else {
      res.sendStatus(200);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
