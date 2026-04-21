const returnForm = document.querySelector('.return-box form');

returnForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent form submission

  // Handle form data here, e.g., send it to a server
  const formData = new FormData(returnForm);
  const data = Object.fromEntries(formData.entries());

  // Example: Send data to a server using fetch or AJAX
  fetch('/submit-return', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    // Handle server response
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });

  // Assuming you have functions to fetch order details
const orderId = getOrderID(); // Replace with your function to get order ID
const productName = getProductName(); // Replace with your function to get product name

const orderDetails = document.querySelector('.order-details');
const orderIdElement = document.getElementById('order-id');
const productNameElement = document.getElementById('product-name');

orderIdElement.textContent = orderId;
productNameElement.textContent = productName;

// Rest of the form submission logic remains the same
});