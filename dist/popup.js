
let userName, userDetails;
const signout = document.getElementById("signout")
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab
}

async function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

async function getUserName() {
  const user = await chrome.storage.sync.get("name");
  return user.name;
}
async function getUser() {
  const data = await chrome.storage.sync.get("token");
  const { user } = await parseJwt(data.token);
  return user;
}
async function setUser() {
  userName = await getUserName()
  userDetails = await getUser();
  document.getElementById("user").innerText = userName;
  document.getElementById('userName').innerText = userName;
}

async function removeSession() {
  chrome.storage.sync.remove("name");
  chrome.storage.sync.remove("token");
}
function addProduct(data) {
  const { product, user } = data;
  document.getElementById('title').innerText = product.name;
  document.getElementById('id').innerText = product.id;
  document.getElementById('name').innerText = product.name;
  document.getElementById('url').innerText = product.name.split(" ").slice(0, 3).join(" ");
  document.getElementById('url').setAttribute("href", product.url);
  document.getElementById('visitOn').innerText = new Date().toLocaleDateString();
}

document.addEventListener("DOMContentLoaded", async () => {
  await setUser();
  const tab = await getCurrentTab();
  if (tab.url && tab.url.includes("amazon.in")) {
    const url = tab.url.split("/");
    let productId;
    if (url.includes("dp")) {
      productId = url[url.indexOf('dp') + 1];
      if (productId.includes("?")) {
        productId = productId.split("?")[0];
      }
    } else if (url.includes("gp")) {
      productId = url[url.indexOf('gp') + 2];
    }
    await chrome.tabs.sendMessage(tab.id,
      {
        type: "NEW",
        productId,
        url: tab.url,
        userId: userDetails.id,
      }, (response) => {
        if (response) {
          addProduct(response);
        }
      })
  } else {
    const wrapper = document.getElementsByClassName("wrapper")[0];
    wrapper.innerHTML = '<div class="title"><p>This is not an <a href="https://www.amazon.in" target="_blank">amazon</a> page.</p></div>'
  }
})

signout.addEventListener(("click"), () => {
  removeSession();
  location.replace('./login/index.html');
})





