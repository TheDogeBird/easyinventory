// models/inventoryItem.js

const mongoose = require('mongoose');

// Define the inventory item schema
const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true },
  category: { type: String, enum: ['Computers', 'Servers', 'NetworkEquipment', 'Laptops', 'Workstations', 'Printers', 'Monitors', 'Cables', 'Peripherals', 'Misc'], required: true },
  itemsShipped: String
});

// Create the inventory item model
const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = InventoryItem;
