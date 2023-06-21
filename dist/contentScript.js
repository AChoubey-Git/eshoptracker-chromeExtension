
let product = {
    name: "",
    id: "",
    url: "",
};
let user = { name: "" };
let db = null;
async function create_database() {
    const request = indexedDB.open('activity');

    request.onerror = (event) => {
        console.log("Problem opening DB.");
    }

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        let objectStore = db.createObjectStore('products', {
            keyPath: "id",
        });

        objectStore.transaction.oncomplete = (event) => {
            console.log("ObjectStore Created.");
        }
    }

    db = await new Promise((resolve) => {
        request.onsuccess = (event) => {
            console.log("DB OPENED.");
            resolve(event.target.result);
        }
    })
}
async function insertProduct(product) {
    if (db) {
        const insert_transaction = db.transaction("products", "readwrite");
        const objectStore = insert_transaction.objectStore("products");
        return new Promise((resolve, reject) => {
            insert_transaction.oncomplete = function () {
                console.log("ALL INSERT TRANSACTIONS COMPLETE.");
                resolve(true);
            }

            insert_transaction.onerror = function () {
                console.log("PROBLEM INSERTING RECORDS.")
                resolve(false);
            }

            let request = objectStore.add(product);

            request.onsuccess = function () {
                console.log("Added: ", product);
            }
            request.onerror = function (event) {
                console.log("Error: ", event);
            }
        });
    }
}

async function getProduct(id) {
    if (db) {
        const get_transaction = db.transaction("products", "readonly");
        const objectStore = get_transaction.objectStore("products");

        return new Promise((resolve, reject) => {
            get_transaction.oncomplete = function () {
                console.log("ALL GET TRANSACTIONS COMPLETE.");
            }

            get_transaction.onerror = function () {
                console.log("PROBLEM GETTING RECORDS.")
            }

            let request = objectStore.get(id);

            request.onsuccess = function (event) {
                resolve(event.target.result);
            }
        });
    }
}
async function getProductCount(id) {
    if (db) {
        const get_transaction = db.transaction("products", "readonly");
        const objectStore = get_transaction.objectStore("products");

        return new Promise((resolve, reject) => {
            get_transaction.oncomplete = function () {
                console.log("ALL GET TRANSACTIONS COMPLETE.");
            }

            get_transaction.onerror = function () {
                console.log("PROBLEM GETTING RECORDS.")
            }

            let request = objectStore.count(id);

            request.onsuccess = function (event) {
                resolve(event.target.result);
            }
        });
    }
}

async function getAllProducts() {
    if (db) {
        const getAll_transaction = db.transaction("products", "readonly");
        const objectStore = getAll_transaction.objectStore("products");

        return new Promise((resolve, reject) => {
            getAll_transaction.oncomplete = function () {
                console.log("GET ALL TRANSACTIONS COMPLETE.");
            }

            getAll_transaction.onerror = function () {
                console.log("PROBLEM GETTING RECORDS.")
            }
            let request = objectStore.getAll();

            request.onsuccess = function (event) {
                resolve(event.target.result);
            }
        });
    }
}

async function deleteProductById(id) {
    if (db) {
        const delete_transaction = db.transaction("products", "readwrite");
        const objectStore = delete_transaction.objectStore("products");

        return await new Promise((resolve, reject) => {
            delete_transaction.oncomplete = function () {
                console.info("DELETE TRANSACTIONS COMPLETED.");
            }

            delete_transaction.onerror = function () {
                console.info("PROBLEM GETTING RECORDS.")
            }
            let request = objectStore.delete(id);

            request.onsuccess = function (event) {
                console.info('Successfully deleted');
                resolve(true);
            }
        });
    }
}
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    const { type, productId, url, userId } = request;
    if (url.includes("amazon.in")) {
        if (type === "NEW") {
            product.name = document.getElementsByClassName("a-size-large a-spacing-none")[0].innerText;
            product.url = url;
            product.id = productId;
            const userName = document.getElementsByClassName("nav-line-1-container")[0].innerText.split(",")[1];
            user.name = userName.includes("sign") ? "Anonymous" : userName;
            sendResponse({ product, user });
            if (product.id && userId) {
                await create_database();
                const name = product.name.split(" ").slice(0, 4).join(" ")
                await insertProduct({
                    name,
                    url: `<a href=${product.url} target="blank">${product.name.split(" ").slice(0, 3).join(" ")}<a/>`,
                    id: product.id,
                    userId,
                    visitedOn: new Date().toLocaleDateString()
                })
            }
        } else if (type === "Get_Products") {
            const products = await getAllProducts();
            if (products.length > 0) {
                chrome.runtime.sendMessage({ status: true, products })
            }
        } else if (type === "Delete_Product") {
            const isDeleted = await deleteProductById(productId);
            if (isDeleted) {
                const products = await getAllProducts();
                if (products.length > 0) {
                    chrome.runtime.sendMessage({ status: true, products })
                }
            }

        }

    }
})