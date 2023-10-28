// Define the base URL for the API
const apiUrl = "https://qa2.sunbasedata.com/sunbase/portal/api";
let bearerToken = null;

console.log("hello");

async function callApi(method, path, body = null) {
  const headers = {
    Authorization: `Bearer ${bearerToken}`,
    "Content-Type": "application/json",
  };

  const options = {
    method: method,
    headers: headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(apiUrl + path, options);

  if (response.status === 401) {
    console.error("Authentication failed.");
    return null;
  }

  if (!response.ok) {
    console.error(`API call failed with status ${response.status}`);
    return null;
  }

  return response.json();
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const body = {
    login_id: username,
    password: password,
  };

  const response = await callApi("POST", "/assignment_auth.jsp", body);

  if (response && response.token) {
    bearerToken = response.token;
    console.log(bearerToken);
    showCustomerListScreen();
  }
}

async function getCustomerList() {
  try {
    const response = await callApi(
      "GET",
      "/assignment.jsp?cmd=get_customer_list"
    );
  } catch (e) {
    console.log("hello", e);
  }

  if (response) {
    const customerList = document.getElementById("customerList");
    customerList.innerHTML = "";

    response.forEach((customer) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${customer.first_name}</td>
                <td>${customer.last_name}</td>
                <td>${customer.email}</td>
                <td>
                    <button onclick="updateCustomer('${customer.uuid}')">Update</button>
                    <button onclick="deleteCustomer('${customer.uuid}')">Delete</button>
                </td>
            `;
      customerList.appendChild(row);
    });
  }
}

async function createCustomer() {
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;

  if (!firstName || !lastName) {
    console.error("First Name and Last Name are required.");
    return;
  }

  const body = {
    first_name: firstName,
    last_name: lastName,
    // Include other fields here
  };

  const response = await callApi("POST", "/assignment.jsp?cmd=create", body);

  if (response && response.status === 201) {
    console.log("Customer created successfully");
    showCustomerListScreen();
  } else {
    console.error("Failed to create a customer");
  }
}

function showAddCustomerScreen() {
  document.getElementById("customerListScreen").style.display = "none";
  document.getElementById("addCustomerScreen").style.display = "block";
}

function showCustomerListScreen() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("customerListScreen").style.display = "block";
  document.getElementById("addCustomerScreen").style.display = "none";
  getCustomerList();
}

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  login();
});

document.getElementById("addCustomerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  createCustomer();
});

document
  .getElementById("addCustomerButton")
  .addEventListener("click", showAddCustomerScreen);

document
  .getElementById("backToCustomerList")
  .addEventListener("click", showCustomerListScreen);
