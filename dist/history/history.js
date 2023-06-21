let userName, userDetails;
const signout = document.getElementById("signout");
let deleteBtn;
let db = null;
let data, tab;
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
}
async function removeSession() {
    chrome.storage.sync.remove("name");
    chrome.storage.sync.remove("token");
}

document.addEventListener("DOMContentLoaded", async () => {
    await setUser();
    tab = await getCurrentTab();
    if (tab.url && tab.url.includes("amazon.in")) {
        await chrome.tabs.sendMessage(tab.id,
            {
                type: "Get_Products",
                url: tab.url,
                userId: userDetails.id,
            })
    }
});
chrome.runtime.onMessage.addListener((request) => {
    const { status } = request;
    const products = request.products.filter((product) => userDetails.id === product.userId);
    if (status && products.length > 0) {
        if ($.fn.dataTable.isDataTable('#products')) {
            table = $('#products').DataTable();
            table.destroy();
        }
        $('#products').DataTable({
            "data": products,
            "columns": [
                { "data": "name" },
                { "data": "url" },
                { "data": "visitedOn" },
                {
                    "data": null,
                    "title": 'Action',
                    "wrap": true,
                    "render": (product) => {
                        return `<button class="btn btn-danger btn-sm" id="delete-${product.id}" type="button" value=${product.id}>Delete</button>`;
                    }
                }
            ],
            ordering: false,
        })
    }
    products.forEach((product) => {
        const btnId = `delete-${product.id}`;
        $('#products tbody').on('click', `#${btnId}`, async () => {
            const id = document.getElementById(btnId).value;
            if (tab.url && tab.url.includes("amazon.in") && id) {
                await chrome.tabs.sendMessage(tab.id, { type: 'Delete_Product', productId: product.id, url: tab.url })
            }
        })
    })
})

signout.addEventListener(("click"), () => {
    removeSession();
})
function deleteProduct(id) {
    console.log(id);
}