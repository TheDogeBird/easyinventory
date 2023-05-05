const tbody = document.querySelector('tbody');
const form = document.getElementById('form');
const formError = document.getElementById('form-error');
const submitButton = document.getElementById('submit-btn');

// Fetch inventory data
fetch('/inventory')
  .then(res => res.json())
  .then(inventory => {
    inventory.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.name}</td>
        <td>${item.description || '-'}</td>
        <td>${item.category}</td>
        <td>${item.itemsShipped || '-'}</td>
        <td>${item.quantity}</td>
        <td>$${(item.quantity * 100).toFixed(2)}</td>
        <td><button onclick="editItem('${item._id}')">Edit</button></td>
      `;
      tr.dataset.id = item._id;
      tbody.appendChild(tr);
    });
  })
  .catch(err => console.log(err));

// Handle form submission
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = form.elements.name.value.trim();
  const description = form.elements.description.value.trim();
  const category = form.elements.category.value;
  const itemsShipped = form.elements['items-shipped'].value.trim();
  const quantity = parseInt(form.elements.quantity.value);

  if (name === '') {
    formError.textContent = 'Please enter a name';
    return;
  }

  if (category === '') {
    formError.textContent = 'Please select a category';
    return;
  }

  if (isNaN(quantity) || quantity < 1) {
    formError.textContent = 'Please enter a valid quantity';
    return;
  }

  // Disable submit button
  submitButton.disabled = true;

  // Create new inventory item
  const inventoryItem = {
    name,
    description,
    category,
    itemsShipped,
    quantity
  };

  // Add inventory item to database
  fetch('/inventory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(inventoryItem)
  })
  .then(res => res.json())
  .then(newInventoryItem => {
    // Add new inventory item to table
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${newInventoryItem.name}</td>
      <td>${newInventoryItem.description || '-'}</td>
      <td>${newInventoryItem.category}</td>
      <td>${newInventoryItem.itemsShipped || '-'}</td>
      <td>${newInventoryItem.quantity}</td>
      <td>$${(newInventoryItem.quantity * 100).toFixed(2)}</td>
      <td><button onclick="editItem('${newInventoryItem._id}')">Edit</button></td>
    `;
    tr.dataset.id = newInventoryItem._id;
    tbody.appendChild(tr);

    // Clear form inputs
    form.elements.name.value = '';
    form.elements.description.value = '';
    form.elements.category.value = '';
    form.elements['items-shipped'].value = '';
    form.elements.quantity.value = '';

    // Enable submit button
    submitButton.disabled = false;

    // Clear form error
    formError.textContent = '';
  })
  .catch(err => {
    console.log(err);
    formError.textContent = 'Failed to add inventory item';
    submitButton.disabled = false;
  });
});

function editItem(id) {
  // get inventory item data
  const tr = document.querySelector(`tr[data-id="${id}"]`);
  const name = tr.children[0].textContent;
  const description = tr.children[1].textContent;
  const category = tr.children[2].textContent;
  const itemsShipped = tr.children[3].textContent;
  const quantity = tr.children[4].textContent;

  // prepopulate form with data
  const form = document.getElementById('form');
  form.elements.name.value = name;
  form.elements.description.value = description;
  form.elements.category.value = category;
  form.elements.itemsShipped.value = itemsShipped;
  form.elements.quantity.value = quantity;
  form.dataset.id = id;

  // set submit event listener to update inventory item
  form.removeEventListener('submit', addInventoryItem);
  form.addEventListener('submit', updateInventoryItem);
  document.getElementById('submit-btn').textContent = 'Update Item';
}

function updateInventoryItem(event) {
  event.preventDefault();

  // get inventory item data from form
  const form = event.target;
  const id = form.dataset.id;
  const name = form.elements.name.value;
  const description = form.elements.description.value;
  const category = form.elements.category.value;
  const itemsShipped = form.elements.itemsShipped.value;
  const quantity = form.elements.quantity.value;

  // send updated inventory item to server
  fetch(`/inventory/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, description, category, itemsShipped, quantity })
  })
    .then(res => {
      if (res.ok) {
        // update inventory item in table
        const tr = document.querySelector(`tr[data-id="${id}"]`);
        tr.innerHTML = `
          <td>${name}</td>
          <td>${description || '-'}</td>
          <td>${category}</td>
          <td>${itemsShipped || '-'}</td>
          <td>${quantity}</td>
          <td>$${(quantity * 100).toFixed(2)}</td>
          <td><button onclick="editItem('${id}')">Edit</button></td>
        `;

        // reset form
        form.reset();
        form.dataset.id = '';
        document.getElementById('submit-btn').textContent = 'Add Item';

        // set submit event listener back to addInventoryItem
        form.removeEventListener('submit', updateInventoryItem);
        form.addEventListener('submit', addInventoryItem);
      } else {
        throw new Error(res.statusText);
      }
    })
    .catch(err => {
      document.getElementById('form-error').textContent = err.message;
    });
}
